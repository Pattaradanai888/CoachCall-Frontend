<!-- pages/register.vue -->
<template>
  <div
    class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10 mt-[6.5rem]"
  >
    <!-- Left Side -->
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

    <!-- Right Side: Form -->
    <div v-motion-pop :delay="100" class="w-1/2 p-12 flex flex-col justify-center">
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
          <div class="relative flex items-center border rounded-lg px-3 py-2 shadow-md">
            <Icon name="mdi:password" size="1.5rem" style="color: black" class="mr-2" />
            <input
              id="password"
              v-model="password"
              :type="showPasswords.password ? 'text' : 'password'"
              placeholder="Password"
              autocomplete="new-password"
              class="w-full outline-none pr-10"
            />
            <button
              type="button"
              class="absolute right-3 text-gray-400 hover:text-gray-600"
              aria-label="Toggle password visibility"
              @click="showPasswords.password = !showPasswords.password"
            >
              <Icon :name="showPasswords.password ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
            </button>
          </div>
          <p v-if="errors.password" class="text-sm text-red-600 mt-1">{{ errors.password }}</p>
        </div>

        <!-- Confirm Password -->
        <div class="flex flex-col">
          <div class="relative flex items-center border rounded-lg px-3 py-2 shadow-md">
            <Icon name="mdi:password" size="1.5rem" style="color: black" class="mr-2" />
            <input
              id="confirm"
              v-model="confirm"
              :type="showPasswords.confirm ? 'text' : 'password'"
              placeholder="Confirm Password"
              autocomplete="new-password"
              class="w-full outline-none pr-10"
            />
            <button
              type="button"
              class="absolute right-3 text-gray-400 hover:text-gray-600"
              aria-label="Toggle confirm password visibility"
              @click="showPasswords.confirm = !showPasswords.confirm"
            >
              <Icon :name="showPasswords.confirm ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
            </button>
          </div>
          <p v-if="password !== confirm && confirm" class="text-sm text-red-600 mt-1">
            Passwords do not match.
          </p>
        </div>

        <!-- Password Requirements -->
        <div>
          <h4 class="font-medium text-gray-900 mb-2">Password Requirements:</h4>
          <ul class="text-sm space-y-1">
            <li
              :class="passwordValidation.length ? 'text-green-600' : 'text-red-600'"
              class="flex items-center"
            >
              <Icon
                :name="passwordValidation.length ? 'mdi:check' : 'mdi:close'"
                class="w-4 h-4 mr-2 flex-shrink-0"
              />
              At least 8 characters
            </li>
            <li
              :class="passwordValidation.lowercase ? 'text-green-600' : 'text-red-600'"
              class="flex items-center"
            >
              <Icon
                :name="passwordValidation.lowercase ? 'mdi:check' : 'mdi:close'"
                class="w-4 h-4 mr-2 flex-shrink-0"
              />
              One lowercase letter
            </li>
            <li
              :class="passwordValidation.uppercase ? 'text-green-600' : 'text-red-600'"
              class="flex items-center"
            >
              <Icon
                :name="passwordValidation.uppercase ? 'mdi:check' : 'mdi:close'"
                class="w-4 h-4 mr-2 flex-shrink-0"
              />
              One uppercase letter
            </li>
            <li
              :class="passwordValidation.number ? 'text-green-600' : 'text-red-600'"
              class="flex items-center"
            >
              <Icon
                :name="passwordValidation.number ? 'mdi:check' : 'mdi:close'"
                class="w-4 h-4 mr-2 flex-shrink-0"
              />
              One number
            </li>
            <li
              :class="passwordValidation.special ? 'text-green-600' : 'text-red-600'"
              class="flex items-center"
            >
              <Icon
                :name="passwordValidation.special ? 'mdi:check' : 'mdi:close'"
                class="w-4 h-4 mr-2 flex-shrink-0"
              />
              One special character
            </li>
          </ul>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="!isPasswordFormValid || isSubmitting"
          class="w-full bg-red-800 text-white py-2 rounded-lg hover:bg-red-900 transition mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Registering...' : 'Register' }}
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
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { reactive, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { navigateTo } from '#app';

const registerSchema = z
  .object({
    fullname: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    confirm: z.string().min(8),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

// Form handling with vee-validate
const { handleSubmit, errors, isSubmitting, setErrors } = useForm({
  validationSchema: toTypedSchema(registerSchema),
});

const { value: fullname } = useField<string>('fullname');
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: confirm } = useField<string>('confirm');

const showPasswords = reactive({
  password: false,
  confirm: false,
});

const passwordValidation = computed(() => {
  const pwd = password.value || '';
  return {
    length: pwd.length >= 8,
    lowercase: /[a-z]/.test(pwd),
    uppercase: /[A-Z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  };
});

const isPasswordFormValid = computed(() => {
  return (
    Object.values(passwordValidation.value).every(Boolean) &&
    password.value === confirm.value &&
    fullname.value &&
    email.value
  );
});

const auth = useAuthStore();

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.register({
      fullname: values.fullname,
      email: values.email,
      password: values.password,
    });
    await navigateTo('/dashboard', { replace: true });
  } catch (error) {
    console.error('Registration failed:', error);
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
      const detail = error.response.data.detail;
      if (typeof detail === 'string' && detail.toLowerCase().includes('email already registered')) {
        setErrors({ email: detail });
      } else {
        setErrors({ fullname: String(detail) });
      }
    } else if (error instanceof Error && error.message) {
      setErrors({ fullname: error.message });
    } else {
      setErrors({ fullname: 'An unexpected error occurred during registration.' });
    }
  }
});
</script>
