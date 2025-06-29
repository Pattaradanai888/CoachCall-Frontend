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
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl w-full max-w-[1140px] mx-auto shadow-lg flex flex-col max-h-[90vh] overflow-hidden">
        <div class="bg-gradient-to-r from-[#9C1313] to-red-600 px-6 py-4 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">
                {{ isEditMode ? 'Edit Training Session' : 'Create Training Session' }}
              </h2>
              <p class="text-red-100 text-sm mt-1">
                {{ isEditMode ? 'Refine your existing template.' : 'Build your next practice with precision.' }}
              </p>
            </div>
            <button
              class="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex items-center"
              @click="emitClose"
            >
              <Icon name="mdi:close-thick" size="2rem" style="color:white" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-4 gap-3">
            <div class="col-span-3">
              <div class="mb-4">
                <h1 class="font-bold text-gray-700 mb-1">
                  Session Name
                </h1>
                <input
                  v-model="sessionName"
                  type="text"
                  class="border-2 rounded-lg w-full shadow-lg p-2 h-11 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
                  placeholder="e.g. Defensive Drills"
                >
              </div>

              <div>
                <h1 class="font-bold mb-1 text-gray-700">
                  Session Description
                </h1>
                <textarea
                  v-model="sessionDescription"
                  class="border-2 rounded-lg w-full shadow-sm p-3 h-20 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
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
              <div class="border-2 border-dashed rounded-lg p-6 transition-all duration-200 mt-5 hover:border-[#9c1313] hover:bg-red-50">
                <div class="text-center py-2">
                  <Icon name="mdi:plus" size="3rem" class="text-gray-400 mx-auto" />
                  <p class="text-gray-500 text-lg">
                    Add Another Task
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div class="mt-6 border-t pt-6">
            <label v-if="!isEditMode && mode === 'timeline'" class="flex items-center cursor-pointer mb-6">
              <input v-model="saveAsTemplateFlag" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-[#9c1313] focus:ring-[#9c1313]">
              <span class="ml-3 text-gray-700">Save this session as a template for future use</span>
            </label>

            <div class="flex justify-between w-full">
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
import type { Session, SessionCreatePayload, Skill, TaskCreatePayload } from '~/types/course';
import { computed, ref, watch } from 'vue';
import TaskComponent from '~/components/TaskComponent.vue';

interface UITask {
  id: number;
  title: string;
  description: string;
  duration: number;
  selectedSkillIds: number[];
  skillWeights: Record<number, number>;
}

interface SessionUIData {
  id: string;
  name: string;
  description: string;
  total_duration_minutes: number;
  task_count: number;
  tasks_full: UITask[];
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
const tasks = ref<UITask[]>([]);
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
function updateField({ id, field, value }: { id: number; field: keyof UITask; value: any }) {
  const task = tasks.value.find(t => t.id === id);
  if (task)
    (task as any)[field] = value;
}
</script>

<style scoped>
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
</style>
