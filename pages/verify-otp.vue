<template>
  <div>
    <ConfirmModal
      :show="isModalVisible"
      :title="modalTitle"
      :message="modalMessage"
      confirm-text="Yes, Resend"
      cancel-text="Cancel"
      @confirm="handleResendConfirm"
      @close="handleModalClose"
    />

    <div
      class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10 mt-[6.5rem]"
    >
      <div class="relative w-1/2 rounded-l-xl overflow-hidden">
        <picture>
          <source srcset="/auth-bg.avif" type="image/avif">
          <source srcset="/auth-bg.webp" type="image/webp">
          <img
            src="/auth-bg.png"
            alt="Basketball player"
            class="object-cover w-full h-full"
            loading="eager"
            fetchpriority="high"
          >
        </picture>
        <div class="absolute inset-0 bg-black bg-opacity-30 flex items-end p-6">
          <div class="text-white">
            <h2 class="text-2xl font-bold">
              Elevate Your Game
            </h2>
            <p class="text-sm mt-1">
              Connect with coaches and players to take your basketball skills to the next level
            </p>
          </div>
        </div>
      </div>

      <div v-motion-pop :delay="100" class="w-1/2 p-12 flex flex-col justify-center">
        <h2 class="text-2xl font-bold mb-2 text-center">
          Verify Your <span class="text-red-800">Email</span>
        </h2>
        <p v-if="resetStore.emailForReset" class="text-gray-600 mb-4 text-center">
          We've sent a 6-digit code to<br>
          <span class="font-semibold">{{ resetStore.emailForReset }}</span>
        </p>
        <p v-if="resetStore.emailForReset" class="text-sm text-gray-500 mb-8 text-center">
          It may take a few moments to arrive. Check your spam folder if you don't see it.
        </p>
        <p v-else-if="isInitializing" class="text-gray-600 mb-8 text-center">
          Loading...
        </p>
        <p v-else class="text-red-600 mb-8 text-center">
          Email not found. Please start over.
        </p>

        <form class="space-y-6" @submit.prevent="onSubmit">
          <!-- Status notification -->
          <div v-if="resetStore.isSendingOtp" class="bg-blue-100 border-blue-400 text-blue-700 px-4 py-3 rounded" role="alert">
            <span class="block sm:inline">📧 Sending OTP to your email...</span>
          </div>

          <div v-if="resetStore.error" class="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <span class="block sm:inline">{{ resetStore.error }}</span>
          </div>

          <div>
            <OtpInput
              v-model="otp"
              :num-inputs="6"
              @on-complete="onSubmit"
            />
            <p v-if="errors.otp" class="text-red-600 text-sm mt-2 text-center">
              {{ errors.otp }}
            </p>
          </div>

          <button
            type="submit"
            class="w-full bg-red-800 text-white py-3 rounded-lg hover:bg-red-900 transition shadow-lg mt-5"
            :disabled="resetStore.isLoading"
          >
            {{ resetStore.isLoading ? 'Verifying...' : 'Verify' }}
          </button>

          <div class="text-center text-sm">
            <p class="text-gray-500 mb-2">
              Didn't receive the code?
              <button
                type="button"
                class="font-semibold text-red-800 hover:underline"
                :disabled="isResending"
                @click="promptForResend"
              >
                {{ isResending ? 'Sending...' : 'Resend Code' }}
              </button>
            </p>
            <p class="text-gray-500">
              Wrong email?
              <NuxtLink
                to="/reset-password"
                class="font-semibold text-red-800 hover:underline"
                @click="resetStore.clearResetState"
              >
                Change Email
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { z } from 'zod';
import ConfirmModal from '~/components/ConfirmModal.vue';
import { usePasswordResetStore } from '~/stores/passwordReset';

// Add middleware to ensure proper flow
definePageMeta({
  middleware: 'password-reset',
});

const isModalVisible = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

const resetStore = usePasswordResetStore();
const isResending = ref(false);
const isInitializing = ref(true);
const otpSchema = toTypedSchema(z.object({ otp: z.string().length(6, 'Please enter a 6-digit code') }));
const { handleSubmit, errors } = useForm({ validationSchema: otpSchema });
const { value: otp } = useField<string>('otp');

onMounted(() => {
  // Initialize store from localStorage first
  resetStore.initializeFromStorage();

  // Wait a tick for reactivity to update, then check
  nextTick(() => {
    isInitializing.value = false;
    if (!resetStore.emailForReset) {
      navigateTo('/reset-password');
    }
  });
});

const onSubmit = handleSubmit(async (values) => {
  const success = await resetStore.verifyOtp(values.otp);
  if (success) {
    navigateTo('/create-new-password');
  }
});

function promptForResend() {
  modalTitle.value = 'Resend Code?';
  modalMessage.value = `Are you sure you want to request a new code? The previous one will no longer work.`;
  isModalVisible.value = true;
}

function handleModalClose() {
  isModalVisible.value = false;
}

async function handleResendConfirm() {
  isModalVisible.value = false;
  if (resetStore.emailForReset) {
    isResending.value = true;
    await resetStore.requestReset(resetStore.emailForReset);
    isResending.value = false;
  }
}
</script>
