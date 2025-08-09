// plugins/auth-init.ts
import { defineNuxtPlugin, useNuxtApp } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();
  const nuxtApp = useNuxtApp();

  // Client only: as a safety net, ensure auth is initialized once
  if (import.meta.client && !auth.isInitialized) {
    try {
      await auth.initialize(nuxtApp);
    }
    catch (e) {
      // Silent fail; global middleware will handle redirects
      console.warn('Auth client init failed:', e);
    }
  }
});
