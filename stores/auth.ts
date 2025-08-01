import type { TokenResponse, User } from '~/types/auth';
// stores/auth.ts - Fixed version
import { defineStore } from 'pinia';
import { computed, getCurrentInstance, ref } from 'vue';
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
        credentials: 'include',
      });
      accessToken.value = refreshResponse.access_token;
      await fetchProfile(true);
    }
    catch (err) {
      console.error('Refresh and profile fetch failed:', err);
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
        }
        else if (!accessToken.value) {
          await _performRefreshAndFetchProfile();
        }
        isInitialized.value = true;
        initializationSource.value = source;
      }
      catch (error) {
        console.error('Auth initialization failed:', error);
        // Reset state on error
        await logoutSilently();
        throw error;
      }
      finally {
        isRefreshing.value = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  // Method to manually refresh token (can be called from API plugin)
  async function refreshToken(): Promise<string> {
    if (isRefreshing.value && refreshPromise) {
      await refreshPromise;
      return accessToken.value || '';
    }

    isRefreshing.value = true;
    refreshPromise = (async () => {
      try {
        const { $api } = useNuxtApp();
        const refreshResponse = await $api<TokenResponse>('/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        accessToken.value = refreshResponse.access_token;

        // Try to fetch profile but don't fail if it doesn't work
        try {
          await fetchProfile(true);
        }
        catch (profileError) {
          console.warn('Profile fetch failed after refresh:', profileError);
        }
      }
      catch (error) {
        console.error('Token refresh failed:', error);
        await logoutSilently();
        throw error;
      }
    })();

    await refreshPromise;
    isRefreshing.value = false;
    refreshPromise = null;

    return accessToken.value || '';
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

  function setUserData(userData: Partial<User> | User): void {
    // userData can be partial for updates too
    try {
      if (user.value && typeof userData === 'object' && userData !== null) {
        const updatedUserData = { ...user.value, ...userData };

        // FIXED: Ensure profile has required fields when updating
        if (updatedUserData.profile) {
          // Ensure display_name is always provided
          updatedUserData.profile = {
          display_name: updatedUserData.profile.display_name || user.value.profile?.display_name || user.value.fullname || 'N/A',
          profile_image_url: updatedUserData.profile.profile_image_url,
          // Always preserve the existing onboarding status when updating
          has_completed_onboarding: updatedUserData.profile.has_completed_onboarding ?? user.value.profile?.has_completed_onboarding ?? false,
        };
        }

        user.value = UserSchema.parse(updatedUserData);
      }
      else {
        user.value = UserSchema.parse(userData);
      }
    }
    catch (error) {
      console.error('Invalid user data:', error, userData);
      if (!user.value)
        user.value = null;
    }
  }

  async function login(payload: { email: string; password: string }): Promise<User> {
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

  async function fetchProfile(isAfterRefresh: boolean = false): Promise<User> {
    // Return existing user if we have one and not forcing refresh
    if (user.value && !isAfterRefresh)
      return user.value;

    // If already fetching profile, wait for that promise
    if (isFetchingProfile.value && profilePromise) {
      return profilePromise;
    }

    if (!accessToken.value) {
      await logoutSilently();
      throw new Error('Authentication required: No access token available to fetch profile.');
    }

    // Only proceed if we're in a valid Nuxt context (client-side or within proper server context)
    if (import.meta.server && !getCurrentInstance() && !useNuxtApp()) {
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
      }
      catch (error: unknown) {
        // Let the API plugin handle 401 errors with automatic refresh
        // Only logout if it's not a 401 or if refresh has already been attempted
        if (
          error
          && typeof error === 'object'
          && 'response' in error
          && error.response
          && typeof error.response === 'object'
          && 'status' in error.response
          && error.response.status === 401
          && isAfterRefresh // Only logout if this was after a refresh attempt
        ) {
          await logoutSilently();
        }
        throw error;
      }
      finally {
        isFetchingProfile.value = false;
        profilePromise = null;
      }
    })();

    return profilePromise;
  }

  // UPDATED: Update profile method
  async function updateDisplayName(newDisplayName: string): Promise<User> {
    const { $api } = useNuxtApp();

    if (!accessToken.value) {
      throw new Error('Authentication required: No access token available.');
    }

    try {
      // Call the API to update the display name
      const response = await $api<{
        fullname: string;
        id: number;
        email: string;
        profile_image_url?: string | null;
      }>('/profile/me', {
        method: 'PUT',
        body: { fullname: newDisplayName },
      });

      // FIXED: Create properly typed user data
      const updatedUserData: User = {
        ...user.value!,
        id: response.id,
        email: response.email,
        fullname: response.fullname,
        profile: {
          display_name: response.fullname, // Always ensure display_name is set
          profile_image_url: response.profile_image_url ?? user.value?.profile?.profile_image_url ?? null,
          has_completed_onboarding: user.value?.profile?.has_completed_onboarding ?? false,
        },
      };

      user.value = UserSchema.parse(updatedUserData);
      return user.value;
    }
    catch (error: unknown) {
      console.error('Display name update failed:', error);
      throw error;
    }
  }

  async function register(payload: {
    fullname: string;
    email: string;
    password: string;
  }): Promise<void> {
    const { $api } = useNuxtApp();
    await $api('/auth/register', { method: 'POST', body: payload });
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
    updateDisplayName,
    logout,
    initializeAuth,
    hydrateFromSSR,
    setUserData,
    refreshToken,
    logoutSilently,
  };
});
