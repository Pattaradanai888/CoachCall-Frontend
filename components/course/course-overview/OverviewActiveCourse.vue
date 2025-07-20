<template>
  <div class="bg-white p-5">
    <!-- Header + Tabs -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">
        Courses Overview
      </h1>
      <div
        ref="tabContainer"
        class="relative flex bg-gray-100 rounded-lg p-1"
      >
        <div
          class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all"
          :style="{ left: `${indicatorLeft}px`, width: `${indicatorWidth}px` }"
        />
        <button
          v-for="tab in tabs"
          :key="tab.label"
          ref="tabRefs"
          class="relative z-10 px-4 py-2 text-sm font-medium"
          :class="activeTab === tab.label ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'"
          @click="setActiveTab(tab.label)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Courses Grid (paginated) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 px-6 py-4">
      <div
        v-for="(course, index) in paginatedCourses"
        :key="course.id"
        class="shadow-lg px-4 bg-white rounded-lg flex flex-col"
      >
        <div class="mb-3">
          <NuxtImg
            :src="course.cover_image_url || '/placeholder.jpg'"
            :alt="`${course.name} course cover`"
            format="webp"
            width="400"
            height="192"
            :loading="index < 2 ? 'eager' : 'lazy'"
            :priority="index === 0"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
            class="w-full h-48 object-cover rounded-lg"
          />
        </div>
        <div>
          <div class="flex justify-between">
            <div>
              <h1 class="font-bold">
                {{ course.name }}
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
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100" @click.prevent="handleEdit(course.id)">
                      Edit
                    </a>
                  </li>
                  <!-- MODIFICATION: Added Archive/Unarchive option -->
                  <li>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100" @click.prevent="handleToggleArchive(course)">
                      <span v-if="course.is_archived">Unarchive</span>
                      <span v-else>Archive</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" class="block px-4 py-2 hover:bg-gray-100 text-red-600" @click.prevent="handleRemove(course)">
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
          <div class="my-2">
            <ProgressBar :value="course.progressValue" :max="100" />
          </div>

          <div class="mt-2 flex items-center justify-between">
            <!-- Left side: Avatar Stack + Tooltip -->
            <div class="flex items-center group relative">
              <div v-if="course.attendees.length > 0" class="flex items-center">
                <NuxtImg
                  v-for="(athlete, avatarIndex) in course.attendees.slice(0, 3)"
                  :key="athlete.uuid"
                  :src="athlete.profile_image_url || '/default-profile.jpg'"
                  :alt="`${athlete.name} profile`"
                  format="webp"
                  width="32"
                  height="32"
                  loading="lazy"
                  class="w-8 h-8 rounded-full border-2 border-white object-cover"
                  :class="{ '-ml-3': avatarIndex > 0 }"
                />
                <div
                  v-if="course.attendees.length > 3"
                  class="w-8 h-8 rounded-full border-2 border-white -ml-3 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600"
                >
                  +{{ course.attendees.length - 3 }}
                </div>
              </div>
              <!-- Tooltip for athlete names -->
              <div v-if="course.attendees.length > 0" class="absolute bottom-full left-0 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {{ course.attendees.map(a => a.name).join(', ') }}
              </div>
            </div>

            <div class="mt-2 flex items-center justify-between">
              <div class="flex items-center text-sm text-gray-700">
                <Icon name="mdi:account-group" class="mr-1 text-gray-500" size="1.25rem" />
                <p>{{ course.attendees.length }} Athletes</p>
              </div>
            </div>
          </div>

          <div v-if="course.start_date && course.end_date" class="flex justify-between mt-4 text-sm text-gray-700">
            <div class="flex">
              <p class="font-bold mr-1">
                Start:
              </p>
              <p>{{ new Date(course.start_date).toLocaleDateString() }}</p>
            </div>
            <div class="flex">
              <p class="font-bold mr-1">
                End:
              </p>
              <p>{{ new Date(course.end_date).toLocaleDateString() }}</p>
            </div>
          </div>

          <div class="flex-grow" />

          <div class="flex justify-center my-3">
            <NuxtLink :to="`/course-detail/${course.id}`">
              <button class="bg-white text-[#9C1313] font-bold border-2 border-[#9C1313] px-4 py-1 rounded-xl hover:bg-[#9C1313] hover:text-white">
                See details
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="!paginatedCourses.length" class="text-center text-gray-500 py-8">
        No {{ activeTab.toLowerCase() }} courses found.
      </div>
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
