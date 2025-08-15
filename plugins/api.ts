import type { FetchOptions, FetchRequest } from 'ofetch';
import { defineNuxtPlugin } from '#app';
import { ofetch } from 'ofetch';
import { isRef, unref, type Ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore();

  const baseFetcher = ofetch.create({
    // CHANGED: Use the SWA domain for API calls instead of external backend
    baseURL: '/api', // This will use your SWA domain + /api
    credentials: 'include',

    onRequest({ options , request }) {
      const headers = new Headers(options.headers as HeadersInit | undefined);

      const tokenSource = (authStore as unknown as { accessToken: string | null }).accessToken;
      const token = isRef(tokenSource) ? unref(tokenSource) : tokenSource;
      const requestUrl = String(request);
      if (token && !requestUrl.startsWith('/api')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
        if (options.body instanceof URLSearchParams) {
          headers.set('Content-Type', 'application/x-www-form-urlencoded');
        } else {
          headers.set('Content-Type', 'application/json');
        }
      }

      options.headers = headers;
    },
  });

  function is401(err: unknown): boolean {
    if (typeof err !== 'object' || err === null) return false;
    const e = err as Record<string, unknown>;
    const response = e['response'] as Record<string, unknown> | undefined;
    const status = response?.['status'] as number | undefined;
    return status === 401;
  }

  const apiFetch = async <T>(request: FetchRequest, options?: FetchOptions<'json'>): Promise<T> => {
    try {
      return await baseFetcher<T>(request, options);
    } catch (err: unknown) {
      // Only attempt token refresh on client-side to avoid SSR composable issues
      if (is401(err) && !String(request).includes('/auth/refresh') && import.meta.client) {
        console.log('API: 401 detected, attempting token refresh...');
        try {
          await authStore.refreshToken();
          console.log('API: Token refresh successful, retrying request');
          return await baseFetcher<T>(request, options);
        } catch (refreshError) {
          console.log('API: Token refresh failed, logging out');
          await authStore.logoutSilently();
          if (import.meta.client) {
            await navigateTo('/login');
          }
          throw refreshError;
        }
      }
      throw err;
    }
  };

  nuxtApp.provide('api', apiFetch);
});
