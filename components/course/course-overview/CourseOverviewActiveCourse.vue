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
      <div
        v-for="course in paginatedCourses"
        :key="course.id"
        class="shadow-lg px-4 bg-white rounded-lg"
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

        <!-- “See details” Button -->
        <div class="flex justify-center my-3">
          <button
            class="bg-white text-[#9C1313] font-bold border-2 border-[#9C1313] px-4 py-1 rounded-xl hover:bg-[#9C1313] hover:text-white"
            @click="handleDetails(course.id)"
          >
            See details
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="flex justify-between items-center px-6 py-4">
      <!-- Showing X–Y of Z Sessions -->
      <p class="text-sm text-gray-700">
        Showing {{ startIndex }}-{{ endIndex }} of {{ filteredCourses.length }}
        Courses
      </p>

      <!-- Page Buttons -->
      <div class="flex items-center">
        <button
          class="px-2 py-1 rounded-md hover:bg-gray-200"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <Icon name="mdi:arrow-left" size="1rem" />
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          class="px-2 py-1 rounded-md mx-1"
          :class="{
            'bg-[#9C1313] text-white': currentPage === page,
            'text-gray-600 hover:text-gray-900 hover:bg-gray-100': currentPage !== page,
          }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          class="px-2 py-1 rounded-md hover:bg-gray-200"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          <Icon name="mdi:arrow-right" size="1rem" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';

/** Tab definitions */
const tabs = [
  { label: 'Active', status: 'Active' },
  { label: 'Archive', status: 'Archive' },
];
const activeTab = ref<string>('Active');

/** Example course data array */
interface Course {
  id: number;
  image: string;
  title: string;
  description: string;
  progressValue: number;

  participants: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Archive';
}
const courses = ref<Course[]>([
  {
    id: 1,
    image: 'course-img.png',
    title: 'Advanced Dribbling',
    description: 'Ball handling drills for all positions',
    progressValue: 70,
    participants: 18,
    startDate: 'May 15, 2025',
    endDate: 'Jun 15, 2025',
    status: 'Active',
  },
  {
    id: 2,
    image: 'course-img-2.png',
    title: 'Shooting Fundamentals',
    description: 'Improve your jump shot and free throws',
    progressValue: 45,
    participants: 12,
    startDate: 'Apr 01, 2025',
    endDate: 'May 01, 2025',
    status: 'Active',
  },
  {
    id: 3,
    image: 'course-img-3.png',
    title: 'Defense Tactics',
    description: 'Learn man-to-man and zone defense',
    progressValue: 100,
    participants: 20,
    startDate: 'Jan 10, 2025',
    endDate: 'Feb 10, 2025',
    status: 'Archive',
  },
  {
    id: 4,
    image: 'course-img-4.png',
    title: 'Offensive Strategies',
    description: 'Pick-and-roll, fast breaks, and spacing',
    progressValue: 30,
    participants: 15,
    startDate: 'Jun 01, 2025',
    endDate: 'Jul 01, 2025',
    status: 'Active',
  },
  {
    id: 5,
    image: 'course-img-5.png',
    title: 'Rebounding 101',
    description: 'Box-out drills and tip-out techniques',
    progressValue: 60,
    participants: 22,
    startDate: 'Mar 05, 2025',
    endDate: 'Apr 05, 2025',
    status: 'Active',
  },
  {
    id: 6,
    image: 'course-img-6.png',
    title: 'Conditioning & Fitness',
    description: 'Endurance, agility, and strength workouts',
    progressValue: 100,
    participants: 25,
    startDate: 'Feb 15, 2025',
    endDate: 'Mar 15, 2025',
    status: 'Archive',
  },
  // …add more objects as needed
]);

/** Filter courses based on the active tab */
const filteredCourses = computed(() => {
  return courses.value.filter(c => c.status === activeTab.value);
});

/** PAGINATION SETUP */
// How many courses per page
const itemsPerPage = 3;
// Current page (1-based)
const currentPage = ref<number>(1);

// Compute total number of pages whenever filteredCourses changes
const totalPages = computed(() => Math.ceil(filteredCourses.value.length / itemsPerPage));

// Whenever the active tab changes, reset to page 1
watch(activeTab, () => {
  currentPage.value = 1;
});

// Compute the slice of filteredCourses to display on the current page
const paginatedCourses = computed(() => {
  const startIdx = (currentPage.value - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  return filteredCourses.value.slice(startIdx, endIdx);
});

// Compute “Showing X–Y of Z” indexes
const startIndex = computed(() => {
  if (filteredCourses.value.length === 0)
    return 0;
  return (currentPage.value - 1) * itemsPerPage + 1;
});
const endIndex = computed(() =>
  Math.min(currentPage.value * itemsPerPage, filteredCourses.value.length),
);

// Methods to navigate pages
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}
function prevPage() {
  if (currentPage.value > 1)
    currentPage.value--;
}
function nextPage() {
  if (currentPage.value < totalPages.value)
    currentPage.value++;
}

/** TAB‐INDICATOR LOGIC */
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

/** DROPDOWN MENU STATE */
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
function handleDetails(courseId: number) {
  console.log('See details for course', courseId);
}
</script>

<style scoped></style>
