<template>
  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <!-- Header: Skill Name + Weight -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <h4 class="font-semibold text-gray-800">{{ skillName }}</h4>
        <span class="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">
          {{ weightPercentage }}%
        </span>
      </div>
      
      <!-- Progress Indicator -->
      <div v-if="rubric && progress.total > 0" class="text-xs text-gray-600">
        {{ progress.completed }}/{{ progress.total }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800" />
      <p class="ml-2 text-sm text-gray-600">Loading...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
      <Icon name="mdi:alert-circle" class="inline mr-1" />
      Failed to load rubric: {{ error }}
    </div>

    <!-- Indicators -->
    <div v-else-if="rubric" class="space-y-3">
      <div 
        v-for="indicator in rubric.indicators" 
        :key="indicator.title"
        class="border-b border-gray-200 pb-3 last:border-0 last:pb-0"
      >
        <!-- Indicator Title -->
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ indicator.title }}
          <span v-if="!hasRating(indicator.title)" class="text-red-500 text-xs ml-1">*</span>
        </label>

        <!-- Rating Buttons (matching original style) -->
        <div class="flex gap-2">
          <button
            v-for="level in ([1, 2, 3] as IndicatorRating[])"
            :key="level"
            type="button"
            :class="getButtonClasses(indicator.title, level)"
            :title="indicator.descriptions[level]"
            @click="selectRating(indicator.title, level)"
          >
            {{ LEVEL_LABELS[level] }}
          </button>
        </div>

        <!-- Description (shown after selection) -->
        <Transition name="fade">
          <div 
            v-if="currentRatings[indicator.title]"
            class="mt-2 p-2 text-xs text-gray-600 bg-white rounded border-l-2"
            :class="getDescriptionBorderClass(currentRatings[indicator.title])"
          >
            {{ indicator.descriptions[currentRatings[indicator.title]!] }}
          </div>
        </Transition>
      </div>
    </div>

    <!-- Fallback State -->
    <div v-else class="p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800">
      Rubric data unavailable
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRubrics } from '~/composables/useRubrics'
import type { IndicatorRatings, IndicatorRating, RubricResponse } from '~/types/rubrics'
import { LEVEL_LABELS } from '~/types/rubrics'

interface Props {
  skillId: number
  skillName: string
  weight: number  // 0.0-1.0 (will display as percentage)
  modelValue: IndicatorRatings  // { "Indicator Name": 1 | 2 | 3 }
}

interface Emits {
  (e: 'update:modelValue', value: IndicatorRatings): void
  (e: 'complete', skillId: number): void
  (e: 'incomplete', skillId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { fetchRubric, isSkillComplete, getSkillProgress } = useRubrics()

// State
const rubric = ref<RubricResponse | null>(null)
const loading = ref(true)
const error = ref('')

// Computed
const currentRatings = computed(() => props.modelValue || {})

const weightPercentage = computed(() => Math.round(props.weight * 100))

const progress = computed(() => {
  if (!rubric.value) return { completed: 0, total: 0, percentage: 0 }
  return getSkillProgress(rubric.value, currentRatings.value)
})

const isComplete = computed(() => {
  if (!rubric.value) return false
  return isSkillComplete(rubric.value, currentRatings.value)
})

// Methods
function hasRating(indicatorName: string): boolean {
  const rating = currentRatings.value[indicatorName]
  return rating === 1 || rating === 2 || rating === 3
}

function selectRating(indicatorName: string, level: IndicatorRating) {
  const newRatings = { ...currentRatings.value, [indicatorName]: level }
  emit('update:modelValue', newRatings)
  // Note: complete/incomplete events are handled by the watch(isComplete) below
}

function getButtonClasses(indicatorName: string, level: IndicatorRating): string {
  const isSelected = currentRatings.value[indicatorName] === level
  
  // Match the EXACT style from the original start.vue
  const baseClasses = 'flex-1 px-3 py-2 text-sm border rounded-lg transition-colors font-medium'
  
  if (level === 1) {
    // Red - Needs Improvement
    return isSelected
      ? `${baseClasses} bg-red-100 text-red-800 border-red-300 font-semibold`
      : `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50`
  } else if (level === 2) {
    // Yellow - Developing (FIX: Use darker text for better visibility)
    return isSelected
      ? `${baseClasses} bg-yellow-100 text-yellow-900 border-yellow-300 font-semibold`
      : `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50`
  } else {
    // Green - Proficient
    return isSelected
      ? `${baseClasses} bg-green-100 text-green-800 border-green-300 font-semibold`
      : `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50`
  }
}

function getDescriptionBorderClass(level: IndicatorRating): string {
  if (level === 1) return 'border-red-300'
  if (level === 2) return 'border-yellow-300'
  return 'border-green-300'
}

// Lifecycle
onMounted(async () => {
  console.log('[SkillRubricEvaluator] Mounting with skillName:', props.skillName)
  try {
    const result = await fetchRubric(props.skillName)
    console.log('[SkillRubricEvaluator] Rubric fetched successfully:', result)
    rubric.value = result
  } catch (err) {
    console.error('[SkillRubricEvaluator] Error fetching rubric:', err)
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
    console.log('[SkillRubricEvaluator] Loading complete. rubric:', rubric.value, 'error:', error.value)
  }
})

// Watch for completion status changes
watch(isComplete, (complete) => {
  if (complete) {
    emit('complete', props.skillId)
  } else {
    emit('incomplete', props.skillId)
  }
})
</script>

<style scoped>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Hover scale animation */
.hover\:scale-102:hover {
  transform: scale(1.02);
}
</style>
