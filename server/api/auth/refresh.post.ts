//server/api/auth/refresh.post.ts
import type { FetchError } from 'ofetch';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const incoming = getHeader(event, 'cookie') || '';

  try {
    const proxyRes = await $fetch.raw(`${config.apiBase}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: incoming },
      credentials: 'include',
    });

    const setCookie = proxyRes.headers.get('set-cookie');
    if (setCookie) {
      event.node.res.setHeader('set-cookie', setCookie);
    }

    return proxyRes._data;
  } catch (error: unknown) {
    // First, check if it's a FetchError from ofetch:
    if ((error as FetchError).status !== undefined && (error as FetchError).data !== undefined) {
      const fetchErr = error as FetchError;
      console.error('Refresh proxy failed:', fetchErr.status, fetchErr.data);
    } else if (error instanceof Error) {
      // Some other Error
      console.error('Refresh proxy failed:', error.message);
    } else {
      // Really unknown
      console.error('Refresh proxy failed:', error);
    }

    throw createError({
      statusCode: 401,
      message: 'Token refresh failed',
    });
  }
});
