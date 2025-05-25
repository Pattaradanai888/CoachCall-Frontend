// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const cookieHeader = getHeader(event, 'cookie');
  try {
    const response = await $fetch(`${config.apiBase}/auth/me`, {
      headers: {
        Cookie: cookieHeader || '',
      },
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    if (err.status === 401) {
      // Try refresh with proper cookie forwarding
      try {
        const refreshResponse = await $fetch.raw(`${config.apiBase}/auth/refresh`, {
          method: 'POST',
          headers: {
            Cookie: cookieHeader || '',
          },
        });

        // Forward Set-Cookie headers from refresh
        const setCookieHeaders = refreshResponse.headers.get('set-cookie');
        if (setCookieHeaders) {
          setHeader(event, 'set-cookie', setCookieHeaders);
        }

        // Retry /me with updated cookies
        const response = await $fetch(`${config.apiBase}/auth/me`, {
          headers: {
            Cookie: cookieHeader || '',
          },
        });

        return response;
      } catch {
        throw createError({
          statusCode: 401,
          statusMessage: 'Authentication required',
        });
      }
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    });
  }
});
