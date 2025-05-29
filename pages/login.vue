<!-- pages/login.vue -->
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
          <h2 class="text-2xl font-bold">ELEVATE YOUR GAME</h2>
          <p class="text-sm mt-1">
            Connect with coaches and players to take your basketball skills to the next level
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side: Login Form -->
    <div v-motion-pop class="w-1/2 p-12 flex flex-col justify-center">
      <h2 class="text-2xl font-bold mb-2 text-center">
        Sign in to <span class="text-red-800">CoachCall</span>
      </h2>
      <p class="text-gray-600 mb-4 text-center">
        Welcome to CoachCall, please enter your login details below
      </p>

      <!-- 4) Use onSubmit here -->
      <form class="space-y-3" @submit.prevent="onSubmit">
        <!-- Email -->
        <div class="flex flex-col">
          <div class="flex items-center border rounded-lg px-3 py-2 shadow-md">
            <Icon name="mdi:account" size="1.5rem" class="mr-2" />
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Email"
              autocomplete="email"
              class="w-full outline-none"
            />
          </div>
          <p v-if="errors.email" class="text-red-600 text-sm">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="flex flex-col">
          <div class="flex items-center border rounded-lg px-3 py-2 shadow-md">
            <Icon name="mdi:password" size="1.5rem" class="mr-2" />
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Password"
              autocomplete="current-password"
              class="w-full outline-none"
            />
          </div>
          <p v-if="errors.password" class="text-red-600 text-sm">{{ errors.password }}</p>
        </div>

        <!-- Options + Submit -->
        <div class="flex items-center justify-between">
          <label class="flex items-center mb-2">
            <input type="checkbox" class="mr-2" />
            <span class="text-gray-700">Remember Password</span>
          </label>
          <NuxtLink to="#" class="text-red-800 text-sm underline underline-offset-2">
            Forgot Password
          </NuxtLink>
        </div>

        <button
          type="submit"
          class="w-full bg-red-800 text-white py-2 rounded-lg hover:bg-red-900 transition shadow-lg"
        >
          Login
        </button>
      </form>

      <p class="text-center mt-3 text-sm">
        No account yet?
        <NuxtLink to="/register" class="text-red-800">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useAuthStore } from '~/stores/auth';
import { navigateTo } from '#app'; // Use Nuxt's navigateTo for consistency

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
});

// Destructure isSubmitting and setErrors
const { handleSubmit, errors, setErrors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
});
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

const auth = useAuthStore();
const route = useRoute(); // Get current route for redirect query

const onSubmit = handleSubmit(async (values) => {
  // isSubmitting is automatically true here
  try {
    await auth.login({ email: values.email, password: values.password });
    const redirectPath = (route.query.redirect as string) || '/dashboard';
    await navigateTo(redirectPath, { replace: true });
  } catch (error: unknown) {
    console.error('Login failed:', error);
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'detail' in error.response.data
    ) {
      setErrors({ email: String(error.response.data.detail) });
    } else if (error instanceof Error && error.message) {
      setErrors({ email: error.message });
    } else {
      setErrors({ email: 'An unexpected error occurred during login.' });
    }
  }
  // isSubmitting is automatically false here
});
</script>
