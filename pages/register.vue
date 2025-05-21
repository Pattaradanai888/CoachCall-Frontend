<template>
  <div
    class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10"
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

    <!-- Right Side: Register Form -->
    <div v-motion-pop class="w-1/2 p-12 flex flex-col justify-center">
      <h2 class="text-2xl font-bold mb-2 text-center">
        Register to <span class="text-red-800">CoachCall</span>
      </h2>
      <p class="text-gray-600 mb-4 text-center">
        Welcome to CoachCall, please register below to use the app
      </p>
      <form class="space-y-3">
        <div>
          <div
            class="flex items-center border rounded-lg px-3 py-2 mb-4 shadow-md"
          >
            <Icon
              name="mdi:account"
              size="1.5rem"
              style="color: black"
              class="mr-2"
            />
            <input
              id="name"
              type="text"
              placeholder="Name"
              class="w-full outline-none"
            />
          </div>

          <div
            class="flex items-center border rounded-lg px-3 py-2 mb-4 shadow-md"
          >
            <Icon
              name="mdi:email"
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

          <div
            class="flex items-center border rounded-lg px-3 py-2 mb-4 shadow-md"
          >
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

          <div
            class="flex items-center border rounded-lg px-3 py-2 mb-4 shadow-md"
          >
            <Icon
              name="material-symbols:lock"
              size="1.5rem"
              style="color: black"
              class="mr-2"
            />
            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm Password"
              class="w-full outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-red-800 text-white py-2 rounded-lg hover:bg-red-900 transition mt-5"
        >
          Register
        </button>
      </form>
      <p class="text-center mt-3 text-sm">
        Already have an account?
        <nuxt-link to="/login" class="text-red-800">Login</nuxt-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Add register form logic here (e.g., API calls)
</script>
