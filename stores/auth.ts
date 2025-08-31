// stores/auth.ts - Fixed version
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { z } from 'zod';
import type { TokenResponse, User } from '~/types/auth';
import { log, debug, error as logError } from '~/utils/logger';

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
    if (import.meta.server) {
      // Always render as unauthenticated on SSR
      nuxtApp.payload.auth = { accessToken: null, user: null } as AuthPayload;
      isInitialized.value = true;
      return;
    } else {
      // Client-side initialization
      log('Auth Store: Initializing on client...');
      
      try {
        // Try to refresh token (this will check for cookies)
        await refreshToken();
        
        // If token refresh succeeded but no user data, fetch profile
        if (accessToken.value && !user.value) {
          await fetchProfile();
        }
        
        log('Auth Store: Initialization complete, authenticated:', isAuthenticated.value);
      } catch (error) {
        debug('Auth Store: No valid session found:', error);
        // Clear any partial state
        accessToken.value = null;
        user.value = null;
      } finally {
        isInitialized.value = true;
      }
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

    log('Auth Store: Attempting login...');
    
    const tokenResponse = await $api<TokenResponse>('/auth/token', {
      method: 'POST',
      body: form,
    });

    accessToken.value = tokenResponse.access_token;
    const profile = await fetchProfile();
    isInitialized.value = true;
    
    log('Auth Store: Login successful, user:', profile.email);
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
        log('Auth Store: Attempting token refresh...');
        const { $api } = useNuxtApp();
        
        const refreshResponse = await $api<TokenResponse>('/auth/refresh', {
          method: 'POST',
        });
        
        accessToken.value = refreshResponse.access_token;
        
        // Fetch user data if we don't have it
        if (!user.value && accessToken.value) {
          await fetchProfile();
        }
        
        log('Auth Store: Token refresh successful');
        return accessToken.value || '';
      } catch (error) {
        logError('Auth Store: Token refresh failed:', error);
        await logoutSilently();
        throw error;
      } finally {
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
      log('Auth Store: Logout API call successful');
    } catch (error) {
      logError('Auth Store: Logout API call failed:', error);
    } finally {
      await logoutSilently();
    }
  }

  async function logoutSilently() {
    log('Auth Store: Clearing auth state');
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