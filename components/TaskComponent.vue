<template>
  <div class="bg-white shadow-lg mt-5 p-6 relative">
    <!-- Delete Task Button -->
    <button
      v-if="tasksLength > 1"
      class="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      @click="emitRemove"
    >
      <Icon name="mdi:delete-outline" size="1.5rem" class="text-gray-400 mx-auto" />
    </button>

    <div class="flex items-center">
      <div class="flex items-center justify-center">
        <p class="w-6 h-6 bg-[#9c1313] text-white rounded-full flex items-center justify-center text-xs font-bold">
          {{ index + 1 }}
        </p>
      </div>
      <div class="ml-4">
        <h1 class="font-bold">
          Task {{ index + 1 }}
        </h1>
        <p>Define your training exercise</p>
      </div>
    </div>

    <div class="grid grid-cols-2 mb-2 gap-5">
      <div>
        <h1 class="font-bold text-gray-700 mb-1">
          Task Title
        </h1>
        <input
          v-model="localTask.title"
          type="text"
          class="border-2 rounded-lg w-full shadow-lg p-2 h-11 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
          placeholder="Task title"
          @input="emitUpdateField('title', localTask.title)"
        >
      </div>
      <div>
        <h1 class="font-bold text-gray-700 mb-1">
          Duration (min)
        </h1>
        <input
          v-model.number="localTask.duration"
          type="number"
          class="border-2 rounded-lg w-full shadow-lg p-2 h-11 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
          placeholder="Duration in minutes"
          @input="emitUpdateField('duration', localTask.duration)"
        >
      </div>
    </div>

    <div>
      <h1 class="font-bold mb-1 text-gray-700">
        Task Description
      </h1>
      <textarea
        v-model="localTask.description"
        class="border-2 rounded-lg w-full shadow-sm p-3 h-20 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
        placeholder="Task description"
        @input="emitUpdateField('description', localTask.description)"
      />
    </div>

    <!-- Skills Buttons -->
    <div class="mt-5">
      <h1 class="font-bold">
        Performance Focus
      </h1>
      <p>Select skills this task will develop</p>
      <div class="grid grid-cols-3 gap-5 mt-5">
        <button
          v-for="skill in availableSkills"
          :key="skill"
          class="border-2 shadow-lg w-full h-10 rounded-lg transition-colors"
          :class="[
            localTask.selectedSkills.includes(skill)
              ? 'bg-[#9c1313] text-white border-[#9c1313]'
              : 'bg-white border-[#D9D9D9] hover:bg-[#FF4444] hover:text-white',
          ]"
          @click="toggleSkill(skill)"
        >
          {{ skill }}
        </button>
      </div>

      <!-- Slider Section -->
      <div v-if="localTask.selectedSkills.length > 0" class="relative w-full mt-5">
        <div class="mb-2">
          <div class="flex justify-between mb-5">
            <div>
              <h1 class="font-bold">
                Weight Distribution
              </h1>
            </div>
            <p class="rounded-lg text-white px-2" :class="[totalWeight === 100 ? 'bg-[#EB001B]' : 'bg-orange-500']">
              {{ totalWeight }}% Total
            </p>
          </div>

          <!-- Slider for each selected skill -->
          <div
            v-for="skill in localTask.selectedSkills"
            :key="skill"
            class="mb-4"
          >
            <div class="flex justify-between mb-2">
              <span class="text-sm font-bold text-gray-700">{{ skill }}</span>
              <span class="text-sm font-bold text-gray-700">{{ localTask.skillWeights[skill] || 0 }}%</span>
            </div>
            <div class="relative">
              <!-- Background track -->
              <div class="w-full bg-gray-200 rounded-full h-2">
                <!-- Progress bar -->
                <div
                  class="h-full bg-[#9c1313] rounded-full transition-all duration-150"
                  :style="{ width: `${localTask.skillWeights[skill] || 0}%` }"
                />
              </div>
              <!-- Slider input -->
              <input
                :value="localTask.skillWeights[skill] || 0"
                type="range"
                min="0"
                max="100"
                step="1"
                class="absolute top-0 left-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-input"
                @input="updateSkillWeight(skill, $event.target.value)"
              >
            </div>
          </div>

          <!-- Optional warning if total is 100 -->
          <div v-if="totalWeight === 100" class="mt-1 text-gray-600 text-sm">
            Total is 100%. To increase a skill, first reduce others.
          </div>
        </div>
      </div>
      <!-- End Slider -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

interface Task {
  id: number;
  title: string;
  description: string;
  duration: number;
  selectedSkills: string[];
  skillWeights: Record<string, number>;
}

const props = defineProps<{ task: Task; index: number; availableSkills: string[]; tasksLength: number }>();
const emit = defineEmits<{
  (e: 'remove', id: number): void;
  (e: 'update-field', payload: { id: number; field: keyof Task; value: any }): void;
  (e: 'toggle-skill', payload: { id: number; skill: string }): void;
  (e: 'update-skill-weight', payload: { id: number; skill: string; value: number }): void;
}>();

// Use a local copy to allow v-model on inputs and emit updates
const localTask = ref<Task>({ ...props.task });

// Watch for prop changes to sync localTask
watch(
  () => props.task,
  (newTask) => {
    localTask.value = { ...newTask };
  },
  { deep: true },
);

// Computed total weight
const totalWeight = computed(() => {
  return localTask.value.selectedSkills.reduce(
    (sum, skill) => sum + (localTask.value.skillWeights[skill] || 0),
    0,
  );
});

function emitRemove() {
  emit('remove', props.task.id);
}

function emitUpdateField(field: keyof Task, value: any) {
  emit('update-field', { id: props.task.id, field, value });
}

function toggleSkill(skill: string) {
  emit('toggle-skill', { id: props.task.id, skill });
}

function updateSkillWeight(skill: string, rawValue: string) {
  const value = Number.parseInt(rawValue, 10) || 0;
  emit('update-skill-weight', { id: props.task.id, skill, value });
}
</script>

<style scoped>
/* Include slider styling here if needed, or import globally */
.slider-input {
  position: relative;
}
.slider-input::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9c1313;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 10;
  margin-top: -9px;
}
.slider-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9c1313;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 10;
  margin-top: -9px;
  border: none;
}
.slider-input::-webkit-slider-track {
  background: transparent;
  height: 8px;
}
.slider-input::-moz-range-track {
  background: transparent;
  height: 8px;
}
</style>
