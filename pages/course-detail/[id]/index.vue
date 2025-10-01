<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-4 sm:my-6 lg:my-10 h-auto min-h-[300px] max-h-[none] mt-20 sm:mt-24 lg:mt-[6rem] px-4 sm:px-6 lg:px-0">
    <div v-if="pending" class="w-full text-center py-8 sm:py-10">
      <div class="text-base sm:text-lg text-gray-600">Loading course details...</div>
    </div>

    <div v-else-if="!course" class="w-full text-center py-8 sm:py-10">
      <h1 class="text-xl sm:text-2xl font-bold text-red-600">
        Course Not Found
      </h1>
      <p class="text-gray-600 mt-2 text-sm sm:text-base">
        We couldn't find the course you were looking for.
      </p>
      <NuxtLink to="/course-management" class="mt-4 inline-block bg-gray-200 px-4 py-2 rounded text-sm sm:text-base">
        Back to Courses
      </NuxtLink>
    </div>

    <div v-else class="w-full">
      <NuxtLink to="/course-management" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-semibold mb-4 sm:mb-6 transition-colors text-sm sm:text-base">
        <Icon name="mdi:arrow-left" size="1.25rem" />
        <span class="hidden sm:inline">Back to Courses</span>
        <span class="sm:hidden">Back</span>
      </NuxtLink>

      <div class="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        <div class="xl:col-span-3">
          <div class="p-4 sm:p-6 bg-white rounded-lg shadow-xl">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3 sm:gap-4">
              <div class="flex-1">
                <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
                  {{ course.name }}
                </h1>
                <p class="text-gray-600 mt-1 text-sm sm:text-base">
                  {{ course.description }}
                </p>
              </div>
              <div class="flex items-center">
                <p class="font-bold mr-2 text-sm sm:text-base">
                  Status
                </p>
                <span class="text-white px-2 py-1 rounded-lg text-xs sm:text-sm" :class="course.is_archived ? 'bg-blue-500' : 'bg-green-600'">
                  {{ course.is_archived ? 'Archived' : 'Active' }}
                </span>
              </div>
            </div>

            <NuxtImg
              :src="course.cover_image_url || '/placeholder.jpg'"
              :alt="course.name"
              format="webp"
              width="800"
              height="256"
              loading="eager"
              priority
              class="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg mb-4 sm:mb-5"
            />

            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 mt-4 sm:mt-6 gap-3 sm:gap-0">
              <h2 class="text-lg sm:text-xl font-bold text-gray-800">
                Training Sessions
              </h2>
              <div ref="tabContainer" class="relative flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <div class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all" :style="{ left: `${indicatorLeft}px`, width: `${indicatorWidth}px` }" />
                <button v-for="tab in tabs" :key="tab.label" ref="tabRefs" class="relative z-10 flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium min-h-[44px] sm:min-h-[40px]" :class="activeTab === tab.label ? 'text-gray-900' : 'text-gray-600'" @click="setActiveTab(tab.label)">
                  <span class="hidden sm:inline">{{ tab.label }} ({{ tab.count }})</span>
                  <span class="sm:hidden">{{ tab.label }}<br><span class="text-xs">({{ tab.count }})</span></span>
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <p v-if="filteredSessions.length === 0" class="text-center text-gray-500 py-6 sm:py-8 bg-gray-50 rounded-lg text-sm sm:text-base">
                No {{ activeTab.toLowerCase() }} sessions.
              </p>
              <NuxtLink
                v-for="session in filteredSessions" :key="session.id"
                :to="session.status === 'Complete'
                  ? `/course-detail/${course.id}/session/${session.id}/report`
                  : `/course-detail/${course.id}/session/${session.id}`"
                class="block"
              >
                <!-- Mobile Layout (stacked) -->
                <div class="block sm:hidden bg-white shadow-md p-4 rounded-lg border-2 border-transparent hover:border-[#9C1313] transition-all">
                  <div class="flex justify-between items-start mb-3">
                    <h1 class="font-bold text-gray-800 text-sm flex-1 pr-2">
                      {{ session.name }}
                    </h1>
                    <div class="flex items-center text-gray-400">
                      <Icon name="mdi:chevron-right" size="1.25rem" />
                    </div>
                  </div>
                  <p class="text-xs text-gray-600 mb-3">
                    {{ session.description }}
                  </p>
                  <div class="flex justify-between items-center">
                    <span class="rounded-lg text-white px-2 py-1 text-xs" :class="session.status === 'Complete' ? 'bg-green-500' : 'bg-blue-500'">
                      {{ session.status }}
                    </span>
                    <div class="flex items-center text-xs text-gray-500">
                      <Icon name="mdi:calendar" size="1rem" class="mr-1" />
                      <span>{{ new Date(session.scheduled_date).toLocaleDateString('en-TH') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Desktop Layout (grid) -->
                <div class="hidden sm:block bg-white shadow-md p-4 rounded-lg border-2 border-transparent hover:border-[#9C1313] hover:scale-[1.02] transition-all">
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="md:col-span-3 md:pr-4">
                      <h1 class="font-bold text-gray-800 text-sm sm:text-base">
                        {{ session.name }}
                      </h1>
                      <p class="text-xs sm:text-sm text-gray-600">
                        {{ session.description }}
                      </p>
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="flex mb-2">
                          <p class="font-bold mr-2 text-xs sm:text-sm">
                            Status:
                          </p>
                          <p class="rounded-lg text-white px-2 text-xs sm:text-sm" :class="session.status === 'Complete' ? 'bg-green-500' : 'bg-blue-500'">
                            {{ session.status }}
                          </p>
                        </div>
                        <div class="flex items-center text-xs sm:text-sm text-gray-500">
                          <Icon name="mdi:calendar" size="1rem sm:1.25rem" class="mr-1" />
                          <p>{{ new Date(session.scheduled_date).toLocaleDateString('en-TH') }}</p>
                        </div>
                      </div>
                      <div class="flex items-center text-gray-400">
                        <Icon name="mdi:chevron-right" size="1.25rem sm:1.5rem" />
                      </div>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="xl:col-span-1 mt-4 xl:mt-0">
          <div class="bg-white p-4 rounded-lg shadow-xl xl:sticky xl:top-24">
            <div class="flex justify-between items-start">
              <h2 class="text-base sm:text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex-1">
                <span class="hidden sm:inline">Enrolled Athletes ({{ course.attendees.length }})</span>
                <span class="sm:hidden">Athletes ({{ course.attendees.length }})</span>
              </h2>
              <button class="border-2 shadow-lg rounded-xl p-2 bg-[#EAEAEA] hover:bg-gray-300 transition-colors" @click="openAddAthleteModal">
                <Icon name="mdi:plus" size="1rem sm:1.25rem" />
              </button>
            </div>

            <div class="space-y-3 sm:space-y-4">
              <p v-if="!course.attendees || course.attendees.length === 0" class="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">
                No athletes enrolled.
              </p>
              
              <!-- Mobile Grid Layout -->
              <div class="grid grid-cols-2 sm:hidden gap-3">
                <div v-for="athlete in course.attendees" :key="athlete.uuid" class="flex flex-col items-center text-center">
                  <NuxtImg
                    :src="athlete.profile_image_url || '/default-profile.jpg'"
                    :alt="athlete.name"
                    format="webp"
                    width="48"
                    height="48"
                    loading="lazy"
                    class="w-12 h-12 rounded-full object-cover shadow-md mb-2"
                  />
                  <div>
                    <p class="text-gray-700 font-medium text-xs truncate w-full">
                      {{ athlete.name }}
                    </p>
                    <p class="text-xs text-gray-500 truncate w-full">
                      {{ athlete.positions.map(p => p.name).join(', ') || 'No Position' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Desktop List Layout -->
              <div class="hidden sm:block space-y-4">
                <div v-for="athlete in course.attendees" :key="athlete.uuid" class="flex items-center">
                  <NuxtImg
                    :src="athlete.profile_image_url || '/default-profile.jpg'"
                    :alt="athlete.name"
                    format="webp"
                    width="48"
                    height="48"
                    loading="lazy"
                    class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md mr-3"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-gray-700 font-medium text-sm sm:text-base truncate">
                      {{ athlete.name }}
                    </p>
                    <p class="text-xs sm:text-sm text-gray-500 truncate">
                      {{ athlete.positions.map(p => p.name).join(', ') || 'No Position' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Athlete Modal -->
    <AthleteSelectionModal
      :show="showAddModal"
      :course="course"
      :all-athletes="allAthletes || []"
      :initial-selected-uuids="course?.attendees.map(a => a.uuid) || []"
      @close="closeAddAthleteModal"
      @update-attendees="handleUpdateAttendees"
    />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const { fetchCourseById, updateCourseAthletes } = useCourses();
const { fetchAllAthleteSelectionInfo } = useAthleteData();
const courseId = Number(route.params.id);

const { data: course, pending, error: _error, refresh } = await fetchCourseById(courseId);
const { data: allAthletes } = await fetchAllAthleteSelectionInfo();

const showAddModal = ref(false);
const showAthleteSearch = ref(false);
const activeTab = ref<string>('To-do');
const tabRefs = ref<HTMLElement[]>([]);
const tabContainer = ref<HTMLElement | null>(null);
const indicatorLeft = ref<number>(0);
const indicatorWidth = ref<number>(0);

const tabs = computed(() => {
  if (!course.value)
    return [];
  return [
    { label: 'To-do', status: 'To Do', count: course.value.sessions.filter(s => s.status === 'To Do').length },
    { label: 'Complete', status: 'Complete', count: course.value.sessions.filter(s => s.status === 'Complete').length },
  ];
});

const filteredSessions = computed(() => {
  if (!course.value)
    return [];
  const currentStatus = tabs.value.find(t => t.label === activeTab.value)?.status;
  return course.value.sessions.filter(session => session.status === currentStatus);
});

function openAddAthleteModal() {
  showAddModal.value = true;
}

function closeAddAthleteModal() {
  showAddModal.value = false;
}

function _toggleAthleteSearch() {
  showAthleteSearch.value = !showAthleteSearch.value;
}

function setActiveTab(label: string) {
  activeTab.value = label;
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

async function handleUpdateAttendees(athleteUuids: string[]) {
  if (!course.value)
    return;

  try {
    await updateCourseAthletes(courseId, athleteUuids);
    await refresh();
  }
  catch (e) {
    console.error('Failed to update athletes:', e);
    // Future enhancement: Use a toast notification for user feedback.
  }
}

// --- 5. LIFECYCLE HOOKS & WATCHERS ---
onMounted(() => {
  updateIndicator();
  if (tabContainer.value) {
    new ResizeObserver(updateIndicator).observe(tabContainer.value);
  }
});

watch(activeTab, updateIndicator, { flush: 'post' });
</script>

<style scoped>
/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  /* Better feedback for touch interactions */
  button:active {
    transform: scale(0.98);
  }
  
  /* Session cards touch feedback */
  .bg-white.shadow-md:active {
    transform: scale(0.98);
  }
  
  /* Remove hover effects on touch devices */
  .hover\:border-\[\#9C1313\]:hover {
    border-color: transparent;
  }
  
  /* Disable hover transforms on touch devices */
  .hover\:scale-\[1\.02\]:hover {
    transform: none;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
  
  .hover\:scale-\[1\.02\]:hover {
    transform: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-2.border-transparent {
    border-color: #d1d5db;
  }
  
  .text-gray-500,
  .text-gray-600 {
    color: #374151;
  }
}
</style>
