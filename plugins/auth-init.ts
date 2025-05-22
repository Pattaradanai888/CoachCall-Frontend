// plugins/auth-init.ts
import { defineNuxtPlugin } from '#app';
import { useAuthStore } from '~/stores/auth';
import type { TokenResponse } from '~/types/auth';

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();

  // Only run on client-side
  if (import.meta.server) return;

  try {
    // Try to refresh token through our server API
    const refreshResponse = await $fetch<TokenResponse>('/api/auth/refresh', {
      method: 'POST',
    });

    auth.accessToken = refreshResponse.access_token;
    await auth.fetchProfile();
  } catch {
    console.info('Silent refresh failed or not logged in.');
  }
});
