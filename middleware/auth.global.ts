import type { RouteLocationNormalized } from 'vue-router';
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

    // Initialize auth state
    await auth.initialize(nuxtApp);

    const onboardingRoute = '/onboarding';
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

      // For the root route (/), only redirect on client-side to prevent hydration mismatch
      if (to.path === '/') {
        if (import.meta.client) {
          return navigateTo('/dashboard', { replace: true, redirectCode: 302 });
        }
        // On server, allow root route to render normally for authenticated users
        return;
      }

      // For other public routes, redirect away from them
      if (publicRoutes.includes(to.path) && to.path !== '/') {
        return navigateTo('/dashboard', { replace: true, redirectCode: 302 });
      }

      return;
    }

    // Unauthenticated flow
    // Allow only explicitly public routes when unauthenticated
    if (!publicRoutes.includes(to.path)) {
      // Only redirect on client-side when we're sure about auth state
      if (import.meta.client && auth.isInitialized && !auth.isRefreshing) {
        const redirectQuery = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
        return navigateTo(`/login${redirectQuery}`, { replace: true, redirectCode: 302 });
      }
      // On server, allow the route to render and let client handle redirect after hydration
    }

    return;
  },
);