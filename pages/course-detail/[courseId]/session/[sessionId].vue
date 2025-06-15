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
            Scheduled: {{ session.scheduledDate }}
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
            :key="task.id"
            class="pb-6 border-b border-gray-200 last:border-b-0"
          >
            <h4 class="text-xl font-semibold text-[#9C1313]">
              Task {{ index + 1 }}: {{ task.name }}
            </h4>
            <p class="text-gray-600 mt-1 mb-4">
              {{ task.description }}
            </p>
            <div class="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div>
                <h5 class="text-sm font-bold text-gray-700 mb-1">
                  Metrics & Weights
                </h5>
                <div class="flex flex-wrap gap-x-4 gap-y-1">
                  <span v-for="metric in task.skillMetrics" :key="metric.skill" class="text-sm text-gray-600 ">
                    {{ metric.skill }}: <strong class="font-mono">{{ metric.weight }}%</strong>
                  </span>
                </div>
              </div>
              <div class="text-right">
                <h5 class="text-sm font-bold text-gray-700 mb-1">
                  Duration
                </h5>
                <p class="text-2xl font-bold text-gray-800 font-mono">
                  {{ task.duration }}<span class="text-base font-sans ml-1">min</span>
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
          <div v-if="course.athletes.length > 0" class="flex items-center space-x-4">
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
              {{ totalPresent }} / {{ course.athletes.length }} Present
            </span>
          </div>
        </div>

        <!-- Case where no athletes are enrolled -->
        <div v-if="!course.athletes || course.athletes.length === 0" class="text-center bg-gray-50 p-6 rounded-lg">
          <p class="text-gray-500">
            No athletes are enrolled in this course.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <button
            v-for="athlete in course.athletes"
            :key="athlete.id"
            class="flex items-center w-full p-3 border rounded-lg shadow-sm text-left transition-all duration-200"
            :class="[
              isAthletePresent(athlete.id)
                ? 'bg-green-100 border-green-500'
                : 'bg-white border-gray-200 hover:bg-gray-50',
            ]"
            @click="toggleAttendance(athlete.id)"
          >
            <img
              :src="athlete.avatar"
              :alt="athlete.name"
              class="w-10 h-10 rounded-full object-cover mr-4 flex-shrink-0"
            >
            <div class="flex-grow">
              <p class="font-semibold text-gray-800 leading-tight">
                {{ athlete.name }}
              </p>
              <p v-if="athlete.position" class="text-sm text-gray-500">
                {{ athlete.position }}
              </p>
            </div>
            <!-- Checkmark icon for present athletes -->
            <div v-if="isAthletePresent(athlete.id)" class="ml-2 text-green-600">
              <Icon name="mdi:check-circle" size="1.5rem" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useCourses } from '~/composables/useCourses';

const route = useRoute();
const { findSessionById } = useCourses();

// Get IDs reactively from the route
const courseId = computed(() => Number(route.params.courseId));
const sessionId = computed(() => Number(route.params.sessionId));

// ===============================================
//           THE KEY CORRECTION HERE
// ===============================================
// Wrap the data lookup in a computed property.
// This creates a reactive dependency on courseId and sessionId.
const data = computed(() => {
  // Ensure we have valid numbers before proceeding
  if (isNaN(courseId.value) || isNaN(sessionId.value)) {
    return { course: undefined, session: undefined };
  }
  return findSessionById(courseId.value, sessionId.value);
});

// Create separate computed properties for easier use in the template
const course = computed(() => data.value.course);
const session = computed(() => data.value.session);

// ===============================================
//       HOW TO PROPERLY THROW A 404 ERROR
// ===============================================
// Use watchEffect to react to changes in the computed data.
// We must check that the route is actually ready before we decide it's a 404.
watchEffect(() => {
  // route.matched.length > 0 ensures the router has finished its initial navigation
  if (route.matched.length > 0 && !session.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session or Course Not Found',
      fatal: true,
    });
  }
});

// ==========================================================
//                 ATTENDANCE LOGIC
// ==========================================================
// State: An array to hold the IDs of athletes marked as present.
const presentAthleteIds = ref<number[]>([]);

// Computed: A counter for the UI.
const totalPresent = computed(() => presentAthleteIds.value.length);

// NEW COMPUTED: Checks if all athletes are marked as present.
const allArePresent = computed(() => {
  if (!course.value?.athletes || course.value.athletes.length === 0) {
    return false;
  }
  return presentAthleteIds.value.length === course.value.athletes.length;
});

// Method: Toggles an individual athlete's attendance status.
function toggleAttendance(athleteId: number) {
  const index = presentAthleteIds.value.indexOf(athleteId);
  if (index > -1) {
    presentAthleteIds.value.splice(index, 1);
  }
  else {
    presentAthleteIds.value.push(athleteId);
  }
}

// Method: Helper for dynamic class binding in the template.
function isAthletePresent(athleteId: number): boolean {
  return presentAthleteIds.value.includes(athleteId);
}

// NEW METHOD: Marks all athletes as present.
function markAllPresent() {
  if (course.value?.athletes) {
    presentAthleteIds.value = course.value.athletes.map(a => a.id);
  }
}

// NEW METHOD: Clears all attendance selections.
function clearAll() {
  presentAthleteIds.value = [];
}

// 404 Error handling
watchEffect(() => {
  if (route.matched.length > 0 && !session.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session or Course Not Found',
      fatal: true,
    });
  }
});

useHead({
  // Use a function to make the title reactive as well
  title: () => (session.value ? `Session: ${session.value.name}` : 'Session Details'),
});
</script>
