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
            {{ course.name }}
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
                {{ findTaskSequence(currentTask.id) }}
              </div>
              <div>
                <h3 class="font-bold text-gray-900">
                  {{ currentTask.name }}
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ currentTask.description }}
                </p>
                <div class="flex flex-wrap gap-2 mt-3">
                  <span v-for="metric in currentTask.skill_weights" :key="metric.skill_name" class="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                    {{ metric.skill_name }}: {{ parseFloat(metric.weight) * 100 }}%
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
                :key="athlete.uuid"
                class="w-full flex items-center p-3 rounded-lg text-left transition-colors"
                :class="[
                  currentAthleteIndex === index
                    ? 'bg-blue-100 text-blue-800 font-semibold shadow-sm'
                    : 'hover:bg-gray-50',
                  { 'bg-green-100 border-green-300': isEvalOfficiallyCompleted(athlete.uuid) },
                ]"
                @click="selectAthlete(index)"
              >
                <NuxtImg :src="athlete.profile_image_url || '/public/default-profile.jpg'" :alt="athlete.name" class="w-9 h-9 rounded-full mr-3" />
                <span class="flex-grow">{{ athlete.name }}</span>
                <Icon
                  v-if="isEvalOfficiallyCompleted(athlete.uuid)"
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
              <img :src="currentAthlete.profile_image_url || '/public/default-profile.jpg'" :alt="currentAthlete.name" class="w-14 h-14 rounded-full mr-4">
              <div>
                <h2 class="text-xl font-bold text-gray-900">
                  <Icon name="mdi:star-outline" class="text-yellow-500 -mt-1 mr-1" />
                  Performance Scoring
                </h2>
                <p class="text-sm text-gray-600">
                  {{ currentAthlete.name }} - Task {{ findTaskSequence(currentTask.id) }}/{{ totalTasks }}: {{ currentTask.name }}
                </p>
              </div>
            </div>
            <!-- Performance stopwatch (counts up) -->
            <div class="flex items-center space-x-3 text-gray-600 bg-gray-100 p-2 rounded-lg">
              <Icon name="mdi:timer-outline" size="1.5rem" />
              <span class="font-mono text-xl font-bold">{{ formattedTaskTime }}</span>
              <button class="hover:text-gray-900" @click="toggleTaskTimer">
                <Icon :name="isTaskTimerRunning ? 'mdi:pause' : 'mdi:play'" size="1.5rem" />
              </button>
              <button class="hover:text-gray-900" @click="resetTaskTimer(true)">
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
            <div v-for="metric in currentTask.skill_weights" :key="metric.skill_id">
              <div class="flex justify-between items-center mb-1">
                <label class="font-semibold text-gray-700">
                  {{ metric.skill_name }}
                  <span class="ml-2 text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">{{ parseFloat(metric.weight) * 100 }}%</span>
                </label>
                <span class="font-bold text-gray-800">{{ currentScores[metric.skill_id] || 0 }}%</span>
              </div>
              <input
                v-model.number="currentScores[metric.skill_id]"
                type="range"
                min="0"
                max="100"
                step="5"
                class="w-full h-2 rounded-lg appearance-none cursor-pointer range-thumb"
                :style="{ background: `linear-gradient(to right, #9C1313 ${currentScores[metric.skill_id] || 0}%, #E5E7EB ${currentScores[metric.skill_id] || 0}%)` }"
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
import type { Attendee, Session, SessionCompletionPayload, Task, TaskCompletionPayload } from '~/types/course';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConfirmModal from '~/components/ConfirmModal.vue';
import { useCourses } from '~/composables/useCourses';
import { useSubmit } from '~/composables/useSubmit';

interface EvaluationData {
  scores: Record<number, number>; // skillId -> score (0-100)
  notes: string;
  time: number;
}

// ===================================
// Setup & Data Fetching
// ===================================
const route = useRoute();
const router = useRouter();
const { fetchCourseById, updateSessionStatus, saveSessionCompletions } = useCourses();

const courseId = computed(() => Number(route.params.id));
const sessionId = computed(() => Number(route.params.sessionId));

const { data: course, pending: coursePending } = await fetchCourseById(courseId.value);

const session = computed<Session | undefined>(() => {
  return course.value?.sessions.find(s => s.id === sessionId.value);
});

const participatingAthletes = computed<Attendee[]>(() => {
  if (!course.value?.attendees)
    return [];
  const athleteQuery = route.query.athletes;
  if (!athleteQuery || typeof athleteQuery !== 'string')
    return course.value.attendees;
  const participatingUuids = athleteQuery.split(',');
  return course.value.attendees.filter(athlete => participatingUuids.includes(athlete.uuid));
});

// ===================================
// Core Reactive State
// ===================================
const evaluations = ref<Record<string, EvaluationData>>({});
const completedEvalKeys = ref<string[]>([]);
const currentTaskIndex = ref(0);
const currentAthleteIndex = ref(0);
const selectedQuickScore = ref<string | null>(null);
const notes = ref('');
const currentScores = ref<Record<number, number>>({});
const sessionComplete = ref(false);
const showCancelModal = ref(false);

const quickScores = [
  { id: 1, label: 'Poor', value: 20 },
  { id: 2, label: 'Needs work', value: 40 },
  { id: 3, label: 'Average', value: 60 },
  { id: 4, label: 'Good', value: 80 },
  { id: 5, label: 'Excellent', value: 100 },
];

// ===================================
// Timer State
// ===================================
const sessionElapsedTime = ref(0);
const taskElapsedTime = ref(0);
const isTaskTimerRunning = ref(false);
let sessionTimerId: NodeJS.Timeout | null = null;
let taskTimerId: NodeJS.Timeout | null = null;

// ===================================
// Computed Properties - *** THIS SECTION IS CORRECTED ***
// ===================================

const tasks = computed<Task[]>(() => session.value?.tasks.map(st => st.task) || []);
const totalTasks = computed(() => tasks.value.length);
const totalPossibleEvals = computed(() => participatingAthletes.value.length * totalTasks.value);
const completedEvalsCount = computed(() => new Set(completedEvalKeys.value).size);

// **FIX 2**: `currentTask` is now correctly derived from the fixed `tasks` array.
const currentTask = computed<Task | undefined>(() => tasks.value[currentTaskIndex.value]);
const currentAthlete = computed<Attendee | undefined>(() => participatingAthletes.value[currentAthleteIndex.value]);

const overallProgress = computed(() => totalPossibleEvals.value === 0 ? 0 : Math.round((completedEvalsCount.value / totalPossibleEvals.value) * 100));
const currentTaskProgress = computed(() => {
  if (!currentTask.value)
    return 0;
  const evalsForThisTask = completedEvalKeys.value.filter(key => key.endsWith(`-${currentTask.value?.id}`)).length;
  return participatingAthletes.value.length > 0 ? Math.round((evalsForThisTask / participatingAthletes.value.length) * 100) : 0;
});
const isFirstEvaluation = computed(() => currentAthleteIndex.value === 0 && currentTaskIndex.value === 0);
const isLastEvaluation = computed(() => currentAthleteIndex.value === participatingAthletes.value.length - 1 && currentTaskIndex.value === totalTasks.value - 1);

const { submit: performSaveScores, loading: isSaving } = useSubmit(
  (payload: { sessionId: number; data: SessionCompletionPayload }) => saveSessionCompletions(payload.sessionId, payload.data),
  {
    onSuccess: async () => {
      await updateSessionStatus(sessionId.value, 'Complete');
      alert('Session completed and scores saved!');
      router.push(`/course-detail/${courseId.value}/session/${sessionId.value}/report`);
    },
    onError: (err) => {
      alert(`Failed to save session scores: ${err.message || 'Unknown error'}`);
      sessionComplete.value = false;
    },
  },
);

const isFinishButtonDisabled = computed(() => {
  return isSaving.value;
});

const finishButtonTitle = computed(() => {
  if (isLastEvaluation.value && completedEvalsCount.value < totalPossibleEvals.value) {
    return `You can finish, but ${totalPossibleEvals.value - completedEvalsCount.value} evaluations are still incomplete.`;
  }
  return 'Finish and save all evaluations';
});

const formattedSessionTime = computed(() => formatTime(sessionElapsedTime.value));
const formattedTaskTime = computed(() => formatTime(taskElapsedTime.value));

// ===================================
// Core Logic & Methods
// ===================================
function findTaskSequence(taskId: number): number {
  const sessionTask = session.value?.tasks.find(st => st.task.id === taskId);
  return sessionTask?.sequence || 0;
}

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
}

function saveCurrentEvaluation() {
  if (!currentAthlete.value || !currentTask.value)
    return;
  const evalKey = `${currentAthlete.value.uuid}-${currentTask.value.id}`;
  evaluations.value[evalKey] = {
    scores: { ...currentScores.value },
    notes: notes.value,
    time: taskElapsedTime.value,
  };
  if (!completedEvalKeys.value.includes(evalKey)) {
    completedEvalKeys.value.push(evalKey);
  }
}

function handleSaveAndNext() {
  saveCurrentEvaluation();

  if (isLastEvaluation.value) {
    finishSession();
    return;
  }

  if (currentAthleteIndex.value < participatingAthletes.value.length - 1) {
    currentAthleteIndex.value++;
  }
  else if (currentTaskIndex.value < totalTasks.value - 1) {
    currentTaskIndex.value++;
    currentAthleteIndex.value = 0;
  }
}

async function finishSession() {
  if (sessionComplete.value || isSaving.value)
    return;

  // Ensure the very last evaluation is saved before proceeding
  saveCurrentEvaluation();

  sessionComplete.value = true;
  pauseTaskTimer();
  if (sessionTimerId)
    clearInterval(sessionTimerId);

  const completions: TaskCompletionPayload[] = [];
  for (const [key, evalData] of Object.entries(evaluations.value)) {
    const lastDashIndex = key.lastIndexOf('-');
    if (lastDashIndex === -1)
      continue;
    const athleteUuid = key.substring(0, lastDashIndex);
    const taskIdStr = key.substring(lastDashIndex + 1);
    const taskId = Number(taskIdStr);

    // now athleteUuid is the full UUID, taskId is correct
    const task = tasks.value.find(t => t.id === taskId);
    if (!task)
      continue;

    const totalWeightedScore = task.skill_weights.reduce((taskSum, metric) => {
      const scoreForSkill = evalData.scores[metric.skill_id] || 0;
      const weight = Number.parseFloat(metric.weight);
      return taskSum + (scoreForSkill * weight);
    }, 0);

    completions.push({
      athlete_uuid: athleteUuid,
      task_id: taskId,
      score: totalWeightedScore,
      scores: evalData.scores,
      notes: evalData.notes,
      time: evalData.time,
    });
  }

  const payload: SessionCompletionPayload = {
    completions,
    totalSessionTime: sessionElapsedTime.value, // <-- ADD THIS
  };

  await performSaveScores({ sessionId: sessionId.value, data: payload });
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
    const newScores: Record<number, number> = {};
    for (const metric of currentTask.value.skill_weights) {
      newScores[metric.skill_id] = score.value;
    }
    currentScores.value = newScores;
  }
}

function isEvalOfficiallyCompleted(athleteUuid: string): boolean {
  if (!currentTask.value)
    return false;
  const evalKey = `${athleteUuid}-${currentTask.value.id}`;
  return completedEvalKeys.value.includes(evalKey);
}

function pauseTaskTimer() {
  if (taskTimerId)
    clearInterval(taskTimerId);
  isTaskTimerRunning.value = false;
}
function startTaskTimer() {
  if (isTaskTimerRunning.value || sessionComplete.value)
    return;
  isTaskTimerRunning.value = true;
  taskTimerId = setInterval(() => {
    taskElapsedTime.value++;
  }, 1000);
}
function toggleTaskTimer() {
  if (isTaskTimerRunning.value)
    pauseTaskTimer();
  else startTaskTimer();
}
function resetTaskTimer(manualStart = false) {
  pauseTaskTimer();
  taskElapsedTime.value = 0;
  if (manualStart)
    startTaskTimer();
}

function loadEvaluationData() {
  selectedQuickScore.value = null;
  if (!currentAthlete.value || !currentTask.value) {
    currentScores.value = {};
    notes.value = '';
    return;
  }
  const evalKey = `${currentAthlete.value.uuid}-${currentTask.value.id}`;
  const existingEval = evaluations.value[evalKey];
  if (existingEval) {
    currentScores.value = { ...existingEval.scores };
    notes.value = existingEval.notes;
  }
  else {
    const defaultScores: Record<number, number> = {};
    currentTask.value.skill_weights.forEach((metric) => {
      defaultScores[metric.skill_id] = 0;
    });
    currentScores.value = defaultScores;
    notes.value = '';
  }
}

watch(currentAthleteIndex, () => {
  loadEvaluationData();
});
watch(currentTaskIndex, () => {
  resetTaskTimer();
  startTaskTimer();
  loadEvaluationData();
});

onMounted(() => {
  startTaskTimer();
  sessionTimerId = setInterval(() => {
    if (!sessionComplete.value)
      sessionElapsedTime.value++;
  }, 1000);
});

onUnmounted(() => {
  if (sessionTimerId)
    clearInterval(sessionTimerId);
  pauseTaskTimer();
});

useHead({
  title: () => (course.value ? `Live Session: ${course.value.name}` : 'Live Session'),
});
</script>
