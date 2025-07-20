<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <!-- Modal Header -->
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h2 class="text-xl font-bold text-gray-800">
            {{ title }}
          </h2>
          <button class="text-gray-500 hover:text-gray-800" @click="$emit('close')">
            <Icon name="mdi:close" size="1.5rem" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="mb-6">
          <p class="text-gray-600">
            {{ message }}
          </p>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end space-x-3">
          <button
            class="px-6 py-2 rounded-lg font-medium text-white bg-[#9C1313] hover:bg-red-800 transition-colors"
            @click="$emit('confirm')"
          >
            {{ confirmText }}
          </button>
          <button
            class="px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300"
            @click="$emit('close')"
          >
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
interface Props {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

// Define props with default values
withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
});

defineEmits(['close', 'confirm']);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
