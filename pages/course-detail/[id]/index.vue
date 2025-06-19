<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-[300px] max-h-[none] mt-[6rem]">
    <div v-if="course" class="w-full mx-7 lg:mx-0">
      <NuxtLink to="/course-management" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors">
        <Icon name="mdi:arrow-left" size="1.25rem" />
        <span>Back to Courses</span>
      </NuxtLink>
      <div class="mb-5">
        <h1 class="text-3xl font-bold">
          Course Management
        </h1>
        <p>Manage your athletes and track their progress</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3">
          <div class="p-6 bg-white rounded-lg shadow-xl">
            <!-- Course Header -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                  {{ course.title }}
                </h1>
                <p class="text-gray-600 mt-1">
                  {{ course.description }}
                </p>
              </div>
              <div class="flex items-center flex-shrink-0 ml-4">
                <p class="font-bold mr-2">
                  Status
                </p>
                <span class="text-white px-2 py-1 rounded-lg text-sm" :class="course.status === 'Active' ? 'bg-green-600' : 'bg-blue-500'">
                  {{ course.status }}
                </span>
              </div>
            </div>

            <!-- Course Image -->
            <NuxtImg :src="course.image" :alt="course.title" class="w-full h-64 object-cover rounded-lg mb-5" fetchpriority="high" />

            <!-- Session Tabs -->
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800">
                Training Sessions
              </h2>
              <div ref="tabContainer" class="relative flex bg-gray-100 rounded-lg p-1">
                <div class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all" :style="{ left: `${indicatorLeft}px`, width: `${indicatorWidth}px` }" />
                <button v-for="tab in tabs" :key="tab.label" ref="tabRefs" class="relative z-10 px-4 py-2 text-sm font-medium" :class="activeTab === tab.label ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'" @click="setActiveTab(tab.label)">
                  {{ tab.label }} ({{ tab.count }})
                </button>
              </div>
            </div>

            <!-- DYNAMIC SESSION LIST WITH LINKS -->
            <div class="space-y-3">
              <p v-if="filteredSessions.length === 0" class="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                No {{ activeTab.toLowerCase() }} sessions.
              </p>
              <NuxtLink
                v-for="session in filteredSessions"
                :key="session.id"
                :to="session.status === 'Complete'
                  ? `/course-detail/${course.id}/session/${session.id}/report`
                  : `/course-detail/${course.id}/session/${session.id}`"
                class="block"
              >
                <div class="bg-white shadow-md grid grid-cols-4 p-4 rounded-lg border-2 border-transparent hover:border-[#9C1313] hover:scale-[1.02] transition-all">
                  <div class="col-span-3 pr-4">
                    <h1 class="font-bold text-gray-800">
                      {{ session.name }}
                    </h1>
                    <p class="text-sm text-gray-600">
                      {{ session.description }}
                    </p>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="flex mb-2">
                        <p class="font-bold mr-2">
                          Status:
                        </p>
                        <p class="rounded-lg text-white px-2 text-sm" :class="session.status === 'Complete' ? 'bg-green-500' : 'bg-blue-500'">
                          {{ session.status }}
                        </p>
                      </div>
                      <div class="flex items-center text-sm text-gray-500">
                        <Icon name="mdi:calendar" size="1.25rem" class="mr-1" />
                        <p>{{ session.scheduledDate }}</p>
                      </div>
                    </div>
                    <div class="flex items-center text-gray-400">
                      <Icon name="mdi:chevron-right" size="1.5rem" />
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- ============== ATHLETE SECTION ============== -->
        <div class="lg:col-span-1">
          <div class="bg-white p-4 rounded-lg shadow-xl sticky top-24">
            <div class="flex justify-between">
              <h2 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                Enrolled Athletes
              </h2>
              <div class="">
                <button class="border-2 shadow-lg rounded-xl mr-2 bg-[#EAEAEA] hover:bg-gray-300" @click="openCreateModal">
                  <Icon name="mdi:plus" size="1.25rem" class="flex items-center" />
                </button>
                <button class=" border-2 shadow-lg rounded-xl bg-[#EAEAEA] hover:bg-gray-300 " @click="toggleAthleteSearch">
                  <Icon name="mdi:magnify" size="1.25rem" class="flex items-center" />
                </button>
              </div>
            </div>
            <!-- START: SEARCH BAR SECTION -->
            <transition name="fade-fast">
              <div v-if="showAthleteSearch" class="relative w-full mb-4">
                <input
                  v-model="athleteSearchQuery"
                  type="text"
                  placeholder=""
                  class="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:border-[#9C1313] transition pl-9"
                >
                <Icon
                  name="mdi:magnify"
                  size="1.25rem"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </transition>
            <!-- END: SEARCH BAR SECTION -->

            <div class="space-y-4">
              <!-- If no athletes, show a message -->
              <p v-if="!course.athletes || course.athletes.length === 0" class="text-center text-gray-500 py-8">
                No athletes enrolled.
              </p>

              <!-- Loop over the new paginated list of athletes -->
              <div v-for="athlete in paginatedAthletes" :key="athlete.id" class="flex items-center justify-between">
                <div class="flex items-center">
                  <img :src="athlete.avatar" :alt="athlete.name" class="w-12 h-12 rounded-full object-cover shadow-md mr-3">
                  <div>
                    <p class="text-gray-700 font-medium">
                      {{ athlete.name }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ athlete.position }}
                    </p>
                  </div>
                </div>

                <div class="relative inline-block text-left">
                  <!-- Trigger Button -->
                  <button type="button" class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200" @click="toggleMenu(athlete.id)">
                    <Icon name="mdi:dots-horizontal" size="1.25rem" />
                  </button>
                  <!-- Dropdown Menu -->
                  <div v-if="openMenuForAthleteId === athlete.id" class="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    <ul class="py-1 text-sm text-gray-700">
                      <li><a href="#" class="block px-4 py-2 hover:bg-gray-100 text-red-600" @click.prevent="() => { openMenuForAthleteId = null }">Remove</a></li>
                    </ul>
                  </div>
                  <!-- Click-outside overlay -->
                  <div v-if="openMenuForAthleteId === athlete.id" class="fixed inset-0 bg-transparent z-10" @click="openMenuForAthleteId = null" />
                </div>
              </div>
            </div>
            <!-- PAGINATION BAR FOR ATHLETES -->
            <PaginationBar
              v-if="totalAthleteItems > itemsPerPageAthletes"
              v-model:current-page="currentAthletePage"
              :total-items="totalAthleteItems"
              :items-per-page="itemsPerPageAthletes"
              class="mt-4"
            />
          </div>
        </div>
      </div>
    </div>
    <AddAthleteToCourse
      :show="showAddModal"
      :course-id="courseId"
      @close="closeCreateModal"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AddAthleteToCourse from '~/components/course/course-overview/AddAthleteToCourse.vue';
import { useCourses } from '~/composables/useCourses';

const route = useRoute();
const { findCourseById } = useCourses();
const courseId = Number(route.params.id);
const course = computed(() => findCourseById(courseId));

if (!course.value) {
  throw createError({ statusCode: 404, statusMessage: 'Course Not Found', fatal: true });
}

// --- Session Tab Logic ---
const activeTab = ref<string>('To-do');
const tabRefs = ref<HTMLElement[]>([]);
const tabContainer = ref<HTMLElement | null>(null);
const indicatorLeft = ref<number>(0);
const indicatorWidth = ref<number>(0);

const tabs = computed(() => [
  { label: 'To-do', status: 'To Do', count: course.value?.sessions.filter(s => s.status === 'To Do').length || 0 },
  { label: 'Complete', status: 'Complete', count: course.value?.sessions.filter(s => s.status === 'Complete').length || 0 },
]);

const filteredSessions = computed(() => {
  if (!course.value)
    return [];
  const currentStatus = tabs.value.find(t => t.label === activeTab.value)?.status;
  return course.value.sessions.filter(session => session.status === currentStatus);
});

function setActiveTab(label: string) {
  activeTab.value = label;
  nextTick(updateIndicator);
}

function updateIndicator() {
  nextTick(() => {
    const index = tabs.value.findIndex(t => t.label === activeTab.value);
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

// --- Athlete Dropdown Menu Logic ---
const openMenuForAthleteId = ref<number | null>(null);

function toggleMenu(athleteId: number) {
  openMenuForAthleteId.value = openMenuForAthleteId.value === athleteId ? null : athleteId;
}

// ==========================================================
// ============== REVISED ATHLETE LIST LOGIC ================
// ==========================================================
// 1. STATE for the search bar visibility and query
const showAthleteSearch = ref(false);
const athleteSearchQuery = ref('');

// 2. TOGGLE FUNCTION for the search bar
function toggleAthleteSearch() {
  showAthleteSearch.value = !showAthleteSearch.value;
  // Clear search when hiding the bar
  if (!showAthleteSearch.value) {
    athleteSearchQuery.value = '';
  }
}

// 3. NEW COMPUTED PROPERTY to filter athletes based on the search query
const filteredEnrolledAthletes = computed(() => {
  if (!course.value?.athletes)
    return [];

  // If there's no search query, return all athletes
  if (!athleteSearchQuery.value.trim()) {
    return course.value.athletes;
  }

  const query = athleteSearchQuery.value.toLowerCase();
  return course.value.athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(query)
    || (athlete.position && athlete.position.toLowerCase().includes(query)),
  );
});

// 4. PAGINATION STATE
const currentAthletePage = ref(1);
const itemsPerPageAthletes = 5;

// 5. UPDATE total items to be based on the FILTERED list
const totalAthleteItems = computed(() => filteredEnrolledAthletes.value.length);

// 6. UPDATE paginated athletes to slice from the FILTERED list
const paginatedAthletes = computed(() => {
  const start = (currentAthletePage.value - 1) * itemsPerPageAthletes;
  const end = start + itemsPerPageAthletes;
  return filteredEnrolledAthletes.value.slice(start, end);
});

// 7. NEW WATCHER to reset pagination when search changes
watch(athleteSearchQuery, () => {
  currentAthletePage.value = 1;
});

// --- Head and Modal Logic ---
useHead({
  title: course.value ? `Details: ${course.value.title}` : 'Course Details',
});

const showAddModal = ref(false);

function openCreateModal() {
  showAddModal.value = true;
}

function closeCreateModal() {
  showAddModal.value = false;
}
</script>

<style>
/* A simple transition for the search bar */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  transform-origin: top;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
  transform: scaleY(0.9);
}
</style>
