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
            @click="activeTab = tab.id"
            :class="[
              'flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            <Icon :name="tab.icon" class="w-5 h-5 mr-2" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="rounded-lg shadow-sm overflow-hidden">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="bg-white p-4 sm:p-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <!-- Profile Info -->
            <div v-motion-slide-visible-once-left class="lg:col-span-1 w-full">
              <div class="text-center">
                <img
                  :src="profileData.avatar"
                  alt="Profile Picture"
                  class="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-100"
                />
                <h2 class="text-2xl font-bold text-gray-900 break-words">{{ profileData.name }}</h2>
                <p class="text-gray-600 break-all text-sm sm:text-base">{{ profileData.email }}</p>

                <div class="mt-6 space-y-2">
                  <div class="flex items-center justify-center text-gray-700 text-sm sm:text-base">
                    <Icon name="mdi:book-outline" class="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>Total Course: {{ profileData.totalCourses }}</span>
                  </div>
                  <div class="flex items-center justify-center text-gray-700 text-sm sm:text-base">
                    <Icon name="mdi:account-group" class="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>Total Athlete: {{ profileData.totalAthletes }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Achievements -->
            <div
              v-motion-slide-visible-once-right
              :delay="200"
              class="lg:col-span-2 w-full min-w-0"
            >
              <div class="flex items-center mb-6">
                <Icon name="mdi:trophy" class="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" />
                <h3 class="text-xl font-semibold text-gray-900">Achievements</h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  v-for="(achievement, index) in achievements"
                  :key="achievement.id"
                  v-motion-slide-visible-once-bottom
                  :delay="300 + index * 100"
                  class="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow w-full min-w-0"
                >
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <Icon :name="achievement.icon" class="w-8 h-8 text-yellow-600" />
                    </div>
                    <div class="flex-grow min-w-0">
                      <h4 class="font-semibold text-gray-900 break-words">
                        {{ achievement.title }}
                      </h4>
                      <p class="text-sm text-gray-600 mb-2 break-words">
                        {{ achievement.description }}
                      </p>
                      <p class="text-xs text-gray-500 break-words">
                        Achieved on {{ achievement.date }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Display Name Tab -->
        <div v-if="activeTab === 'display-name'" class="p-4 sm:p-6">
          <div class="max-w-lg mx-auto">
            <div
              v-motion-slide-visible-once-bottom
              class="bg-white rounded-lg shadow-sm p-4 sm:p-6"
            >
              <div class="flex items-center mb-6">
                <Icon name="mdi:account-edit" class="w-6 h-6 text-gray-700 mr-2 flex-shrink-0" />
                <h3 class="text-xl font-semibold text-gray-900">Display Name</h3>
              </div>
              <p class="text-gray-600 mb-6 text-sm sm:text-base">
                Update your display name that will be shown to other users
              </p>

              <form @submit.prevent="updateDisplayName" class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Current Display name
                  </label>
                  <div class="relative">
                    <input
                      v-model="displayNameForm.current"
                      type="text"
                      disabled
                      class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 pr-10"
                    />
                    <Icon
                      name="mdi:check"
                      class="absolute right-3 top-2.5 w-5 h-5 text-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    New Display name
                  </label>
                  <input
                    v-model="displayNameForm.new"
                    type="text"
                    placeholder="Enter new display name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 class="font-medium text-gray-900 mb-2">Requirements:</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 2-50 characters long</li>
                    <li>• Letters, numbers, spaces, hyphens, underscores, and periods only</li>
                    <li>• Cannot be empty or contain only spaces</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  class="w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 transition-colors font-medium"
                >
                  Update Display Name
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Password Tab -->
        <div v-if="activeTab === 'password'" class="p-4 sm:p-6">
          <div class="max-w-lg mx-auto">
            <div
              v-motion-slide-visible-once-bottom
              class="bg-white rounded-lg shadow-sm p-4 sm:p-6"
            >
              <div class="flex items-center mb-6">
                <Icon name="mdi:lock" class="w-6 h-6 text-gray-700 mr-2 flex-shrink-0" />
                <h3 class="text-xl font-semibold text-gray-900">Change Password</h3>
              </div>
              <p class="text-gray-600 mb-6 text-sm sm:text-base">
                Update your password to keep your account secure
              </p>

              <form @submit.prevent="updatePassword" class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.current"
                      :type="showPasswords.current ? 'text' : 'password'"
                      placeholder="Enter current password"
                      autocomplete="current-password"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      @click="showPasswords.current = !showPasswords.current"
                      class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <Icon
                        :name="showPasswords.current ? 'mdi:eye-off' : 'mdi:eye'"
                        class="w-5 h-5"
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"> New Password </label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.new"
                      :type="showPasswords.new ? 'text' : 'password'"
                      placeholder="Enter new password"
                      autocomplete="new-password"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      @click="showPasswords.new = !showPasswords.new"
                      class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <Icon :name="showPasswords.new ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.confirm"
                      :type="showPasswords.confirm ? 'text' : 'password'"
                      placeholder="Confirm New Password"
                      autocomplete="new-password"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      @click="showPasswords.confirm = !showPasswords.confirm"
                      class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <Icon
                        :name="showPasswords.confirm ? 'mdi:eye-off' : 'mdi:eye'"
                        class="w-5 h-5"
                      />
                    </button>
                  </div>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
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

                <button
                  type="submit"
                  :disabled="!isPasswordValid"
                  class="w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Profile Picture Tab -->
        <div v-if="activeTab === 'profile-picture'" class="bg-white p-4 sm:p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <!-- Current Profile Picture -->
            <div v-motion-slide-visible-once-left class="text-center">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Current Profile Picture</h3>
              <img
                :src="profileData.avatar"
                alt="Current Profile Picture"
                class="w-48 h-48 rounded-full mx-auto border-4 border-gray-100"
              />
            </div>

            <!-- Upload New Picture -->
            <div v-motion-slide-visible-once-right :delay="200" class="w-full min-w-0">
              <div class="flex items-center mb-6">
                <Icon name="mdi:camera" class="w-6 h-6 text-gray-700 mr-2 flex-shrink-0" />
                <h3 class="text-xl font-semibold text-gray-900">Profile Picture</h3>
              </div>
              <p class="text-gray-600 mb-6 text-sm sm:text-base">
                Upload and manage your profile picture
              </p>

              <!-- Upload Area -->
              <div
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-gray-400 transition-colors mb-6"
              >
                <Icon name="mdi:cloud-upload" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p class="text-gray-600 mb-2 text-sm sm:text-base">Drop file here</p>
                <p class="text-gray-500 text-sm mb-4">or</p>
                <button
                  @click="$refs.fileInput.click()"
                  class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Browse File
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
              </div>

              <!-- Image Requirements -->
              <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div class="flex items-start">
                  <Icon
                    name="mdi:information"
                    class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                  />
                  <div class="min-w-0">
                    <h4 class="font-medium text-gray-900 mb-2">Image Requirements:</h4>
                    <ul class="text-sm text-gray-600 space-y-1">
                      <li>• Supported formats: JPG, PNG, GIF</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Recommended dimensions: 400×400 pixels</li>
                      <li>• Square images work best</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="showPreviewModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closePreviewModal"
    >
      <div v-motion-pop class="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4" @click.stop>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Preview Profile Picture</h3>
        <p class="text-gray-600 mb-4 text-sm sm:text-base">
          Review your new profile picture before uploading
        </p>

        <div class="text-center mb-6">
          <img
            :src="previewImage"
            alt="Preview"
            class="w-32 h-32 rounded-full mx-auto border-4 border-gray-100"
          />
          <p class="text-sm text-gray-500 mt-2 break-words">{{ selectedFile?.name }}</p>
          <p class="text-xs text-gray-400">Size: {{ formatFileSize(selectedFile?.size) }}</p>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <div class="flex items-center">
            <Icon name="mdi:information" class="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
            <p class="text-sm text-blue-800">
              The image will be automatically resized to 400×400 pixels to maintain consistency
              across the application.
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            @click="closePreviewModal"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="uploadProfilePicture"
            class="flex-1 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors"
          >
            Upload Picture
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Reactive data
const activeTab = ref('overview');
const showPreviewModal = ref(false);
const previewImage = ref('');
const selectedFile = ref(null);

const tabs = [
  { id: 'overview', name: 'Overview', icon: 'mdi:home' },
  { id: 'display-name', name: 'Display name', icon: 'mdi:account-edit' },
  { id: 'password', name: 'Password', icon: 'mdi:lock' },
  { id: 'profile-picture', name: 'Profile Picture', icon: 'mdi:camera' },
];

const profileData = ref({
  name: 'Alex Johnson',
  email: 'alex_j@example.com',
  avatar:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&auto=format',
  totalCourses: 16,
  totalAthletes: 20,
});

const achievements = ref([
  {
    id: 1,
    title: 'Team Growth Star',
    description: '10% increase in new trainees',
    date: 'May 5, 2025',
    icon: 'mdi:star',
  },
  {
    id: 2,
    title: 'Template Master',
    description: 'Used templates for 50% of your courses',
    date: 'May 5, 2025',
    icon: 'mdi:file-document',
  },
  {
    id: 3,
    title: 'Skill Boost',
    description: '75% of athletes improved their skills',
    date: 'May 5, 2025',
    icon: 'mdi:trending-up',
  },
  {
    id: 4,
    title: 'Team Growth Star',
    description: '10% increase in new trainees',
    date: 'May 5, 2025',
    icon: 'mdi:star',
  },
]);

// Form data
const displayNameForm = ref({
  current: 'Alex Johnson',
  new: '',
});

const passwordForm = ref({
  current: '',
  new: '',
  confirm: '',
});

const showPasswords = ref({
  current: false,
  new: false,
  confirm: false,
});

// Password validation
const passwordValidation = computed(() => {
  const password = passwordForm.value.new;
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
});

const isPasswordValid = computed(() => {
  return (
    Object.values(passwordValidation.value).every((valid) => valid) &&
    passwordForm.value.new === passwordForm.value.confirm &&
    passwordForm.value.current.length > 0
  );
});

// Methods
const updateDisplayName = () => {
  if (displayNameForm.value.new.trim()) {
    profileData.value.name = displayNameForm.value.new;
    displayNameForm.value.current = displayNameForm.value.new;
    displayNameForm.value.new = '';
    // Add success notification logic here
    console.log('Display name updated successfully');
  }
};

const updatePassword = () => {
  if (isPasswordValid.value) {
    // Add password update logic here
    console.log('Password updated successfully');
    passwordForm.value = { current: '', new: '', confirm: '' };
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    handleFile(file);
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    handleFile(file);
  }
};

const handleFile = (file) => {
  if (file.type.startsWith('image/')) {
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
      showPreviewModal.value = true;
    };
    reader.readAsDataURL(file);
  }
};

const closePreviewModal = () => {
  showPreviewModal.value = false;
  previewImage.value = '';
  selectedFile.value = null;
};

const uploadProfilePicture = () => {
  if (selectedFile.value) {
    // Add upload logic here
    profileData.value.avatar = previewImage.value;
    console.log('Profile picture updated successfully');
    closePreviewModal();
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// SEO
useHead({
  title: 'Profile Management - CoachCall',
  meta: [
    {
      name: 'description',
      content:
        'Manage your CoachCall profile settings, update display name, change password, and upload profile picture.',
    },
  ],
});
</script>

<style scoped>
/* Custom animations for better UX */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Smooth transitions for tab switching */
.tab-content {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
