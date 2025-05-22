// middleware/auth.ts
import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // Skip auth for public routes
  if (['/login', '/register'].includes(to.path)) return;

  // Server-side: Check if we can get auth state
  if (import.meta.server) {
    try {
      // Try to refresh token server-side via API route
      await $fetch('/api/auth/refresh', { method: 'POST' });
      // If successful, the user is authenticated
      return;
    } catch {
      // Refresh failed, redirect to login
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      });
    }
  }

  // Client-side: Use existing logic
  if (!authStore.isAuthenticated && !authStore.accessToken) {
    try {
      await authStore.fetchProfile();
    } catch {
      return navigateTo('/login');
    }
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }
});
