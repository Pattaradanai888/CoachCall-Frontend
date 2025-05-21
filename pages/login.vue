<!-- pages/login.vue -->
<template>
  <div
    class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10"
  >
    <!-- Left Side: Image -->
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
              class="w-full outline-none"
            />
          </div>
          <p v-if="errors.email" class="text-red-600 text-sm">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="flex flex-col">
          <div class="flex items-center border rounded-lg px-3 py-2 shadow-md">
            <Icon name="material-symbols:lock" size="1.5rem" class="mr-2" />
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Password"
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
import { useForm, useField } from 'vee-validate'
import { toFieldValidator } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'guest-only',
})

// 1) Schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
})

// 2) Setup VeeValidate
const { handleSubmit, errors } = useForm({
  validationSchema: toFieldValidator(loginSchema),
})
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const auth = useAuthStore()
const router = useRouter()

// 3) onSubmit now used in template
const onSubmit = handleSubmit(async () => {
  await auth.login({ email: email.value, password: password.value })
  router.push('/')
})
</script>
