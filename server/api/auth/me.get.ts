// server/api/auth/me.get.ts
import type { H3Event } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  const authorizationHeader = getHeader(event, 'authorization');

  if (!authorizationHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header missing',
    });
  }

  try {
    const profileData = await $fetch(`${config.apiBase}/auth/me`, {
      headers: {
        Authorization: authorizationHeader,
      },
    });
    return profileData;
  }
  catch (error: unknown) {
    const errorResponse = error as {
      response?: { status?: number };
      data?: { detail?: string };
    };
    throw createError({
      statusCode: errorResponse.response?.status || 500,
      statusMessage: errorResponse.data?.detail || 'Failed to fetch user profile from backend',
      data: errorResponse.data,
    });
  }
});
