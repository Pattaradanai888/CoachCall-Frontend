<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-[300px] mt-[7rem]">
    <!-- Loading / Error State -->
    <div v-if="pending || error || !session" class="w-full text-center py-10">
      <h1 v-if="pending" class="text-2xl font-bold text-gray-700">
        Loading Session...
      </h1>
      <h1 v-else class="text-2xl font-bold text-gray-700">
        Session not found.
      </h1>
    </div>

    <!-- Session Details -->
    <div v-else class="bg-white rounded-lg p-6 lg:p-8 shadow-xl w-full">
      <!-- Back Link -->
      <NuxtLink v-if="mode === 'course'" :to="`/course-detail/${courseId}`" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors">
        <Icon name="mdi:arrow-left" size="1.25rem" />
        <span>Back to Course Details</span>
      </NuxtLink>
      <NuxtLink v-else to="/course-management" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors">
        <Icon name="mdi:arrow-left" size="1.25rem" />
        <span>Back to Course Management</span>
      </NuxtLink>

      <!-- Session Header -->
      <div class="border-b pb-4 mb-6">
        <h1 class="text-3xl font-extrabold text-gray-900">
          {{ session.name }}
        </h1>
        <p class="text-lg text-gray-600 mt-2">
          {{ session.description }}
        </p>
        <div class="flex items-center justify-between mt-4 text-sm">
          <p
            class="font-bold px-3 py-1 rounded-full"
            :class="session.status === 'Complete' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'"
          >
            Status: {{ session.status }}
          </p>
          <p class="text-gray-500 font-mono">
            <Icon name="mdi:calendar-blank" class="inline-block -mt-1 mr-1" />
            Scheduled: {{ new Date(session.scheduled_date).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Task List (un-changed) -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          Tasks
        </h2>
        <div class="space-y-6">
          <p v-if="session.tasks.length === 0" class="text-center text-gray-500 py-6">
            No tasks have been added to this session yet.
          </p>
          <div
            v-for="(task, index) in session.tasks"
            :key="task.sequence"
            class="pb-6 border-b border-gray-200 last:border-b-0"
          >
            <h4 class="text-xl font-semibold text-[#9C1313]">
              Task {{ index + 1 }}: {{ task.task.name }}
            </h4>
            <p class="text-gray-600 mt-1 mb-4">
              {{ task.task.description }}
            </p>
            <div class="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div>
                <h5 class="text-sm font-bold text-gray-700 mb-1">
                  Metrics & Weights
                </h5>
                <div class="flex flex-wrap gap-x-4 gap-y-1">
                  <span v-for="metric in task.task.skill_weights" :key="metric.skill_id" class="text-sm text-gray-600 ">
                    {{ metric.skill_name }}: <strong class="font-mono">{{ parseFloat(metric.weight) * 100 }}%</strong>
                  </span>
                </div>
              </div>
              <div class="text-right">
                <h5 class="text-sm font-bold text-gray-700 mb-1">
                  Duration
                </h5>
                <p class="text-2xl font-bold text-gray-800 font-mono">
                  {{ task.task.duration_minutes }}<span class="text-base font-sans ml-1">min</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Athlete Attendance Section -->
      <div class="mt-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">
            Athlete Attendance
          </h2>
          <!-- Actions and Counter Group -->
          <div class="flex items-center space-x-4">
            <button
              class="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              @click="showAddAthleteModal = true"
            >
              <Icon name="mdi:account-plus-outline" class="mr-1" />
              Add / Manage Athletes
            </button>
            <span v-if="sessionAthletes.length > 0" class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {{ totalPresent }} / {{ sessionAthletes.length }} Present
            </span>
          </div>
        </div>

        <!-- Mark All / Clear All Buttons -->
        <div v-if="sessionAthletes.length > 0" class="flex items-center space-x-4 mb-4">
          <button
            v-if="!allArePresent"
            class="flex items-center px-3 py-1.5 text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 rounded transition-colors"
            @click="markAllPresent"
          >
            <Icon name="mdi:check-all" class="mr-1" />
            Mark All Present
          </button>
          <button
            v-else
            class="flex items-center px-3 py-1.5 text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded transition-colors"
            @click="clearAll"
          >
            <Icon name="mdi:close-box-multiple-outline" class="mr-1" />
            Clear All
          </button>
        </div>

        <!-- Case where no athletes are selected/enrolled -->
        <div v-if="!sessionAthletes || sessionAthletes.length === 0" class="text-center bg-gray-50 p-6 rounded-lg">
          <p class="text-gray-500">
            No athletes selected for this session.
          </p>
          <button class="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700" @click="showAddAthleteModal = true">
            Select Athletes
          </button>
        </div>

        <!-- Athlete Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <button
            v-for="athlete in sessionAthletes"
            :key="athlete.uuid"
            class="flex items-center w-full p-3 border rounded-lg shadow-sm text-left transition-all"
            :class="[isAthletePresent(athlete.uuid) ? 'bg-green-100 border-green-500' : 'bg-white hover:bg-gray-50']"
            @click="toggleAttendance(athlete.uuid)"
          >
            <NuxtImg
              :src="athlete.profile_image_url || '/default-profile.jpg'"
              :alt="athlete.name"
              class="w-10 h-10 rounded-full object-cover mr-4 flex-shrink-0"
            />
            <div class="flex-grow">
              <p class="font-semibold text-gray-800 leading-tight">
                {{ athlete.name }}
              </p>
              <p v-if="athlete.positions" class="text-sm text-gray-500">
                {{ athlete.positions.map(p => p.name).join(', ') || 'No positions' }}
              </p>
            </div>
            <!-- Checkmark icon for present athletes -->
            <div v-if="isAthletePresent(athlete.uuid)" class="ml-2 text-green-600">
              <Icon name="mdi:check-circle" size="1.5rem" />
            </div>
          </button>
        </div>

        <!-- Start Session Button -->
        <div class="mt-8 flex justify-end">
          <NuxtLink
            v-if="totalPresent > 0"
            :to="startSessionUrl"
            class="px-8 py-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-lg text-lg flex items-center"
          >
            <Icon name="mdi:play-circle-outline" class="mr-2" size="1.5rem" />
            Start Session ({{ totalPresent }})
          </NuxtLink>
          <div
            v-else
            class="px-8 py-4 bg-gray-300 text-gray-500 rounded-lg font-bold text-lg flex items-center cursor-not-allowed"
            title="Select at least one athlete to start the session"
          >
            <Icon name="mdi:play-circle-outline" class="mr-2" size="1.5rem" />
            Start Session
          </div>
        </div>
      </div>
    </div>

    <!-- Add Athlete Modal -->
    <AddAthleteToCourse
      :show="showAddAthleteModal"
      :course="course || null"
      :all-athletes="allCoachAthletes || []"
      :initial-selected-uuids="sessionAthletes.map(a => a.uuid)"
      @close="showAddAthleteModal = false"
      @update-attendees="handleUpdateAttendees"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Attendee, Session } from '~/types/course';

const route = useRoute();
const { fetchCourseById, fetchSessionTemplates } = useCourses();
const { fetchAllAthleteSelectionInfo } = useAthleteData();

const mode = computed<'course' | 'quick'>(() => (route.params.id === 'quick' ? 'quick' : 'course'));
const courseId = computed(() => (mode.value === 'course' ? Number(route.params.id) : null));
const sessionId = computed(() => Number(route.params.sessionId));

const { data: course, pending: coursePending, error: courseError } = await useAsyncData(
  `course-for-session-${route.params.id}`,
  () => (mode.value === 'course' && courseId.value ? fetchCourseById(courseId.value).then(r => r.data.value) : Promise.resolve(null)),
  { watch: [mode, courseId] },
);

const { data: allSessionTemplates, pending: templatesPending, error: templatesError } = await fetchSessionTemplates();

const { data: allCoachAthletes } = await fetchAllAthleteSelectionInfo();

const pending = computed(() => coursePending.value || templatesPending.value);
const error = computed(() => courseError.value || templatesError.value);

const session = computed<Session | undefined>(() => {
  if (Number.isNaN(sessionId.value))
    return undefined;

  if (mode.value === 'course' && course.value?.sessions) {
    return course.value.sessions.find(s => s.id === sessionId.value);
  }
  if (mode.value === 'quick' && allSessionTemplates.value) {
    return allSessionTemplates.value.find(t => t.id === sessionId.value);
  }
  return undefined;
});

const sessionAthletes = ref<Attendee[]>([]);
const presentAthleteIds = ref<string[]>([]);
const showAddAthleteModal = ref(false);

watch(session, (newSession) => {
  if (newSession) {
    if (mode.value === 'course' && course.value) {
      sessionAthletes.value = [...course.value.attendees];
    }
    else {
      sessionAthletes.value = [];
    }
    presentAthleteIds.value = [];
  }
}, { immediate: true });

const totalPresent = computed(() => presentAthleteIds.value.length);
const allArePresent = computed(() => {
  if (sessionAthletes.value.length === 0)
    return false;
  return presentAthleteIds.value.length === sessionAthletes.value.length;
});

function toggleAttendance(athleteUuid: string) {
  const index = presentAthleteIds.value.indexOf(athleteUuid);
  if (index > -1) {
    presentAthleteIds.value.splice(index, 1);
  }
  else {
    presentAthleteIds.value.push(athleteUuid);
  }
}

function isAthletePresent(athleteUuid: string): boolean {
  return presentAthleteIds.value.includes(athleteUuid);
}

function markAllPresent() {
  presentAthleteIds.value = sessionAthletes.value.map(a => a.uuid);
}

function clearAll() {
  presentAthleteIds.value = [];
}

function handleUpdateAttendees(updatedUuids: string[]) {
  if (!allCoachAthletes.value)
    return;
  sessionAthletes.value = allCoachAthletes.value.filter(athlete => updatedUuids.includes(athlete.uuid));
  presentAthleteIds.value = presentAthleteIds.value.filter(id => updatedUuids.includes(id));
  showAddAthleteModal.value = false;
}

const startSessionUrl = computed(() => {
  const athleteQuery = presentAthleteIds.value.join(',');
  let basePath = '';
  if (mode.value === 'course') {
    basePath = `/course-detail/${courseId.value}/session/${sessionId.value}/start`;
  }
  else {
    basePath = `/course-detail/quick/session/${sessionId.value}/start`;
  }

  if (presentAthleteIds.value.length === 0)
    return basePath;
  return `${basePath}?athletes=${athleteQuery}`;
});

const stopWatcher = watchEffect(() => {
  if (pending.value)
    return;
  if (!Number.isNaN(sessionId.value) && !session.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session Not Found',
      fatal: true,
    });
  }
});

onUnmounted(() => {
  stopWatcher();
});

useHead({
  title: () => (session.value ? `Session: ${session.value.name}` : 'Session Details'),
});
</script>
