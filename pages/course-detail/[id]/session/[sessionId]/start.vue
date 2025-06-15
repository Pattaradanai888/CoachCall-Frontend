<template>
  <div class="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
    <div v-if="!session || !course" class="text-center text-red-500 font-bold">
      Loading session data or session not found...
    </div>

    <div v-else class="max-w-7xl mx-auto">
      <!-- =================================== -->
      <!-- Top Header & Progress Section -->
      <!-- =================================== -->
      <header class="bg-white p-6 rounded-xl shadow-md mb-6">
        <div class="flex justify-between items-start mb-6">
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-800">
            {{ course.title }}
          </h1>
          <div class="flex items-center space-x-4 flex-shrink-0">
            <span class="px-3 py-1 text-sm font-semibold text-orange-800 bg-orange-200 rounded-full">
              In progress
            </span>
            <span class="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full flex items-center">
              <Icon name="mdi:clock-outline" class="mr-1.5" />
              Session: 00:00
            </span>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p class="text-sm text-gray-500 mb-2">
              Overall Progress
            </p>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-red-600 h-2.5 rounded-full" style="width: 45%" />
            </div>
            <p class="font-bold text-lg mt-1">
              45%
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-2">
              Current Task Progress
            </p>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-red-600 h-2.5 rounded-full" style="width: 70%" />
            </div>
            <p class="font-bold text-lg mt-1">
              70%
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-2">
              Evaluations
            </p>
            <p class="font-bold text-2xl text-gray-800">
              <span class="text-red-600">18</span> / {{ participatingAthletes.length * totalTasks }}
            </p>
          </div>
        </div>
      </header>

      <!-- =================================== -->
      <!-- Main Content Grid -->
      <!-- =================================== -->
      <main class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- == Left Sidebar == -->
        <aside class="space-y-6">
          <!-- Current Evaluation Card -->
          <div class="bg-white p-6 rounded-xl shadow-md">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800 flex items-center">
                <Icon name="mdi:format-list-checks" class="mr-2" />
                Current Evaluation
              </h2>
              <div class="flex space-x-1">
                <button class="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" :disabled="currentTaskIndex === 0" @click="prevTask">
                  <Icon name="mdi:chevron-left" />
                </button>
                <button class="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" :disabled="currentTaskIndex >= totalTasks - 1" @click="nextTask">
                  <Icon name="mdi:chevron-right" />
                </button>
              </div>
            </div>
            <p v-if="totalTasks > 0" class="text-sm text-gray-500 mb-2">
              Task {{ currentTaskIndex + 1 }} of {{ totalTasks }}
            </p>
            <div v-if="currentTask" class="flex items-start space-x-4">
              <div class="flex-shrink-0 w-8 h-8 bg-red-600 text-white flex items-center justify-center rounded-full font-bold text-sm">
                {{ currentTask.order }}
              </div>
              <div>
                <h3 class="font-bold text-gray-900">
                  {{ currentTask.name }}
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ currentTask.description }}
                </p>
                <div class="flex flex-wrap gap-2 mt-3">
                  <span v-for="metric in currentTask.skillMetrics" :key="metric.skill" class="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                    {{ metric.skill }}: {{ metric.weight }}%
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500">
              No tasks in this session.
            </div>
          </div>

          <!-- Athlete List Card -->
          <div class="bg-white p-6 rounded-xl shadow-md">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Icon name="mdi:account-group-outline" class="mr-2" />
              Athletes
            </h2>
            <!-- Handle case where no athletes were selected -->
            <div v-if="participatingAthletes.length === 0" class="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
              <p>No athletes were selected for this session.</p>
              <NuxtLink :to="`/course-detail/${courseId}/session/${sessionId}`" class="text-sm text-blue-600 hover:underline mt-2 block">
                Go back to select participants
              </NuxtLink>
            </div>
            <!-- The list now uses `participatingAthletes` -->
            <div v-else class="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
              <button
                v-for="(athlete, index) in participatingAthletes"
                :key="athlete.id"
                class="w-full flex items-center p-3 rounded-lg text-left transition-colors"
                :class="[
                  currentAthleteIndex === index
                    ? 'bg-blue-100 text-blue-800 font-semibold shadow-sm'
                    : 'hover:bg-gray-50',
                ]"
                @click="selectAthlete(index)"
              >
                <img :src="athlete.avatar" :alt="athlete.name" class="w-9 h-9 rounded-full mr-3">
                <span>{{ athlete.name }}</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- == Right Main Content == -->
        <!-- Only show scoring if there are athletes to score -->
        <section v-if="participatingAthletes.length > 0 && currentTask" class="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center">
              <img :src="currentAthlete.avatar" :alt="currentAthlete.name" class="w-14 h-14 rounded-full mr-4">
              <div>
                <h2 class="text-xl font-bold text-gray-900">
                  <Icon name="mdi:star-outline" class="text-yellow-500 -mt-1 mr-1" />
                  Performance Scoring
                </h2>
                <p class="text-sm text-gray-600">
                  {{ currentAthlete.name }} - Task {{ currentTask.order }}/{{ totalTasks }}: {{ currentTask.name }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-3 text-gray-600 bg-gray-100 p-2 rounded-lg">
              <Icon name="mdi:timer-outline" size="1.5rem" />
              <span class="font-mono text-xl font-bold">00:00</span>
              <button class="hover:text-gray-900">
                <Icon name="mdi:play" size="1.5rem" />
              </button>
              <button class="hover:text-gray-900">
                <Icon name="mdi:reload" size="1.5rem" />
              </button>
            </div>
          </div>

          <!-- Quick Score Templates -->
          <div class="mb-6">
            <h3 class="text-sm font-bold text-gray-600 mb-2">
              Quick Score Templates
            </h3>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="score in quickScores" :key="score.label"
                class="px-3 py-2 text-sm border rounded-lg transition-colors"
                :class="[
                  selectedQuickScore === score.label
                    ? 'bg-red-200 text-red-800 border-red-300 font-bold'
                    : 'bg-white border-gray-300 hover:bg-gray-100',
                ]"
                @click="selectedQuickScore = score.label"
              >
                {{ score.id }}. {{ score.label }}
              </button>
            </div>
          </div>

          <!-- Skill Sliders -->
          <div class="space-y-6 mb-6">
            <div v-for="metric in currentTask.skillMetrics" :key="metric.skill">
              <div class="flex justify-between items-center mb-1">
                <label class="font-semibold text-gray-700">
                  {{ metric.skill }}
                  <span class="ml-2 text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">{{ metric.weight }}%</span>
                </label>
                <span class="font-bold text-gray-800">{{ currentScores[metric.skill] || 0 }}%</span>
              </div>
              <input
                v-model.number="currentScores[metric.skill]"
                type="range"
                min="0"
                max="100"
                step="5"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb"
              >
            </div>
          </div>

          <!-- Notes -->
          <div class="mb-6">
            <label for="notes" class="font-semibold text-gray-700 mb-2 block">Notes</label>
            <textarea
              id="notes"
              v-model="notes"
              rows="4"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              placeholder="Optional notes about the athlete's performance"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between items-center border-t pt-6">
            <button class="px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition">
              ← Previous
            </button>
            <button class="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-lg">
              Save & Next →
            </button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Athlete, Task } from '~/composables/useCourses';
import { computed, ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useCourses } from '~/composables/useCourses';

const route = useRoute();
const { findSessionById } = useCourses();

// Data Fetching
const courseId = computed(() => Number(route.params.id)); // <-- Use 'id' to match the folder name [id]
const sessionId = computed(() => Number(route.params.sessionId));
const data = computed(() => findSessionById(courseId.value, sessionId.value));
const course = computed(() => data.value.course);
const session = computed(() => data.value.session);

// ==========================================================
//    LOGIC TO GET "CHECKED-IN" ATHLETES FROM URL
// ==========================================================
const participatingAthletes = computed<Athlete[]>(() => {
  // Fallback to an empty array if course data is not yet available
  if (!course.value?.athletes)
    return [];

  // 1. Get the athlete IDs from the URL query string (e.g., "101,104,102")
  const athleteQuery = route.query.athletes;

  // 2. If no 'athletes' query exists, it means no one was checked in. Return an empty list.
  if (!athleteQuery || typeof athleteQuery !== 'string') {
    return [];
  }

  // 3. Convert the string "101,104,102" into an array of numbers: [101, 104, 102]
  const participatingIds = athleteQuery.split(',').map(Number);

  // 4. Filter the main course athlete list to only include those whose ID is in our list from the URL
  return course.value.athletes.filter(athlete =>
    participatingIds.includes(athlete.id),
  );
});

// Component State
const currentTaskIndex = ref(0);
const currentAthleteIndex = ref(0);
const selectedQuickScore = ref('Needs work');
const notes = ref('');
const currentScores = ref<{ [key: string]: number }>({});

// Quick Score Data
const quickScores = [
  { id: 1, label: 'Poor' },
  { id: 2, label: 'Needs work' },
  { id: 3, label: 'Average' },
  { id: 4, label: 'Good' },
  { id: 5, label: 'Excellent' },
];

// --- Computed properties for easy access in the template ---
const currentTask = computed<Task | undefined>(() => session.value?.tasks[currentTaskIndex.value]);
const totalTasks = computed(() => session.value?.tasks.length || 0);
const currentAthlete = computed<Athlete | undefined>(() => participatingAthletes.value[currentAthleteIndex.value]);

// --- Methods ---
function selectAthlete(index: number) {
  // TODO: Add logic here to save the current evaluation before switching
  currentAthleteIndex.value = index;
}

function nextTask() {
  if (currentTaskIndex.value < totalTasks.value - 1) {
    currentTaskIndex.value++;
  }
}

function prevTask() {
  if (currentTaskIndex.value > 0) {
    currentTaskIndex.value--;
  }
}

// Set Page Title
useHead({
  title: () => (course.value ? `Live Session: ${course.value.title}` : 'Live Session'),
});

// Watch for data loading and handle potential 404s
watchEffect(() => {
  if (route.matched.length > 0 && !session.value) {
    // In a real Nuxt 3 app, this is a better way to handle 404s
    // throw createError({ statusCode: 404, statusMessage: 'Session Not Found', fatal: true });
  }
});
</script>

<style>
/* Custom styles for the range slider thumb to match the design */
.range-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #9c1313; /* A red color from your theme */
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.range-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #9c1313;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
</style>
