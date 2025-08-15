export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const fullPath = url.pathname
  
  // Extract the path after /api/
  const pathSegment = fullPath.replace(/^\/api\//, '')
  const method = getMethod(event)
  const query = getQuery(event)
  const headers = getHeaders(event)
  
  let body: BodyInit | undefined = undefined;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const rawBody = await readRawBody(event);
      if (rawBody) {
        body = rawBody;
      }
    } catch (e) {
      body = undefined;
    }
  }

  const config = useRuntimeConfig()
  const backendUrl = config.backendUrl || 'https://coach-call-fastapi.southeastasia.cloudapp.azure.com'
  
  let targetUrl = `${backendUrl}/${pathSegment}`
  
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
    
    // Forward all important headers including cookies
    const headersToForward = [
      'content-type', 'authorization', 'user-agent', 
      'accept', 'cookie', 'x-forwarded-for', 'x-real-ip'
    ]
    
    headersToForward.forEach(header => {
      if (headers[header]) {
        forwardHeaders.set(header, headers[header])
      }
    })

    console.log(`[SWA-PROXY] Forwarding cookies: ${headers['cookie'] || 'none'}`)

    const response = await $fetch.raw(targetUrl, {
      method,
      body,
      headers: forwardHeaders,
      credentials: 'include', // This is crucial
    })

    // IMPORTANT: Proper cookie handling
    const responseHeaders = response.headers
    
    // Handle Set-Cookie headers - this is the key fix
    const setCookieHeaders = response.headers.getSetCookie?.() || []
    console.log(`[SWA-PROXY] Backend set ${setCookieHeaders.length} cookies`)
    
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookieString, index) => {
        console.log(`[SWA-PROXY] Setting cookie ${index}: ${cookieString}`)
        
        // Remove problematic attributes that SWA doesn't handle well
        let modifiedCookie = cookieString
          .replace(/;\s*domain=[^;]+/i, '') // Remove domain
          .replace(/;\s*samesite=[^;]+/i, '') // Remove samesite temporarily
        
        // Ensure Secure flag in production
        if (!modifiedCookie.includes('Secure') && !modifiedCookie.includes('secure')) {
          modifiedCookie += '; Secure'
        }
        
        // Add SameSite=None for cross-origin (required with Secure)
        modifiedCookie += '; SameSite=None'
        
        console.log(`[SWA-PROXY] Modified cookie ${index}: ${modifiedCookie}`)
        
        appendResponseHeader(event, 'Set-Cookie', modifiedCookie)
      })
    }

    // Forward other important headers
    const headersToForwardBack = ['content-type', 'cache-control', 'expires', 'last-modified', 'etag']
    headersToForwardBack.forEach(headerName => {
      const headerValue = responseHeaders.get(headerName)
      if (headerValue) {
        setResponseHeader(event, headerName, headerValue)
      }
    })

    // CORS headers
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
    const origin = getHeader(event, 'origin')
    if (origin) {
      setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
    }
    
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