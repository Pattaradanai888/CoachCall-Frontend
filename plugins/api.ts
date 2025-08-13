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

    onRequest({ options }) {
      const headers = new Headers(options.headers as HeadersInit | undefined);

      // Keep the authorization header logic
      type TokenLike = string | null | Ref<string | null>;
      const tokenSource = (authStore as unknown as { accessToken: TokenLike }).accessToken;
      const token = isRef(tokenSource) ? unref(tokenSource) : tokenSource;
      if (token) {
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
      if (is401(err) && !String(request).includes('/auth/refresh')) {
        await authStore.refreshToken();
        return await baseFetcher<T>(request, options);
      }
      throw err;
    }
  };

  nuxtApp.provide('api', apiFetch);
});
