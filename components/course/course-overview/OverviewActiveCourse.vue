<template>
  <div class="bg-white p-3 sm:p-4 lg:p-5 rounded-lg shadow-sm">
    <!-- Header + Tabs -->
    <div class="flex flex-row justify-between items-center gap-3 sm:gap-4">
      <div class="flex-1 min-w-0">
        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 leading-tight">
          Courses Overview
        </h1>
      </div>
      <div
        ref="tabContainer"
        class="relative flex bg-gray-100 rounded-lg p-1 flex-shrink-0 overflow-x-auto"
      >
        <div
          class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300"
          :style="{ left: `${indicatorLeft}px`, width: `${indicatorWidth}px` }"
        />
        <button
          v-for="tab in tabs"
          :key="tab.label"
          ref="tabRefs"
          class="relative z-10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-200"
          :class="activeTab === tab.label ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'"
          @click="setActiveTab(tab.label)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Responsive Courses Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 px-1 sm:px-2 lg:px-4 py-2 sm:py-4">
      <div
        v-for="(course, index) in paginatedCourses"
        :key="course.id"
        class="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-3 sm:p-4 flex flex-col"
      >
        <div class="mb-3">
          <NuxtImg
            :src="course.cover_image_url || getFallbackImage(course.name)"
            :alt="`${course.name} course cover`"
            format="webp"
            width="400"
            height="192"
            :loading="index < 2 ? 'eager' : 'lazy'"
            :priority="index === 0"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
            class="w-full h-36 sm:h-40 lg:h-48 object-cover rounded-lg"
          />
        </div>
        <div class="flex-grow">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1 pr-2 min-w-0">
              <h1 class="font-bold text-sm sm:text-base text-gray-800 truncate" :title="course.name">
                {{ course.name }}
              </h1>
              <p class="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2" :title="course.description || undefined">
                {{ course.description || 'No description available' }}
              </p>
            </div>
            <div class="relative inline-block text-left flex-shrink-0">
              <!-- Trigger Button -->
              <button
                type="button"
                class="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-gray-200 focus:outline-none transition-colors duration-200"
                @click="toggleMenu(course.id)"
              >
                <Icon name="mdi:dots-horizontal" size="0.875rem" class="sm:size-4" />
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="openMenuFor === course.id"
                class="absolute right-0 mt-2 w-36 sm:w-40 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg z-20"
              >
                <ul class="py-1 text-xs sm:text-sm text-gray-700">
                  <li>
                    <a href="#" class="block px-3 sm:px-4 py-2 hover:bg-gray-100 transition-colors" @click.prevent="handleEdit(course.id)">
                      Edit
                    </a>
                  </li>
                  <!-- MODIFICATION: Added Archive/Unarchive option -->
                  <li>
                    <a href="#" class="block px-3 sm:px-4 py-2 hover:bg-gray-100 transition-colors" @click.prevent="handleToggleArchive(course)">
                      <span v-if="course.is_archived">Unarchive</span>
                      <span v-else>Archive</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" class="block px-3 sm:px-4 py-2 hover:bg-gray-100 text-red-600 transition-colors" @click.prevent="handleRemove(course)">
                      Remove
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Click‐outside overlay -->
              <div
                v-if="openMenuFor === course.id"
                class="fixed inset-0 bg-transparent z-10"
                @click="openMenuFor = null"
              />
            </div>
          </div>
          <div class="my-3">
            <ProgressBar :value="course.progressValue" :max="100" />
          </div>

          <div class="space-y-3">
            <!-- Avatar Stack + Athlete Count -->
            <div class="flex items-center justify-between">
              <div class="flex items-center group relative">
                <div v-if="course.attendees.length > 0" class="flex items-center">
                  <NuxtImg
                    v-for="(athlete, avatarIndex) in course.attendees.slice(0, 3)"
                    :key="athlete.uuid"
                    :src="athlete.profile_image_url || '/default-profile.jpg'"
                    :alt="`${athlete.name} profile`"
                    format="webp"
                    width="28"
                    height="28"
                    loading="lazy"
                    class="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white object-cover"
                    :class="{ '-ml-2 sm:-ml-3': avatarIndex > 0 }"
                  />
                  <div
                    v-if="course.attendees.length > 3"
                    class="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white -ml-2 sm:-ml-3 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600"
                  >
                    +{{ course.attendees.length - 3 }}
                  </div>
                </div>
                <!-- Tooltip for athlete names -->
                <div v-if="course.attendees.length > 0" class="absolute bottom-full left-0 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  {{ course.attendees.map(a => a.name).join(', ') }}
                </div>
              </div>

              <div class="flex items-center text-xs sm:text-sm text-gray-700">
                <Icon name="mdi:account-group" class="mr-1 text-gray-500" size="1rem" />
                <p>{{ course.attendees.length }} Athletes</p>
              </div>
            </div>

            <!-- Course Dates -->
            <div v-if="course.start_date && course.end_date" class="flex flex-col sm:flex-row justify-between gap-2 text-xs sm:text-sm text-gray-700">
              <div class="flex items-center">
                <p class="font-semibold mr-1">Start:</p>
                <p>{{ new Date(course.start_date).toLocaleDateString() }}</p>
              </div>
              <div class="flex items-center">
                <p class="font-semibold mr-1">End:</p>
                <p>{{ new Date(course.end_date).toLocaleDateString() }}</p>
              </div>
            </div>
          </div>

          <!-- Action Button at bottom -->
          <div class="mt-auto pt-3">
            <NuxtLink :to="`/course-detail/${course.id}`" class="block w-full">
              <button class="w-full bg-white text-[#9C1313] font-bold border-2 border-[#9C1313] px-3 sm:px-4 py-2 rounded-xl hover:bg-[#9C1313] hover:text-white transition-all duration-200 active:scale-95 text-xs sm:text-sm">
                See Details
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="!paginatedCourses.length" class="col-span-full text-center text-gray-500 py-8 sm:py-12">
        <Icon name="mdi:school-outline" size="3rem" class="mx-auto mb-3 text-gray-400" />
        <p class="text-sm sm:text-base">No {{ activeTab.toLowerCase() }} courses found.</p>
        <p class="text-xs sm:text-sm text-gray-400 mt-1">Create your first course to get started.</p>
      </div>
    </div>
    <PaginationBar
      v-model:current-page="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      class="px-2 sm:px-4 lg:px-6 py-4"
    />
  </div>
</template>

<script lang="ts" setup>
import type { CourseDetail } from '~/types/course';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import PaginationBar from '~/components/PaginationBar.vue';

const props = defineProps<{
  courses: (CourseDetail & { progressValue: number })[] | null;
}>();

const emit = defineEmits<{
  (e: 'edit-course', id: number): void;
  (e: 'remove-course', course: { id: number; name: string }): void;
  (e: 'toggle-archive', course: { id: number; name: string; is_archived: boolean }): void;
}>();

const tabs = [
  { label: 'Active', isArchived: false },
  { label: 'Archive', isArchived: true },
];
const activeTab = ref<string>('Active');

const filteredCourses = computed(() => {
  const isArchived = activeTab.value === 'Archive';
  return (props.courses || []).filter(c => c.is_archived === isArchived);
});

const itemsPerPage = 3;
const currentPage = ref<number>(1);

const totalItems = computed(() => filteredCourses.value.length);

watch(activeTab, () => {
  currentPage.value = 1;
});

const paginatedCourses = computed(() => {
  const startIdx = (currentPage.value - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  return filteredCourses.value.slice(startIdx, endIdx);
});

// Computed property for fallback image with course title
const getFallbackImage = (courseName: string) => {
  const svg = `
    <svg width="400" height="192" viewBox="0 0 400 192" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="192" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#374151" text-anchor="middle" dy=".3em">${courseName}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// --- Tab Indicator and other UI logic (no changes needed) ---
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

const openMenuFor = ref<number | null>(null);
function toggleMenu(courseId: number) {
  openMenuFor.value = openMenuFor.value === courseId ? null : courseId;
}

function handleEdit(courseId: number) {
  openMenuFor.value = null;
  emit('edit-course', courseId);
}

// UPDATE THIS FUNCTION
function handleRemove(course: { id: number; name: string }) {
  openMenuFor.value = null;
  emit('remove-course', { id: course.id, name: course.name });
}

function handleToggleArchive(course: { id: number; name: string; is_archived: boolean }) {
  openMenuFor.value = null;
  emit('toggle-archive', course);
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
