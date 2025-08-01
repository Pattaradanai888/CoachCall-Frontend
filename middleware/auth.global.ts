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

    if (import.meta.server) {
      // Hydrate from payload if present
      const authPayload = nuxtApp.payload.auth as AuthPayload | undefined;
      if (authPayload?.accessToken && authPayload?.user) {
        if (!auth.accessToken)
          auth.accessToken = authPayload.accessToken;
        if (!auth.user)
          auth.user = authPayload.user;
      }

      // If no token and not yet processed, attempt refresh+profile
      if (!auth.accessToken && !authPayload?.processed) {
        if (!serverAuthPromise) {
          serverAuthPromise = performServerAuth(auth, nuxtApp);
        }
        try {
          await serverAuthPromise;
        }
        catch (error) {
          console.error('Server auth failed:', error);
          // Set processed to true even on failure to prevent infinite loops
          nuxtApp.payload.auth = {
            accessToken: null,
            user: null,
            processed: true,
          } satisfies AuthPayload;
        }
        finally {
          serverAuthPromise = null;
        }
      }
      // If token exists but user missing and not yet processed, fetch profile
      else if (
        auth.accessToken
        && !auth.user
        && !(nuxtApp.payload.auth as AuthPayload)?.processed
      ) {
        if (!serverAuthPromise) {
          serverAuthPromise = fetchProfileAndSetPayload(auth, nuxtApp);
        }
        try {
          await serverAuthPromise;
        }
        catch (error) {
          console.error('Server profile fetch failed:', error);
          // Clear auth state on profile fetch failure
          auth.accessToken = null;
          auth.user = null;
          nuxtApp.payload.auth = {
            accessToken: null,
            user: null,
            processed: true,
          } satisfies AuthPayload;
        }
        finally {
          serverAuthPromise = null;
        }
      }

      // Route guard
      return handleServerRouteGuarding(to, auth);
    }

    // Client-side route guard
    if (import.meta.client) {
      return handleClientRouteGuarding(to, auth);
    }
  },
);

async function performServerAuth(
  auth: ReturnType<typeof useAuthStore>,
  nuxtApp: ReturnType<typeof useNuxtApp>,
): Promise<void> {
  const headers = useRequestHeaders(['cookie']);
  const config = useRuntimeConfig();

  if (!headers.cookie) {
    nuxtApp.payload.auth = {
      accessToken: null,
      user: null,
      processed: true,
    } satisfies AuthPayload;
    return;
  }

  try {
    const refresh = await $fetch<RefreshTokenResponse>(`${config.public.apiBase}/auth/refresh`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });
    auth.accessToken = refresh.access_token;

    const profileData = await $fetch<User>(`${config.public.apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    auth.setUserData(profileData);

    nuxtApp.payload.auth = {
      accessToken: auth.accessToken,
      user: JSON.parse(JSON.stringify(auth.user)),
      processed: true,
    } satisfies AuthPayload;
  }
  catch (error) {
    console.error('Server auth failed:', error);
    // If refresh fails, clear auth state
    auth.accessToken = null;
    auth.user = null;
    nuxtApp.payload.auth = {
      accessToken: null,
      user: null,
      processed: true,
    } satisfies AuthPayload;
    throw error;
  }
}

async function fetchProfileAndSetPayload(
  auth: ReturnType<typeof useAuthStore>,
  nuxtApp: ReturnType<typeof useNuxtApp>,
): Promise<void> {
  const config = useRuntimeConfig();
  
  try {
    const profileData = await $fetch<User>(`${config.public.apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    auth.setUserData(profileData);

    nuxtApp.payload.auth = {
      accessToken: auth.accessToken,
      user: JSON.parse(JSON.stringify(auth.user)),
      processed: true,
    } satisfies AuthPayload;
  }
  catch (error) {
    console.error('Profile fetch failed:', error);
    // If profile fetch fails, clear auth state
    auth.accessToken = null;
    auth.user = null;
    nuxtApp.payload.auth = {
      accessToken: null,
      user: null,
      processed: true,
    } satisfies AuthPayload;
    throw error;
  }
}

function handleServerRouteGuarding(
  to: RouteLocationNormalized,
  auth: ReturnType<typeof useAuthStore>,
) {
  const publicRoutes = ['/login', '/register'];

  if (auth.isAuthenticated && auth.user) {
    const onboardingRoute = '/onboarding';
    const hasCompletedOnboarding = auth.user.profile?.has_completed_onboarding;

    if (!hasCompletedOnboarding && to.path !== onboardingRoute) {
      if (to.path.startsWith('/api/')) {
        return;
      }
      return navigateTo(onboardingRoute, { replace: true });
    }

    if (hasCompletedOnboarding && to.path === onboardingRoute) {
      return navigateTo('/dashboard', { replace: true });
    }
  }
  if (publicRoutes.includes(to.path) && auth.isAuthenticated) {
    return navigateTo('/dashboard', { replace: true });
  }
  if (to.path === '/' && auth.isAuthenticated) {
    return navigateTo('/dashboard', { replace: true });
  }
  if (!publicRoutes.includes(to.path) && to.path !== '/' && !auth.isAuthenticated) {
    const redirectQuery
      = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
    return navigateTo(`/login${redirectQuery}`, { replace: true });
  }
}

async function handleClientRouteGuarding(
  to: RouteLocationNormalized,
  auth: ReturnType<typeof useAuthStore>,
) {
  const publicRoutes = ['/login', '/register'];

  if (!auth.isInitialized) {
    await Promise.resolve();
  }

  if (auth.isAuthenticated && auth.user) {
    const onboardingRoute = '/onboarding';
    const hasCompletedOnboarding = auth.user.profile?.has_completed_onboarding;

    if (!hasCompletedOnboarding && to.path !== onboardingRoute) {
      return navigateTo(onboardingRoute, { replace: true });
    }

    if (hasCompletedOnboarding && to.path === onboardingRoute) {
      return navigateTo('/dashboard', { replace: true });
    }
  }

  if (publicRoutes.includes(to.path)) {
    if (auth.isAuthenticated) {
      return navigateTo('/dashboard', { replace: true });
    }
    return;
  }

  if (to.path === '/') {
    if (auth.isAuthenticated) {
      return navigateTo('/dashboard', { replace: true });
    }
    return;
  }

  if (!auth.isAuthenticated) {
    const redirectQuery
      = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';

    if (auth.isInitialized) {
      return navigateTo(`/login${redirectQuery}`, { replace: true });
    }

    if (!auth.isRefreshing) {
      try {
        await auth.initializeAuth('client');
        if (!auth.isAuthenticated) {
          return navigateTo(`/login${redirectQuery}`, { replace: true });
        }
      }
      catch (error) {
        console.error('Client auth initialization failed:', error);
        return navigateTo(`/login${redirectQuery}`, { replace: true });
      }
    }
    else {
      // If already refreshing, wait for it to complete
      while (auth.isRefreshing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (!auth.isAuthenticated) {
        return navigateTo(`/login${redirectQuery}`, { replace: true });
      }
    }
  }
}
