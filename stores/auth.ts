import type { TokenResponse, User } from '~/types/auth';
// stores/auth.ts - Fixed version
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  profile: z.object({
    display_name: z.string(),
    profile_image_url: z.string().url().nullable().optional(),
    has_completed_onboarding: z.boolean(),
  }).nullable(),
}).transform((user) => {
  return {
    ...user,
    fullname: user.profile?.display_name ?? 'N/A',
    profile_image_url: user.profile?.profile_image_url,
  };
});

export type UserFromSchema = z.infer<typeof UserSchema>;

interface AuthPayload {
  accessToken: string | null;
  user: User | null;
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
  const isInitialized = ref(false);
  const isRefreshing = ref(false);

  let refreshPromise: Promise<void> | null = null;

  async function initialize(
    nuxtApp: ReturnType<typeof useNuxtApp>,
  ): Promise<void> {
    if (isInitialized.value) {
      return;
    }

    if (import.meta.server) {
      // Do not attempt refresh on server: FastAPI cookie is on its own domain and not visible to SWA SSR
      // Render as unauthenticated on SSR; client will hydrate and refresh immediately if cookies exist
      nuxtApp.payload.auth = { accessToken: null, user: null } as AuthPayload;
      isInitialized.value = true;
    }
    else { // Client-side
      const payload = nuxtApp.payload.auth as AuthPayload | undefined;
      // On initial client load, hydrate from the server-provided payload.
      if (payload && payload.accessToken && payload.user) {
        accessToken.value = payload.accessToken;
        user.value = payload.user;
      }
      // After initial load, payload will be empty. If we don't have a token,
      // it means we are navigating client-side and need to check our auth status.
  else if (!accessToken.value) {
        try {
          // This will attempt to get a new token. If it fails, it will logout silently.
          await refreshToken();
        }
        catch (e) {
          console.error('Client-side refresh token failed:', e);
        }
      }
      isInitialized.value = true;
    }
  }

  async function login(
    payload: { email: string; password: string },
  ): Promise<User> {
    const { $api } = useNuxtApp();
    const form = new URLSearchParams();
    form.append('grant_type', 'password');
    form.append('username', payload.email);
    form.append('password', payload.password);

    const tokenResponse = await $api<TokenResponse>('/auth/token', {
      method: 'POST',
      body: form,
    });

    accessToken.value = tokenResponse.access_token;
    const profile = await fetchProfile();
    isInitialized.value = true;
    return profile;
  }

  async function fetchProfile(): Promise<User> {
    const { $api } = useNuxtApp();
    const profileData = await $api('/auth/me');
    const parsedUser = UserSchema.parse(profileData);
    user.value = parsedUser;
    return parsedUser;
  }

  async function refreshToken(): Promise<string> {
    if (isRefreshing.value && refreshPromise) {
      await refreshPromise;
      return accessToken.value || '';
    }

    isRefreshing.value = true;
    const promise = (async () => {
      try {
        const { $api } = useNuxtApp();
        const refreshResponse = await $api<TokenResponse>('/auth/refresh', {
          method: 'POST',
        });
        accessToken.value = refreshResponse.access_token;
        return accessToken.value || '';
      }
      catch (error) {
        console.error('Token refresh failed:', error);
        await logoutSilently();
        throw error;
      }
      finally {
        isRefreshing.value = false;
        refreshPromise = null;
      }
    })();
    refreshPromise = promise.then(() => {});
    return promise;
  }

  async function logout() {
    try {
      const { $api } = useNuxtApp();
      await $api('/auth/logout', { method: 'POST' });
    }
    catch (error) {
      console.error('Logout API call failed:', error);
    }
    finally {
      await logoutSilently();
    }
  }

  async function logoutSilently() {
    user.value = null;
    accessToken.value = null;
    isInitialized.value = false;
  }

  async function updateDisplayName(newDisplayName: string): Promise<User> {
    const { $api } = useNuxtApp();
    const response = await $api<{
      id: number;
      email: string;
      fullname: string;
      profile_image_url?: string | null;
    }>('/profile/me', {
      method: 'PUT',
      body: { fullname: newDisplayName },
    });

    const updatedUserData: User = {
      ...user.value!,
      id: response.id,
      email: response.email,
      fullname: response.fullname,
      profile: {
        display_name: response.fullname,
        profile_image_url:
          response.profile_image_url
          ?? user.value?.profile?.profile_image_url
          ?? null,
        has_completed_onboarding:
          user.value?.profile?.has_completed_onboarding ?? false,
      },
    };

    user.value = UserSchema.parse(updatedUserData);
    return user.value;
  }

  // Simple setter to allow components to update the user in store (e.g., after profile image changes)
  function setUserData(newUser: User) {
    user.value = UserSchema.parse(newUser);
  }

  async function register(payload: {
    fullname: string;
    email: string;
    password: string;
  }): Promise<void> {
    const { $api } = useNuxtApp();
    await $api('/auth/register', { method: 'POST', body: payload });
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isInitialized,
    isRefreshing,
    initialize,
    login,
    register,
    fetchProfile,
    updateDisplayName,
    logout,
    refreshToken,
    logoutSilently,
  setUserData,
  };
});