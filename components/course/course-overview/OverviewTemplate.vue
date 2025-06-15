<template>
  <!-- Template Section -->
  <div class="bg-white p-5">
    <div class="flex justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          Session Overview
        </h1>
      </div>
      <div class="flex">
        <button
          class="bg-[#9C1313] text-white font-bold px-2 py-2 rounded-xl hover:bg-[#7A0F0F] mx-auto shadow-lg"
          @click="openCreateModal"
        >
          <div class="flex items-center justify-center">
            <Icon name="mdi:plus" size="1rem" class="mr-1" />
            <p class="text-sm">
              Create Session Template
            </p>
          </div>
        </button>
        <div class="ml-2">
          <!-- Search Bar Container -->
          <div class="relative w-full max-w-md shadow-lg">
            <!-- Input Field -->
            <input
              type="text"
              placeholder="Search..."
              class="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:border-[#9C1313] transition duration-300 ease-in-out"
            >
            <!-- Magnifying Glass Icon -->
            <Icon
              name="mdi:magnify"
              size="1rem"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- Template Items -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 px-6 py-4">
      <div v-for="(template, index) in paginatedTemplates" :key="index" class="shadow-lg px-4">
        <!-- ... (your item card content remains the same) ... -->
        <div class="flex justify-between">
          <div>
            <h1 class="font-bold">
              {{ template.title }}
            </h1>
            <p>{{ template.description }}</p>
          </div>
          <div>
            <div class="relative inline-block text-left">
              <button type="button" class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 focus:outline-none" @click="toggle(index)">
                <Icon name="mdi:dots-horizontal" size="1rem" class="" />
              </button>
              <div v-if="isOpen[index]" class="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <ul class="py-1 text-sm text-gray-700">
                  <li><a href="#" class="block px-4 py-2 hover:bg-gray-100" @click.prevent="handleEdit(template)">Edit</a></li>
                  <li><a href="#" class="block px-4 py-2 hover:bg-gray-100 text-red-600" @click.prevent="handleRemove(template)">Remove</a></li>
                </ul>
              </div>
              <div v-if="isOpen[index]" class="fixed inset-0 bg-transparent z-0" @click="isOpen[index] = false" />
            </div>
          </div>
        </div>
        <div class="flex mt-2">
          <div class="flex bg-[#F1F5F9] px-2 rounded-lg mr-1">
            <p class="font-bold text-sm">
              Difficulty:
            </p>
            <p class="text-sm ml-1">
              {{ template.difficulty }}
            </p>
          </div>
          <div class="flex bg-[#F1F5F9] px-2 rounded-lg">
            <p class="font-bold text-sm">
              Time:
            </p>
            <p class="text-sm ml-1">
              {{ template.time }}
            </p>
          </div>
        </div>
        <div class="flex justify-center my-3">
          <button class="bg-white text-[#9C1313] font-bold border-2 border-[#9C1313] border-solid px-4 py-1 rounded-xl hover:bg-[#9C1313] hover:text-white mx-auto">
            <p>Quick Session</p>
          </button>
        </div>
      </div>
    </div>

    <!-- ******* REFACTORED PAGINATION ******* -->
    <!-- Use the new component. v-model:currentPage handles the two-way data binding. -->
    <PaginationBar
      v-model:current-page="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
    />
    <!-- *************************************** -->
  </div>
  <CreateSessionTemplate
    :show="showAddModal"
    @close="closeCreateModal"
  />
</template>

<script lang="ts" setup>
import { PaginationBar } from '#components';
import { computed, ref, watchEffect } from 'vue';
import CreateSessionTemplate from './CreateSessionTemplate.vue';

const showAddModal = ref(false);

function openCreateModal() {
  showAddModal.value = true;
}

function closeCreateModal() {
  showAddModal.value = false;
}

// Define interface for Template
interface Template {
  title: string;
  description: string;
  difficulty: string;
  time: string;
}

// Sample data for templates
const templates = ref<Template[]>([
  { title: 'Advanced Dribbling1', description: 'Ball handling drills for all positions', difficulty: 'intermediate', time: '30 mins' },
  { title: 'Advanced Dribbling2', description: 'Ball handling drills for all positions', difficulty: 'intermediate', time: '30 mins' },
  { title: 'Advanced Dribbling3', description: 'Ball handling drills for all positions', difficulty: 'intermediate', time: '30 mins' },
  { title: 'Advanced Dribbling4', description: 'Ball handling drills for all positions', difficulty: 'intermediate', time: '30 mins' },
  { title: 'Advanced Dribbling5', description: 'Ball handling drills for all positions', difficulty: 'intermediate', time: '30 mins' },
]);

// 2. Keep the state needed for pagination in the parent
const currentPage = ref(1);
const itemsPerPage = 3;
const totalItems = computed(() => templates.value.length);

// 3. Keep the computed property that slices the data for the current page
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return templates.value.slice(start, end);
});

// NOTE: All other pagination logic (totalPages, startIndex, endIndex, goToPage, prevPage, nextPage)
// has been moved to PaginationBar.vue and can be removed from this file.

// Dropdown menu state
const isOpen = ref<boolean[]>([]);

watchEffect(() => {
  isOpen.value = Array.from({ length: templates.value.length }).fill(false);
});

function toggle(index: number) {
  isOpen.value[index] = !isOpen.value[index];
}

function handleEdit(template: Template) {
  console.log('Edit clicked:', template);
  const index = templates.value.findIndex(t => t === template);
  if (index !== -1)
    isOpen.value[index] = false;
}

function handleRemove(template: Template) {
  console.log('Remove clicked:', template);
  const index = templates.value.findIndex(t => t === template);
  if (index !== -1)
    isOpen.value[index] = false;
}
</script>
