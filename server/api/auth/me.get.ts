// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const response = await $fetch(`${config.apiBase}/auth/me`, {
      headers: {
        Cookie: getHeader(event, 'cookie') || '',
      },
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    if (err.status === 401) {
      try {
        await $fetch(`${config.apiBase}/auth/refresh`, {
          method: 'POST',
          headers: {
            Cookie: getHeader(event, 'cookie') || '',
          },
        });

        const response = await $fetch(`${config.apiBase}/auth/me`, {
          headers: {
            Cookie: getHeader(event, 'cookie') || '',
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
  }
});
