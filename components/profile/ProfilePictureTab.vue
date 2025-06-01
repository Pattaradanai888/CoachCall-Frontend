<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
    <!-- Current Profile Picture -->
    <div v-motion-slide-visible-once-left class="text-center">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Current Profile Picture
      </h3>
      <NuxtImg
        :src="currentProfileImageUrl || '/default-profile.jpg'"
        fetchpriority="high"
        width="192"
        height="192"
        alt="Current Profile Picture"
        class="w-48 h-48 rounded-full mx-auto border-4 border-gray-100 object-cover"
        placeholder
      />
      <button
        v-if="currentProfileImageUrl"
        :disabled="loadingDelete"
        class="mt-4 px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 hover:bg-red-50 rounded-md transition-colors"
        @click="confirmDeleteProfilePicture"
      >
        {{ loadingDelete ? 'Deleting...' : 'Delete Picture' }}
      </button>
    </div>

    <!-- Upload New Picture -->
    <div v-motion-slide-visible-once-right :delay="200" class="w-full min-w-0">
      <div class="flex items-center mb-6">
        <Icon name="mdi:camera" class="w-6 h-6 text-gray-700 mr-2 flex-shrink-0" />
        <h3 class="text-xl font-semibold text-gray-900">
          Upload New Picture
        </h3>
      </div>
      <p class="text-gray-600 mb-6 text-sm sm:text-base">
        Upload a new profile picture.
      </p>

      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-gray-400 transition-colors mb-6"
        @drop.prevent="handleDrop"
        @dragover.prevent
        @dragenter.prevent
      >
        <Icon name="mdi:cloud-upload" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600 mb-2 text-sm sm:text-base">
          Drop file here
        </p>
        <p class="text-gray-500 text-sm mb-4">
          or
        </p>
        <button
          type="button"
          class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
          @click="triggerFileInput"
        >
          Browse File
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          class="hidden"
          aria-label="File input for profile picture"
          @change="handleFileSelect"
        >
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex items-start">
          <Icon name="mdi:information" class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div class="min-w-0">
            <h4 class="font-medium text-gray-900 mb-2">
              Image Requirements:
            </h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Supported formats: JPG, PNG, WEBP, GIF</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Recommended dimensions: e.g., 300x300 pixels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <ProfilePicturePreviewModal
      :show-modal="showPreviewModal"
      :preview-image="previewImage"
      :selected-file="selectedFile"
      :uploading="loadingUpload"
      @close="closePreviewModal"
      @upload="handleUploadProfilePicture"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import ProfilePicturePreviewModal from './ProfilePicturePreviewModal.vue';

const props = defineProps<{
  currentProfileImageUrl: string | null | undefined;
}>();

const emit = defineEmits<{
  (e: 'image-updated', newImageUrl: string): void;
  (e: 'image-deleted' | 'error'): void;
}>();

const auth = useAuthStore();
const { $api } = useNuxtApp();

const showPreviewModal = ref(false);
const selectedFile = ref<File | null>(null);
const previewImage = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const loadingUpload = ref(false);
const loadingDelete = ref(false);

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processSelectedFile(file);
  }
}

function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0];
  if (file) {
    processSelectedFile(file);
  }
}

function processSelectedFile(file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    emit('error', 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF.');
    return;
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    emit('error', 'File is too large. Maximum size is 5MB.');
    return;
  }

  selectedFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.value = e.target?.result as string;
    showPreviewModal.value = true;
  };
  reader.readAsDataURL(file);
}

function closePreviewModal() {
  showPreviewModal.value = false;
  selectedFile.value = null;
  previewImage.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

async function handleUploadProfilePicture() {
  if (!selectedFile.value)
    return;

  loadingUpload.value = true;
  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    // Use $api instead of $fetch to include auth token
    const data = await $api<{ message: string; image_url: string }>('/profile/upload-image', {
      method: 'POST',
      body: formData,
    });

    auth.setUserData({ profile_image_url: data.image_url });
    emit('image-updated', data.image_url);
    closePreviewModal();
  }
  catch {
    // Simplified error handling
    const message = 'Failed to upload profile picture.';
    emit('error', message);
  }
  finally {
    loadingUpload.value = false;
  }
}

function confirmDeleteProfilePicture() {
  if (
    window.confirm(
      'Are you sure you want to delete your profile picture? This action cannot be undone.',
    )
  ) {
    handleDeleteProfilePicture();
  }
}

async function handleDeleteProfilePicture() {
  if (!props.currentProfileImageUrl)
    return;

  loadingDelete.value = true;
  try {
    await $api('/profile/image', {
      method: 'DELETE',
    });

    if (auth.user) {
      auth.setUserData({ profile_image_url: null });
    }

    emit('image-deleted');
  }
  catch {
    const message = 'Failed to delete profile picture.';
    emit('error', message);
  }
  finally {
    loadingDelete.value = false;
  }
}
</script>
