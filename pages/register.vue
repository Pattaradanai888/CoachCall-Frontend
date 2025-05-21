<template>
  <div class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10">
    <!-- Left Side: Image and Text -->
    <div class="relative w-1/2 rounded-l-xl overflow-hidden">
      <NuxtImg src="/auth-bg.png" format="avif,webp" alt="Basketball player" class="object-cover w-full h-full" />
      <div class="absolute inset-0 bg-black bg-opacity-30 flex items-end p-6">
        <div class="text-white">
          <h2 class="text-2xl font-bold">ELEVATE YOUR GAME</h2>
          <p class="text-sm mt-1">
            Connect with coaches and players to take your basketball skills to the next level
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side: Register Form -->
    <div class="w-1/2 p-6 flex flex-col justify-center">
      <h2 class="text-2xl font-bold mb-2">Register to <span class="text-red-800">CoachCall</span></h2>
      <p class="text-gray-600 mb-4">Welcome to CoachCall, please register below to use the app</p>
      <form class="space-y-3">
        <div>
          <label class="block text-gray-700 mb-1" for="name">Name</label>
          <div class="flex items-center border rounded-lg px-3 py-2">
            <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H8m4-4v8m-8 4h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input id="name" type="text" placeholder="Name" class="w-full outline-none" >
          </div>
        </div>
        <div>
          <label class="block text-gray-700 mb-1" for="email">Email</label>
          <div class="flex items-center border rounded-lg px-3 py-2">
            <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H8m4-4v8m-8 4h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input id="email" type="email" placeholder="Email" class="w-full outline-none" >
          </div>
        </div>
        <div>
          <label class="block text-gray-700 mb-1" for="password">Password</label>
          <div class="flex items-center border rounded-lg px-3 py-2">
            <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.761 0-5 2.239-5 5h10c0-2.761-2.239-5-5-5z" />
            </svg>
            <input id="password" type="password" placeholder="Password" class="w-full outline-none" >
          </div>
        </div>
        <div>
          <label class="block text-gray-700 mb-1" for="confirm-password">Confirm Password</label>
          <div class="flex items-center border rounded-lg px-3 py-2">
            <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.761 0-5 2.239-5 5h10c0-2.761-2.239-5-5-5z" />
            </svg>
            <input id="confirm-password" type="password" placeholder="Confirm Password" class="w-full outline-none" >
          </div>
        </div>
        <button type="submit" class="w-full bg-red-800 text-white py-2 rounded-lg hover:bg-red-900 transition">
          Register
        </button>
      </form>
      <p class="text-center mt-3 text-sm">
        Already have an account? <nuxt-link to="/login" class="text-red-800">Login</nuxt-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Add register form logic here (e.g., API calls)
</script>