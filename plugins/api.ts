// plugins/api.ts
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const api = $fetch.create({
    baseURL: useRuntimeConfig().public.apiBase as string,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  nuxtApp.provide('api', api)
})
