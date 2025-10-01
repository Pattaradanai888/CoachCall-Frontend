<template>
  <div class="bg-gray-100 min-h-screen p-2 sm:p-4 lg:p-8 mt-[4.5rem]">
    <div v-if="pending || error || !session" class="flex flex-col items-center justify-center h-[70vh]">
      <h1 v-if="pending" class="text-2xl font-bold text-gray-700">
        Loading Session...
      </h1>
      <h1 v-else class="text-2xl font-bold text-gray-700">
        Session Data Not Found
      </h1>
      <p class="text-gray-500 mt-2">
        Please ensure the session exists and you have access.
      </p>
    </div>

    <div v-else class="max-w-7xl mx-auto">
      <!-- Responsive Header: Overall Progress -->
      <header class="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-4 sm:mb-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-6 mb-4 sm:mb-6">
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            {{ course?.name || 'Quick Session' }}
          </h1>
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-shrink-0">
            <span class="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full flex items-center">
              <Icon name="mdi:clock-outline" class="mr-1.5" />
              Active Time: {{ formattedSessionTime }}
            </span>
            <button class="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-200 rounded-full hover:bg-red-400 hover:text-red-900 transition flex items-center" @click="handleCancel">
              <Icon name="mdi:close-circle-outline" class="mr-1.5" />
              Cancel Session
            </button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
          <div>
            <p class="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
              Overall Progress
            </p>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-red-800 h-2 rounded-full transition-all duration-300" :style="{ width: `${overallProgress}%` }" />
            </div>
            <p class="font-bold text-base sm:text-lg mt-1">
              {{ overallProgress }}%
            </p>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
              Current Task Progress
            </p>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-red-800 h-2 rounded-full transition-all duration-300" :style="{ width: `${currentTaskProgress}%` }" />
            </div>
            <p class="font-bold text-base sm:text-lg mt-1">
              {{ currentTaskProgress }}%
            </p>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
              Evaluations
            </p>
            <p class="font-bold text-lg sm:text-2xl text-gray-800">
              <span class="text-red-800">{{ completedEvalsCount }}</span> / {{ totalPossibleEvals }}
            </p>
          </div>
        </div>
      </header>

      <!-- Responsive Main: Mobile-first stacked layout -->
      <main class="space-y-4 sm:space-y-6">
        <!-- Current Evaluation Section - Mobile: Full width -->
        <section class="bg-white rounded-xl shadow-md p-4 sm:p-6 space-y-4 sm:space-y-6 lg:hidden">
          <div>
            <div class="flex justify-between items-center mb-2 sm:mb-4">
              <h2 class="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                <Icon name="mdi:format-list-checks" class="mr-2" />
                Current Evaluation
              </h2>
              <div class="flex space-x-1">
                <button class="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" :disabled="currentTaskIndex === 0" @click="() => navigateTask('prev')">
                  <Icon name="mdi:chevron-left" />
                </button>
                <button class="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" :disabled="currentTaskIndex >= totalTasks - 1" @click="() => navigateTask('next')">
                  <Icon name="mdi:chevron-right" />
                </button>
              </div>
            </div>
            <p v-if="totalTasks > 0" class="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
              Task {{ currentTaskIndex + 1 }} of {{ totalTasks }}
            </p>
            <div v-if="currentTask" class="flex flex-col sm:flex-row items-start sm:space-x-4">
              <div class="flex-shrink-0 w-8 h-8 bg-red-800 text-white flex items-center justify-center rounded-full font-bold text-sm mb-2 sm:mb-0">
                {{ findTaskSequence(currentTask.id) }}
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-base sm:text-lg">
                  {{ currentTask.name }}
                </h3>
                <p class="text-xs sm:text-sm text-gray-600 mt-1">
                  {{ currentTask.description }}
                </p>
                <p class="text-xs sm:text-sm text-gray-500 mt-2 font-semibold">
                  <Icon name="mdi:target" class="mr-1 -mt-1" />
                  Target Duration: {{ currentTask.duration_minutes }} min
                </p>
              </div>
            </div>
            <div v-else class="text-gray-500">
              No tasks in this session.
            </div>
          </div>

          <hr class="border-gray-200">

          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-4 flex items-center">
              <Icon name="mdi:account-group-outline" class="mr-2" />
              Athletes
            </h2>
            <div v-if="participatingAthletes.length === 0" class="text-center text-gray-500 bg-gray-50 p-2 sm:p-4 rounded-lg">
              <p>No athletes were selected for this session.</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(athlete, index) in participatingAthletes"
                :key="athlete.uuid"
                class="w-full flex items-center p-2 sm:p-3 rounded-lg text-left transition-colors"
                :class="[
                  currentAthleteIndex === index
                    ? 'bg-blue-100 text-blue-800 font-semibold shadow-sm'
                    : 'hover:bg-gray-50',
                  { 'bg-green-100/50 border border-green-200': isAthleteFinished(athlete.uuid) },
                ]"
                @click="() => navigateToAthlete(index)"
              >
                <NuxtImg
                  :src="athlete.profile_image_url || '/default-profile.jpg'"
                  :alt="athlete.name"
                  format="webp"
                  width="36"
                  height="36"
                  loading="lazy"
                  class="w-9 h-9 rounded-full mr-2 sm:mr-3"
                />
                <span class="flex-grow text-xs sm:text-base">{{ athlete.name }}</span>
                <div class="relative group flex-shrink-0">
                  <button
                    v-if="isTimerRunningFor(athlete.uuid)"
                    class="p-1 rounded-full hover:bg-red-200 transition-colors"
                    @click.stop="markAthleteAsFinished(athlete.uuid)"
                  >
                    <Icon name="mdi:stop-circle-outline" class="text-red-700" size="1.2rem sm:1.5rem" />
                  </button>
                  <span class="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-max px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    Mark as Finished
                  </span>
                </div>
                <Icon
                  v-if="isAthleteFinished(athlete.uuid) && !isTimerRunningFor(athlete.uuid)"
                  name="mdi:check-circle"
                  class="text-green-600"
                  size="1rem sm:1.25rem"
                />
              </div>
            </div>
          </div>

          <div v-if="participatingAthletes.length > 0">
            <button
              class="w-full flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-white font-bold transition-colors text-sm sm:text-base"
              :class="unifiedButtonClass"
              @click="handleUnifiedTimerClick"
            >
              <Icon :name="unifiedButtonIcon" class="mr-2" size="1.1rem sm:1.25rem" />
              <span>{{ unifiedButtonText }}</span>
            </button>
          </div>
        </section>

        <!-- Desktop Layout: Grid for larger screens -->
        <div class="hidden lg:flex lg:gap-6">
          <!-- Current Evaluation Section - Desktop: Sidebar -->
          <aside class="bg-white rounded-xl shadow-md p-6 space-y-6 lg:w-1/3 lg:sticky lg:top-28 lg:self-start">
            <div>
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800 flex items-center">
                  <Icon name="mdi:format-list-checks" class="mr-2" />
                  Current Evaluation
                </h2>
                <div class="flex space-x-1">
                  <button class="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" :disabled="currentTaskIndex === 0" @click="() => navigateTask('prev')">
                    <Icon name="mdi:chevron-left" />
                  </button>
                  <button class="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50" :disabled="currentTaskIndex >= totalTasks - 1" @click="() => navigateTask('next')">
                    <Icon name="mdi:chevron-right" />
                  </button>
                </div>
              </div>
              <p v-if="totalTasks > 0" class="text-sm text-gray-500 mb-2">
                Task {{ currentTaskIndex + 1 }} of {{ totalTasks }}
              </p>
              <div v-if="currentTask" class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-8 h-8 bg-red-800 text-white flex items-center justify-center rounded-full font-bold text-sm">
                  {{ findTaskSequence(currentTask.id) }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-lg">
                    {{ currentTask.name }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ currentTask.description }}
                  </p>
                  <p class="text-sm text-gray-500 mt-2 font-semibold">
                    <Icon name="mdi:target" class="mr-1 -mt-1" />
                    Target Duration: {{ currentTask.duration_minutes }} min
                  </p>
                </div>
              </div>
              <div v-else class="text-gray-500">
                No tasks in this session.
              </div>
            </div>

            <hr class="border-gray-200">

            <div>
              <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Icon name="mdi:account-group-outline" class="mr-2" />
                Athletes
              </h2>
              <div v-if="participatingAthletes.length === 0" class="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
                <p>No athletes were selected for this session.</p>
              </div>
              <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-2">
                <div
                  v-for="(athlete, index) in participatingAthletes"
                  :key="athlete.uuid"
                  class="w-full flex items-center p-3 rounded-lg text-left transition-colors"
                  :class="[
                    currentAthleteIndex === index
                      ? 'bg-blue-100 text-blue-800 font-semibold shadow-sm'
                      : 'hover:bg-gray-50',
                    { 'bg-green-100/50 border border-green-200': isAthleteFinished(athlete.uuid) },
                  ]"
                  @click="() => navigateToAthlete(index)"
                >
                  <NuxtImg
                    :src="athlete.profile_image_url || '/default-profile.jpg'"
                    :alt="athlete.name"
                    format="webp"
                    width="36"
                    height="36"
                    loading="lazy"
                    class="w-9 h-9 rounded-full mr-3"
                  />
                  <span class="flex-grow">{{ athlete.name }}</span>
                  <div class="relative group flex-shrink-0">
                    <button
                      v-if="isTimerRunningFor(athlete.uuid)"
                      class="p-1 rounded-full hover:bg-red-200 transition-colors"
                      @click.stop="markAthleteAsFinished(athlete.uuid)"
                    >
                      <Icon name="mdi:stop-circle-outline" class="text-red-700" size="1.5rem" />
                    </button>
                    <span class="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-max px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                      Mark as Finished
                    </span>
                  </div>
                  <Icon
                    v-if="isAthleteFinished(athlete.uuid) && !isTimerRunningFor(athlete.uuid)"
                    name="mdi:check-circle"
                    class="text-green-600"
                    size="1.25rem"
                  />
                </div>
              </div>
            </div>

            <div v-if="participatingAthletes.length > 0">
              <button
                class="w-full flex items-center justify-center px-4 py-3 rounded-lg text-white font-bold transition-colors"
                :class="unifiedButtonClass"
                @click="handleUnifiedTimerClick"
              >
                <Icon :name="unifiedButtonIcon" class="mr-2" size="1.25rem" />
                <span>{{ unifiedButtonText }}</span>
              </button>
            </div>
          </aside>

          <!-- Performance Scoring Section - Desktop: Main content -->
          <section v-if="participatingAthletes.length > 0 && currentTask && currentAthlete" class="bg-white rounded-xl shadow-md p-6 lg:flex-1">
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center">
                <NuxtImg
                  :src="currentAthlete.profile_image_url || '/default-profile.jpg'"
                  :alt="currentAthlete.name"
                  format="webp"
                  width="56"
                  height="56"
                  :loading="currentAthleteIndex === 0 && currentTaskIndex === 0 ? 'eager' : 'lazy'"
                  class="w-14 h-14 rounded-full mr-4"
                />
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
              <div class="flex items-center space-x-3 text-gray-600 bg-gray-100 p-2 rounded-lg">
                <Icon name="mdi:timer-outline" size="1.5rem" />
                <span class="font-mono text-xl font-bold">{{ formattedTaskTime }}</span>
                <button class="hover:text-gray-900" @click="toggleTaskTimer">
                  <Icon :name="currentEval?.isTimerRunning ? 'mdi:pause-circle' : 'mdi:play-circle'" size="1.7rem" :class="currentEval?.isTimerRunning ? 'text-red-600' : 'text-green-600'" />
                </button>
                <button class="hover:text-gray-900" @click="resetTaskTimer">
                  <Icon name="mdi:reload" size="1.5rem" />
                </button>
              </div>
            </div>

            <div class="mb-8">
              <h3 class="text-sm font-bold text-gray-600 mb-3">
                Quick Score
              </h3>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                <button
                  v-for="score in quickScores" :key="score.label"
                  class="px-4 py-1.5 text-sm border rounded-full transition-colors"
                  :class="[
                    selectedQuickScore === score.label
                      ? 'bg-red-800 text-white border-red-800 font-bold'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100',
                  ]"
                  @click="applyQuickScore(score.label)"
                >
                  {{ score.label }}
                </button>
              </div>
            </div>

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
                  :style="{ background: `linear-gradient(to right, #991B1B ${currentScores[metric.skill_id] || 0}%, #E5E7EB ${currentScores[metric.skill_id] || 0}%)` }"
                  @input="isDirty = true; selectedQuickScore = null;"
                >
              </div>
            </div>

            <div class="mb-6">
              <label for="notes-desktop" class="font-semibold text-gray-700 mb-2 block">Notes</label>
              <textarea
                id="notes-desktop"
                v-model="notes"
                rows="4"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                placeholder="Optional notes about the athlete's performance"
                @input="isDirty = true"
              />
            </div>

            <div class="flex justify-between items-center border-t pt-6">
              <button class="px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed" :disabled="isFirstEvaluation" @click="handlePrevious">
                ← Previous
              </button>
              <div class="relative group">
                <button
                  class="px-6 py-3 bg-red-800 text-white rounded-lg font-bold hover:bg-red-900 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  :disabled="isSaveButtonDisabled"
                  @click="handleSaveAndNext"
                >
                  <span v-if="isLastEvaluation">Finish Session</span>
                  <span v-else>Save & Next →</span>
                </button>
                <span
                  v-if="isSaveButtonDisabled"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                >
                  {{ saveButtonTooltip }}
                </span>
              </div>
            </div>
          </section>
        </div>

        <!-- Performance Scoring Section - Mobile: Full width -->
        <section v-if="participatingAthletes.length > 0 && currentTask && currentAthlete" class="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:hidden">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
            <div class="flex items-center mb-2 sm:mb-0">
              <NuxtImg
                :src="currentAthlete.profile_image_url || '/default-profile.jpg'"
                :alt="currentAthlete.name"
                format="webp"
                width="44"
                height="44"
                :loading="currentAthleteIndex === 0 && currentTaskIndex === 0 ? 'eager' : 'lazy'"
                class="w-11 h-11 rounded-full mr-3"
              />
              <div>
                <h2 class="text-base font-bold text-gray-900">
                  <Icon name="mdi:star-outline" class="text-yellow-500 -mt-1 mr-1" />
                  Performance Scoring
                </h2>
                <p class="text-xs text-gray-600">
                  {{ currentAthlete.name }} - Task {{ findTaskSequence(currentTask.id) }}/{{ totalTasks }}: {{ currentTask.name }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-gray-600 bg-gray-100 p-1 rounded-lg">
              <Icon name="mdi:timer-outline" size="1.2rem" />
              <span class="font-mono text-base font-bold">{{ formattedTaskTime }}</span>
              <button class="hover:text-gray-900" @click="toggleTaskTimer">
                <Icon :name="currentEval?.isTimerRunning ? 'mdi:pause-circle' : 'mdi:play-circle'" size="1.3rem" :class="currentEval?.isTimerRunning ? 'text-red-600' : 'text-green-600'" />
              </button>
              <button class="hover:text-gray-900" @click="resetTaskTimer">
                <Icon name="mdi:reload" size="1.2rem" />
              </button>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-xs font-bold text-gray-600 mb-2">
              Quick Score
            </h3>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
              <button
                v-for="score in quickScores" :key="score.label"
                class="px-3 py-1 text-xs border rounded-full transition-colors"
                :class="[
                  selectedQuickScore === score.label
                    ? 'bg-red-800 text-white border-red-800 font-bold'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100',
                ]"
                @click="applyQuickScore(score.label)"
              >
                {{ score.label }}
              </button>
            </div>
          </div>

          <div class="space-y-4 mb-4">
            <div v-for="metric in currentTask.skill_weights" :key="metric.skill_id">
              <div class="flex justify-between items-center mb-1">
                <label class="font-semibold text-gray-700 text-xs">
                  {{ metric.skill_name }}
                  <span class="ml-2 text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">{{ parseFloat(metric.weight) * 100 }}%</span>
                </label>
                <span class="font-bold text-gray-800 text-xs">{{ currentScores[metric.skill_id] || 0 }}%</span>
              </div>
              <input
                v-model.number="currentScores[metric.skill_id]"
                type="range"
                min="0"
                max="100"
                step="5"
                class="w-full h-2 rounded-lg appearance-none cursor-pointer range-thumb"
                :style="{ background: `linear-gradient(to right, #991B1B ${currentScores[metric.skill_id] || 0}%, #E5E7EB ${currentScores[metric.skill_id] || 0}%)` }"
                @input="isDirty = true; selectedQuickScore = null;"
              >
            </div>
          </div>

          <div class="mb-4">
            <label for="notes-mobile" class="font-semibold text-gray-700 mb-1 block text-xs">Notes</label>
            <textarea
              id="notes-mobile"
              v-model="notes"
              rows="3"
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-xs"
              placeholder="Optional notes about the athlete's performance"
              @input="isDirty = true"
            />
          </div>

          <div class="flex flex-col sm:flex-row justify-between items-center border-t pt-4 gap-2 sm:gap-0">
            <button class="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs" :disabled="isFirstEvaluation" @click="handlePrevious">
              ← Previous
            </button>
            <div class="relative group w-full sm:w-auto">
              <button
                class="w-full sm:w-auto px-4 py-2 bg-red-800 text-white rounded-lg font-bold hover:bg-red-900 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-xs"
                :disabled="isSaveButtonDisabled"
                @click="handleSaveAndNext"
              >
                <span v-if="isLastEvaluation">Finish Session</span>
                <span v-else>Save & Next →</span>
              </button>
              <span
                v-if="isSaveButtonDisabled"
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              >
                {{ saveButtonTooltip }}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>

    <ConfirmModal
      :show="showCancelModal"
      title="Cancel Live Session"
      message="Are you sure you want to cancel this session? All progress will be lost."
      @close="showCancelModal = false"
      @confirm="executeCancellation"
    />
    <ConfirmModal
      :show="showDirtyNavModal"
      title="Unsaved Changes"
      message="You have unsaved changes. Do you want to save them before moving?"
      confirm-text="Save and Continue"
      cancel-text="Discard and Continue"
      @close="showDirtyNavModal = false"
      @confirm="confirmDirtyNavigation"
      @cancel="cancelDirtyNavigation"
    />
    <NotificationModal
      :show="showNotificationModal"
      :title="notificationTitle"
      :message="notificationMessage"
      :type="notificationType"
      @close="handleNotificationClose"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Attendee, Session, SessionCompletionPayload, Task, TaskCompletionPayload } from '~/types/course';

type TimerState = 'ALL_RUNNING' | 'ALL_PAUSED' | 'MIXED';

interface EvaluationData {
  scores: Record<number, number>;
  notes: string;
  time: number;
  isTimerRunning: boolean;
  isFinished: boolean;
}

const route = useRoute();
const router = useRouter();
// MODIFIED: Import fetchSessionById
const { fetchCourseById, updateSessionStatus, saveSessionCompletions, fetchSessionById } = useCourses();
const { fetchAllAthleteSelectionInfo } = useAthleteData();

const mode = computed<'course' | 'quick'>(() => (route.params.id === 'quick' ? 'quick' : 'course'));
const courseId = computed(() => (mode.value === 'course' ? Number(route.params.id) : null));
const sessionId = computed(() => Number(route.params.sessionId));

// This part for fetching course data remains the same for 'course' mode
const { data: course, pending: coursePending, error: courseError } = await useAsyncData(
  `course-for-start-${courseId.value || 'quick'}`,
  () => (mode.value === 'course' && courseId.value ? fetchCourseById(courseId.value).then(r => r.data.value) : Promise.resolve(null)),
);

// NEW: Fetch the session data separately, using the appropriate method based on the mode.
const { data: session, pending: sessionPending, error: sessionError } = await useAsyncData<Session | null>(
  `session-start-details-${sessionId.value}`,
  () => {
    if (Number.isNaN(sessionId.value))
      return Promise.resolve(null);

    // If it's a quick session, fetch the specific session instance directly.
    if (mode.value === 'quick') {
      return fetchSessionById(sessionId.value).then(r => r.data.value);
    }

    // For a course session, we can find it within the already-fetched course data.
    if (course.value?.sessions) {
      return Promise.resolve(course.value.sessions.find(s => s.id === sessionId.value) || null);
    }

    return Promise.resolve(null);
  },
  {
    watch: [course], // Re-run if course data changes
  },
);

const { data: allCoachAthletes, pending: athletesPending } = await fetchAllAthleteSelectionInfo();

// REMOVED: The old `session` computed property and `allSessionTemplates` fetch are gone.

const participatingAthletes = computed<Attendee[]>(() => {
  const athleteQuery = route.query.athletes;
  if (typeof athleteQuery !== 'string' || !athleteQuery || !allCoachAthletes.value) {
    return [];
  }
  const participatingUuids = athleteQuery.split(',');
  return allCoachAthletes.value.filter(athlete =>
    participatingUuids.includes(athlete.uuid),
  );
});

// MODIFIED: Updated pending and error states
const pending = computed(() => sessionPending.value || athletesPending.value || (mode.value === 'course' && coursePending.value));
const error = computed(() => sessionError.value || (mode.value === 'course' && courseError.value));

// ... THE REST OF THE SCRIPT REMAINS EXACTLY THE SAME ...
// (evaluations ref, computed properties like currentTask, overallProgress, etc. are all fine)

const evaluations = ref<Record<string, EvaluationData>>({});
const completedEvalKeys = ref<string[]>([]);
const currentTaskIndex = ref(0);
const currentAthleteIndex = ref(0);
const sessionElapsedTime = ref(0);
let sessionTimerId: NodeJS.Timeout | null = null;
let taskTimerIntervalId: NodeJS.Timeout | null = null;
const isSessionTimerActive = ref(false);

const showCancelModal = ref(false);
const showDirtyNavModal = ref(false);
let navigationCallback: (() => void) | null = null;
const isDirty = ref(false);

const showNotificationModal = ref(false);
const notificationTitle = ref('');
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');

const quickScores = [
  { label: 'Poor', value: 20 },
  { label: 'Needs Work', value: 40 },
  { label: 'Average', value: 60 },
  { label: 'Good', value: 80 },
  { label: 'Excellent', value: 100 },
];
const selectedQuickScore = ref<string | null>(null);

const tasks = computed<Task[]>(() => session.value?.tasks.map(st => st.task) || []);
const totalTasks = computed(() => tasks.value.length);
const totalPossibleEvals = computed(() => participatingAthletes.value.length * totalTasks.value);
const completedEvalsCount = computed(() => new Set(completedEvalKeys.value).size);

const currentTask = computed<Task | undefined>(() => tasks.value[currentTaskIndex.value]);
const currentAthlete = computed<Attendee | undefined>(() => participatingAthletes.value[currentAthleteIndex.value]);
const currentEvalKey = computed(() => currentAthlete.value && currentTask.value ? `${currentAthlete.value.uuid}-${currentTask.value.id}` : '');
const currentEval = computed(() => evaluations.value[currentEvalKey.value]);

const currentScores = ref<Record<number, number>>({});
const notes = ref('');

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
  saveSessionCompletions,
  {
    onSuccess: async () => {
      await updateSessionStatus(sessionId.value, 'Complete');
      notificationTitle.value = 'Session Saved!';
      notificationMessage.value = 'The session was completed and scores were saved successfully. You will now be redirected to the report.';
      notificationType.value = 'success';
      showNotificationModal.value = true;
    },
    onError: (err: string) => {
      notificationTitle.value = 'Save Failed';
      notificationMessage.value = `There was an error saving the session:\n\n${err}`;
      notificationType.value = 'error';
      showNotificationModal.value = true;
    },
  },
);

const isSaveButtonDisabled = computed(() => {
  if (isSaving.value)
    return true;
  if (!currentEval.value)
    return true;
  return !currentEval.value.isFinished;
});

const saveButtonTooltip = computed(() => {
  if (currentEval.value && !currentEval.value.isFinished) {
    return 'Click the stop icon on the athlete\'s list to mark them as finished before saving.';
  }
  return '';
});



const formattedSessionTime = computed(() => formatTime(sessionElapsedTime.value));
const formattedTaskTime = computed(() => formatTime(currentEval.value?.time || 0));

const timersState = computed<TimerState>(() => {
  if (!currentTask.value || participatingAthletes.value.length === 0)
    return 'ALL_PAUSED';
  // Only consider athletes who are NOT finished for the current task
  const unfinishedAthletes = participatingAthletes.value.filter(
    athlete => !isAthleteFinished(athlete.uuid)
  );
  if (unfinishedAthletes.length === 0) return 'ALL_PAUSED';
  const runningCount = unfinishedAthletes.filter(athlete => isTimerRunningFor(athlete.uuid)).length;
  if (runningCount === 0)
    return 'ALL_PAUSED';
  if (runningCount === unfinishedAthletes.length)
    return 'ALL_RUNNING';
  return 'MIXED';
});

const unifiedButtonText = computed(() => {
  switch (timersState.value) {
    case 'ALL_RUNNING': return 'Pause All Timers';
    case 'MIXED': return 'Resume Paused';
    case 'ALL_PAUSED':
    default: return 'Start All Timers';
  }
});

const unifiedButtonIcon = computed(() => {
  switch (timersState.value) {
    case 'ALL_RUNNING': return 'mdi:pause';
    case 'MIXED': return 'mdi:play-pause';
    case 'ALL_PAUSED':
    default: return 'mdi:play';
  }
});

const unifiedButtonClass = computed(() => {
  switch (timersState.value) {
    case 'ALL_RUNNING': return 'bg-slate-600 hover:bg-slate-700';
    case 'MIXED': return 'bg-blue-600 hover:bg-blue-700';
    case 'ALL_PAUSED':
    default: return 'bg-red-800 hover:bg-red-900';
  }
});

function handleUnifiedTimerClick() {
  switch (timersState.value) {
    case 'ALL_RUNNING':
      pauseAllTimersForCurrentTask();
      break;
    case 'MIXED':
    case 'ALL_PAUSED':
      startAllTimersForCurrentTask();
      break;
  }
}

function initializeEvaluations() {
  if (!participatingAthletes.value || !tasks.value || tasks.value.length === 0)
    return;
  const initialEvals: Record<string, EvaluationData> = {};
  for (const athlete of participatingAthletes.value) {
    for (const task of tasks.value) {
      const key = `${athlete.uuid}-${task.id}`;
      const defaultScores = task.skill_weights.reduce((acc, metric) => {
        acc[metric.skill_id] = 0;
        return acc;
      }, {} as Record<number, number>);
      initialEvals[key] = {
        scores: defaultScores,
        notes: '',
        time: 0,
        isTimerRunning: false,
        isFinished: false,
      };
    }
  }
  evaluations.value = initialEvals;
  loadCurrentEvaluationForm();
}

function loadCurrentEvaluationForm() {
  if (currentEval.value) {
    currentScores.value = { ...currentEval.value.scores };
    notes.value = currentEval.value.notes;
    isDirty.value = false;
    selectedQuickScore.value = null;
  }
}

function saveCurrentEvaluation() {
  if (!currentEval.value || !currentEvalKey.value)
    return;

  // Save scores and notes
  evaluations.value[currentEvalKey.value].scores = { ...currentScores.value };
  evaluations.value[currentEvalKey.value].notes = notes.value;

  // Mark as finished and stop timer if not already finished
  if (!currentEval.value.isFinished) {
    currentEval.value.isFinished = true;
    currentEval.value.isTimerRunning = false;
  }

  isDirty.value = false;
  if (!completedEvalKeys.value.includes(currentEvalKey.value)) {
    completedEvalKeys.value.push(currentEvalKey.value);
  }
}

function navigateWithDirtyCheck(callback: () => void) {
  if (isDirty.value) {
    navigationCallback = callback;
    showDirtyNavModal.value = true;
  }
  else {
    callback();
  }
}

function navigateToAthlete(index: number) {
  if (index === currentAthleteIndex.value)
    return;
  navigateWithDirtyCheck(() => {
    currentAthleteIndex.value = index;
  });
}

function navigateTask(direction: 'next' | 'prev') {
  pauseAllTimersForCurrentTask();
  navigateWithDirtyCheck(() => {
    if (direction === 'next' && currentTaskIndex.value < totalTasks.value - 1) {
      currentTaskIndex.value++;
      currentAthleteIndex.value = 0;
    }
    else if (direction === 'prev' && currentTaskIndex.value > 0) {
      currentTaskIndex.value--;
      currentAthleteIndex.value = participatingAthletes.value.length - 1;
    }
  });
}

function confirmDirtyNavigation() {
  saveCurrentEvaluation();
  if (navigationCallback)
    navigationCallback();
  resetAndCloseDirtyModal();
}

function cancelDirtyNavigation() {
  loadCurrentEvaluationForm();
  if (navigationCallback)
    navigationCallback();
  resetAndCloseDirtyModal();
}

function resetAndCloseDirtyModal() {
  showDirtyNavModal.value = false;
  navigationCallback = null;
}

function handleSaveAndNext() {
  saveCurrentEvaluation();
  if (isLastEvaluation.value) {
    finishSession();
  }
  else {
    if (currentAthleteIndex.value < participatingAthletes.value.length - 1) {
      currentAthleteIndex.value++;
    }
    else if (currentTaskIndex.value < totalTasks.value - 1) {
      pauseAllTimersForCurrentTask();
      currentTaskIndex.value++;
      currentAthleteIndex.value = 0;
    }
  }
}

function handlePrevious() {
  navigateWithDirtyCheck(() => {
    saveCurrentEvaluation();
    if (currentAthleteIndex.value > 0) {
      currentAthleteIndex.value--;
    }
    else if (currentTaskIndex.value > 0) {
      pauseAllTimersForCurrentTask();
      currentTaskIndex.value--;
      currentAthleteIndex.value = participatingAthletes.value.length - 1;
    }
  });
}

function markAthleteAsFinished(athleteUuid: string) {
  if (!currentTask.value)
    return;
  const key = `${athleteUuid}-${currentTask.value.id}`;
  const evaluation = evaluations.value[key];
  if (evaluation && evaluation.isTimerRunning) {
    evaluation.isTimerRunning = false;
    evaluation.isFinished = true;
  }
}

function toggleTaskTimer() {
  if (!currentEval.value || !currentEvalKey.value)
    return;
  if (currentEval.value.isFinished) {
    // Unmark as finished and resume timer
    currentEval.value.isFinished = false;
    currentEval.value.isTimerRunning = true;
    // Remove from completedEvalKeys if present
    const idx = completedEvalKeys.value.indexOf(currentEvalKey.value);
    if (idx !== -1) completedEvalKeys.value.splice(idx, 1);
    isDirty.value = true;
  } else {
    currentEval.value.isTimerRunning = !currentEval.value.isTimerRunning;
    isDirty.value = true;
  }
}

function resetTaskTimer() {
  if (!currentEval.value || !currentEvalKey.value)
    return;
  currentEval.value.time = 0;
  currentEval.value.isFinished = false;
  currentEval.value.isTimerRunning = false;
  // Remove from completedEvalKeys if present
  const idx = completedEvalKeys.value.indexOf(currentEvalKey.value);
  if (idx !== -1) completedEvalKeys.value.splice(idx, 1);
  isDirty.value = true;
}

function startAllTimersForCurrentTask() {
  if (!currentTask.value)
    return;
  resumeSessionTimer();
  for (const athlete of participatingAthletes.value) {
    const key = `${athlete.uuid}-${currentTask.value.id}`;
    const evaluation = evaluations.value[key];
    if (evaluation && !evaluation.isFinished) {
      evaluation.isTimerRunning = true;
    }
  }
}

function pauseAllTimersForCurrentTask() {
  if (!currentTask.value)
    return;
  for (const athlete of participatingAthletes.value) {
    const key = `${athlete.uuid}-${currentTask.value.id}`;
    if (evaluations.value[key]) {
      evaluations.value[key].isTimerRunning = false;
    }
  }
}

function pauseSessionTimer() {
  isSessionTimerActive.value = false;
}

function resumeSessionTimer() {
  isSessionTimerActive.value = true;
}

function startTimers() {
  sessionTimerId = setInterval(() => {
    if (isSessionTimerActive.value) {
      sessionElapsedTime.value++;
    }
  }, 1000);

  taskTimerIntervalId = setInterval(() => {
    let anyTaskTimerRunning = false;
    Object.keys(evaluations.value).forEach((key) => {
      const evalItem = evaluations.value[key];
      if (evalItem.isTimerRunning) {
        evalItem.time++;
        anyTaskTimerRunning = true;
      }
    });
    if (!anyTaskTimerRunning) {
      pauseSessionTimer();
    }
    else {
      resumeSessionTimer();
    }
  }, 1000);
}

function stopTimers() {
  if (sessionTimerId)
    clearInterval(sessionTimerId);
  if (taskTimerIntervalId)
    clearInterval(taskTimerIntervalId);
}

function isTimerRunningFor(athleteUuid: string): boolean {
  if (!currentTask.value)
    return false;
  const key = `${athleteUuid}-${currentTask.value.id}`;
  return evaluations.value[key]?.isTimerRunning || false;
}

function isAthleteFinished(athleteUuid: string): boolean {
  if (!currentTask.value)
    return false;
  const key = `${athleteUuid}-${currentTask.value.id}`;
  return evaluations.value[key]?.isFinished || false;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function executeCancellation() {
  const destination = mode.value === 'course' ? `/course-detail/${courseId.value}` : '/course-management';
  router.push(destination);
}

function findTaskSequence(taskId: number): number {
  return session.value?.tasks.find(st => st.task.id === taskId)?.sequence || 0;
}

function applyQuickScore(label: string) {
  selectedQuickScore.value = label;
  const score = quickScores.find(s => s.label === label);
  if (score && currentTask.value) {
    for (const metric of currentTask.value.skill_weights) {
      currentScores.value[metric.skill_id] = score.value;
    }
    isDirty.value = true;
  }
}

function handleNotificationClose() {
  showNotificationModal.value = false;
  if (notificationType.value === 'success') {
    const reportPath = mode.value === 'course'
      ? `/course-detail/${courseId.value}/session/${sessionId.value}/report`
      : `/course-detail/quick/session/${sessionId.value}/report`;
    router.push(reportPath);
  }
}

async function finishSession() {
  if (isSaving.value)
    return;
  stopTimers();
  const completions: TaskCompletionPayload[] = [];
  for (const [key, evalData] of Object.entries(evaluations.value)) {
    if (!completedEvalKeys.value.includes(key))
      continue;
    const lastDashIndex = key.lastIndexOf('-');
    const athleteUuid = key.substring(0, lastDashIndex);
    const taskId = Number(key.substring(lastDashIndex + 1));
    const task = tasks.value.find(t => t.id === taskId);
    if (!task)
      continue;
    const totalWeightedScore = task.skill_weights.reduce((sum, metric) => {
      const scoreForSkill = evalData.scores[metric.skill_id] || 0;
      const weight = Number.parseFloat(String(metric.weight));
      return sum + (scoreForSkill * weight);
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
    totalSessionTime: sessionElapsedTime.value,
  };
  await performSaveScores(sessionId.value, payload);
}

function handleCancel() {
  showCancelModal.value = true;
}

watch(currentEvalKey, () => {
  loadCurrentEvaluationForm();
}, { immediate: true });

watch(participatingAthletes, (newAthletes) => {
  if (newAthletes && newAthletes.length > 0) {
    initializeEvaluations();
  }
}, { immediate: true });

onMounted(() => {
  initializeEvaluations();
  startTimers();
});

onUnmounted(() => {
  stopTimers();
});

useHead({
  title: () => (course.value ? `Live Session: ${course.value.name}` : 'Live Session'),
});
</script>

<style>
.range-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #991b1b;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -6px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.range-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #991b1b;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}
</style>
