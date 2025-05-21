<template>
  <div class="min-h-screen flex flex-col bg-[#FAFAFA]">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <nav class="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-[#991B1B] text-white font-bold rounded-full flex items-center justify-center">
            CC
          </div>
          <span class="text-lg font-semibold text-gray-900">CoachCall</span>
        </NuxtLink>

        <!-- Right Side - Desktop -->
        <div class="hidden lg:flex items-center space-x-6">
          <NuxtLink
            to="/login"
            class="text-sm font-semibold text-gray-900 hover:text-[#991B1B] transition"
          >
            Log in <span aria-hidden="true">&rarr;</span>
          </NuxtLink>
        </div>

        <!-- Mobile Menu Button -->
        <div class="lg:hidden">
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 text-gray-700"
            @click="isMobileMenuOpen = true"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </nav>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" class="lg:hidden">
        <div class="fixed inset-0 z-10 bg-black/30" @click="isMobileMenuOpen = false" />
        <div class="fixed inset-y-0 right-0 z-20 w-3/4 max-w-sm bg-white p-6 shadow-lg">
          <div class="flex items-center justify-between">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <div class="w-10 h-10 bg-[#991B1B] text-white font-bold rounded-full flex items-center justify-center">
                CC
              </div>
              <span class="text-lg font-semibold text-gray-900">CoachCall</span>
            </NuxtLink>
            <button type="button" class="p-2 text-gray-700" @click="isMobileMenuOpen = false">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mt-6 space-y-4">
            <NuxtLink to="/login" class="block text-base font-medium text-gray-900 hover:text-[#991B1B]">Log in</NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-grow ">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-[#FAFAFA] border-t border-gray-200 text-center text-sm text-gray-500 py-6">
      <p>&copy; 2025 CoachCall. All rights reserved.</p>
      <div class="mt-2 space-x-4">
        <NuxtLink to="#" class="hover:underline">Terms</NuxtLink>
        <NuxtLink to="#" class="hover:underline">Privacy</NuxtLink>
        <NuxtLink to="#" class="hover:underline">Contact</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isMobileMenuOpen = ref(false);
</script>
