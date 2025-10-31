<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-4 sm:my-6 lg:my-10 h-auto min-h-[300px] mt-20 sm:mt-24 lg:mt-[7rem] px-4 sm:px-6 lg:px-0">
    <!-- Loading / Error State -->
    <div v-if="pending || error || !session" class="w-full text-center py-8 sm:py-10">
      <h1 v-if="pending" class="text-xl sm:text-2xl font-bold text-gray-700">
        Loading Session...
      </h1>
      <h1 v-else class="text-xl sm:text-2xl font-bold text-gray-700">
        Session not found.
      </h1>
    </div>

    <!-- Session Details -->
    <div v-else class="bg-white rounded-lg p-4 sm:p-6 lg:p-8 shadow-xl w-full">
      <!-- Back Link and Cancel Button -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <NuxtLink v-if="mode === 'course'" :to="`/course-detail/${courseId}`" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors text-sm sm:text-base">
          <Icon name="mdi:arrow-left" size="1.25rem" />
          <span class="hidden sm:inline">Back to Course Details</span>
          <span class="sm:hidden">Back</span>
        </NuxtLink>
        <NuxtLink v-else to="/course-management" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors text-sm sm:text-base">
          <Icon name="mdi:arrow-left" size="1.25rem" />
          <span class="hidden sm:inline">Back to Course Management</span>
          <span class="sm:hidden">Back</span>
        </NuxtLink>

        <button
          v-if="mode === 'quick' && session.status !== 'Complete'"
          class="flex items-center justify-center sm:justify-start space-x-2 text-red-600 hover:text-red-800 font-semibold transition-colors text-xs sm:text-sm px-3 py-2 sm:py-1.5 rounded-lg border border-red-300 hover:bg-red-50 w-full sm:w-auto min-h-[44px]"
          @click="handleCancelSession"
        >
          <Icon name="mdi:cancel" size="1rem" />
          <span class="hidden sm:inline">Cancel & Delete Session</span>
          <span class="sm:hidden">Cancel Session</span>
        </button>
      </div>

      <!-- Session Header -->
      <div class="border-b pb-4 mb-4 sm:mb-6">
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">
          {{ session.name }}
        </h1>
        <p class="text-sm sm:text-base lg:text-lg text-gray-600 mt-2">
          {{ session.description }}
        </p>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3 sm:gap-0">
          <p
            class="font-bold px-3 py-1 rounded-full text-xs sm:text-sm w-fit"
            :class="session.status === 'Complete' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'"
          >
            Status: {{ session.status }}
          </p>
          <p class="text-gray-500 text-xs sm:text-sm">
            <Icon name="mdi:calendar-blank" class="inline-block -mt-1 mr-1" />
            <span class="hidden sm:inline">Scheduled: </span>{{ new Date(session.scheduled_date).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Task List -->
      <div>
        <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
          Tasks
        </h2>
        <div class="space-y-4 sm:space-y-6">
          <p v-if="session.tasks.length === 0" class="text-center text-gray-500 py-6 text-sm sm:text-base">
            No tasks have been added to this session yet.
          </p>
          <div
            v-for="(task, index) in session.tasks"
            :key="task.sequence"
            class="pb-4 sm:pb-6 border-b border-gray-200 last:border-b-0"
          >
            <h4 class="text-base sm:text-lg lg:text-xl font-semibold text-[#9C1313] mb-2">
              Task {{ index + 1 }}: {{ task.task.name }}
            </h4>
            <p class="text-gray-600 mt-1 mb-3 sm:mb-4 text-sm sm:text-base">
              {{ task.task.description }}
            </p>
            
            <!-- Mobile Layout (stacked) -->
            <div class="block sm:hidden space-y-3">
              <div class="bg-gray-50 p-3 rounded-md">
                <h5 class="text-xs font-bold text-gray-700 mb-2">
                  Duration
                </h5>
                <p class="text-lg font-bold text-gray-800">
                  {{ task.task.duration_minutes }}<span class="text-sm font-normal ml-1">minutes</span>
                </p>
              </div>
              <div class="bg-gray-50 p-3 rounded-md">
                <h5 class="text-xs font-bold text-gray-700 mb-2">
                  Metrics & Weights
                </h5>
                <div class="space-y-1">
                  <div v-for="metric in task.task.skill_weights" :key="metric.skill_id" class="text-xs text-gray-600">
                    {{ metric.skill_name }}: <strong class="font-mono">{{ parseFloat(metric.weight) * 100 }}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop Layout (side by side) -->
            <div class="hidden sm:flex sm:items-center sm:justify-between bg-gray-50 p-3 rounded-md">
              <div>
                <h5 class="text-sm font-bold text-gray-700 mb-1">
                  Metrics & Weights
                </h5>
                <div class="flex flex-wrap gap-x-4 gap-y-1">
                  <span v-for="metric in task.task.skill_weights" :key="metric.skill_id" class="text-sm text-gray-600">
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
      <div class="mt-6 sm:mt-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
          <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
            Athlete Attendance
          </h2>
          <!-- Actions and Counter Group -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <button
              class="flex items-center justify-center sm:justify-start text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-2 sm:px-0 sm:py-0 rounded-lg sm:rounded-none bg-blue-50 sm:bg-transparent"
              @click="showAddAthleteModal = true"
            >
              <Icon name="mdi:account-plus-outline" class="mr-1 sm:mr-1" />
              <span class="hidden sm:inline">Add / Manage Athletes</span>
              <span class="sm:hidden">Manage Athletes</span>
            </button>
            <span v-if="sessionAthletes.length > 0" class="text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-center">
              {{ totalPresent }} / {{ sessionAthletes.length }} Present
            </span>
          </div>
        </div>

        <!-- Mark All / Clear All Buttons -->
        <div v-if="sessionAthletes.length > 0" class="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-4 mb-4">
          <button
            v-if="!allArePresent"
            class="flex items-center px-3 py-2 sm:py-1.5 text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 rounded transition-colors"
            @click="markAllPresent"
          >
            <Icon name="mdi:check-all" class="mr-1" />
            Mark All Present
          </button>
          <button
            v-else
            class="flex items-center px-3 py-2 sm:py-1.5 text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded transition-colors"
            @click="clearAll"
          >
            <Icon name="mdi:close-box-multiple-outline" class="mr-1" />
            Clear All
          </button>
        </div>

        <!-- Case where no athletes are selected/enrolled -->
        <div v-if="!sessionAthletes || sessionAthletes.length === 0" class="text-center bg-gray-50 p-4 sm:p-6 rounded-lg">
          <p class="text-gray-500 text-sm sm:text-base">
            No athletes selected for this session.
          </p>
          <button class="mt-3 sm:mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm sm:text-base" @click="showAddAthleteModal = true">
            Select Athletes
          </button>
        </div>

        <!-- Athlete Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <button
            v-for="athlete in sessionAthletes"
            :key="athlete.uuid"
            class="flex items-center w-full p-3 border rounded-lg shadow-sm text-left transition-all min-h-[60px]"
            :class="[isAthletePresent(athlete.uuid) ? 'bg-green-100 border-green-500' : 'bg-white hover:bg-gray-50']"
            @click="toggleAttendance(athlete.uuid)"
          >
            <NuxtImg
              :src="athlete.profile_image_url || '/default-profile.jpg'"
              :alt="athlete.name"
              class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4 flex-shrink-0"
            />
            <div class="flex-grow min-w-0">
              <p class="font-semibold text-gray-800 leading-tight text-sm sm:text-base truncate">
                {{ athlete.name }}
              </p>
              <p v-if="athlete.positions" class="text-xs sm:text-sm text-gray-500 truncate">
                {{ athlete.positions.map(p => p.name).join(', ') || 'No positions' }}
              </p>
            </div>
            <!-- Checkmark icon for present athletes -->
            <div v-if="isAthletePresent(athlete.uuid)" class="ml-2 text-green-600 flex-shrink-0">
              <Icon name="mdi:check-circle" size="1.2rem" class="sm:w-6 sm:h-6" />
            </div>
          </button>
        </div>

        <!-- Start Session Button -->
        <div class="mt-6 sm:mt-8 flex justify-center sm:justify-end">
          <NuxtLink
            v-if="totalPresent > 0"
            :to="startSessionUrl"
            class="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-lg text-base sm:text-lg flex items-center justify-center"
            :disabled="isStarting"
            @click="handleStartSession"
          >
            <Icon name="mdi:play-circle-outline" class="mr-2" size="1.2rem sm:1.5rem" />
            <span class="hidden sm:inline">{{ isStarting ? 'Starting...' : `Start Session (${totalPresent})` }}</span>
            <span class="sm:hidden">{{ isStarting ? 'Starting...' : `Start (${totalPresent})` }}</span>
          </NuxtLink>
          <div
            v-else
            class="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-300 text-gray-500 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center cursor-not-allowed"
            title="Select at least one athlete to start the session"
          >
            <Icon name="mdi:play-circle-outline" class="mr-2" size="1.2rem sm:1.5rem" />
            <span class="hidden sm:inline">Start Session</span>
            <span class="sm:hidden">Start</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Athlete Modal -->
    <AthleteSelectionModal
      :show="showAddAthleteModal"
      :course="course || null"
      :all-athletes="allCoachAthletes || []"
      :initial-selected-uuids="sessionAthletes.map(a => a.uuid)"
      @close="showAddAthleteModal = false"
      @update-attendees="handleUpdateAttendees"
    />

    <!-- Cancel Session Confirmation Modal -->
    <ConfirmModal
      :show="showCancelConfirm"
      title="Cancel & Delete Session"
      message="Are you sure you want to cancel and delete this quick session? This action cannot be undone."
      confirm-text="Delete Session"
      @close="showCancelConfirm = false"
      @confirm="confirmCancelSession"
    />

    <!-- Error Notification Modal -->
    <NotificationModal
      :show="showErrorNotification"
      title="Error"
      :message="errorMessage"
      type="error"
      @close="showErrorNotification = false"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Attendee, Session } from '~/types/course';

const route = useRoute();
const router = useRouter();
const { fetchCourseById, fetchSessionById, deleteSession, confirmSession } = useCourses();
const { fetchAllAthleteSelectionInfo } = useAthleteData();
const isStarting = ref(false);

const mode = computed<'course' | 'quick'>(() => (route.params.id === 'quick' ? 'quick' : 'course'));
const courseId = computed(() => (mode.value === 'course' ? Number(route.params.id) : null));
const sessionId = computed(() => Number(route.params.sessionId));

const { data: course, pending: coursePending, error: courseError } = await useAsyncData(
  `course-for-session-${route.params.id}`,
  () => (mode.value === 'course' && courseId.value ? fetchCourseById(courseId.value).then(r => r.data.value) : Promise.resolve(null)),
  { watch: [mode, courseId] },
);

const { data: session, pending: sessionPending, error: sessionError } = await useAsyncData<Session | null>(
  `session-details-${sessionId.value}`,
  () => {
    if (Number.isNaN(sessionId.value))
      return Promise.resolve(null);

    if (mode.value === 'quick') {
      return fetchSessionById(sessionId.value).then(r => r.data.value);
    }

    if (course.value?.sessions) {
      return Promise.resolve(course.value.sessions.find(s => s.id === sessionId.value) || null);
    }

    return Promise.resolve(null);
  },
  {
    watch: [course],
  },
);

const { data: allCoachAthletes } = await fetchAllAthleteSelectionInfo();

const pending = computed(() => coursePending.value || sessionPending.value);
const error = computed(() => courseError.value || sessionError.value);

const sessionAthletes = ref<Attendee[]>([]);
const presentAthleteIds = ref<string[]>([]);
const showAddAthleteModal = ref(false);
const showCancelConfirm = ref(false);
const showErrorNotification = ref(false);
const errorMessage = ref('');

watch(session, (newSession) => {
  if (newSession) {
    if (mode.value === 'course' && course.value) {
      sessionAthletes.value = [...course.value.attendees];
    }
    else {
      // For quick sessions, we start with an empty list which the user can populate.
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

async function handleStartSession() {
  if (!session.value || isStarting.value)
    return;

  isStarting.value = true;
  try {
    // For quick sessions, we must first confirm them
    if (mode.value === 'quick') {
      await confirmSession(session.value.id);
    }

    // Now navigate to the start page
    const athleteQuery = presentAthleteIds.value.join(',');
    let basePath = '';
    if (mode.value === 'course') {
      basePath = `/course-detail/${courseId.value}/session/${sessionId.value}/start`;
    }
    else {
      basePath = `/course-detail/quick/session/${sessionId.value}/start`;
    }

    const finalUrl = presentAthleteIds.value.length > 0
      ? `${basePath}?athletes=${athleteQuery}`
      : basePath;

    await router.push(finalUrl);
  }
  catch (error) {
    console.error('Failed to start session:', error);
    // Add user-facing error notification
  }
  finally {
    isStarting.value = false;
  }
}

function handleCancelSession() {
  if (!session.value) return;
  showCancelConfirm.value = true;
}

async function confirmCancelSession() {
  if (!session.value) return;
  
  showCancelConfirm.value = false;
  
  try {
    await deleteSession(session.value.id);
    await router.push('/course-management');
  }
  catch (e) {
    console.error('Failed to delete session:', e);
    errorMessage.value = 'Failed to delete the session. Please try again.';
    showErrorNotification.value = true;
  }
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

<style scoped>
/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  /* Better button feedback on touch devices */
  button:active {
    transform: scale(0.98);
  }
  
  /* Enhance athlete card interactions - if grid buttons exist */
  .grid button:active {
    transform: scale(0.97);
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
