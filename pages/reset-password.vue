<!-- pages/reset-password.vue -->
<template>
  <div
    class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10 mt-[6.5rem]"
  >
    <!-- Left Side: Image -->
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
            ELEVATE YOUR GAME
          </h2>
          <p class="text-sm mt-1">
            Connect with coaches and players to take your basketball skills to the next level
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side: Form -->
    <div v-motion-pop :delay="100" class="w-1/2 p-12 flex flex-col justify-center">
      <h2 class="text-2xl font-bold mb-2 text-center">
        Recovery <span class="text-red-800">Account</span>
      </h2>
      <p class="text-gray-600 mb-4 text-center">
        Enter the email address you used to register with CoachCall
      </p>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <div
          v-if="message"
          class="px-4 py-3 rounded relative mb-4"
          :class="isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'"
          role="alert"
        >
          <span class="block sm:inline">{{ message }}</span>
        </div>

        <!-- Email -->
        <div class="flex flex-col">
          <div
            class="flex items-center border rounded-lg px-3 py-2 shadow-md"
            :class="{ 'border-red-500': errors.email }"
          >
            <Icon name="mdi:account" size="1.5rem" class="mr-2" />
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Email"
              autocomplete="email"
              class="w-full outline-none"
            >
          </div>
          <p v-if="errors.email" class="text-red-600 text-sm mt-1">
            {{ errors.email }}
          </p>
        </div>

        <button
          type="submit"
          class="w-full bg-red-800 text-white py-2 rounded-lg hover:bg-red-900 transition shadow-lg mt-5"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Sending...' : 'Send me OTP' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { z } from 'zod';
import { usePasswordResetStore } from '~/stores/passwordReset';

const validationSchema = toTypedSchema(
  z.object({
    email: z.string().min(1, 'Email is required').email('Must be a valid email'),
  }),
);

const { handleSubmit, errors } = useForm({ validationSchema });
const { value: email } = useField<string>('email');

const resetStore = usePasswordResetStore();
const message = ref<string | null>(null);
const isError = ref(false);
const isSubmitting = ref(false);

const onSubmit = handleSubmit(async (values) => {
  message.value = null;
  isError.value = false;
  isSubmitting.value = true;

  // Store email immediately using the setter function
  resetStore.setEmailForReset(values.email);

  // Send OTP request in background (don't wait for response)
  resetStore.requestReset(values.email).catch(() => {
    // Handle errors silently - user will see error on OTP page if needed
  });

  // Small delay for better UX, then redirect
  setTimeout(() => {
    isSubmitting.value = false;
    navigateTo('/verify-otp');
  }, 500);
});

onUnmounted(() => {
  // Only clear reset state if there was an error or user is leaving the flow
  if (resetStore.error) {
    resetStore.clearResetState();
  }
});
</script>
