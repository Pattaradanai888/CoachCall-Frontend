// stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { z } from 'zod';
import type { TokenResponse } from '~/types/auth';

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  fullname: z.string(),
});

type User = z.infer<typeof UserSchema>;

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => Boolean(user.value));

  async function register(payload: { fullname: string; email: string; password: string }) {
    const { $api } = useNuxtApp();
    const response = await $api('/auth/register', { method: 'POST', body: payload });
    user.value = UserSchema.parse(response);
    return user.value;
  }

  async function login(payload: { email: string; password: string }) {
    const { $api } = useNuxtApp();
    const form = new URLSearchParams();
    form.append('grant_type', 'password');
    form.append('scope', '');
    form.append('username', payload.email);
    form.append('password', payload.password);

    const tokenResponse = await $api<TokenResponse>('/auth/token', {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    accessToken.value = tokenResponse.access_token;
    return fetchProfile();
  }

  async function fetchProfile() {
    if (user.value) return user.value;

    try {
      const { $api } = useNuxtApp();
      const profile = await $api('/auth/me');
      user.value = UserSchema.parse(profile);
      return user.value;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'status' in error.response
      ) {
        const status = (error.response as { status: number }).status;

        if (status === 401) {
          try {
            const { $api } = useNuxtApp();
            const refreshResponse = await $api<TokenResponse>('/auth/refresh', {
              method: 'POST',
            });
            accessToken.value = refreshResponse.access_token;
            return await fetchProfile(); // Retry with new token
          } catch {
            logout(); // If refresh fails, logout
          }
        }
      }
      throw error;
    }
  }

  async function logout() {
    const { $api } = useNuxtApp();
    try {
      await $api('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      user.value = null;
      accessToken.value = null;
    }
  }

  return { user, accessToken, isAuthenticated, register, login, fetchProfile, logout };
});
