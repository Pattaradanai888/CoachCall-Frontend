<template>
  <div class="bg-white p-3 sm:p-4 lg:p-5 md:min-h-[250px] rounded-lg shadow-sm">
    <div class="flex flex-col gap-3 sm:gap-4 md:flex-row md:justify-between md:items-center">
      <div class="flex-1 min-w-0">
        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 leading-tight">
          Session Overview
        </h1>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center md:flex-shrink-0">
        <button
          class="bg-[#9C1313] text-white font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-[#7A0F0F] w-full sm:w-auto shadow-lg transition-all duration-200 active:scale-95"
          @click="$emit('open-create-modal')"
        >
          <div class="flex items-center justify-center">
            <Icon name="mdi:plus" size="1rem" class="mr-1 sm:mr-2" />
            <p class="text-xs sm:text-sm whitespace-nowrap">
              Create Session Template
            </p>
          </div>
        </button>
        <div class="sm:ml-2">
          <div class="relative w-full sm:max-w-md shadow-lg">
            <input
              type="text"
              placeholder="Search templates..."
              class="w-full px-3 sm:px-4 py-2 pr-10 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#9C1313] focus:ring-1 focus:ring-[#9C1313] transition duration-300 ease-in-out"
            >
            <Icon
              name="mdi:magnify"
              size="1rem"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Responsive Grid with improved spacing -->
    <div v-if="paginatedTemplates.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 px-1 sm:px-2 lg:px-4 py-2 sm:py-4">
      <div v-for="(template, index) in paginatedTemplates" :key="template.id" class="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-3 sm:p-4 flex flex-col">
        <div class="flex-grow">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1 pr-2 min-w-0">
              <h1 class="font-bold text-sm sm:text-base text-gray-800 truncate" :title="template.name">
                {{ template.name }}
              </h1>
              <p v-if="template.description" class="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2" :title="template.description">
                {{ template.description }}
              </p>
            </div>
            <div class="relative inline-block text-left flex-shrink-0">
              <button type="button" class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-gray-200 focus:outline-none transition-colors duration-200" @click="toggle(index)">
                <Icon name="mdi:dots-horizontal" size="0.875rem" class="sm:size-4" />
              </button>
              <div v-if="isOpen[index]" class="absolute right-0 mt-2 w-36 sm:w-40 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <ul class="py-1 text-xs sm:text-sm text-gray-700">
                  <li><a href="#" class="block px-3 sm:px-4 py-2 hover:bg-gray-100 transition-colors" @click.prevent="$emit('open-edit-modal', template)">Edit</a></li>
                  <li><a href="#" class="block px-3 sm:px-4 py-2 hover:bg-gray-100 text-red-600 transition-colors" @click.prevent="$emit('remove-template', template.id)">Remove</a></li>
                </ul>
              </div>
              <div v-if="isOpen[index]" class="fixed inset-0 bg-transparent z-10" @click="isOpen[index] = false" />
            </div>
          </div>
          <div class="flex mb-3">
            <div class="inline-flex items-center bg-[#F1F5F9] px-2 py-1 rounded-lg">
              <Icon name="mdi:clock-outline" class="mr-1 text-gray-600" size="0.875rem" />
              <p class="font-semibold text-xs sm:text-sm text-gray-700">
                Time:
              </p>
              <p class="text-xs sm:text-sm text-gray-600 ml-1">
                {{ template.total_duration_minutes }} mins
              </p>
            </div>
          </div>
        </div>
        <div class="mt-auto">
          <button
            class="w-full bg-white text-[#9C1313] font-bold border-2 border-[#9C1313] px-3 sm:px-4 py-2 rounded-xl hover:bg-[#9C1313] hover:text-white transition-all duration-200 active:scale-95 text-xs sm:text-sm"
            @click.prevent="$emit('start-quick-session', template)"
          >
            Quick Session        
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center p-6 sm:p-8 text-gray-500">
      <Icon name="mdi:folder-open-outline" size="3rem" class="mx-auto mb-3 text-gray-400" />
      <p class="text-sm sm:text-base">No session templates found.</p>
      <p class="text-xs sm:text-sm text-gray-400 mt-1">Create your first template to get started.</p>
    </div>

    <PaginationBar
      v-model:current-page="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      class="mt-4 sm:mt-6"
    />
  </div>
</template>

<script lang="ts" setup>
import type { SessionTemplate } from '~/types/course';

const props = defineProps<{
  templates: SessionTemplate[] | null;
}>();

defineEmits<{
  (e: 'open-create-modal'): void;
  (e: 'open-edit-modal', template: SessionTemplate): void;
  (e: 'remove-template', templateId: number): void;
  (e: 'start-quick-session', template: SessionTemplate): void;
}>();

const currentPage = ref(1);
// The number of items per page is 6 to ensure the grid is always full for both 2-column and 3-column layouts.
const itemsPerPage = 3;
const totalItems = computed(() => props.templates?.length || 0);

const paginatedTemplates = computed(() => {
  if (!props.templates)
    return [];
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return props.templates.slice(start, end);
});

const isOpen = ref<boolean[]>([]);

watchEffect(() => {
  if (props.templates) {
    isOpen.value = Array.from({ length: props.templates.length }, () => false);
  }
});

function toggle(index: number) {
  const currentStatus = isOpen.value[index];
  isOpen.value.fill(false);
  isOpen.value[index] = !currentStatus;
}
</script>