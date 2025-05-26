// stores/auth.ts - Fixed version with better state management
import { defineStore } from 'pinia';
import { ref, computed, getCurrentInstance } from 'vue';
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
  const isAuthenticated = computed(() => Boolean(user.value) && Boolean(accessToken.value));

  // Enhanced state management for preventing duplicates
  const isRefreshing = ref(false);
  const isInitialized = ref(false);
  const initializationSource = ref<'ssr' | 'client' | null>(null);
  let refreshPromise: Promise<void> | null = null;

  // Track if we're currently fetching profile to prevent duplicates
  const isFetchingProfile = ref(false);
  let profilePromise: Promise<User> | null = null;

  async function _performRefreshAndFetchProfile(): Promise<void> {
    try {
      const { $api } = useNuxtApp();
      const refreshResponse = await $api<TokenResponse>('/auth/refresh', {
        method: 'POST',
      });
      accessToken.value = refreshResponse.access_token;
      await fetchProfile(true);
    } catch (err) {
      await logoutSilently();
      throw err;
    }
  }

  async function initializeAuth(source: 'ssr' | 'client' = 'client'): Promise<void> {
    // If already initialized by SSR, don't re-initialize on client
    if (isInitialized.value && initializationSource.value === 'ssr' && source === 'client') {
      return Promise.resolve();
    }

    // If already authenticated, no need to initialize
    if (isAuthenticated.value) {
      isInitialized.value = true;
      initializationSource.value = source;
      return Promise.resolve();
    }

    // If already refreshing, wait for that promise
    if (isRefreshing.value && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing.value = true;
    refreshPromise = (async () => {
      try {
        if (accessToken.value && !user.value) {
          await fetchProfile();
        } else if (!accessToken.value) {
          await _performRefreshAndFetchProfile();
        }
        isInitialized.value = true;
        initializationSource.value = source;
      } catch (error) {
        // Reset state on error
        await logoutSilently();
        throw error;
      } finally {
        isRefreshing.value = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  // Method to hydrate from SSR payload without triggering API calls
  function hydrateFromSSR(ssrAccessToken: string, ssrUser: User): void {
    if (accessToken.value !== ssrAccessToken || user.value?.id !== ssrUser.id) {
      accessToken.value = ssrAccessToken;
      user.value = ssrUser;
    }
    isInitialized.value = true;
    initializationSource.value = 'ssr';
  }

  // Method to set user data directly (for server-side operations)
  function setUserData(userData: any): void {
    try {
      user.value = UserSchema.parse(userData);
    } catch (error) {
      console.error('Invalid user data:', error);
      user.value = null;
    }
  }

  async function login(payload: { email: string; password: string }): Promise<User> {
    const { $api } = useNuxtApp();
    const form = new URLSearchParams();
    form.append('grant_type', 'password');
    form.append('scope', '');
    form.append('username', payload.email);
    form.append('password', payload.password);

    const tokenResponse = await $api<TokenResponse>('/auth/token', {
      method: 'POST',
      body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    accessToken.value = tokenResponse.access_token;
    const profile = await fetchProfile();
    isInitialized.value = true;
    initializationSource.value = 'client';
    return profile;
  }

  async function fetchProfile(isAfterRefresh: boolean = false): Promise<User> {
    // Return existing user if we have one and not forcing refresh
    if (user.value && !isAfterRefresh) return user.value;

    // If already fetching profile, wait for that promise
    if (isFetchingProfile.value && profilePromise) {
      return profilePromise;
    }

    if (!accessToken.value) {
      await logoutSilently();
      throw new Error('Authentication required: No access token available to fetch profile.');
    }

    // Only proceed if we're in a valid Nuxt context (client-side or within proper server context)
    if (process.server && !getCurrentInstance() && !useNuxtApp()) {
      throw new Error('Cannot fetch profile: Invalid server context');
    }

    isFetchingProfile.value = true;
    profilePromise = (async (): Promise<User> => {
      try {
        const { $api } = useNuxtApp();
        const profileData = await $api('/auth/me');
        const parsedUser = UserSchema.parse(profileData);
        user.value = parsedUser;
        return parsedUser;
      } catch (error: any) {
        if (error.response && error.response.status === 401 && !isAfterRefresh) {
          await logoutSilently();
          throw error;
        }
        if (!isAfterRefresh) await logoutSilently();
        throw error;
      } finally {
        isFetchingProfile.value = false;
        profilePromise = null;
      }
    })();

    return profilePromise;
  }

  async function register(payload: {
    fullname: string;
    email: string;
    password: string;
  }): Promise<User> {
    const { $api } = useNuxtApp();
    await $api('/auth/register', { method: 'POST', body: payload });
    return login({ email: payload.email, password: payload.password });
  }

  async function logout() {
    const { $api } = useNuxtApp();
    try {
      await $api('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await logoutSilently();
    }
  }

  async function logoutSilently() {
    user.value = null;
    accessToken.value = null;
    isInitialized.value = false;
    initializationSource.value = null;
    isRefreshing.value = false;
    isFetchingProfile.value = false;
    refreshPromise = null;
    profilePromise = null;
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isRefreshing,
    isInitialized,
    initializationSource,
    isFetchingProfile,
    login,
    register,
    fetchProfile,
    logout,
    initializeAuth,
    hydrateFromSSR,
    setUserData,
  };
});
