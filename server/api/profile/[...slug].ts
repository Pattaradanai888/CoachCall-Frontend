export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const method = getMethod(event)
  const query = getQuery(event)
  const headers = getHeaders(event)
  
  let body = undefined
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      body = await readBody(event)
    } catch (e) {
      body = undefined
    }
  }

  const config = useRuntimeConfig() as { backendUrl?: string; apiBase?: string; public: { apiBase?: string } }
  const backendUrl = config.backendUrl || config.apiBase || 'https://coach-call-fastapi.southeastasia.cloudapp.azure.com'
  
  let targetUrl = `${backendUrl}/profile/${slug}`
  
  if (Object.keys(query).length > 0) {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    targetUrl += `?${params.toString()}`
  }

  console.log(`[SWA-PROXY] ${method} ${targetUrl}`)

  try {
    const forwardHeaders = new Headers()
    if (headers['content-type']) forwardHeaders.set('content-type', headers['content-type'])
    if (headers['authorization']) forwardHeaders.set('authorization', headers['authorization'])
    if (headers['user-agent']) forwardHeaders.set('user-agent', headers['user-agent'])
    if (headers['accept']) forwardHeaders.set('accept', headers['accept'])
    if (headers['cookie']) forwardHeaders.set('cookie', headers['cookie']) // Forward cookies to backend

    const response = await $fetch.raw(targetUrl, {
      method,
      body,
      headers: forwardHeaders,
      credentials: 'include',
    })

    // Forward response headers
    const responseHeaders = response.headers
    
    // Handle Set-Cookie headers
    const setCookieHeaders = response.headers.getSetCookie?.() || []
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach(cookieString => {
        let modifiedCookie = cookieString.replace(/;\s*domain=[^;]+/i, '')
        if (!modifiedCookie.includes('secure') && !modifiedCookie.includes('Secure')) {
          modifiedCookie += '; Secure'
        }
        appendResponseHeader(event, 'Set-Cookie', modifiedCookie)
      })
    }

    // Forward important headers
    const headersToForward = ['content-type', 'cache-control', 'expires', 'last-modified', 'etag']
    headersToForward.forEach(headerName => {
      const headerValue = responseHeaders.get(headerName)
      if (headerValue) {
        setResponseHeader(event, headerName, headerValue)
      }
    })

    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
    setResponseHeader(event, 'Access-Control-Allow-Origin', getHeader(event, 'origin') || '*')
    
    return response._data
    
  } catch (error: any) {
    console.error(`[SWA-PROXY] Error proxying ${method} ${targetUrl}:`, error)
    
    if (error.response) {
      setResponseStatus(event, error.response.status)
      return error.response._data || { error: 'Backend request failed' }
    } else {
      setResponseStatus(event, 500)
      return { error: 'Internal server error' }
    }
  }
})
