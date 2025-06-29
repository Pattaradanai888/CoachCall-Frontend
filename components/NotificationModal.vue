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
          <div class="flex items-center">
            <Icon :name="iconName" :class="iconColor" class="mr-3" size="1.75rem" />
            <h2 class="text-xl font-bold text-gray-800">
              {{ title }}
            </h2>
          </div>
          <button class="text-gray-500 hover:text-gray-800" @click="$emit('close')">
            <Icon name="mdi:close" size="1.5rem" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="mb-6">
          <p class="text-gray-600 whitespace-pre-wrap">
            {{ message }}
          </p>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end space-x-4">
          <button
            class="px-6 py-2 rounded-lg font-semibold text-white bg-red-800 hover:bg-red-900 transition"
            @click="$emit('close')"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  show: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
});

defineEmits(['close']);

const iconName = computed(() => {
  return props.type === 'success' ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline';
});

const iconColor = computed(() => {
  return props.type === 'success' ? 'text-green-600' : 'text-red-600';
});
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
