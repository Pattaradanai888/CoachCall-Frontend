<!-- pages/register.vue -->
<template>
  <div
    class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10"
  >
    <!-- Left Side -->
    <div class="relative w-1/2 rounded-l-xl overflow-hidden">
      <NuxtImg
        src="/auth-bg.png"
        format="avif,webp"
        fetchpriority="high"
        alt="Basketball player"
        class="object-cover w-full h-full"
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

    <!-- Right Side: Form -->
    <div v-motion-pop class="w-1/2 p-12 flex flex-col justify-center">
      <h2 class="text-2xl font-bold mb-2 text-center">
        Register to <span class="text-red-800">CoachCall</span>
      </h2>
      <p class="text-gray-600 mb-4 text-center">
        Welcome to CoachCall, please register below to use the app
      </p>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <!-- Name -->
        <div class="flex flex-col">
          <div class="flex items-center border rounded-lg px-3 py-2 shadow-md">
            <Icon name="mdi:account" size="1.5rem" style="color: black" class="mr-2" />
            <input
              id="fullname"
              v-model="fullname"
              type="text"
              placeholder="Name"
              autocomplete="name"
              class="w-full outline-none"
            />
          </div>
          <p v-if="errors.fullname" class="text-sm text-red-600 mt-1">{{ errors.fullname }}</p>
        </div>

        <!-- Email -->
        <div class="flex flex-col">
          <div class="flex items-center border rounded-lg px-3 py-2 shadow-md">
            <Icon name="mdi:email" size="1.5rem" style="color: black" class="mr-2" />
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Email"
              autocomplete="email"
              class="w-full outline-none"
            />
          </div>
          <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="flex flex-col">
          <div class="flex items-center border rounded-lg px-3 py-2 shadow-md">
            <Icon name="mdi:password" size="1.5rem" style="color: black" class="mr-2" />
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Password"
              autocomplete="new-password"
              class="w-full outline-none"
            />
          </div>
          <p v-if="errors.password" class="text-sm text-red-600 mt-1">{{ errors.password }}</p>
        </div>

        <!-- Confirm Password -->
        <div class="flex flex-col">
          <div class="flex items-center border rounded-lg px-3 py-2 shadow-md">
            <Icon name="mdi:password" size="1.5rem" style="color: black" class="mr-2" />
            <input
              id="confirm"
              v-model="confirm"
              type="password"
              placeholder="Confirm Password"
              autocomplete="new-password"
              class="w-full outline-none"
            />
          </div>
          <p v-if="errors.confirm" class="text-sm text-red-600 mt-1">{{ errors.confirm }}</p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="w-full bg-red-800 text-white py-2 rounded-lg hover:bg-red-900 transition mt-5"
        >
          Register
        </button>
      </form>

      <p class="text-center mt-3 text-sm">
        Already have an account? <NuxtLink to="/login" class="text-red-800">Login</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toFieldValidator } from '@vee-validate/zod';
import { z } from 'zod';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const registerSchema = z
  .object({
    fullname: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

// VeeValidate form setup
const { handleSubmit, errors } = useForm({
  validationSchema: toFieldValidator(registerSchema),
});

const { value: fullname } = useField<string>('fullname');
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: confirm } = useField<string>('confirm');

const auth = useAuthStore();
const router = useRouter();

// Submit logic
const onSubmit = handleSubmit(async () => {
  await auth.register({ fullname: fullname.value, email: email.value, password: password.value });
  router.push('/');
});
</script>
