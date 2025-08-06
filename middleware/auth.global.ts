import type { RouteLocationNormalized } from 'vue-router';
import type { User } from '~/types/auth';
// middleware/auth.global.ts
import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useAuthStore,
  useNuxtApp,
  useRequestHeaders,
  useRuntimeConfig,
} from '#imports';

let serverAuthPromise: Promise<void> | null = null;

interface AuthPayload {
  accessToken: string | null;
  user: User | null;
  processed: boolean;
}

interface RefreshTokenResponse {
  access_token: string;
}

export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized, _from: RouteLocationNormalized) => {
    const auth = useAuthStore();
    const nuxtApp = useNuxtApp();

    if (import.meta.hot) {
      return;
    }

    // --- SERVER-SIDE ---
    if (import.meta.server) {
      const payload = nuxtApp.payload.auth as AuthPayload | undefined;
      if (payload?.processed) {
        if (payload.accessToken && payload.user && !auth.isAuthenticated) {
          auth.hydrateFromSSR(payload.accessToken, payload.user);
        }
        return handleServerRouteGuarding(to, auth);
      }

      if (!serverAuthPromise) {
        serverAuthPromise = initializeServerSideAuth(auth, nuxtApp);
      }
      
      try {
        await serverAuthPromise;
      }
      catch (error) {
        // Error is already logged in initializeServerSideAuth.
      }
      finally {
        serverAuthPromise = null;
      }

      return handleServerRouteGuarding(to, auth);
    }

    // --- CLIENT-SIDE ---
    if (import.meta.client) {
      if (!auth.isInitialized) {
        await auth.initializeAuth('client');
      }
      return handleClientRouteGuarding(to, auth);
    }
  },
);

async function initializeServerSideAuth(
  auth: ReturnType<typeof useAuthStore>,
  nuxtApp: ReturnType<typeof useNuxtApp>,
): Promise<void> {
  const headers = useRequestHeaders(['cookie']);
  const config = useRuntimeConfig();

  let authResult: AuthPayload = {
    accessToken: null,
    user: null,
    processed: true,
  };

  try {
    if (headers.cookie) {
      const refresh = await $fetch<RefreshTokenResponse>(`${config.public.apiBase}/auth/refresh`, {
        method: 'POST',
        headers: { cookie: headers.cookie },
      });

      if (refresh.access_token) {
        const accessToken = refresh.access_token;
        const profileData = await $fetch<User>(`${config.public.apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        authResult = {
          accessToken,
          user: profileData,
          processed: true,
        };
      }
    }
  }
  catch (error) {
    console.error('Server-side authentication failed:', error);
  }
  finally {
    if (authResult.accessToken && authResult.user) {
      auth.hydrateFromSSR(authResult.accessToken, authResult.user);
    }
    else {
      await auth.logoutSilently();
    }
    nuxtApp.payload.auth = JSON.parse(JSON.stringify(authResult));
  }
}

function handleServerRouteGuarding(
  to: RouteLocationNormalized,
  auth: ReturnType<typeof useAuthStore>,
) {
  const publicRoutes = ['/', '/login', '/register', '/reset-password', '/create-new-password', '/verify-otp'];

  if (auth.isAuthenticated && auth.user) {
    const onboardingRoute = '/onboarding';
    const hasCompletedOnboarding = auth.user.profile?.has_completed_onboarding;

    if (!hasCompletedOnboarding && to.path !== onboardingRoute) {
      return navigateTo(onboardingRoute, { replace: true });
    }

    if (hasCompletedOnboarding && to.path === onboardingRoute) {
      return navigateTo('/dashboard', { replace: true });
    }
    
    if (publicRoutes.includes(to.path)) {
      return navigateTo('/dashboard', { replace: true });
    }
  }
  else {
    if (publicRoutes.includes(to.path)) {
      return;
    }
    
    const redirectQuery = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
    return navigateTo(`/login${redirectQuery}`, { replace: true });
  }
}

async function handleClientRouteGuarding(
  to: RouteLocationNormalized,
  auth: ReturnType<typeof useAuthStore>,
) {
  const publicRoutes = ['/', '/login', '/register', '/reset-password', '/create-new-password', '/verify-otp'];

  if (auth.isAuthenticated && auth.user) {
    const onboardingRoute = '/onboarding';
    const hasCompletedOnboarding = auth.user.profile?.has_completed_onboarding;

    if (!hasCompletedOnboarding && to.path !== onboardingRoute) {
      return navigateTo(onboardingRoute, { replace: true });
    }

    if (hasCompletedOnboarding && to.path === onboardingRoute) {
      return navigateTo('/dashboard', { replace: true });
    }
    
    if (publicRoutes.includes(to.path)) {
      return navigateTo('/dashboard', { replace: true });
    }
  }
  else {
    if (publicRoutes.includes(to.path)) {
      return;
    }
    const redirectQuery = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
    return navigateTo(`/login${redirectQuery}`, { replace: true });
  }
}
