// plugins/auth-init.client.ts
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // This runs on client-side only, immediately after app initialization
  if (!authStore.isInitialized) {
    console.log('Auth plugin: Initializing authentication...')
    await authStore.initialize(useNuxtApp())
  }
})
