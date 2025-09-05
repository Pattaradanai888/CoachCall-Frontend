// stores/auth.ts - Fixed version
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { z } from 'zod';
import type { TokenResponse, User } from '~/types/auth';
import { log, debug, logError } from '~/utils/logger';

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
  
  // Show loading only when necessary to avoid flashing
  const isCheckingAuth = computed(() => {
    // Show loading during initial client-side initialization
    // but only for a brief moment to check for existing session
    if (!isInitialized.value && import.meta.client) {
      return true;
    }
    
    // Show loading when refreshing an existing session
    if (isRefreshing.value) {
      return true;
    }
    
    return false;
  });

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
        // Try to refresh token silently (this will check for cookies)
        // Set initialized to true quickly to minimize loading flash
        const refreshPromise = refreshTokenSilently();
        
        // Set as initialized after starting the refresh to minimize loading time
        isInitialized.value = true;
        
        await refreshPromise;
        
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
        // Ensure initialized is set even on error
        isInitialized.value = true;
      }
    }
  }

  async function refreshTokenSilently(): Promise<string> {
    try {
      log('Auth Store: Attempting silent token refresh...');
      const { $api } = useNuxtApp();
      
      const refreshResponse = await $api<TokenResponse>('/auth/refresh', {
        method: 'POST',
      });
      
      accessToken.value = refreshResponse.access_token;
      
      // Fetch user data if we don't have it
      if (!user.value && accessToken.value) {
        await fetchProfile();
      }
      
      log('Auth Store: Silent token refresh successful');
      return accessToken.value || '';
    } catch (error) {
      // Don't log as error for silent refresh - this is expected when no session exists
      debug('Auth Store: Silent token refresh failed:', error);
      accessToken.value = null;
      user.value = null;
      throw error;
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
      
      // Force clear refresh_token cookie on client side as well
      // This helps in environments where the server-side cookie clearing isn't working
      if (import.meta.client) {
        // Import and use the cookie utility functions
        const { clearCookie, debugLogoutCookies } = await import('~/utils/cookieUtils');
        
        // Debug cookies before clearing
        debugLogoutCookies();
        
        // Clear the refresh token cookie
        clearCookie('refresh_token');
        
        // Debug cookies after clearing
        debugLogoutCookies();
        
        log('Auth Store: Manually cleared refresh_token cookie');
      }
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
    // Keep isInitialized as true to prevent re-initialization
    // isInitialized.value = false; // Remove this line
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
    isCheckingAuth,
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