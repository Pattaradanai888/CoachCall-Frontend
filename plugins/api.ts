import type { FetchOptions, FetchRequest } from 'ofetch';
import { defineNuxtPlugin, useRuntimeConfig } from '#app';
// plugins/api.ts
import { ofetch } from 'ofetch';
import { isRef, unref, type Ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();

  const baseFetcher = ofetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',

    onRequest({ options }) {
      if (!options.headers) {
        options.headers = new Headers();
      }
      const headers = options.headers as Headers;

  type TokenLike = string | null | Ref<string | null>;
  const tokenSource = (authStore as unknown as { accessToken: TokenLike }).accessToken;
  const token = isRef(tokenSource) ? unref(tokenSource) : tokenSource;
  if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        if (options.body instanceof URLSearchParams) {
          headers.set('Content-Type', 'application/x-www-form-urlencoded');
        }
        else if (options.body) {
          headers.set('Content-Type', 'application/json');
        }
      }
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
    }
    catch (err: unknown) {
      if (is401(err) && !String(request).includes('/auth/refresh')) {
        await authStore.refreshToken();
        return await baseFetcher<T>(request, options);
      }
      throw err;
    }
  };

  nuxtApp.provide('api', apiFetch);
});
