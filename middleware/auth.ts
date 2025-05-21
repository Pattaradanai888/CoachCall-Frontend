// middleware/auth.ts
import { useAuthStore } from '~/stores/auth'
import { navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    try {
      await auth.fetchProfile()
    } catch {
      return navigateTo('/login')
    }
  }
  if (auth.isAuthenticated && ['/login', '/register'].includes(to.path)) {
    return navigateTo('/')
  }
})
