// stores/passwordReset.ts
import { defineStore } from 'pinia';

export const usePasswordResetStore = defineStore('passwordReset', () => {
  const { $api } = useNuxtApp();

  // State
  const emailForReset = ref<string | null>(null);
  const verifiedOtp = ref<string | null>(null);
  const isLoading = ref(false);
  const isSendingOtp = ref(false);
  const error = ref<string | null>(null);
  const lastRequestTime = ref<number | null>(null);
  const isInitialized = ref(false);

  // Constants
  const STORAGE_KEYS = {
    EMAIL: 'reset-email',
    OTP: 'verified-otp',
    TIMESTAMP: 'reset-timestamp',
  } as const;

  // Initialize from storage (client-side only)
  function initializeFromStorage() {
    if (import.meta.server || isInitialized.value)
      return;

    try {
      const storedEmail = localStorage.getItem(STORAGE_KEYS.EMAIL);
      const storedOtp = localStorage.getItem(STORAGE_KEYS.OTP);
      const storedTimestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);

      if (storedTimestamp) {
        const timestamp = Number.parseInt(storedTimestamp);
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);

        if (timestamp < thirtyMinutesAgo) {
          clearResetState();
          return;
        }
      }

      if (storedEmail)
        emailForReset.value = storedEmail;
      if (storedOtp)
        verifiedOtp.value = storedOtp;
      if (storedTimestamp)
        lastRequestTime.value = Number.parseInt(storedTimestamp);

      isInitialized.value = true;
    }
    catch (error) {
      console.error('Failed to initialize from storage:', error);
      clearResetState();
    }
  }

  // Watch for changes and persist to storage
  if (import.meta.client) {
    watch([emailForReset, verifiedOtp], () => {
      if (!isInitialized.value)
        return;

      try {
        if (emailForReset.value) {
          localStorage.setItem(STORAGE_KEYS.EMAIL, emailForReset.value);
          localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
        }
        else {
          localStorage.removeItem(STORAGE_KEYS.EMAIL);
          localStorage.removeItem(STORAGE_KEYS.TIMESTAMP);
        }

        if (verifiedOtp.value) {
          localStorage.setItem(STORAGE_KEYS.OTP, verifiedOtp.value);
        }
        else {
          localStorage.removeItem(STORAGE_KEYS.OTP);
        }
      }
      catch (error) {
        console.error('Failed to persist to storage:', error);
      }
    }, { immediate: false });
  }

  // Rate limiting check (client-side)
  function canSendRequest(): boolean {
    if (!lastRequestTime.value)
      return true;

    const timeSinceLastRequest = Date.now() - lastRequestTime.value;
    const minInterval = 60 * 1000; // 1 minute minimum between requests

    return timeSinceLastRequest >= minInterval;
  }

  function getTimeUntilNextRequest(): number {
    if (!lastRequestTime.value)
      return 0;

    const timeSinceLastRequest = Date.now() - lastRequestTime.value;
    const minInterval = 60 * 1000;

    return Math.max(0, minInterval - timeSinceLastRequest);
  }

  async function requestReset(email: string): Promise<{ success: boolean; canRetryIn?: number }> {
    // Client-side rate limiting
    if (!canSendRequest()) {
      const retryIn = Math.ceil(getTimeUntilNextRequest() / 1000);
      error.value = `Please wait ${retryIn} seconds before requesting another code.`;
      return { success: false, canRetryIn: retryIn };
    }

    isSendingOtp.value = true;
    error.value = null;

    try {
      await $api('/password-reset/request-otp', {
        method: 'POST',
        body: { email },
      });

      emailForReset.value = email;
      lastRequestTime.value = Date.now();

      return { success: true };
    }
    catch (e: unknown) {
      const apiError = e as { data?: { detail?: string }; status?: number };
      if (apiError.status === 429) {
        error.value = 'Too many requests. Please wait before trying again.';
      }
      else {
        error.value = apiError.data?.detail || 'An unexpected error occurred.';
      }
      return { success: false };
    }
    finally {
      isSendingOtp.value = false;
    }
  }

  async function verifyOtp(otp: string): Promise<boolean> {
    if (!emailForReset.value) {
      error.value = 'Email is missing. Please start over.';
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      await $api('/password-reset/verify-otp', {
        method: 'POST',
        body: { email: emailForReset.value, otp },
      });

      verifiedOtp.value = otp;
      return true;
    }
    catch (e: unknown) {
      const apiError = e as { data?: { detail?: string }; status?: number };
      if (apiError.status === 404) {
        error.value = 'Email not found. Please request a new OTP.';
      }
      else if (apiError.status === 400) {
        error.value = 'Invalid or expired OTP. Please try again or request a new code.';
      }
      else if (apiError.status === 429) {
        error.value = 'Too many verification attempts. Please wait before trying again.';
      }
      else {
        error.value = apiError.data?.detail || 'Invalid OTP. Please try again.';
      }
      return false;
    }
    finally {
      isLoading.value = false;
    }
  }

  async function resetPassword(newPassword: string): Promise<boolean> {
    if (!emailForReset.value || !verifiedOtp.value) {
      error.value = 'Verification is incomplete. Please start over.';
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      await $api('/password-reset/confirm', {
        method: 'POST',
        body: {
          email: emailForReset.value,
          otp: verifiedOtp.value,
          new_password: newPassword,
        },
      });

      clearResetState();
      return true;
    }
    catch (e: unknown) {
      const apiError = e as { data?: { detail?: string }; status?: number };
      if (apiError.status === 400) {
        error.value = 'Invalid verification code. Please start over.';
      }
      else {
        error.value = apiError.data?.detail || 'Failed to reset password.';
      }
      return false;
    }
    finally {
      isLoading.value = false;
    }
  }

  function clearResetState() {
    emailForReset.value = null;
    verifiedOtp.value = null;
    error.value = null;
    isLoading.value = false;
    lastRequestTime.value = null;

    if (import.meta.client) {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    }
  }

  function setEmailForReset(email: string) {
    emailForReset.value = email;
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEYS.EMAIL, email);
    }
  }

  // Computed properties
  const canResendOtp = computed(() => canSendRequest());
  const timeUntilCanResend = computed(() => getTimeUntilNextRequest());

  return {
    // State
    emailForReset: readonly(emailForReset),
    verifiedOtp: readonly(verifiedOtp),
    isLoading: readonly(isLoading),
    isSendingOtp: readonly(isSendingOtp),
    error: readonly(error),
    isInitialized: readonly(isInitialized),

    // Computed
    canResendOtp,
    timeUntilCanResend,

    // Actions
    requestReset,
    verifyOtp,
    resetPassword,
    clearResetState,
    initializeFromStorage,
    setEmailForReset,
  };
});
