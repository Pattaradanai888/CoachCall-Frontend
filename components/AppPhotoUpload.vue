<!-- components/AppPhotoUpload.vue -->
<template>
  <div class="flex flex-col">
    <label class="block text-sm font-semibold text-gray-700 mb-2">
      <Icon name="mdi:camera" class="inline mr-1 text-red-600" />
      Profile Photo
      <span class="text-gray-500 text-xs ml-1">(Optional)</span>
    </label>

    <div class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-red-400 transition-colors">
      <!-- Upload Area -->
      <div v-if="!previewUrl" class="text-center">
        <Icon name="mdi:cloud-upload" size="4rem" class="text-gray-400 mb-4" />
        <p class="text-gray-600 font-medium mb-2">
          Upload athlete's photo
        </p>
        <p class="text-gray-500 text-sm mb-4">
          Drag & drop or click to browse
        </p>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileChange"
        >
        <button
          type="button"
          class="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition-colors font-medium"
          @click="triggerFileInput"
        >
          Choose Photo
        </button>
      </div>

      <!-- Preview -->
      <div v-else class="text-center">
        <NuxtImg
          :src="previewUrl"
          alt="Preview"
          class="h-32 w-32 object-cover rounded-full mb-4 border-4 border-red-200"
        />
        <button
          type="button"
          class="text-red-600 hover:text-red-800 text-sm font-medium"
          @click="removePhoto"
        >
          Remove Photo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  previewUrl?: string | null;
}

defineProps<Props>();

const emit = defineEmits<{
  fileChange: [event: Event];
  removePhoto: [];
}>();

const fileInputRef = ref<HTMLInputElement>();

const onFileChange = (event: Event) => emit('fileChange', event);
const removePhoto = () => emit('removePhoto');
function triggerFileInput() {
  fileInputRef.value?.click();
}
</script>
