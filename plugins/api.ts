// plugins/api.ts
import { defineNuxtPlugin } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore();

  const api = $fetch.create({
    baseURL: useRuntimeConfig().public.apiBase as string,
    credentials: 'include',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    async onRequest({ options }) {
      if (authStore.accessToken) {
        (options.headers as Headers).set('Authorization', `Bearer ${authStore.accessToken}`);
      }
    },
  });

  nuxtApp.provide('api', api);
});
