// middleware/auth.global.ts
import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useRequestHeaders,
  useAuthStore,
  useNuxtApp,
} from '#imports';

let executionCounter = 0;
let serverAuthPromise: Promise<void> | null = null;

export default defineNuxtRouteMiddleware(async (to, from) => {
  const id = ++executionCounter;
  const auth = useAuthStore();
  const nuxtApp = useNuxtApp();

  if (import.meta.hot) {
    return;
  }

  if (process.server) {
    // Hydrate from payload if present
    if (nuxtApp.payload.auth?.accessToken && nuxtApp.payload.auth?.user) {
      if (!auth.accessToken) auth.accessToken = nuxtApp.payload.auth.accessToken;
      if (!auth.user) auth.user = nuxtApp.payload.auth.user;
    }

    // If no token and not yet processed, attempt refresh+profile
    if (!auth.accessToken && !nuxtApp.payload.auth?.processed) {
      if (!serverAuthPromise) {
        serverAuthPromise = performServerAuth(auth, nuxtApp);
      }
      try {
        await serverAuthPromise;
      } finally {
        serverAuthPromise = null;
      }
    }
    // If token exists but user missing and not yet processed, fetch profile
    else if (auth.accessToken && !auth.user && !nuxtApp.payload.auth?.processed) {
      if (!serverAuthPromise) {
        serverAuthPromise = fetchProfileAndSetPayload(auth, nuxtApp);
      }
      try {
        await serverAuthPromise;
      } finally {
        serverAuthPromise = null;
      }
    }

    // Route guard
    return handleServerRouteGuarding(to, auth);
  }

  // Client-side route guard
  if (process.client) {
    return handleClientRouteGuarding(to, auth);
  }
});

async function performServerAuth(auth: any, nuxtApp: any): Promise<void> {
  const headers = useRequestHeaders(['cookie']);

  if (!headers.cookie) {
    nuxtApp.payload.auth = { accessToken: null, user: null, processed: true };
    return;
  }

  const refresh = await $fetch<{ access_token: string }>('/api/auth/refresh', {
    method: 'POST',
    headers,
  });
  auth.accessToken = refresh.access_token;

  const profileData = await $fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  auth.setUserData(profileData);

  nuxtApp.payload.auth = {
    accessToken: auth.accessToken,
    user: JSON.parse(JSON.stringify(auth.user)),
    processed: true,
  };
}

async function fetchProfileAndSetPayload(auth: any, nuxtApp: any): Promise<void> {
  const profileData = await $fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  auth.setUserData(profileData);

  nuxtApp.payload.auth = {
    accessToken: auth.accessToken,
    user: JSON.parse(JSON.stringify(auth.user)),
    processed: true,
  };
}

function handleServerRouteGuarding(to: any, auth: any) {
  const publicRoutes = ['/login', '/register'];

  if (publicRoutes.includes(to.path) && auth.isAuthenticated) {
    return navigateTo('/dashboard', { replace: true });
  }
  if (to.path === '/' && auth.isAuthenticated) {
    return navigateTo('/dashboard', { replace: true });
  }
  if (!publicRoutes.includes(to.path) && to.path !== '/' && !auth.isAuthenticated) {
    const redirectQuery =
      to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
    return navigateTo(`/login${redirectQuery}`, { replace: true });
  }
}

async function handleClientRouteGuarding(to: any, auth: any) {
  const publicRoutes = ['/login', '/register'];

  if (!auth.isInitialized) {
    await Promise.resolve(); // nextTick equivalent
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
    const redirectQuery =
      to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
    if (auth.isInitialized) {
      return navigateTo(`/login${redirectQuery}`, { replace: true });
    }
    if (!auth.isRefreshing) {
      try {
        await auth.initializeAuth('client');
        if (!auth.isAuthenticated) {
          return navigateTo(`/login${redirectQuery}`, { replace: true });
        }
      } catch {
        return navigateTo(`/login${redirectQuery}`, { replace: true });
      }
    }
  }
}
