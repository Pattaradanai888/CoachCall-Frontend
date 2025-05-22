// stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { z } from 'zod';
import type { TokenResponse } from '~/types/auth';
import { useStorage } from '@vueuse/core';

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  fullname: z.string(),
});

type User = z.infer<typeof UserSchema>;

function is401Error(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'status' in error.response &&
    (error.response as { status: number }).status === 401
  );
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = useStorage<string | null>('accessToken', null);
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => Boolean(user.value));

  const initializeFromServer = async () => {
    if (import.meta.server) {
      try {
        // Try to get user info via server API that handles refresh
        const profile = await $fetch('/api/auth/me');
        user.value = UserSchema.parse(profile);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

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
      let profile;

      if (import.meta.server) {
        // Server-side: use server API
        profile = await $fetch('/api/auth/me');
      } else {
        // Client-side: use direct API call
        const { $api } = useNuxtApp();
        profile = await $api('/auth/me');
      }

      user.value = UserSchema.parse(profile);
      return user.value;
    } catch (error) {
      // Handle 401 errors with refresh logic (client-side only)
      if (!import.meta.server && is401Error(error)) {
        try {
          const refreshResponse = await $fetch<TokenResponse>('/api/auth/refresh', {
            method: 'POST',
          });
          accessToken.value = refreshResponse.access_token;
          return await fetchProfile();
        } catch {
          logout();
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

  return {
    user,
    accessToken,
    isAuthenticated,
    initializeFromServer,
    register,
    login,
    fetchProfile,
    logout,
  };
});
