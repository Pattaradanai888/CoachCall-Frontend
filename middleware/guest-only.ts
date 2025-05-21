import { useAuthStore } from '~/stores/auth'
import { navigateTo } from '#app'

export default defineNuxtRouteMiddleware((_to) => {
  const auth = useAuthStore()

  // Skip backend call. If user is already known to be authenticated, block access
  if (auth.isAuthenticated) {
    return navigateTo('/')
  }

  // If user is not authenticated (no token in store), allow access
  return
})
