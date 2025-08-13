export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const method = getMethod(event)
  const query = getQuery(event)
  const headers = getHeaders(event)
  
  // Get request body for POST/PUT requests
  let body = undefined
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      body = await readBody(event)
    } catch (e) {
      // Handle cases where body might be empty
      body = undefined
    }
  }

  const config = useRuntimeConfig() as { backendUrl?: string; apiBase?: string; public: { apiBase?: string } }
  const backendUrl = config.backendUrl || config.apiBase || 'https://coach-call-fastapi.southeastasia.cloudapp.azure.com'
  
  // Build the target URL
  let targetUrl = `${backendUrl}/auth/${slug}`
  
  // Add query parameters if they exist
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
    // Forward the request to FastAPI backend
    const forwardHeaders = new Headers()
    if (headers['content-type']) forwardHeaders.set('content-type', headers['content-type'])
    if (headers['authorization']) forwardHeaders.set('authorization', headers['authorization'])
    if (headers['user-agent']) forwardHeaders.set('user-agent', headers['user-agent'])
    if (headers['accept']) forwardHeaders.set('accept', headers['accept'])
    if (headers['cookie']) forwardHeaders.set('cookie', headers['cookie'])

    const response = await $fetch.raw(targetUrl, {
      method,
      body,
      headers: forwardHeaders,
      // Include credentials to forward cookies to backend
      credentials: 'include',
    })

    // Forward response headers back to client
    const responseHeaders = response.headers
    
    // Handle Set-Cookie headers specially to ensure they work with SWA
    const setCookieHeaders = response.headers.getSetCookie?.() || []
    if (setCookieHeaders.length > 0) {
      // Process each set-cookie header to ensure proper domain/path
      setCookieHeaders.forEach(cookieString => {
        // Parse and modify cookie if needed for SWA domain
        let modifiedCookie = cookieString
        
        // Remove any domain restrictions to let browser handle it
        modifiedCookie = modifiedCookie.replace(/;\s*domain=[^;]+/i, '')
        
        // Ensure secure flag for production
        if (!modifiedCookie.includes('secure') && !modifiedCookie.includes('Secure')) {
          modifiedCookie += '; Secure'
        }
        
        appendResponseHeader(event, 'Set-Cookie', modifiedCookie)
      })
    }

    // Forward other important headers
    const headersToForward = [
      'content-type',
      'cache-control',
      'expires',
      'last-modified',
      'etag'
    ]
    
    headersToForward.forEach(headerName => {
      const headerValue = responseHeaders.get(headerName)
      if (headerValue) {
        setResponseHeader(event, headerName, headerValue)
      }
    })

    // Set CORS headers for the SWA domain
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
    setResponseHeader(event, 'Access-Control-Allow-Origin', getHeader(event, 'origin') || '*')
    
    return response._data
    
  } catch (error: any) {
    console.error(`[SWA-PROXY] Error proxying ${method} ${targetUrl}:`, error)
    
    // Handle fetch errors and return appropriate HTTP status
    if (error.response) {
      // FastAPI returned an error response
      setResponseStatus(event, error.response.status)
      return error.response._data || { error: 'Backend request failed' }
    } else {
      // Network or other error
      setResponseStatus(event, 500)
      return { error: 'Internal server error' }
    }
  }
})