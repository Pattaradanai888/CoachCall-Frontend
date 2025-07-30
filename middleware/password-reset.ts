export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side
  if (import.meta.server)
    return;

  const resetStore = usePasswordResetStore();

  // Initialize from localStorage if needed
  if (!resetStore.emailForReset) {
    resetStore.initializeFromStorage();
  }

  // Route-specific checks
  if (to.path === '/verify-otp') {
    // For OTP verification, we need an email
    if (!resetStore.emailForReset) {
      return navigateTo('/reset-password');
    }
  }

  if (to.path === '/create-new-password') {
    // For password creation, we need both email and verified OTP
    if (!resetStore.emailForReset || !resetStore.verifiedOtp) {
      return navigateTo('/reset-password');
    }
  }
});
