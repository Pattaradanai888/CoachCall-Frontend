// plugins/auth-init.client.ts
import { log } from '~/utils/logger';

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // This runs on client-side only, immediately after app initialization
  if (!authStore.isInitialized) {
    log('Auth plugin: Initializing authentication...')
    await authStore.initialize(useNuxtApp())
  }
})
