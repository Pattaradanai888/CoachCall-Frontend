<template>
  <div class="min-h-screen flex flex-col bg-[#FAFAFA]">
    <!-- Header -->
    <header
      :class="[
        'fixed top-0 left-0 right-0 z-50',
        isHeaderTransparent ? 'bg-transparent' : 'bg-white shadow-sm border-b border-gray-200',
      ]"
    >
      <nav class="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink :to="isAuthenticated ? '/dashboard' : '/'" class="flex items-center space-x-2">
          <div
            class="w-10 h-10 bg-[#991B1B] text-white font-bold rounded-full flex items-center justify-center"
          >
            CC
          </div>
          <span
            :class="['text-lg font-semibold', isHeaderTransparent ? 'text-white' : 'text-gray-900']"
          >
            CoachCall
          </span>
        </NuxtLink>

        <!-- Right Side - Desktop -->
        <div class="hidden lg:flex items-center space-x-6">
          <ClientOnly>
            <div v-if="isAuthenticated" class="relative">
              <button
                class="flex items-center space-x-2 focus:outline-none"
                @click.stop="toggleProfileMenu"
              >
                <div class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                  <NuxtImg
                    src="/default-avatar.png"
                    alt="User avatar"
                    class="w-full h-full object-cover"
                    placeholder
                  />
                </div>
                <span
                  :class="[
                    'text-sm font-semibold',
                    isHeaderTransparent ? 'text-white' : 'text-gray-900',
                  ]"
                >
                  {{ user?.fullname || 'Loading...' }}
                </span>
              </button>

              <!-- Profile Dropdown -->
              <div
                v-if="isProfileMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 profile-menu"
              >
                <NuxtLink
                  to="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="isProfileMenuOpen = false"
                >
                  Profile
                </NuxtLink>
                <button
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="handleLogout"
                >
                  Sign out
                </button>
              </div>
            </div>
            <div v-else>
              <NuxtLink
                to="/login"
                :class="[
                  'text-sm font-semibold',
                  isHeaderTransparent
                    ? 'text-white hover:text-gray-300'
                    : 'text-gray-900 hover:text-[#991B1B]',
                  'transition',
                ]"
              >
                Log in <span aria-hidden="true">→</span>
              </NuxtLink>
            </div>
          </ClientOnly>
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
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </nav>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" class="lg:hidden">
        <div class="fixed inset-0 z-10 bg-black/30" @click="isMobileMenuOpen = false" />
        <div class="fixed inset-y-0 right-0 z-20 w-3/4 max-w-sm bg-white p-6 shadow-lg">
          <div class="flex items-center justify-between">
            <NuxtLink
              :to="isAuthenticated ? '/dashboard' : '/'"
              class="flex items-center space-x-2"
            >
              <div
                class="w-10 h-10 bg-[#991B1B] text-white font-bold rounded-full flex items-center justify-center"
              >
                CC
              </div>
              <span class="text-lg font-semibold text-gray-900">CoachCall</span>
            </NuxtLink>
            <button type="button" class="p-2 text-gray-700" @click="isMobileMenuOpen = false">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="mt-6 space-y-4">
            <!-- Mobile Profile Section -->
            <ClientOnly>
              <div v-if="isAuthenticated" class="space-y-2">
                <div class="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <div class="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                    <NuxtImg
                      src="/default-avatar.png"
                      alt="User avatar"
                      class="w-full h-full object-cover"
                      placeholder
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ user?.fullname || 'Loading...' }}</p>
                    <p class="text-sm text-gray-500">{{ user?.email || '' }}</p>
                  </div>
                </div>

                <NuxtLink
                  to="#"
                  class="block py-2 px-3 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                  @click="isMobileMenuOpen = false"
                >
                  Profile
                </NuxtLink>
                <button
                  class="w-full text-left py-2 px-3 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                  @click="handleLogout"
                >
                  Sign out
                </button>
              </div>
              <div v-else>
                <NuxtLink
                  to="/login"
                  class="block text-base font-medium text-gray-900 hover:text-[#991B1B]"
                  @click="isMobileMenuOpen = false"
                >
                  Log in
                </NuxtLink>
              </div>
            </ClientOnly>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-[#FAFAFA] border-t border-gray-200 text-center text-sm text-gray-500 py-6">
      <p>© 2025 CoachCall. All rights reserved.</p>
      <div class="mt-2 space-x-4">
        <NuxtLink to="#" class="hover:underline">Terms</NuxtLink>
        <NuxtLink to="#" class="hover:underline">Privacy</NuxtLink>
        <NuxtLink to="#" class="hover:underline">Contact</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from '#app';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from '#app';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

// Get user data from store
const user = computed(() => auth.user);
const isAuthenticated = computed(() => auth.isAuthenticated);

// Profile menu state
const isProfileMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);

// Scroll state
const isScrolled = ref(false);

// Detect if on landing page
const isLandingPage = computed(() => route.path === '/');

// Determine if header should be transparent
const isHeaderTransparent = computed(() => isLandingPage.value && !isScrolled.value);

// Handle scroll event
const handleScroll = () => {
  // The background image section has h-screen (100vh)
  // We want the navbar to stay transparent while any part of it overlaps with the bg image
  const navbar = document.querySelector('header');
  const navbarHeight = navbar ? navbar.offsetHeight : 80; // fallback height

  // Switch to white navbar when we've scrolled past the background image section
  const bgImageHeight = window.innerHeight; // h-screen = 100vh
  isScrolled.value = window.scrollY >= bgImageHeight - navbarHeight;
};

// Toggle profile dropdown
const toggleProfileMenu = (event: Event) => {
  event.stopPropagation();
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

// Handle logout
const handleLogout = async () => {
  try {
    await auth.logout();
    isProfileMenuOpen.value = false;
    isMobileMenuOpen.value = false;
    await router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Close profile menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const profileMenu = document.querySelector('.profile-menu');
  const profileButton = document.querySelector('.profile-button');
  if (
    profileMenu &&
    !profileMenu.contains(event.target as Node) &&
    profileButton &&
    !profileButton.contains(event.target as Node)
  ) {
    isProfileMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.profile-menu {
  z-index: 50; /* Ensure dropdown is above other elements */
}
</style>
