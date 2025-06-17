<template>
  <div class="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 mt-[4.5rem]">
    <div v-if="!session || !course" class="text-center text-red-500 font-bold">
      Loading session data or session not found...
    </div>

    <div v-else class="max-w-7xl mx-auto">
      <!-- ... (Header section is unchanged) ... -->
      <header class="bg-white p-6 rounded-xl shadow-md mb-6">
        <div class="flex justify-between items-start mb-6">
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-800">
            {{ course.title }}
          </h1>
          <div class="flex items-center space-x-4 flex-shrink-0">
            <!-- Session-wide timer -->
            <span class="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full flex items-center">
              <Icon name="mdi:clock-outline" class="mr-1.5" />
              Session: {{ formattedSessionTime }}
            </span>
            <!-- Cancel Button -->
            <button class="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-200 rounded-full hover:bg-red-400 hover:text-red-900 transition flex items-center" @click="handleCancel">
              <Icon name="mdi:close-circle-outline" class="mr-1.5" />
              Cancel Session
            </button>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p class="text-sm text-gray-500 mb-2">
              Overall Progress
            </p>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-red-600 h-2.5 rounded-full transition-all duration-300" :style="{ width: `${overallProgress}%` }" />
            </div>
            <p class="font-bold text-lg mt-1">
              {{ overallProgress }}%
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-2">
              Current Task Progress
            </p>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-red-600 h-2.5 rounded-full transition-all duration-300" :style="{ width: `${currentTaskProgress}%` }" />
            </div>
            <p class="font-bold text-lg mt-1">
              {{ currentTaskProgress }}%
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-2">
              Evaluations
            </p>
            <p class="font-bold text-2xl text-gray-800">
              <span class="text-red-600">{{ completedEvalsCount }}</span> / {{ totalPossibleEvals }}
            </p>
          </div>
        </div>
      </header>

      <main class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- == Left Sidebar == -->
        <aside class="space-y-6">
          <!-- ... (Current Evaluation card is unchanged) ... -->
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
            <div v-if="participatingAthletes.length === 0" class="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
              <p>No athletes were selected for this session.</p>
              <NuxtLink :to="`/course-detail/${courseId}/session/${sessionId}`" class="text-sm text-blue-600 hover:underline mt-2 block">
                Go back to select participants
              </NuxtLink>
            </div>
            <div v-else class="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
              <button
                v-for="(athlete, index) in participatingAthletes"
                :key="athlete.id"
                class="w-full flex items-center p-3 rounded-lg text-left transition-colors"
                :class="[
                  currentAthleteIndex === index
                    ? 'bg-blue-100 text-blue-800 font-semibold shadow-sm'
                    : 'hover:bg-gray-50',
                  { 'bg-green-100 border-green-300': isEvalOfficiallyCompleted(athlete.id) },
                ]"
                @click="selectAthlete(index)"
              >
                <img :src="athlete.avatar" :alt="athlete.name" class="w-9 h-9 rounded-full mr-3">
                <span class="flex-grow">{{ athlete.name }}</span>
                <Icon
                  v-if="isEvalOfficiallyCompleted(athlete.id)"
                  name="mdi:check-circle"
                  class="text-green-500 flex-shrink-0"
                  size="1.25rem"
                />
              </button>
            </div>
          </div>
        </aside>

        <!-- ... (Right side Main Content is unchanged) ... -->
        <section v-if="participatingAthletes.length > 0 && currentTask && currentAthlete" class="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
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
            <!-- Performance stopwatch (counts up) -->
            <div class="flex items-center space-x-3 text-gray-600 bg-gray-100 p-2 rounded-lg">
              <Icon name="mdi:timer-outline" size="1.5rem" />
              <span class="font-mono text-xl font-bold">{{ formattedPerformanceTime }}</span>
              <button class="hover:text-gray-900" @click="togglePerformanceTimer">
                <Icon :name="isPerformanceTimerRunning ? 'mdi:pause' : 'mdi:play'" size="1.5rem" />
              </button>
              <button class="hover:text-gray-900" @click="resetPerformanceTimer(true)">
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
                @click="applyQuickScore(score.label)"
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
                class="w-full h-2 rounded-lg appearance-none cursor-pointer range-thumb"
                :style="{ background: `linear-gradient(to right, #9C1313 ${currentScores[metric.skill] || 0}%, #E5E7EB ${currentScores[metric.skill] || 0}%)` }"
                @input="selectedQuickScore = null"
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
            <button class="px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed" :disabled="isFirstEvaluation" @click="handlePrevious">
              ← Previous
            </button>
            <button
              class="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-lg disabled:bg-red-400 disabled:cursor-not-allowed"
              :disabled="isFinishButtonDisabled"
              :title="finishButtonTitle"
              @click="handleSaveAndNext"
            >
              <span v-if="isLastEvaluation">Finish Session</span>
              <span v-else>Save & Next →</span>
            </button>
          </div>
        </section>
      </main>
    </div>

    <ConfirmModal
      :show="showCancelModal"
      title="Cancel Live Session"
      message="Are you sure you want to cancel this session? All progress will be lost and you will be returned to the session details page."
      confirm-text="Yes, Cancel"
      cancel-text="Keep Evaluating"
      @close="showCancelModal = false"
      @confirm="executeCancellation"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Athlete, Task } from '~/composables/useCourses';
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConfirmModal from '~/components/ConfirmModal.vue';
import { useCourses } from '~/composables/useCourses';
import { useSessionReport } from '~/composables/useSessionReport';

interface EvaluationData {
  scores: Record<string, number>;
  notes: string;
  time: number;
}

// ===================================
// Setup
// ===================================
const route = useRoute();
const router = useRouter();
const { findSessionById, updateSessionStatus } = useCourses();
const { setReportData } = useSessionReport();

// ===================================
// Data Fetching
// ===================================
const courseId = computed(() => Number(route.params.id));
const sessionId = computed(() => Number(route.params.sessionId));
const data = computed(() => findSessionById(courseId.value, sessionId.value));
const course = computed(() => data.value.course);
const session = computed(() => data.value.session);

const participatingAthletes = computed<Athlete[]>(() => {
  if (!course.value?.athletes)
    return [];
  const athleteQuery = route.query.athletes;
  if (!athleteQuery || typeof athleteQuery !== 'string')
    return [];
  const participatingIds = athleteQuery.split(',').map(Number);
  return course.value.athletes.filter(athlete => participatingIds.includes(athlete.id));
});

// ===================================
// Core Reactive State
// ===================================
const evaluations = ref<Record<string, EvaluationData>>({}); // Temporary data store
const completedEvalKeys = ref<string[]>([]); // Source of truth for completion
const currentTaskIndex = ref(0);
const currentAthleteIndex = ref(0);
const selectedQuickScore = ref<string | null>(null);
const notes = ref('');
const currentScores = ref<Record<string, number>>({});
const sessionComplete = ref(false);
const showCancelModal = ref(false);

// ===================================
// Timer State
// ===================================
const sessionElapsedTime = ref(0);
const performanceElapsedTime = ref(0);
const isPerformanceTimerRunning = ref(false);
let sessionTimerId: NodeJS.Timeout | null = null;
let performanceTimerId: NodeJS.Timeout | null = null;
const quickScores = [
  { id: 1, label: 'Poor', value: 20 },
  { id: 2, label: 'Needs work', value: 40 },
  { id: 3, label: 'Average', value: 60 },
  { id: 4, label: 'Good', value: 80 },
  { id: 5, label: 'Excellent', value: 100 },
];

// =================================================================
// RE-ORDERED & CONSOLIDATED COMPUTED PROPERTIES
// =================================================================
const totalTasks = computed(() => session.value?.tasks.length || 0);
const totalPossibleEvals = computed(() => participatingAthletes.value.length * totalTasks.value);
const completedEvalsCount = computed(() => completedEvalKeys.value.length);

const currentTask = computed<Task | undefined>(() => session.value?.tasks[currentTaskIndex.value]);
const currentAthlete = computed<Athlete | undefined>(() => participatingAthletes.value[currentAthleteIndex.value]);

const overallProgress = computed(() => {
  if (totalPossibleEvals.value === 0)
    return 0;
  return Math.round((completedEvalsCount.value / totalPossibleEvals.value) * 100);
});

const currentTaskProgress = computed(() => {
  if (!currentTask.value || participatingAthletes.value.length === 0)
    return 0;
  const taskId = currentTask.value.id;
  const evalsForThisTask = completedEvalKeys.value.filter(key => key.endsWith(`-${taskId}`));
  return Math.round((evalsForThisTask.length / participatingAthletes.value.length) * 100);
});

const isFirstEvaluation = computed(() => currentAthleteIndex.value === 0 && currentTaskIndex.value === 0);
const isLastEvaluation = computed(() =>
  currentAthleteIndex.value === participatingAthletes.value.length - 1
  && currentTaskIndex.value === totalTasks.value - 1,
);

const areAllEvaluationsComplete = computed(() => {
  if (totalPossibleEvals.value === 0)
    return true;
  return completedEvalsCount.value === totalPossibleEvals.value;
});

const isFinishButtonDisabled = computed(() => {
  if (sessionComplete.value)
    return true;
  if (isLastEvaluation.value) {
    const isReadyToFinish = completedEvalsCount.value >= totalPossibleEvals.value - 1;
    return !isReadyToFinish;
  }
  return false;
});

const finishButtonTitle = computed(() => {
  if (isLastEvaluation.value && isFinishButtonDisabled.value) {
    return 'You must complete all other evaluations before finishing.';
  }
  return '';
});

const formattedSessionTime = computed(() => formatTime(sessionElapsedTime.value));
const formattedPerformanceTime = computed(() => formatTime(performanceElapsedTime.value));

// ===================================
// Core Logic Methods
// ===================================
function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function handleCancel() {
  showCancelModal.value = true;
}
function executeCancellation() {
  router.push(`/course-detail/${courseId.value}/session/${sessionId.value}`);
  showCancelModal.value = false;
}

function saveCurrentEvaluation() {
  if (!currentAthlete.value || !currentTask.value)
    return;
  const evalKey = `${currentAthlete.value.id}-${currentTask.value.id}`;
  evaluations.value[evalKey] = {
    scores: { ...currentScores.value },
    notes: notes.value,
    time: performanceElapsedTime.value,
  };
}

function handleSaveAndNext() {
  if (!currentAthlete.value || !currentTask.value)
    return;

  const currentEvalKey = `${currentAthlete.value.id}-${currentTask.value.id}`;
  saveCurrentEvaluation();

  if (!completedEvalKeys.value.includes(currentEvalKey)) {
    completedEvalKeys.value.push(currentEvalKey);
  }

  if (isLastEvaluation.value) {
    if (areAllEvaluationsComplete.value) {
      sessionComplete.value = true;
      if (sessionTimerId)
        clearInterval(sessionTimerId);
      pausePerformanceTimer();

      setReportData({
        course: course.value,
        session: session.value,
        participatingAthletes: participatingAthletes.value,
        evaluations: evaluations.value,
        totalSessionTime: sessionElapsedTime.value,
      });

      if (course.value && session.value) {
        updateSessionStatus(course.value.id, session.value.id, 'Complete');
      }

      router.push(`/course-detail/${courseId.value}/session/${sessionId.value}/report`);
    }
    return; // Stop here if it's the last eval.
  }

  // Navigate to the next evaluation
  if (currentAthleteIndex.value < participatingAthletes.value.length - 1) {
    currentAthleteIndex.value++;
  }
  else if (currentTaskIndex.value < totalTasks.value - 1) {
    currentTaskIndex.value++;
    currentAthleteIndex.value = 0;
  }
}

function handlePrevious() {
  if (isFirstEvaluation.value)
    return;
  saveCurrentEvaluation();

  if (currentAthleteIndex.value > 0) {
    currentAthleteIndex.value--;
  }
  else if (currentTaskIndex.value > 0) {
    currentTaskIndex.value--;
    currentAthleteIndex.value = participatingAthletes.value.length - 1;
  }
}

function selectAthlete(index: number) {
  if (currentAthleteIndex.value !== index) {
    saveCurrentEvaluation();
    currentAthleteIndex.value = index;
  }
}

function nextTask() {
  if (currentTaskIndex.value < totalTasks.value - 1) {
    saveCurrentEvaluation();
    currentTaskIndex.value++;
    currentAthleteIndex.value = 0;
  }
}

function prevTask() {
  if (currentTaskIndex.value > 0) {
    saveCurrentEvaluation();
    currentTaskIndex.value--;
    currentAthleteIndex.value = 0;
  }
}

function applyQuickScore(label: string) {
  selectedQuickScore.value = label;
  const score = quickScores.find(s => s.label === label);
  if (score && currentTask.value) {
    const newScores: Record<string, number> = {};
    for (const metric of currentTask.value.skillMetrics) {
      newScores[metric.skill] = score.value;
    }
    currentScores.value = newScores;
  }
}

function isEvalOfficiallyCompleted(athleteId: number): boolean {
  if (!currentTask.value)
    return false;
  const evalKey = `${athleteId}-${currentTask.value.id}`;
  return completedEvalKeys.value.includes(evalKey);
}

// Timer Controls
function pausePerformanceTimer() {
  if (performanceTimerId) {
    clearInterval(performanceTimerId);
    performanceTimerId = null;
  }
  isPerformanceTimerRunning.value = false;
}
function startPerformanceTimer() {
  if (isPerformanceTimerRunning.value || sessionComplete.value)
    return;
  isPerformanceTimerRunning.value = true;
  performanceTimerId = setInterval(() => {
    performanceElapsedTime.value++;
  }, 1000);
}
function togglePerformanceTimer() {
  if (isPerformanceTimerRunning.value) {
    pausePerformanceTimer();
  }
  else {
    startPerformanceTimer();
  }
}
function resetPerformanceTimer(manualStart = false) {
  pausePerformanceTimer();
  performanceElapsedTime.value = 0;
  if (manualStart) {
    startPerformanceTimer();
  }
}

// ===================================
// Watchers & Lifecycle Hooks
// ===================================
watch([currentAthleteIndex, currentTaskIndex], () => {
  resetPerformanceTimer();
  startPerformanceTimer();
  selectedQuickScore.value = null;

  if (!currentAthlete.value || !currentTask.value) {
    currentScores.value = {};
    notes.value = '';
    return;
  }

  const evalKey = `${currentAthlete.value.id}-${currentTask.value.id}`;
  const existingEval = evaluations.value[evalKey];

  if (existingEval) {
    currentScores.value = { ...existingEval.scores };
    notes.value = existingEval.notes;
    performanceElapsedTime.value = existingEval.time;
  }
  else {
    const defaultScores: Record<string, number> = {};
    if (currentTask.value.skillMetrics) {
      for (const metric of currentTask.value.skillMetrics) {
        defaultScores[metric.skill] = 0;
      }
    }
    currentScores.value = defaultScores;
    notes.value = '';
  }
}, { immediate: true });

onMounted(() => {
  sessionTimerId = setInterval(() => {
    if (!sessionComplete.value)
      sessionElapsedTime.value++;
  }, 1000);
});

onUnmounted(() => {
  if (sessionTimerId)
    clearInterval(sessionTimerId);
  pausePerformanceTimer();
});

useHead({
  title: () => (course.value ? `Live Session: ${course.value.title}` : 'Live Session'),
});

watchEffect(() => {
  if (route.matched.length > 0 && !session.value) {
    console.error('Session not found');
  }
});
</script>

<style>
/* This custom style for the thumb is still required */
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
  margin-top: -7px; /* Center thumb vertically */
}

.range-thumb::-moz-range-thumb {
  width: 14px; /* Adjust size to account for border */
  height: 14px;
  background: #9c1313;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
</style>
