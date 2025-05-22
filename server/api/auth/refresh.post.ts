// server/api/auth/refresh.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    // Forward the refresh request to your FastAPI backend
    // This preserves the HTTP-only refresh token cookie
    const response = await $fetch(`${config.apiBase}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: getHeader(event, 'cookie') || '',
      },
    });

    return response;
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token refresh failed',
    });
  }
});
