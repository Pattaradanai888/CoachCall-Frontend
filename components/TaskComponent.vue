<template>
  <div class="bg-white shadow-lg mt-5 p-6 relative">
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
          min="0"
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

    <div class="mt-5">
      <h1 class="font-bold">
        Performance Focus
      </h1>
      <p>Select skills this task will develop</p>
      <div class="grid grid-cols-3 gap-5 mt-5">
        <button
          v-for="skill in availableSkills"
          :key="skill.id"
          class="border-2 shadow-lg w-full h-10 rounded-lg transition-colors"
          :class="[
            localTask.selectedSkillIds.includes(skill.id)
              ? 'bg-[#9c1313] text-white border-[#9c1313]'
              : 'bg-white border-[#D9D9D9] hover:bg-[#FF4444] hover:text-white',
          ]"
          @click="handleToggleSkill(skill)"
        >
          {{ skill.name }}
        </button>
      </div>

      <div v-if="localTask.selectedSkillIds.length > 0" class="relative w-full mt-5">
        <div class="mb-2">
          <div class="flex justify-between mb-5">
            <div>
              <h1 class="font-bold">
                Weight Distribution
              </h1>
            </div>
            <p class="rounded-lg text-white px-2" :class="[totalWeight === 100 ? 'bg-green-600' : totalWeight > 100 ? 'bg-red-600' : 'bg-orange-500']">
              {{ totalWeight }}% Total
            </p>
          </div>

          <div class="mb-4">
            <button
              class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              @click="autoDistributeWeights"
            >
              Auto-distribute equally
            </button>
          </div>

          <div
            v-for="skillId in localTask.selectedSkillIds"
            :key="`skill-wrapper-${skillId}`"
            class="mb-6"
          >
            <div class="flex justify-between mb-2">
              <span class="text-sm font-bold text-gray-700">{{ getSkillName(skillId) }}</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-700">{{ Math.round(localTask.skillWeights[skillId] || 0) }}%</span>
                <span v-if="(localTask.skillWeights[skillId] || 0) === 0" class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  No focus
                </span>
              </div>
            </div>
            <div class="relative">
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="h-full bg-[#9c1313] rounded-full transition-all duration-200"
                  :style="{ width: `${localTask.skillWeights[skillId] || 0}%` }"
                />
                <div
                  v-if="getMaxAllowedWeight(skillId) < 100"
                  class="absolute top-0 right-0 h-full bg-red-100 border-l-2 border-red-300 rounded-r-full"
                  :style="{ width: `${100 - getMaxAllowedWeight(skillId)}%` }"
                />
              </div>
              <input
                :value="localTask.skillWeights[skillId] || 0"
                type="range"
                min="0"
                :max="100"
                step="1"
                class="absolute top-0 left-0 w-full h-3 bg-transparent appearance-none cursor-pointer slider-input"
                @input="handleSliderInput(skillId, $event)"
                @change="handleSliderChange(skillId, $event)"
              >
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span v-if="getMaxAllowedWeight(skillId) < 100" class="text-orange-600">
                Limited to {{ getMaxAllowedWeight(skillId) }}%
              </span>
              <span>{{ getMaxAllowedWeight(skillId) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Skill } from '~/types/course';
import { computed, ref, watch } from 'vue';

interface Task {
  id: number;
  title: string;
  description: string;
  duration: number;
  selectedSkillIds: number[];
  skillWeights: Record<number, number>;
}

const props = defineProps<{
  task: Task;
  index: number;
  availableSkills: Skill[];
  tasksLength: number;
}>();

const emit = defineEmits<{
  (e: 'remove', id: number): void;
  (e: 'update-field', payload: { id: number; field: keyof Task; value: any }): void;
  (e: 'toggle-skill', payload: { id: number; skill: Skill }): void;
  (e: 'update-skill-weight', payload: { id: number; skillId: number; value: number }): void;
}>();

const localTask = ref<Task>({ ...props.task });
const isSliding = ref(false);

watch(
  () => props.task,
  (newTask) => {
    if (!isSliding.value) {
      localTask.value = { ...newTask };
    }
  },
  { deep: true },
);

const totalWeight = computed(() => {
  return Math.round(localTask.value.selectedSkillIds.reduce(
    (sum, skillId) => sum + (localTask.value.skillWeights[skillId] || 0),
    0,
  ));
});

function getMaxAllowedWeight(currentSkillId: number): number {
  const otherSkillsTotal = localTask.value.selectedSkillIds
    .filter(id => id !== currentSkillId)
    .reduce((sum, id) => sum + (localTask.value.skillWeights[id] || 0), 0);
  return Math.max(0, 100 - otherSkillsTotal);
}

function getSkillName(skillId: number): string {
  const skill = props.availableSkills.find(s => s.id === skillId);
  return skill ? skill.name : 'Unknown Skill';
}

function autoDistributeWeights() {
  const skillCount = localTask.value.selectedSkillIds.length;
  if (skillCount === 0)
    return;

  const equalWeight = Math.floor(100 / skillCount);
  const remainder = 100 % skillCount;

  localTask.value.selectedSkillIds.forEach((skillId, index) => {
    const weight = equalWeight + (index < remainder ? 1 : 0);
    emit('update-skill-weight', { id: props.task.id, skillId, value: weight });
  });
}

function handleSliderInput(skillId: number, event: Event) {
  const target = event.target as HTMLInputElement;
  let value = Number.parseInt(target.value, 10);

  const otherSkillsTotal = localTask.value.selectedSkillIds
    .filter(id => id !== skillId)
    .reduce((sum, id) => sum + (localTask.value.skillWeights[id] || 0), 0);

  const maxAllowed = 100 - otherSkillsTotal;

  if (value > maxAllowed) {
    value = maxAllowed;
    target.value = String(maxAllowed);
  }

  localTask.value.skillWeights[skillId] = value;

  const otherSkills = localTask.value.selectedSkillIds.filter(id => id !== skillId);
  if (otherSkills.length === 1) {
    const otherSkillId = otherSkills[0];
    localTask.value.skillWeights[otherSkillId] = 100 - value;
  }
}

function handleSliderChange(skillId: number, event: Event) {
  isSliding.value = false;
  localTask.value.selectedSkillIds.forEach((sId) => {
    emit('update-skill-weight', {
      id: props.task.id,
      skillId: sId,
      value: localTask.value.skillWeights[sId] || 0,
    });
  });
}

function emitRemove() {
  emit('remove', props.task.id);
}

function emitUpdateField(field: keyof Task, value: any) {
  emit('update-field', { id: props.task.id, field, value });
}

function handleToggleSkill(skill: Skill) {
  emit('toggle-skill', { id: props.task.id, skill });
}
</script>

<style scoped>
.slider-input {
  position: relative;
  z-index: 10;
}

.slider-input::-webkit-slider-thumb {
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #9c1313;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 20;
  transition: all 0.2s ease;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}

.slider-input::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #9c1313;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 20;
  transition: all 0.2s ease;
  border: none;
}

.slider-input::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}

.slider-input::-webkit-slider-track {
  background: transparent;
  height: 12px;
  border-radius: 6px;
}

.slider-input::-moz-range-track {
  background: transparent;
  height: 12px;
  border-radius: 6px;
}
</style>
