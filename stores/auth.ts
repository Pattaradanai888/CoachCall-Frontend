// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { z } from 'zod'

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  fullname: z.string(),
})

type User = z.infer<typeof UserSchema>

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => Boolean(user.value))

  async function register(payload: { fullname: string; email: string; password: string }) {
    const { $api } = useNuxtApp()
    const response = await $api('/auth/register', { method: 'POST', body: payload })
    user.value = UserSchema.parse(response)
    return user.value
  }

  async function login(payload: { email: string; password: string }) {
    const { $api } = useNuxtApp()
    const form = new URLSearchParams()
    form.append('grant_type', 'password')
    form.append('scope', '')
    form.append('username', payload.email)
    form.append('password', payload.password)

    await $api('/auth/token', {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return fetchProfile()
  }

  async function fetchProfile() {
    const { $api } = useNuxtApp()
    const profile = await $api('/auth/me')
    user.value = UserSchema.parse(profile)
    return user.value
  }

  async function logout() {
    const { $api } = useNuxtApp()
    await $api('/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, isAuthenticated, register, login, fetchProfile, logout }
})
