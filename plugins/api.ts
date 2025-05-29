// plugins/api.ts
import { defineNuxtPlugin } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore();

  const api = $fetch.create({
    baseURL: useRuntimeConfig().public.apiBase as string,
    credentials: 'include',
    async onRequest({ options }) {
      // Initialize headers if not present
      if (!options.headers) {
        options.headers = new Headers();
      }

      // Convert to Headers object if it's a plain object
      if (!(options.headers instanceof Headers)) {
        const headersObj = options.headers as Record<string, string>;
        options.headers = new Headers();
        for (const [key, value] of Object.entries(headersObj)) {
          (options.headers as Headers).set(key, value);
        }
      }

      const headers = options.headers as Headers;

      // Only set Content-Type if not already set and not FormData
      if (!headers.get('Content-Type') && !(options.body instanceof FormData)) {
        // Check if body is URLSearchParams (for form data like login)
        if (options.body instanceof URLSearchParams) {
          headers.set('Content-Type', 'application/x-www-form-urlencoded');
        } else if (options.body) {
          headers.set('Content-Type', 'application/json');
        }
      }

      // Add authorization header if token exists
      if (authStore.accessToken) {
        headers.set('Authorization', `Bearer ${authStore.accessToken}`);
      }
    },
  });

  nuxtApp.provide('api', api);
});
