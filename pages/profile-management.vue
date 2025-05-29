<template>
  <div class="min-h-screen bg-gray-50 overflow-x-hidden">
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-[5rem]">
      <!-- Page Header -->
      <div v-motion-slide-visible-once-bottom class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Profile Management</h1>
        <p class="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <!-- Navigation Tabs -->
      <div v-motion-slide-visible-once-bottom :delay="100" class="mb-8 overflow-x-auto">
        <nav class="flex space-x-8 border-b border-gray-200 min-w-max px-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
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
        <p class="text-gray-500">Loading profile...</p>
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
            :achievements="achievements"
            :total-courses="mockTotalCourses"
            :total-athletes="mockTotalAthletes"
          />

          <DisplayNameTab
            v-if="activeTab === 'display-name' && profileData"
            :initial-fullname="profileData.fullname"
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
            :current-profile-image-url="profileData.profile_image_url"
            @image-updated="handleProfileImageUpdated"
            @image-deleted="handleProfileImageDeleted"
            @error="
              () => handleProfileUpdateError('An error occurred while updating profile picture')
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore, type User } from '~/stores/auth';

// Import new components
import ProfileOverviewTab from '~/components/profile/ProfileOverviewTab.vue';
import DisplayNameTab from '~/components/profile/DisplayNameTab.vue';
import PasswordTab from '~/components/profile/PasswordTab.vue';
import ProfilePictureTab from '~/components/profile/ProfilePictureTab.vue';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

// Store and router
const auth = useAuthStore();

// Page state
const activeTab = ref('overview');
const loadingPage = ref(false); // Renamed from 'loading' to be specific to page loading
const pageError = ref<string | null>(null); // Renamed from 'error'

// Profile data from Pinia store
const profileData = computed<User | null>(() => auth.user);

// Mock data (replace with real data fetching if needed)
const achievements = ref<Achievement[]>([
  {
    id: '1',
    title: 'First Course Created',
    description: 'Created your first training course',
    date: '2024-01-15',
    icon: 'mdi:trophy',
  },
  {
    id: '2',
    title: 'Coach Milestone',
    description: 'Trained 10 athletes successfully',
    date: '2024-02-20',
    icon: 'mdi:medal',
  },
]);
const mockTotalCourses = ref(5); // Example mock data
const mockTotalAthletes = ref(12); // Example mock data

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

// Notification utility (placeholder)
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  // Replace with your actual notification system (e.g., a toast library)
  if (type === 'error') {
    console.error(`NOTIFICATION: ${message}`);
    pageError.value = message; // Display error on page if desired
  } else {
    console.log(`NOTIFICATION: ${message}`);
    pageError.value = null; // Clear previous errors on success
  }
  // Auto-clear error message after a few seconds
  if (type === 'error') {
    setTimeout(() => {
      if (pageError.value === message) pageError.value = null;
    }, 5000);
  }
};

// Event Handlers from child components
const handleDisplayNameUpdated = (newName: string) => {
  showNotification(`Display name updated to: ${newName}`, 'success');
  // profileData (auth.user) is already updated by the child component via store
};

const handlePasswordUpdated = () => {
  showNotification('Password updated successfully', 'success');
};

const handleProfileImageUpdated = () => {
  showNotification('Profile picture updated successfully', 'success');
  // profileData (auth.user) is already updated by the child component via store
};

const handleProfileImageDeleted = () => {
  showNotification('Profile picture deleted successfully', 'success');
  // profileData (auth.user) is already updated by the child component via store
};

const handleProfileUpdateError = (message: string) => {
  showNotification(message, 'error');
};

// Fetch initial page data or ensure auth.user is populated
const fetchPageProfileData = async () => {
  loadingPage.value = true;
  pageError.value = null;
  try {
    // auth.initializeAuth or auth.fetchProfile should be called by middleware or auth plugin.
    // This check ensures user data is present; if not, attempts to fetch.
    if (!auth.user && auth.accessToken) {
      // Only fetch if user is null but token exists
      await auth.fetchProfile();
    }
    // If auth.user is still null after this, it might indicate an issue resolved by redirection.
    if (!auth.user && auth.isAuthenticated) {
      // Should not happen if isAuthenticated is true
      console.warn('User is authenticated but user data is null. Attempting fetch.');
      await auth.fetchProfile();
    }
  } catch (err: unknown) {
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
  } finally {
    loadingPage.value = false;
  }
};

onMounted(async () => {
  if (!auth.isAuthenticated) {
    navigateTo('/login?redirect=/profile-management');
    return;
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
  }
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
  }
);
</script>
