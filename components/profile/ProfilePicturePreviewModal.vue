<template>
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="previewModalTitle"
    @click="$emit('close')"
  >
    <div v-motion-pop class="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4" @click.stop>
      <h3 id="previewModalTitle" class="text-lg font-semibold text-gray-900 mb-4">
        Preview Profile Picture
      </h3>
      <p class="text-gray-600 mb-4 text-sm sm:text-base">
        Review your new profile picture before uploading.
      </p>

      <div class="text-center mb-6">
        <NuxtImg
          v-if="previewImage"
          :src="previewImage"
          alt="Profile picture preview"
          fetchpriority="high"
          width="128"
          height="128"
          class="w-32 h-32 rounded-full mx-auto border-4 border-gray-100 object-cover"
        />
        <p v-if="selectedFile" class="text-sm text-gray-500 mt-2 break-words">
          {{ selectedFile.name }}
        </p>
        <p v-if="selectedFile" class="text-xs text-gray-400">
          Size: {{ formatFileSize(selectedFile.size) }}
        </p>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
        <div class="flex items-center">
          <Icon name="mdi:information" class="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
          <p class="text-sm text-blue-800">
            The image will be automatically processed (e.g., resized to 300x300px).
          </p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          type="button"
          class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="uploading"
          class="flex-1 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors disabled:opacity-50"
          @click="$emit('upload')"
        >
          {{ uploading ? 'Uploading...' : 'Upload Picture' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showModal: boolean;
  previewImage: string | null;
  selectedFile: File | null;
  uploading: boolean;
}>();

defineEmits<{
  (e: 'close' | 'upload'): void;
}>();

const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>
