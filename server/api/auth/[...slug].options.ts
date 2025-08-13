export default defineEventHandler(async (event) => {
  // Handle CORS preflight
  setResponseHeader(event, 'Access-Control-Allow-Origin', getHeader(event, 'origin') || '*')
  setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
  setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
  setResponseHeader(event, 'Access-Control-Max-Age', 86400)
  setResponseHeader(event, 'Vary', 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method')
  
  setResponseStatus(event, 200)
  return ''
})