// plugins/init-auth.ts
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  if (!auth.user) {
    try {
      await auth.fetchProfile()
    } catch {
      // User not logged in — ignore
    }
  }
})
