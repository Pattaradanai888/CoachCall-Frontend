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
      const redirectQuery = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
      return navigateTo(`/login${redirectQuery}`, { replace: true, redirectCode: 302 });
    }

    return;
  },
);