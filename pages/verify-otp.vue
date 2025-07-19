<template>
  <div
    class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10 mt-[6.5rem]"
  >
    <!-- Left Side: Image (Identical to previous page) -->
    <div class="relative w-1/2 rounded-l-xl overflow-hidden">
      <NuxtImg
        src="/auth-bg.png"
        alt="Basketball player"
        class="object-cover w-full h-full"
        fetchpriority="high"
        quality="80"
        format="webp"
        width="570"
        height="600"
      />
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

    <!-- Right Side: OTP Form -->
    <div v-motion-pop :delay="100" class="w-1/2 p-12 flex flex-col justify-center">
      <h2 class="text-2xl font-bold mb-2 text-center">
        Verify Your <span class="text-red-800">Email</span>
      </h2>
      <p v-if="email" class="text-gray-600 mb-8 text-center">
        Please Enter the 6-Digit Code Sent To <br> <span class="font-semibold">{{ email }}</span>
      </p>
      <p v-else class="text-gray-600 mb-8 text-center">
        Loading email...
      </p>

      <form class="space-y-6" @submit.prevent="onSubmit">
        <!-- Server-side error message -->
        <div
          v-if="serverError"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span class="block sm:inline">{{ serverError }}</span>
        </div>

        <!-- OTP Input Component -->
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

        <nuxt-link to="/create-new-password">
          <button
            type="submit"
            class="w-full bg-red-800 text-white py-3 rounded-lg hover:bg-red-900 transition shadow-lg mt-5"
            :disabled="isSubmitting"
          >
            Verify
          </button>
        </nuxt-link>

        <div class="text-center text-sm">
          <p class="text-gray-500">
            Didn't receive the code?
            <button type="button" class="font-semibold text-red-800 hover:underline">
              Resend Code
            </button>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { z } from 'zod';
// Import the component
import { useAuthStore } from '~/stores/auth';

// Get auth store
const authStore = useAuthStore();
const email = ref();

// Define validation schema for the OTP
const otpSchema = z.object({
  otp: z.string().length(6, 'Please enter a 6-digit code'),
});

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(otpSchema),
});

const { value: otp } = useField<string>('otp');

// Server-side error handling
const serverError = ref<string | null>(null);

// Redirect if email is not set (e.g., user navigates directly to this page)
onMounted(() => {
  // if (!email.value) {
  // console.warn('No email found for verification. Redirecting.');
  // navigateTo('/reset-password'); // Or wherever they should start
  // }
});

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  console.log('Verifying OTP:', values.otp, 'for email:', email.value);

  try {
    // --- IMPORTANT ---
    // Here you would call your backend API to verify the OTP
    // await api.verifyOtp({ email: email.value, otp: values.otp });

    // On success, clear the stored email and navigate
    // authStore.clearEmailForVerification();

    // For example, navigate to a page to set a new password or to the dashboard
    // await navigateTo('/dashboard');
  }
  catch (error: any) {
    serverError.value = error.data?.message || 'Invalid OTP. Please try again.';
  }
});
</script>
