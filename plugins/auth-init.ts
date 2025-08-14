// plugins/auth-init.ts
import { defineNuxtPlugin, useNuxtApp } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();
  const nuxtApp = useNuxtApp();

  // Always initialize auth state
  if (!auth.isInitialized) {
    try {
      await auth.initialize(nuxtApp);
    }
    catch (e) {
      // Silent fail; global middleware will handle redirects
      console.warn('Auth init failed:', e);
    }
  }
});
