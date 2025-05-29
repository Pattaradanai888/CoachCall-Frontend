// server/api/auth/refresh.post.ts
import {
  defineEventHandler,
  getHeader,
  appendHeader,
  createError,
  useRuntimeConfig,
} from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const cookieHeader = getHeader(event, 'cookie');

  try {
    const refreshResponse = await $fetch.raw<{ access_token: string }>(
      `${config.apiBase}/auth/refresh`,
      {
        method: 'POST',
        headers: {
          Cookie: cookieHeader || '',
        },
      }
    );

    const setCookieHeaders = refreshResponse.headers.get('set-cookie');
    if (setCookieHeaders) {
      appendHeader(event, 'set-cookie', setCookieHeaders);
    }

    if (refreshResponse._data) {
      return refreshResponse._data;
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: 'Refresh response missing data',
      });
    }
  } catch (error: unknown) {
    let statusCode = 500;
    let statusMessage = 'Token refresh failed';

    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'status' in error.response
    ) {
      statusCode = error.response.status as number;
    }
    if (
      error &&
      typeof error === 'object' &&
      'data' in error &&
      error.data &&
      typeof error.data === 'object' &&
      'detail' in error.data
    ) {
      statusMessage = error.data.detail as string;
    } else if (error && typeof error === 'object' && 'message' in error && statusCode !== 500) {
      statusMessage = error.message as string;
    }

    throw createError({
      statusCode,
      statusMessage,
      data: error && typeof error === 'object' && 'data' in error ? error.data : undefined,
    });
  }
});
