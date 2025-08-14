import type { RouteLocationNormalized } from 'vue-router';
// middleware/auth.global.ts
import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useAuthStore,
  useNuxtApp,
} from '#imports';

export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized) => {
    const auth = useAuthStore();
    const nuxtApp = useNuxtApp();

  // Initialize server/client auth state before guarding
  await auth.initialize(nuxtApp);

    const onboardingRoute = '/onboarding';
    // Root (/) is public to avoid SSR/client mismatch flashes
    const publicRoutes = ['/', '/login', '/register', '/reset-password', '/create-new-password', '/verify-otp'];

    // On client-side, if we're still refreshing tokens, wait for it to complete
    if (import.meta.client && auth.isRefreshing) {
      try {
        await auth.refreshToken();
      } catch (error) {
        console.error('Token refresh failed during navigation:', error);
      }
    }

    // Authenticated flow
    if (auth.isAuthenticated) {
      const user = auth.user!;
      const hasCompletedOnboarding = user.profile?.has_completed_onboarding;

      // Onboarding enforcement
      if (!hasCompletedOnboarding && to.path !== onboardingRoute) {
        return navigateTo(onboardingRoute, { replace: true, redirectCode: 302 });
      }
      if (hasCompletedOnboarding && to.path === onboardingRoute) {
        return navigateTo('/dashboard', { replace: true, redirectCode: 302 });
      }

      // Public pages (including /) should push authenticated users to dashboard
      if (publicRoutes.includes(to.path)) {
        return navigateTo('/dashboard', { replace: true, redirectCode: 302 });
      }

      return;
    }

    // Unauthenticated flow
    // Allow only explicitly public routes when unauthenticated (including '/')
    if (!publicRoutes.includes(to.path)) {
      // Do NOT redirect on server; let the client decide post-hydration to avoid SSR/client HTML mismatches
      if (import.meta.client && auth.isInitialized && !auth.isRefreshing && !auth.isAuthenticated) {
        const redirectQuery = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
        return navigateTo(`/login${redirectQuery}`, { replace: true, redirectCode: 302 });
      }
    }

    return;
  },
);