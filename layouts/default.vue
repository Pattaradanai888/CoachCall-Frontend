<template>
  <div class="min-h-screen flex flex-col bg-[#FAFAFA]">
    <header
      class="fixed top-0 left-0 right-0 z-50" :class="[
        isHeaderTransparent ? 'bg-transparent' : 'bg-white shadow-sm border-b border-gray-200',
      ]"
    >
      <nav class="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <ClientOnly>
          <NuxtLink :to="isAuthInitialized ? (isAuthenticated ? '/dashboard' : '/') : '/'" class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-[#991B1B] text-white font-bold rounded-full flex items-center justify-center"
            >
              CC
            </div>
            <span
              class="text-lg font-semibold" :class="[isHeaderTransparent ? 'text-white' : 'text-gray-900']"
            >
              CoachCall
            </span>
          </NuxtLink>
          <template #fallback>
            <NuxtLink to="/" class="flex items-center space-x-2">
              <div
                class="w-10 h-10 bg-[#991B1B] text-white font-bold rounded-full flex items-center justify-center"
              >
                CC
              </div>
              <span
                class="text-lg font-semibold" :class="[isHeaderTransparent ? 'text-white' : 'text-gray-900']"
              >
                CoachCall
              </span>
            </NuxtLink>
          </template>
        </ClientOnly>

        <ClientOnly>
          <div class="hidden lg:flex items-center space-x-6">
            <div v-if="isCheckingAuth" class="flex items-center space-x-2 animate-pulse">
              <div class="w-8 h-8 rounded-full bg-gray-300"/>
              <div class="h-4 w-24 bg-gray-300 rounded"/>
            </div>
            
            <div v-else-if="isAuthenticated" class="relative">
              <button
                class="flex items-center space-x-2 focus:outline-none profile-button transition-all duration-200 hover:opacity-80"
                @click.stop="toggleProfileMenu"
              >
                <div class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden ring-2 ring-transparent transition-all">
                  <NuxtImg
                    :src="user?.profile?.profile_image_url || '/default-profile.jpg'"
                    alt="User avatar"
                    class="w-full h-full object-cover"
                    placeholder="/default-profile.jpg"
                    format="webp"
                    width="32"
                    height="32"
                  />
                </div>
                <span
                  class="text-sm font-semibold transition-colors" :class="[
                    isHeaderTransparent ? 'text-white' : 'text-gray-900',
                  ]"
                >
                  {{ displayName }}
                </span>
                <svg 
                  class="w-4 h-4 transition-transform duration-200" 
                  :class="[
                    isProfileMenuOpen ? 'rotate-180' : 'rotate-0',
                    isHeaderTransparent ? 'text-white' : 'text-gray-500'
                  ]"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="isProfileMenuOpen"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 profile-menu border border-gray-200"
                >
                  <NuxtLink
                    to="/profile-management"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="isProfileMenuOpen = false"
                  >
                    Profile Settings
                  </NuxtLink>
                  <button
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="handleLogout"
                  >
                    Sign Out
                  </button>
                </div>
              </Transition>
            </div>
            
            <div v-else>
              <NuxtLink
                to="/login"
                class="text-sm font-semibold transition-all duration-200 hover:scale-105" :class="[
                  isHeaderTransparent
                    ? 'text-white hover:text-gray-300'
                    : 'text-gray-900 hover:text-[#991B1B]',
                ]"
              >
                Log in <span aria-hidden="true">→</span>
              </NuxtLink>
            </div>
          </div>
          <template #fallback>
            <div class="hidden lg:flex items-center space-x-6 w-20 h-8"/>
          </template>
        </ClientOnly>

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

      <div v-if="isMobileMenuOpen" class="lg:hidden">
        <div class="fixed inset-0 z-10 bg-black/30" @click="isMobileMenuOpen = false" />
        <div class="fixed inset-y-0 right-0 z-20 w-3/4 max-w-sm bg-white p-6 shadow-lg">
          <div class="flex items-center justify-between">
            <NuxtLink
              :to="isAuthInitialized ? (isAuthenticated ? '/dashboard' : '/') : '/'"
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

          <ClientOnly>
            <div class="mt-6 space-y-4">
              <div v-if="isCheckingAuth" class="space-y-2 animate-pulse">
                <div class="flex items-center space-x-3 p-4 rounded-lg bg-gray-100 border border-gray-200">
                  <div class="w-12 h-12 rounded-full bg-gray-300"/>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-300 rounded w-3/4"/>
                    <div class="h-3 bg-gray-300 rounded w-1/2"/>
                  </div>
                </div>
                <div class="h-12 bg-gray-200 rounded-lg"/>
                <div class="h-12 bg-gray-200 rounded-lg"/>
              </div>
              
              <div v-else-if="isAuthenticated" class="space-y-2">
                <div class="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                  <div class="w-12 h-12 rounded-full bg-gray-300 overflow-hidden ring-2 ring-white shadow-sm">
                    <NuxtImg
                      :src="user?.profile?.profile_image_url || '/default-profile.jpg'"
                      alt="User avatar"
                      class="w-full h-full object-cover"
                      placeholder="/default-profile.jpg"
                      format="webp"
                      width="48"
                      height="48"
                    />
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">
                      {{ displayName }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ user?.email || '' }}
                    </p>
                  </div>
                </div>

                <NuxtLink
                  to="/profile-management"
                  class="block py-3 px-4 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  @click="isMobileMenuOpen = false"
                >
                  Profile Settings
                </NuxtLink>
                <button
                  class="w-full text-left py-3 px-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  @click="handleLogout"
                >
                  Sign Out
                </button>
              </div>
              
              <div v-else>
                <NuxtLink
                  to="/login"
                  class="block py-3 px-4 text-center text-base font-semibold text-white bg-[#991B1B] hover:bg-[#7f1d1d] rounded-lg transition-colors"
                  @click="isMobileMenuOpen = false"
                >
                  Log In
                </NuxtLink>
              </div>
            </div>
            <template #fallback>
              <div class="mt-6 h-20"/>
            </template>
          </ClientOnly>
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-[#FAFAFA] border-t border-gray-200 text-center text-sm text-gray-500 py-6">
      <p>© 2025 CoachCall. All rights reserved.</p>
      <div class="mt-2 space-x-4">
        <NuxtLink to="#" class="hover:underline">
          Terms
        </NuxtLink>
        <NuxtLink to="#" class="hover:underline">
          Privacy
        </NuxtLink>
        <NuxtLink to="#" class="hover:underline">
          Contact
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from '#app';
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const user = computed(() => auth.user);
const isAuthenticated = computed(() => auth.isAuthenticated);
const isAuthInitialized = computed(() => auth.isInitialized);
const isCheckingAuth = computed(() => auth.isCheckingAuth);

const displayName = computed(() => {
  return user.value?.profile?.display_name || user.value?.fullname || 'User';
});

const isProfileMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);

const isLandingPage = computed(() => route.path === '/');

const isScrolled = ref(!isLandingPage.value);

const isHeaderTransparent = computed(() => isLandingPage.value && !isScrolled.value);

function handleScroll() {
  if (import.meta.client) {
    const navbar = document.querySelector('header');
    const navbarHeight = navbar ? (navbar as HTMLElement).offsetHeight : 80;
    const bgImageHeight = window.innerHeight;
    isScrolled.value = window.scrollY >= bgImageHeight - navbarHeight;
  }
}

watch(isLandingPage, (val) => {
  if (val) {
    isScrolled.value = false;
    nextTick(() => handleScroll());
  } else {
    isScrolled.value = true;
  }
});

function toggleProfileMenu(event: Event) {
  event.stopPropagation();
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
}

async function handleLogout() {
  try {
    await auth.logout();
    isProfileMenuOpen.value = false;
    isMobileMenuOpen.value = false;
    await router.push('/');
  }
  catch (error) {
    console.error('Logout failed:', error);
  }
}

function handleClickOutside(event: MouseEvent) {
  const profileMenu = document.querySelector('.profile-menu');
  const profileButton = document.querySelector('.profile-button');
  if (
    profileMenu
    && !profileMenu.contains(event.target as Node)
    && profileButton
    && !profileButton.contains(event.target as Node)
  ) {
    isProfileMenuOpen.value = false;
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.profile-menu {
  z-index: 50;
}
header {
  transition:
    background-color 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.auth-section {
  transition: all 0.3s ease-in-out;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.profile-button:hover .w-8 {
  box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.5);
}
</style>