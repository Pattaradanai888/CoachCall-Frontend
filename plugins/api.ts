import type { FetchOptions, FetchRequest } from 'ofetch';
import { defineNuxtPlugin, useRuntimeConfig } from '#app';
// plugins/api.ts
import { ofetch } from 'ofetch';
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

      if (authStore.accessToken) {
        headers.set('Authorization', `Bearer ${authStore.accessToken}`);
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

  const apiFetch = async <T>(request: FetchRequest, options?: FetchOptions): Promise<T> => {
    const error = await baseFetcher<T>(request, options as any).catch(e => e);
    if (error?.response?.status === 401 && !String(request).includes('/auth/refresh')) {
      await authStore.refreshToken();

      return await baseFetcher<T>(request, options as any);
    }

    if (error instanceof Error) {
      throw error;
    }

    return error;
  };

  nuxtApp.provide('api', apiFetch);
});
