// ~/middleware/auth.ts
import { defineNuxtRouteMiddleware, navigateTo, useRequestHeaders } from '#app';
import { useAuthStore } from '~/stores/auth';
import type { TokenResponse } from '~/types/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  //
  // ── 1) PUBLIC ROUTES (LOGIN/REGISTER) ──────────────────────
  //
  const publicRoutes = ['/login', '/register'];
  if (publicRoutes.includes(to.path)) {
    // SERVER: Check if user has valid session
    if (process.server) {
      const headers = useRequestHeaders(['cookie']);
      try {
        await $fetch<TokenResponse>('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers,
        });
        return navigateTo('/dashboard');
      } catch {
        return; // Allow access to login/register
      }
    }

    // CLIENT: If already authenticated, redirect to dashboard
    if (process.client && auth.isAuthenticated) {
      return navigateTo('/dashboard');
    }

    return; // Allow access to login/register
  }

  //
  // ── 2) LANDING PAGE REDIRECT ───────────────────────────────
  //
  if (to.path === '/') {
    // SERVER: Check if user has valid session
    if (process.server) {
      const headers = useRequestHeaders(['cookie']);
      try {
        await $fetch<TokenResponse>('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers,
        });
        return navigateTo('/dashboard');
      } catch {
        return; // Show landing page
      }
    }

    // CLIENT: Always try to refresh and check auth status
    if (process.client) {
      try {
        const refresh = await $fetch<TokenResponse>('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        // Update auth store
        auth.accessToken = refresh.access_token;
        await auth.fetchProfile();

        // Now redirect to dashboard
        return navigateTo('/dashboard');
      } catch {
        // If refresh fails, clear auth state and show landing
        auth.accessToken = null;
        auth.user = null;
        return; // Show landing page
      }
    }

    return; // Show landing page
  }

  //
  // ── 3) PROTECTED ROUTES ─────────────────────────────────────
  //

  // Skip middleware during HMR to prevent logout on hot-reload
  if (import.meta.hot) {
    return;
  }

  // SERVER: Check if user has valid session
  if (process.server) {
    const headers = useRequestHeaders(['cookie']);
    try {
      await $fetch<TokenResponse>('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers,
      });
      return; // Allow access to protected route
    } catch {
      return navigateTo('/login');
    }
  }

  // CLIENT: Check authentication status
  if (process.client) {
    // If already authenticated, allow access
    if (auth.isAuthenticated) {
      return;
    }

    // Try to refresh token
    try {
      const refresh = await $fetch<TokenResponse>('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      auth.accessToken = refresh.access_token;
      await auth.fetchProfile();
      return; // Now authenticated, allow access
    } catch {
      return navigateTo('/login');
    }
  }
});
