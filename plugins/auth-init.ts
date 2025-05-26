// plugins/auth-init.ts
import { defineNuxtPlugin } from '#app';
import { useAuthStore } from '~/stores/auth';
import type { TokenResponse } from '~/types/auth';

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();

  // Only run on client-side
  if (import.meta.server) return;

  // Only try to initialize if we don't already have a user
  // This prevents conflicts with the middleware
  if (auth.user) return;

  try {
    // Try to refresh token through our server API
    const refreshResponse = await $fetch<TokenResponse>('/api/auth/refresh', {
      method: 'POST',
    });

    auth.accessToken = refreshResponse.access_token;
    await auth.fetchProfile();
  } catch {
    // Silent fail - the middleware will handle auth checks
    console.info('Silent refresh failed or not logged in.');
  }
});
