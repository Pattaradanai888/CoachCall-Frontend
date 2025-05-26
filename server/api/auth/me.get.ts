// server/api/auth/me.get.ts
import { defineEventHandler, getHeader, createError, useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
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
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.data?.detail || 'Failed to fetch user profile from backend',
      data: error.data,
    });
  }
});
