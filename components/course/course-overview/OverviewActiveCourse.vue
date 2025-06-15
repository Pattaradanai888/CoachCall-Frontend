<template>
  <div class="bg-white p-5">
    <!-- Header + Tabs -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">
        Courses Overview
      </h1>
      <div
        ref="tabContainer"
        class="relative flex bg-gray-100 rounded-lg p-1 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full"
      >
        <!-- Moving background “indicator” under the active tab -->
        <div
          class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out"
          :style="{ left: `${indicatorLeft}px`, width: `${indicatorWidth}px` }"
        />

        <!-- Tab Buttons -->
        <button
          v-for="tab in tabs"
          :key="tab.label"
          ref="tabRefs"
          class="relative z-10 px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap"
          :class="activeTab === tab.label ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'"
          @click="setActiveTab(tab.label)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Courses Grid (paginated) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 px-6 py-4">
      <!-- NOTE: Added 'flex flex-col' to make the card a flex container -->
      <div
        v-for="course in paginatedCourses"
        :key="course.id"
        class="shadow-lg px-4 bg-white rounded-lg flex flex-col"
      >
        <!-- Course Image -->
        <div class="mb-3">
          <NuxtImg
            :src="course.image"
            :alt="course.title"
            class="w-full h-48 object-cover rounded-lg"
            fetchpriority="high"
            quality="80"
            format="webp"
          />
        </div>

        <!-- Title / Description + “⋯” Menu -->
        <div class="flex justify-between">
          <div>
            <h1 class="font-bold">
              {{ course.title }}
            </h1>
            <p class="text-sm text-gray-600">
              {{ course.description }}
            </p>
          </div>
          <div class="relative inline-block text-left">
            <!-- Trigger Button -->
            <button
              type="button"
              class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 focus:outline-none"
              @click="toggleMenu(course.id)"
            >
              <Icon name="mdi:dots-horizontal" size="1rem" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="openMenuFor === course.id"
              class="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg z-10"
            >
              <ul class="py-1 text-sm text-gray-700">
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100"
                    @click.prevent="handleEdit(course.id)"
                  >
                    Edit
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 text-red-600"
                    @click.prevent="handleRemove(course.id)"
                  >
                    Remove
                  </a>
                </li>
              </ul>
            </div>

            <!-- Click‐outside overlay -->
            <div
              v-if="openMenuFor === course.id"
              class="fixed inset-0 bg-transparent z-0"
              @click="openMenuFor = null"
            />
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="my-2">
          <ProgressBar :value="course.progressValue" :max="100" />
        </div>

        <!-- Participants Count -->
        <div class="mt-2 flex items-center text-sm text-gray-700">
          <Icon name="mdi:account" size="1.25rem" class="mr-1" />
          <p>{{ course.participants }} Athletes</p>
        </div>

        <!-- Start / End Dates -->
        <div class="flex justify-between mt-2 text-sm text-gray-700">
          <div class="flex">
            <p class="font-bold mr-1">
              Start:
            </p>
            <p>{{ course.startDate }}</p>
          </div>
          <div class="flex">
            <p class="font-bold mr-1">
              End:
            </p>
            <p>{{ course.endDate }}</p>
          </div>
        </div>

        <!-- NOTE: This div will grow to push the button to the bottom -->
        <div class="flex-grow" />

        <!-- “See details” Button -->
        <div class="flex justify-center my-3">
          <NuxtLink :to="`/course-detail/${course.id}`">
            <button class="bg-white text-[#9C1313] font-bold border-2 border-[#9C1313] px-4 py-1 rounded-xl hover:bg-[#9C1313] hover:text-white">
              See details
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- If there are no courses for the current filter, show a message -->
    <div v-if="!paginatedCourses.length" class="text-center text-gray-500 py-8">
      No {{ activeTab.toLowerCase() }} courses found.
    </div>

    <PaginationBar
      v-model:current-page="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      class="px-6 py-4"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Course } from '~/composables/useCourses';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
// 1. IMPORT THE REUSABLE COMPONENT
import PaginationBar from '~/components/PaginationBar.vue';
import { useCourses } from '~/composables/useCourses';

/** Tab definitions */
const tabs = [
  { label: 'Active', status: 'Active' },
  { label: 'Archive', status: 'Archive' },
];
const activeTab = ref<string>('Active');

/** Data from composable */
const { courses } = useCourses();

/** Filter courses based on the active tab */
const filteredCourses = computed(() => {
  return courses.value.filter(c => c.status === activeTab.value);
});

const itemsPerPage = 3;
const currentPage = ref<number>(1);

// A computed property for the total number of items to paginate
const totalItems = computed(() => filteredCourses.value.length);

// Whenever the active tab changes (which changes the filtered list), reset to page 1
watch(activeTab, () => {
  currentPage.value = 1;
});

// The parent component is still responsible for slicing the data
const paginatedCourses = computed(() => {
  const startIdx = (currentPage.value - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  return filteredCourses.value.slice(startIdx, endIdx);
});

// NOTE: The following have been removed as they are now handled by PaginationBar.vue:
// - totalPages computed property
// - startIndex computed property
// - endIndex computed property
// - goToPage() method
// - prevPage() method
// - nextPage() method

// ==========================================================

/** TAB‐INDICATOR LOGIC (unchanged) */
const tabRefs = ref<HTMLElement[]>([]);
const tabContainer = ref<HTMLElement | null>(null);
const indicatorLeft = ref<number>(0);
const indicatorWidth = ref<number>(0);

function setActiveTab(label: string) {
  activeTab.value = label;
  updateIndicator();
}

function updateIndicator() {
  nextTick(() => {
    const index = tabs.findIndex(t => t.label === activeTab.value);
    const el = tabRefs.value[index];
    if (el && tabContainer.value) {
      const containerRect = tabContainer.value.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      indicatorLeft.value = elRect.left - containerRect.left + tabContainer.value.scrollLeft;
      indicatorWidth.value = elRect.width;
    }
  });
}

onMounted(() => {
  updateIndicator();
  if (tabContainer.value) {
    new ResizeObserver(updateIndicator).observe(tabContainer.value);
  }
});

/** DROPDOWN MENU STATE (unchanged) */
const openMenuFor = ref<number | null>(null);
function toggleMenu(courseId: number) {
  openMenuFor.value = openMenuFor.value === courseId ? null : courseId;
}

function handleEdit(courseId: number) {
  console.log('Edit clicked for course', courseId);
  openMenuFor.value = null;
}
function handleRemove(courseId: number) {
  console.log('Remove clicked for course', courseId);
  openMenuFor.value = null;
}
</script>

<style scoped>
/* You may want to keep this if you use it on other pages */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
