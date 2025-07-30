<!-- components/PaginationBar.vue -->
<template>
  <div v-if="totalItems > 0" class="flex justify-between items-center mt-4">
    <!-- Information Text -->
    <p class="text-gray-700 text-sm">
      Showing {{ startIndex }} - {{ endIndex }} of {{ totalItems }} items
    </p>

    <!-- Pagination Controls -->
    <div class="flex items-center">
      <!-- Previous Button -->
      <button
        class="px-2 py-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        <Icon name="mdi:arrow-left" size="1rem" />
      </button>

      <!-- Page Number Buttons -->
      <button
        v-for="page in totalPages"
        :key="page"
        class="px-3 py-1 rounded-md mx-1 text-sm font-medium"
        :class="{
          'bg-[#9C1313] text-white shadow-md': currentPage === page,
          'bg-white text-gray-700 hover:bg-gray-200': currentPage !== page,
        }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <!-- Next Button -->
      <button
        class="px-2 py-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        <Icon name="mdi:arrow-right" size="1rem" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

// Define props passed from the parent component
const props = defineProps({
  totalItems: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
});

// Define emits to communicate back to the parent using the v-model convention
const emit = defineEmits(['update:currentPage']);

// Computed property to calculate the total number of pages
const totalPages = computed(() => {
  if (props.totalItems === 0)
    return 1; // Avoid division by zero
  return Math.ceil(props.totalItems / props.itemsPerPage);
});

// Computed properties for the "Showing X-Y of Z" text
const startIndex = computed(() => {
  if (props.totalItems === 0)
    return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endIndex = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
});

// Methods to emit page change events
function goToPage(page: number) {
  emit('update:currentPage', page);
}

function prevPage() {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1);
  }
}

function nextPage() {
  if (props.currentPage < totalPages.value) {
    emit('update:currentPage', props.currentPage + 1);
  }
}
</script>
