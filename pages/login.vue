<script lang="ts" setup>
// Add login form logic here (e.g., API calls)
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10 "
  >
    <!-- Left Side: Image and Text -->
    <div class="relative w-1/2 rounded-l-xl overflow-hidden">
      <NuxtImg
        src="/auth-bg.png"
        format="avif,webp"
        alt="Basketball player"
        class="object-cover w-full h-full"
      />
      <div class="absolute inset-0 bg-black bg-opacity-30 flex items-end p-6">
        <div class="text-white">
          <h2 class="text-2xl font-bold">ELEVATE YOUR GAME</h2>
          <p class="text-sm mt-1">
            Connect with coaches and players to take your basketball skills to
            the next level
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side: Login Form -->
    <div v-motion-pop class="w-1/2 p-12 flex flex-col justify-center ">
      <h2 class="text-2xl font-bold mb-2 text-center">
        Sign in to <span class="text-red-800">CoachCall</span>
      </h2>
      <p class="text-gray-600 mb-4 text-center">
        Welcome to CoachCall, please enter your login details below using the
        app
      </p>
      <form class="space-y-3">
          <div class="flex items-center border rounded-lg px-3 py-2 mb-2 shadow-md">
            <Icon
              name="mdi:account"
              size="1.5rem"
              style="color: black"
              class="mr-2"
            />
            <input
              id="email"
              type="email"
              placeholder="Email"
              class="w-full outline-none"
            />
          </div>
          <div class="flex items-center border rounded-lg px-3 py-2 mb-2 shadow-md">
            <Icon
              name="material-symbols:lock"
              size="1.5rem"
              style="color: black"
              class="mr-2"
            />
            <input
              id="password"
              type="password"
              placeholder="Password"
              class="w-full outline-none"
            />
          </div>
        <div class="flex items-center justify-between">
          <label class="flex items-center mb-5">
            <input type="checkbox" class="mr-2" />
            <span class="text-gray-700">Remember Password</span>
          </label>
          <p class="text-red-800 text-sm underline underline-offset-2 mb-5">
            Forgot Password
          </p>
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
        <nuxt-link to="/register" class="text-red-800">Register</nuxt-link>
      </p>
    </div>
  </div>
</template>
