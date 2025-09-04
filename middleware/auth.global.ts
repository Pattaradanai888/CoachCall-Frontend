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

    await auth.initialize(nuxtApp);

    const onboardingRoute = '/onboarding';
    const publicRoutes = ['/', '/login', '/register', '/reset-password', '/create-new-password', '/verify-otp'];

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

      // For the root route, allow it to render. The page itself will handle the redirect.
      if (to.path === '/') {
        return;
      }

      // For other public routes, redirect away from them
      if (publicRoutes.includes(to.path)) {
        return navigateTo('/dashboard', { replace: true, redirectCode: 302 });
      }

      return;
    }

    // Unauthenticated flow
    if (!publicRoutes.includes(to.path)) {
      if (import.meta.client && auth.isInitialized && !auth.isRefreshing) {
        const redirectQuery = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
        return navigateTo(`/login${redirectQuery}`, { replace: true, redirectCode: 302 });
      }
    }

    return;
  },
);