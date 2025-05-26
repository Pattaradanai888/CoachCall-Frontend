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
  } catch (error: any) {
    let statusCode = 500;
    let statusMessage = 'Token refresh failed';

    if (error.response && error.response.status) {
      statusCode = error.response.status;
    }
    if (error.data && error.data.detail) {
      statusMessage = error.data.detail;
    } else if (error.message && statusCode !== 500) {
      statusMessage = error.message;
    }

    throw createError({
      statusCode,
      statusMessage,
      data: error.data,
    });
  }
});
