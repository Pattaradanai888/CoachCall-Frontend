<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-[300px] max-h-[none] mt-[6rem]">
    <div v-if="pending" class="w-full text-center py-10">
      Loading course details...
    </div>

    <div v-else-if="error || !course" class="w-full text-center py-10">
      <h1 class="text-2xl font-bold text-red-600">
        Course Not Found
      </h1>
      <p class="text-gray-600 mt-2">
        We couldn't find the course you were looking for.
      </p>
      <NuxtLink to="/course-management" class="mt-4 inline-block bg-gray-200 px-4 py-2 rounded">
        Back to Courses
      </NuxtLink>
    </div>

    <div v-else class="w-full mx-7 lg:mx-0">
      <NuxtLink to="/course-management" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors">
        <Icon name="mdi:arrow-left" size="1.25rem" />
        <span>Back to Courses</span>
      </NuxtLink>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3">
          <div class="p-6 bg-white rounded-lg shadow-xl">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                  {{ course.name }}
                </h1>
                <p class="text-gray-600 mt-1">
                  {{ course.description }}
                </p>
              </div>
              <div class="flex items-center flex-shrink-0 ml-4">
                <p class="font-bold mr-2">
                  Status
                </p>
                <span class="text-white px-2 py-1 rounded-lg text-sm" :class="course.is_archived ? 'bg-blue-500' : 'bg-green-600'">
                  {{ course.is_archived ? 'Archived' : 'Active' }}
                </span>
              </div>
            </div>

            <NuxtImg :src="course.cover_image_url || '/placeholder.jpg'" :alt="course.name" class="w-full h-64 object-cover rounded-lg mb-5" />

            <div class="flex justify-between items-center mb-4 mt-6">
              <h2 class="text-xl font-bold text-gray-800">
                Training Sessions
              </h2>
              <div ref="tabContainer" class="relative flex bg-gray-100 rounded-lg p-1">
                <div class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all" :style="{ left: `${indicatorLeft}px`, width: `${indicatorWidth}px` }" />
                <button v-for="tab in tabs" :key="tab.label" ref="tabRefs" class="relative z-10 px-4 py-2 text-sm font-medium" :class="activeTab === tab.label ? 'text-gray-900' : 'text-gray-600'" @click="setActiveTab(tab.label)">
                  {{ tab.label }} ({{ tab.count }})
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <p v-if="filteredSessions.length === 0" class="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                No {{ activeTab.toLowerCase() }} sessions.
              </p>
              <NuxtLink
                v-for="session in filteredSessions" :key="session.id"
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
                        <p>{{ new Date(session.scheduled_date).toLocaleDateString('en-TH') }}</p>
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

        <div class="lg:col-span-1">
          <div class="bg-white p-4 rounded-lg shadow-xl sticky top-24">
            <div class="flex justify-between">
              <h2 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                Enrolled Athletes ({{ course.attendees.length }})
              </h2>
              <div class="">
                <button class="border-2 shadow-lg rounded-xl mr-2 bg-[#EAEAEA] hover:bg-gray-300" @click="openAddAthleteModal">
                  <Icon name="mdi:plus" size="1.25rem" />
                </button>
                <button class="border-2 shadow-lg rounded-xl bg-[#EAEAEA] hover:bg-gray-300" @click="toggleAthleteSearch">
                  <Icon name="mdi:magnify" size="1.25rem" />
                </button>
              </div>
            </div>

            <div class="space-y-4">
              <p v-if="!course.attendees || course.attendees.length === 0" class="text-center text-gray-500 py-8">
                No athletes enrolled.
              </p>
              <div v-for="athlete in course.attendees" :key="athlete.uuid" class="flex items-center">
                <img :src="athlete.profile_image_url || '/default-profile.jpg'" :alt="athlete.name" class="w-12 h-12 rounded-full object-cover shadow-md mr-3">
                <div>
                  <p class="text-gray-700 font-medium">
                    {{ athlete.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ athlete.positions.map(p => p.name).join(', ') || 'No Position' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Athlete Modal -->
    <AddAthleteToCourse
      :show="showAddModal"
      :course="course"
      :all-athletes="allAthletes || []"
      @close="closeAddAthleteModal"
      @update-attendees="handleUpdateAttendees"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AddAthleteToCourse from '~/components/course/course-overview/AddAthleteToCourse.vue';
import { useAthleteData } from '~/composables/useAthleteData';
import { useCourses } from '~/composables/useCourses';

const route = useRoute();
const { fetchCourseById, updateCourseAthletes } = useCourses();
const { fetchAllAthleteSelectionInfo } = useAthleteData();
const courseId = Number(route.params.id);

const { data: course, pending, error, refresh } = await fetchCourseById(courseId);
const { data: allAthletes } = await fetchAllAthleteSelectionInfo();

// --- Session Tab Logic (Restored from original) ---
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

onMounted(() => {
  updateIndicator();
  if (tabContainer.value) {
    new ResizeObserver(updateIndicator).observe(tabContainer.value);
  }
});

watch(activeTab, updateIndicator, { flush: 'post' });

// --- Modal State ---
const showAddModal = ref(false);
const showAthleteSearch = ref(false);

function openAddAthleteModal() {
  showAddModal.value = true;
}

function closeAddAthleteModal() {
  showAddModal.value = false;
}

function toggleAthleteSearch() {
  showAthleteSearch.value = !showAthleteSearch.value;
}

async function handleUpdateAttendees(athleteUuids: string[]) {
  if (!course.value)
    return;

  try {
    await updateCourseAthletes(courseId, athleteUuids);
    await refresh(); // Re-fetch the course data to show the updated list
  }
  catch (e) {
    console.error('Failed to update athletes:', e);
    // You could add a user-facing error notification here
  }
}

useHead({
  title: () => (course.value ? `Details: ${course.value.name}` : 'Course Details'),
});
</script>
