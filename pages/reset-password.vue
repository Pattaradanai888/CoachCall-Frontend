<!-- pages/reset-password.vue -->
<template>
  <div
    class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10 mt-[6.5rem]"
  >
    <!-- Left Side: Image -->
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
            ELEVATE YOUR GAME
          </h2>
          <p class="text-sm mt-1">
            Connect with coaches and players to take your basketball skills to the next level
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side: Login Form -->
    <div v-motion-pop :delay="100" class="w-1/2 p-12 flex flex-col justify-center">
      <h2 class="text-2xl font-bold mb-2 text-center">
        Recovery <span class="text-red-800">Account</span>
      </h2>
      <p class="text-gray-600 mb-4 text-center">
        Enter the email address you used to register with CoachCall
      </p>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <!-- Server-side error message -->
        <div
          v-if="serverError"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span class="block sm:inline">{{ serverError }}</span>
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
            Please input an email
          </p>
        </div>

        <nuxt-link to="/verify-otp">
          <button
            class="w-full bg-red-800 text-white py-2 rounded-lg hover:bg-red-900 transition shadow-lg mt-5"
          >
            Send me OTP
          </button>
        </nuxt-link>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#app';
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { z } from 'zod';
import { useAuthStore } from '~/stores/auth';

// Define the validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Please input an email').email('Please input an email'),
});

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
});
const { value: email } = useField<string>('email');

// Server-side error handling
const serverError = ref<string | null>(null);

const auth = useAuthStore();
const route = useRoute();

const onSubmit = handleSubmit(async (values) => {

});
</script>
