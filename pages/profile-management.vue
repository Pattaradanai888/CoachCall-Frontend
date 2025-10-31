<!-- pages/profile-management -->
<template>
  <div class="min-h-screen bg-gray-50 overflow-x-hidden">
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-[5rem]">
      <!-- Page Header -->
      <div v-motion-slide-visible-once-bottom class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Profile Management
        </h1>
        <p class="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div v-motion-slide-visible-once-bottom :delay="100" class="mb-8 overflow-x-auto">
        <nav class="flex space-x-8 border-b border-gray-200 min-w-max px-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap" :class="[
              activeTab === tab.id
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
            @click="activeTab = tab.id"
          >
            <Icon :name="tab.icon" class="w-5 h-5 mr-2" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Loading and Error States -->
      <div v-if="loadingPage" class="text-center py-10">
        <p class="text-gray-500">
          Loading profile...
        </p>
        <!-- You can add a spinner here -->
      </div>
      <div
        v-else-if="pageError"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
        role="alert"
      >
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline"> {{ pageError }}</span>
      </div>

      <!-- Tab Content -->
      <div v-else class="rounded-lg shadow-sm overflow-hidden">
        <div class="bg-white p-4 sm:p-6">
          <ProfileOverviewTab
            v-if="activeTab === 'overview' && profileData"
            :profile="profileData"
          />

          <DisplayNameTab
            v-if="activeTab === 'display-name' && profileData"
            :initial-fullname="profileData.profile?.display_name || ''"
            @updated="handleDisplayNameUpdated"
            @error="handleProfileUpdateError"
          />

          <PasswordTab
            v-if="activeTab === 'password'"
            @updated="handlePasswordUpdated"
            @error="
              (message) =>
                handleProfileUpdateError(message || 'An error occurred while updating password')
            "
          />

          <ProfilePictureTab
            v-if="activeTab === 'profile-picture' && profileData"
            :current-profile-image-url="profileData.profile?.profile_image_url"
            @image-updated="handleProfileImageUpdated"
            @image-deleted="handleProfileImageDeleted"
            @error="handleProfileUpdateError"
          />

        </div>
      </div>
    </div>

    <!-- Notification Modal -->
    <NotificationModal
      :show="showNotificationModal"
      :title="notificationTitle"
      :message="notificationMessage"
      :type="notificationType"
      @close="closeNotificationModal"
    />
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types/auth';
import { computed, onMounted, ref, watch } from 'vue';

import DisplayNameTab from '~/components/profile/DisplayNameTab.vue';
import PasswordTab from '~/components/profile/PasswordTab.vue';
// Import new components
import ProfileOverviewTab from '~/components/profile/ProfileOverviewTab.vue';
import ProfilePictureTab from '~/components/profile/ProfilePictureTab.vue';
import NotificationModal from '~/components/NotificationModal.vue';
import { useAuthStore } from '~/stores/auth';

// Store and router
const auth = useAuthStore();

// Page state
const activeTab = ref('overview');
const loadingPage = ref(false); // Renamed from 'loading' to be specific to page loading
const pageError = ref<string | null>(null); // Renamed from 'error'

// Notification modal state
const showNotificationModal = ref(false);
const notificationTitle = ref('');
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');

// Profile data from Pinia store
const profileData = computed<User | null>(() => auth.user);



const tabs = [
  { id: 'overview', name: 'Overview', icon: 'mdi:account-details-outline' },
  {
    id: 'display-name',
    name: 'Display Name',
    icon: 'mdi:account-edit-outline',
  },
  { id: 'password', name: 'Password', icon: 'mdi:lock-outline' },
  {
    id: 'profile-picture',
    name: 'Profile Picture',
    icon: 'mdi:camera-account',
  },
];

// Notification utility using NotificationModal
function showNotification(message: string, type: 'success' | 'error' = 'success') {
  notificationTitle.value = type === 'success' ? 'Success' : 'Error';
  notificationMessage.value = message;
  notificationType.value = type;
  showNotificationModal.value = true;
  
  // Clear page error when showing success notification
  if (type === 'success') {
    pageError.value = null;
  }
}

function closeNotificationModal() {
  showNotificationModal.value = false;
}

// Event Handlers from child components
function handleDisplayNameUpdated(newName: string) {
  showNotification(`Display name updated to: ${newName}`, 'success');
  // profileData (auth.user) is already updated by the child component via store
}

function handlePasswordUpdated() {
  showNotification('Password updated successfully', 'success');
}

function handleProfileImageUpdated() {
  showNotification('Profile picture updated successfully', 'success');
  // profileData (auth.user) is already updated by the child component via store
}

function handleProfileImageDeleted() {
  showNotification('Profile picture deleted successfully', 'success');
  // profileData (auth.user) is already updated by the child component via store
}

function handleProfileUpdateError(message: string) {
  showNotification(message, 'error');
}

// Fetch initial page data or ensure auth.user is populated
async function fetchPageProfileData() {
  loadingPage.value = true;
  pageError.value = null;
  try {
    // auth.initializeAuth or auth.fetchProfile should be called by middleware or auth plugin.
    // This check ensures user data is present; if not, attempts to fetch.
    if (!auth.user && auth.accessToken) {
      // Only fetch if user is null but token exists
      // Use initializeAuth instead of fetchProfile since it doesn't exist
  await auth.initialize(useNuxtApp());
    }
    // If auth.user is still null after this, it might indicate an issue resolved by redirection.
    if (!auth.user && auth.isAuthenticated) {
      // Should not happen if isAuthenticated is true
      console.warn('User is authenticated but user data is null. Attempting fetch.');
  await auth.initialize(useNuxtApp());
    }
  }
  catch (err: unknown) {
    const error = err as Error & {
      data?: { detail?: string };
      response?: { status: number };
    };
    const message = error.data?.detail || error.message || 'Failed to load profile information.';
    pageError.value = message;
    console.error('Profile page data fetch error:', err);
    if (error.response?.status === 401 || error.message?.includes('Authentication required')) {
      navigateTo('/login?redirect=/profile-management');
    }
  }
  finally {
    loadingPage.value = false;
  }
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    navigateTo('/login?redirect=/profile-management');
    return;
  }
  
  // Check for tab parameter in URL
  const route = useRoute();
  const tabParam = route.query.tab as string;
  if (tabParam && tabs.some(tab => tab.id === tabParam)) {
    activeTab.value = tabParam;
  }
  
  await fetchPageProfileData();
});

// Watch for auth changes (e.g., logout from another tab)
watch(
  () => auth.isAuthenticated,
  (isAuth) => {
    if (!isAuth && import.meta.client) {
      // Ensure this runs client-side
      navigateTo('/login');
    }
  },
);

// If profileData becomes null while on this page (e.g. after a failed token refresh elsewhere)
watch(
  () => profileData.value,
  (currentUser) => {
    if (!currentUser && auth.isAuthenticated && import.meta.client) {
      // Attempt to re-fetch or handle appropriately
      console.warn('Profile data became null unexpectedly. Re-fetching.');
      fetchPageProfileData();
    }
  },
);
</script>
