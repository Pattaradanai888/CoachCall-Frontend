// server/api/auth/refresh.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    // Forward ALL cookies from incoming request to FastAPI
    const cookieHeader = getHeader(event, 'cookie');

    const response = await $fetch(`${config.apiBase}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: cookieHeader || '',
      },
    });

    // Important: Forward any Set-Cookie headers from FastAPI back to client
    const fastApiHeaders = await $fetch.raw(`${config.apiBase}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: cookieHeader || '',
      },
    });

    // Copy Set-Cookie headers from FastAPI response to Nuxt response
    const setCookieHeaders = fastApiHeaders.headers.get('set-cookie');
    if (setCookieHeaders) {
      setHeader(event, 'set-cookie', setCookieHeaders);
    }

    return response;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token refresh failed',
    });
  }
});
