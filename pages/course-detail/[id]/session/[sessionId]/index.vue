<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-[300px] max-h-[none] mt-[7rem]">
    <!-- Error State (now handled by the check below) -->
    <!-- Template will only render when data is valid -->
    <div v-if="!session || !course" class="text-center">
      <h1 class="text-2xl font-bold text-gray-700">
        Session not found.
      </h1>
    </div>

    <!-- Session Details -->
    <div v-else class="bg-white rounded-lg p-6 lg:p-8 shadow-xl w-full">
      <NuxtLink :to="`/course-detail/${courseId}`" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors">
        <Icon name="mdi:arrow-left" size="1.25rem" />
        <span>Back to Courses detail</span>
      </NuxtLink>

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
            Scheduled: {{ session.scheduled_date }}
          </p>
        </div>
      </div>

      <!-- Task List -->
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

      <!-- ============== NEW ATHLETE SECTION ============== -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">
            Athlete Attendance
          </h2>
          <!-- NEW: Actions and Counter Group -->
          <div v-if="course.attendees.length > 0" class="flex items-center space-x-4">
            <!-- "Mark All / Clear All" Button -->
            <button
              v-if="!allArePresent"
              class="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              @click="markAllPresent"
            >
              <Icon name="mdi:check-all" class="mr-1" />
              Mark All Present
            </button>
            <button
              v-else
              class="flex items-center text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
              @click="clearAll"
            >
              <Icon name="mdi:close-box-multiple-outline" class="mr-1" />
              Clear All
            </button>

            <!-- Attendance Counter -->
            <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {{ totalPresent }} / {{ course.attendees.length }} Present
            </span>
          </div>
        </div>

        <!-- Case where no athletes are enrolled -->
        <div v-if="!course.attendees || course.attendees.length === 0" class="text-center bg-gray-50 p-6 rounded-lg">
          <p class="text-gray-500">
            No athletes are enrolled in this course.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <button
            v-for="athlete in course.attendees"
            :key="athlete.uuid"
            class="flex items-center w-full p-3 border rounded-lg shadow-sm text-left transition-all"
            :class="[isAthletePresent(athlete.uuid) ? 'bg-green-100 border-green-500' : 'bg-white hover:bg-gray-50']"
            @click="toggleAttendance(athlete.uuid)"
          >
            <NuxtImg
              :src="athlete.profile_image_url || '/public/default-profile.jpg'"
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
        <p v-if="totalPresent === 0" class="text-xs text-gray-500 mt-2">
          Select athletes below to begin.
        </p>
        <div class="mt-5">
          <!-- Show this button only if at least one athlete is selected -->
          <NuxtLink
            v-if="totalPresent > 0"
            :to="startSessionUrl"
            class="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-lg text-lg flex items-center "
          >
            <Icon name="mdi:play-circle-outline" class="mr-2" size="1.5rem" />
            Start Session ({{ totalPresent }})
          </NuxtLink>
          <!-- Show a disabled placeholder if no athletes are selected -->
          <div
            v-else
            class="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-bold text-lg flex items-center cursor-not-allowed"
            title="Select at least one athlete to start the session"
          >
            <Icon name="mdi:play-circle-outline" class="mr-2" size="1.5rem" />
            Start Session
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Session } from '~/types/course';
import { computed, onUnmounted, ref, watchEffect } from 'vue'; // Import onUnmounted
import { useRoute } from 'vue-router';
import { useCourses } from '~/composables/useCourses';

const route = useRoute();
const { fetchCourseById } = useCourses();

// ===============================================
//           DATA FETCHING
// ===============================================
const courseId = computed(() => Number(route.params.id));
const sessionId = computed(() => Number(route.params.sessionId));

const { data: course, pending, error } = await fetchCourseById(courseId.value);

const session = computed<Session | undefined>(() => {
  // Add a guard to prevent running when sessionId is not a valid number
  if (!course.value || !course.value.sessions || Number.isNaN(sessionId.value)) {
    return undefined;
  }
  return course.value.sessions.find(s => s.id === sessionId.value);
});

// ==========================================================
//                 ATTENDANCE LOGIC
// ==========================================================
const presentAthleteIds = ref<string[]>([]);

const totalPresent = computed(() => presentAthleteIds.value.length);

const allArePresent = computed(() => {
  if (!course.value?.attendees || course.value.attendees.length === 0)
    return false;
  return presentAthleteIds.value.length === course.value.attendees.length;
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
  if (course.value?.attendees) {
    presentAthleteIds.value = course.value.attendees.map(a => a.uuid);
  }
}

function clearAll() {
  presentAthleteIds.value = [];
}

// ==========================================================
//    DYNAMIC URL FOR THE "START SESSION" BUTTON
// ==========================================================
const startSessionUrl = computed(() => {
  const basePath = `/course-detail/${courseId.value}/session/${sessionId.value}/start`;
  if (presentAthleteIds.value.length === 0)
    return basePath;
  const athleteQuery = presentAthleteIds.value.join(',');
  return `${basePath}?athletes=${athleteQuery}`;
});

// ===============================================
//       404 ERROR HANDLING & METADATA (THE FIX)
// ===============================================

// Assign the watcher to a variable so we can stop it later.
const stopWatcher = watchEffect(() => {
  // This guard is important. We only want to check for errors
  // after the initial loading is complete.
  if (pending.value) {
    return;
  }

  // Only throw an error if we have a valid session ID in the URL but couldn't find the data.
  // This prevents the error during navigation when sessionId becomes NaN.
  if (!Number.isNaN(sessionId.value) && (!course.value || !session.value)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session or Course Not Found',
      fatal: true,
    });
  }
});

// Use the onUnmounted hook to clean up the watcher.
// This is crucial to prevent it from running during navigation away from the page.
onUnmounted(() => {
  stopWatcher();
});

// Set the page title reactively.
useHead({
  title: () => (session.value ? `Session: ${session.value.name}` : 'Session Details'),
});
</script>
