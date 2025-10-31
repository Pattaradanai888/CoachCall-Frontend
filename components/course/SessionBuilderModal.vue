<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    />
  </transition>

  <transition name="slide-down">
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
    >
      <div class="bg-white rounded-lg sm:rounded-2xl w-full max-w-[1140px] mx-auto shadow-lg flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div class="bg-gradient-to-r from-[#9C1313] to-red-600 px-4 sm:px-6 py-3 sm:py-4 text-white">
          <div class="flex justify-between items-center">
            <div class="flex-1 pr-2">
              <h2 class="text-lg sm:text-2xl font-bold">
                {{ isEditMode ? 'Edit Training Session' : 'Create Training Session' }}
              </h2>
              <p class="text-red-100 text-xs sm:text-sm mt-1 hidden sm:block">
                {{ isEditMode ? 'Refine your existing template.' : 'Build your next practice with precision.' }}
              </p>
            </div>
            <button
              class="p-1 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex items-center flex-shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              @click="emitClose"
            >
              <Icon name="mdi:close-thick" size="1.5rem" class="sm:w-8 sm:h-8" style="color:white" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 sm:p-6">
          <!-- Mobile Layout (stacked) -->
          <div class="block lg:hidden space-y-4">
            <!-- Stats Cards at Top on Mobile -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div class="text-xs text-gray-600">
                  Total Time
                </div>
                <p class="text-lg font-bold text-[#9c1313]">
                  {{ totalTime }} min
                </p>
              </div>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div class="text-xs text-gray-600">
                  Total Tasks
                </div>
                <p class="text-lg font-bold text-[#9c1313]">
                  {{ tasks.length }}
                </p>
              </div>
            </div>

            <!-- Form Fields -->
            <div class="space-y-4">
              <div>
                <h1 class="font-bold text-gray-700 mb-2 text-sm">
                  Session Name
                </h1>
                <input
                  v-model="sessionName"
                  type="text"
                  class="border-2 rounded-lg w-full shadow-sm p-3 h-12 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313] text-base sm:text-sm"
                  placeholder="e.g. Defensive Drills"
                >
              </div>

              <div>
                <h1 class="font-bold mb-2 text-gray-700 text-sm">
                  Session Description
                </h1>
                <textarea
                  v-model="sessionDescription"
                  class="border-2 rounded-lg w-full shadow-sm p-3 h-20 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313] text-base sm:text-sm resize-none"
                  placeholder="Describe the goals and focus of this session"
                />
              </div>
            </div>
          </div>

          <!-- Desktop Layout (side by side) -->
          <div class="hidden lg:grid lg:grid-cols-4 gap-3">
            <div class="col-span-3">
              <div class="mb-4">
                <h1 class="font-bold text-gray-700 mb-1">
                  Session Name
                </h1>
                <input
                  v-model="sessionName"
                  type="text"
                  class="border-2 rounded-lg w-full shadow-lg p-2 h-11 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313] text-base sm:text-sm"
                  placeholder="e.g. Defensive Drills"
                >
              </div>

              <div>
                <h1 class="font-bold mb-1 text-gray-700">
                  Session Description
                </h1>
                <textarea
                  v-model="sessionDescription"
                  class="border-2 rounded-lg w-full shadow-sm p-3 h-20 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313] text-base sm:text-sm"
                  placeholder="Describe the goals and focus of this session"
                />
              </div>
            </div>

            <div class="col-span-1">
              <div class="bg-white shadow-md p-4 rounded-md mb-3">
                <div class="text-sm text-gray-600">
                  Total Time
                </div>
                <p class="text-2xl sm:text-3xl font-bold">
                  {{ totalTime }} min
                </p>
              </div>
              <div class="bg-white shadow-md p-4 rounded-md">
                <div class="text-sm text-gray-600">
                  Total Tasks
                </div>
                <p class="text-2xl sm:text-3xl font-bold">
                  {{ tasks.length }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div v-for="(task, index) in tasks" :key="task.id">
              <TaskComponent
                :task="task"
                :index="index"
                :available-skills="availableSkills || []"
                :tasks-length="tasks.length"
                @remove="removeTask"
                @update-field="updateField"
                @toggle-skill="toggleSkill"
                @update-skill-weight="updateSkillWeight"
              />
            </div>
            <button class="w-full" @click="addTask">
              <div class="border-2 border-dashed rounded-lg p-4 sm:p-6 transition-all duration-200 mt-4 sm:mt-5 hover:border-[#9c1313] hover:bg-red-50">
                <div class="text-center py-2">
                  <Icon name="mdi:plus" size="2rem" class="sm:w-12 sm:h-12 text-gray-400 mx-auto" />
                  <p class="text-gray-500 text-sm sm:text-lg">
                    Add Another Task
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div class="mt-4 sm:mt-6 border-t pt-4 sm:pt-6">
            <label v-if="!isEditMode && mode === 'timeline'" class="flex items-start sm:items-center cursor-pointer mb-4 sm:mb-6">
              <input v-model="saveAsTemplateFlag" type="checkbox" class="h-4 w-4 sm:h-5 sm:w-5 rounded border-gray-300 text-[#9c1313] focus:ring-[#9c1313] mt-0.5 sm:mt-0 flex-shrink-0 scale-110 sm:scale-100">
              <span class="ml-2 sm:ml-3 text-gray-700 text-sm sm:text-base">Save this session as a template for future use</span>
            </label>

            <!-- Mobile Layout (stacked buttons) -->
            <div class="block sm:hidden space-y-3">
              <button
                v-if="isEditMode"
                class="w-full px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors border-2 border-gray-300 rounded-lg flex items-center justify-center"
                @click="resetToInitial"
              >
                <Icon name="mdi:refresh" class="mr-2" size="1.2rem" />
                Reset
              </button>
              
              <div class="flex space-x-3">
                <button
                  class="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors border-2 border-[#D9D9D9] rounded-lg text-sm font-medium"
                  @click="emitClose"
                >
                  Cancel
                </button>
                <button
                  class="flex-1 px-4 py-3 bg-[#9c1313] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  :disabled="!canCreate"
                  @click="handleFinalize"
                >
                  {{ getMobileButtonText() }}
                </button>
              </div>
            </div>

            <!-- Desktop Layout (horizontal buttons) -->
            <div class="hidden sm:flex justify-between w-full">
              <button
                v-if="isEditMode"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border-2 border-gray-300 rounded-lg flex items-center"
                @click="resetToInitial"
              >
                <Icon name="mdi:refresh" class="mr-2" />
                Reset
              </button>
              <div v-else />

              <div class="flex justify-end space-x-3">
                <button
                  class="px-4 py-2 w-32 text-gray-600 hover:text-gray-800 transition-colors border-2 border-[#D9D9D9] rounded-lg"
                  @click="emitClose"
                >
                  Cancel
                </button>
                <button
                  class="px-6 py-2 w-48 bg-[#9c1313] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!canCreate"
                  @click="handleFinalize"
                >
                  {{ finalButtonText }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import type { Session, SessionCreatePayload, Skill, TaskCreatePayload, TaskFull } from '~/types/course';
import { computed, ref, watch } from 'vue';
import TaskComponent from '~/components/TaskComponent.vue';

interface SessionUIData {
  id: string;
  name: string;
  description: string;
  total_duration_minutes: number;
  task_count: number;
  tasks_full: TaskFull[];
}

type ModalMode = 'timeline' | 'template';

const props = withDefaults(defineProps<{
  show: boolean;
  mode?: ModalMode;
  availableSkills: Skill[];
  initialData?: Session | null;
}>(), {
  mode: 'timeline',
  initialData: null,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create-session', payload: SessionUIData): void;
  (e: 'create-template', payload: SessionCreatePayload): void;
  (e: 'update-template', payload: SessionCreatePayload): void;
}>();

const isEditMode = computed(() => !!props.initialData);

const sessionName = ref('');
const sessionDescription = ref('');
let taskIdCounter = 1;
const tasks = ref<TaskFull[]>([]);
const saveAsTemplateFlag = ref(props.mode === 'template');
const originalDataForReset = ref<Session | null>(null);
const totalTime = computed(() => tasks.value.reduce((sum, t) => sum + (Number(t.duration) || 0), 0));
const canCreate = computed(() => sessionName.value.trim() !== '' && tasks.value.length > 0 && tasks.value.every(t => t.title.trim() !== ''));

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (isEditMode.value && props.initialData) {
      populateForm(props.initialData);
      originalDataForReset.value = JSON.parse(JSON.stringify(props.initialData));
    }
    else {
      resetForm();
    }
  }
});

watch(() => props.mode, (newMode) => {
  if (!isEditMode.value) {
    saveAsTemplateFlag.value = newMode === 'template';
  }
});

const finalButtonText = computed(() => {
  if (isEditMode.value)
    return 'Update Template';
  if (props.mode === 'timeline') {
    return saveAsTemplateFlag.value ? 'Save as Template' : 'Add to Timeline';
  }
  return 'Create Template';
});

const getMobileButtonText = () => {
  if (isEditMode.value)
    return 'Update';
  if (props.mode === 'timeline') {
    return saveAsTemplateFlag.value ? 'Save Template' : 'Add Session';
  }
  return 'Create';
};

function handleFinalize() {
  if (!canCreate.value)
    return;

  if (isEditMode.value) {
    emit('update-template', buildTemplatePayload());
  }
  else {
    const isSavingAsTemplate = props.mode === 'template' || (props.mode === 'timeline' && saveAsTemplateFlag.value);

    if (isSavingAsTemplate) {
      emit('create-template', buildTemplatePayload());
    }
    else {
      const sessionUIData: SessionUIData = {
        id: `custom-${Date.now()}`,
        name: sessionName.value,
        description: sessionDescription.value,
        total_duration_minutes: totalTime.value,
        task_count: tasks.value.length,
        tasks_full: JSON.parse(JSON.stringify(tasks.value)),
      };
      emit('create-session', sessionUIData);
    }
  }
  emitClose();
}

function populateForm(data: Session) {
  sessionName.value = data.name;
  sessionDescription.value = data.description || '';
  tasks.value = (data.tasks || []).map((sessionTask) => {
    const skillWeights = (sessionTask.task?.skill_weights || []).reduce((acc, sw) => {
      acc[sw.skill_id] = Number.parseFloat(sw.weight) * 100;
      return acc;
    }, {} as Record<number, number>);

    return {
      id: taskIdCounter++,
      title: sessionTask.task?.name || '',
      description: sessionTask.task?.description || '',
      duration: sessionTask.task?.duration_minutes || 0,
      selectedSkillIds: Object.keys(skillWeights).map(Number),
      skillWeights,
    };
  });
  if (tasks.value.length === 0)
    addTask();
}

function resetToInitial() {
  if (originalDataForReset.value) {
    populateForm(originalDataForReset.value);
  }
}

function resetForm() {
  sessionName.value = '';
  sessionDescription.value = '';
  tasks.value = [];
  taskIdCounter = 1;
  addTask();
  originalDataForReset.value = null;
  saveAsTemplateFlag.value = props.mode === 'template';
}

function emitClose() {
  resetForm();
  emit('close');
}

function toggleSkill({ id, skill }: { id: number; skill: Skill }) {
  const task = tasks.value.find(t => t.id === id);
  if (!task)
    return;
  const skillIndex = task.selectedSkillIds.indexOf(skill.id);
  if (skillIndex > -1) {
    task.selectedSkillIds.splice(skillIndex, 1);
    delete task.skillWeights[skill.id];
  }
  else {
    task.selectedSkillIds.push(skill.id);
    task.skillWeights[skill.id] = 0;
  }
}

function updateSkillWeight({ id, skillId, value }: { id: number; skillId: number; value: number }) {
  const task = tasks.value.find(t => t.id === id);
  if (task)
    task.skillWeights[skillId] = value;
}

function buildTemplatePayload(): SessionCreatePayload {
  const mappedTasks: TaskCreatePayload[] = tasks.value.map(uiTask => ({
    name: uiTask.title,
    description: uiTask.description,
    duration_minutes: uiTask.duration,
    skill_weights: uiTask.selectedSkillIds
      .filter(skillId => (uiTask.skillWeights[skillId] || 0) > 0)
      .map(skillId => ({
        skill_id: skillId,
        weight: (uiTask.skillWeights[skillId] || 0) / 100,
      })),
  }));

  return {
    name: sessionName.value,
    description: sessionDescription.value,
    is_template: true,
    scheduled_date: new Date().toISOString(),
    tasks: mappedTasks,
  };
}

function addTask() {
  tasks.value.push({ id: taskIdCounter++, title: '', description: '', duration: 0, selectedSkillIds: [], skillWeights: {} });
}
function removeTask(id: number) {
  if (tasks.value.length <= 1)
    return;
  const idx = tasks.value.findIndex(t => t.id === id);
  if (idx > -1)
    tasks.value.splice(idx, 1);
}
function updateField({ id, field, value }: { id: number; field: keyof TaskFull; value: string | number | null }) {
  const task = tasks.value.find(t => t.id === id);
  if (task) {
    // Type-safe assignment based on field
    if (field === 'id' || field === 'duration') {
      (task[field] as number) = value as number;
    } else if (field === 'title') {
      (task[field] as string) = value as string;
    } else if (field === 'description') {
      (task[field] as string | null) = value as string | null;
    }
  }
}
</script>

<style scoped>
/* Vue Transition Classes - Cannot be replaced with Tailwind */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Mobile-specific modal positioning - Custom behavior for transitions */
@media (max-width: 640px) {
  .slide-down-enter-from,
  .slide-down-leave-to {
    transform: translateY(-10px);
  }
}

/* Tablet modal size optimization - Using CSS for max-w override */
@media (min-width: 641px) and (max-width: 1023px) {
  .max-w-\[1140px\] {
    max-width: 90vw;
  }
}

/* Touch scrolling optimization - Browser-specific feature */
@media (hover: none) and (pointer: coarse) {
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
