// middleware/auth.ts
import { defineNuxtRouteMiddleware, navigateTo, useRequestHeaders } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  // 1) public
  if (['/login', '/register'].includes(to.path)) return;

  const auth = useAuthStore();

  // 2) SSR: try to refresh, otherwise redirect right away
  if (process.server) {
    const headers = useRequestHeaders(['cookie']);
    try {
      await $fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers,
      });
      return; // authenticated, continue SSR
    } catch {
      // **redirect** on SSR rather than throwing an error page
      return navigateTo('/login');
    }
  }

  // 3) Client: bail during HMR (so hot-reload doesn’t kick you out)
  if (import.meta.hot) return;

  // 4) Client: normal guard
  if (!auth.isAuthenticated) {
    try {
      await auth.fetchProfile();
    } catch {
      return navigateTo('/login');
    }
  }
});
