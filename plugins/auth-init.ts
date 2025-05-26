// plugins/auth-init.ts
import { defineNuxtPlugin, useNuxtApp } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();
  const nuxtApp = useNuxtApp();

  // Only run on client
  if (import.meta.server) {
    return;
  }

  // Check if SSR provided auth state
  const ssrAccessToken = nuxtApp.payload.auth?.accessToken;
  const ssrUser = nuxtApp.payload.auth?.user;

  if (ssrAccessToken && ssrUser) {
    // Hydrate store with SSR data - this doesn't trigger API calls
    auth.hydrateFromSSR(ssrAccessToken, ssrUser);
    return;
  }

  // Only initialize if not already initialized and not authenticated
  if (!auth.isInitialized && !auth.isAuthenticated && !auth.isRefreshing) {
    try {
      await auth.initializeAuth('client');
    } catch (error) {
      // Silently handle initialization errors
      console.warn('Auth initialization failed:', error);
    }
  }
});
