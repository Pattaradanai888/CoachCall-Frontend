<template>
  <!-- Backdrop -->
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    />
  </transition>

  <!-- Modal Panel -->
  <transition name="slide-down">
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl w-full max-w-[1140px] mx-auto shadow-lg flex flex-col max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-[#9C1313] to-red-600 px-6 py-4 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">
                Create Training Session
              </h2>
              <p class="text-red-100 text-sm mt-1">
                Build your next practice with precision
              </p>
            </div>
            <button
              class="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex items-center"
              @click="emitClose"
            >
              <Icon name="mdi:close-thick" size="2rem" style="color:white" class="" />
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-4 gap-3">
            <div class="col-span-3">
              <div class="mb-2">
                <div class="flex">
                  <div class="w-full mr-2">
                    <h1 class="font-bold text-gray-700 mb-1">
                      Session Name
                    </h1>
                    <input
                      v-model="sessionName"
                      type="text"
                      class="border-2 rounded-lg w-full shadow-lg p-2 h-11 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
                      placeholder="Session title"
                    >
                  </div>
                  <div class="w-full ml-2">
                    <h1 class="font-bold text-gray-700 mb-1">
                      Category
                    </h1>
                    <div class="relative">
                      <select
                        v-model="templateCategory"
                        class="border-2 rounded-lg w-full shadow-lg p-2 h-11 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
                        @change="handleCategoryChange"
                      >
                        <option value="">
                          Select training const...
                        </option>
                        <option
                          v-for="category in availableCategories"
                          :key="category"
                          :value="category"
                        >
                          {{ category }}
                        </option>
                        <!-- Special sentinel option for creating new category -->
                        <option value="__new__">
                          + Create new category...
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <!-- Inline input for new category -->
                <div v-if="showNewCategoryInput" class="my-2 flex">
                  <input
                    ref="newCategoryInput"
                    v-model="newCategoryName"
                    type="text"
                    class="border-2 rounded-lg w-full shadow-sm p-2 border-gray-300 focus:border-[#9c1313] focus:outline-none focus:ring-1 focus:ring-[#9c1313]"
                    placeholder="New category name"
                    @keyup.enter="addNewCategory"
                    @blur="cancelNewCategory"
                  >
                  <button
                    class="ml-2 px-4 py-2 bg-[#9c1313] text-white rounded-lg hover:bg-red-700 transition-colors"
                    @mousedown.prevent="addNewCategory"
                  >
                    Add
                  </button>
                  <button
                    class="ml-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    @mousedown.prevent="cancelNewCategory"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div>
                <h1 class="font-bold mb-1 text-gray-700">
                  Session Description
                </h1>
                <textarea
                  v-model="sessionDescription"
                  class="border-2 rounded-lg w-full shadow-sm p-3 h-20 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
                  placeholder="Session description"
                />
              </div>
            </div>

            <div class="col-span">
              <div>
                <div class="bg-white shadow-md p-4 rounded-md mb-3">
                  <div class="flex justify-between">
                    <div class="mr-2">
                      <div class="text-sm text-gray-600">
                        Total Time
                      </div>
                      <p class="text-2xl sm:text-3xl font-bold">
                        {{ totalTime }} min
                      </p>
                    </div>
                    <div class="flex align-middle justify-center">
                      <Icon name="mdi:clock-time-eight-outline" size="3rem" style="color:grey" class="mr-1" />
                    </div>
                  </div>
                </div>
                <div class="bg-white shadow-md p-4 rounded-md">
                  <div class="flex justify-between">
                    <div class="mr-2">
                      <div class="text-sm text-gray-600">
                        Total Tasks
                      </div>
                      <p class="text-2xl sm:text-3xl font-bold">
                        {{ tasks.length }}
                      </p>
                    </div>
                    <div class="flex align-middle justify-center">
                      <Icon name="mdi:clipboard-text-outline" size="3rem" style="color:grey" class="mr-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Task Sections -->
          <div>
            <div v-for="(task, index) in tasks" :key="task.id">
              <TaskComponent
                :task="task"
                :index="index"
                :available-skills="availableSkills"
                :tasks-length="tasks.length"
                @remove="removeTask"
                @update-field="updateField"
                @toggle-skill="toggleSkill"
                @update-skill-weight="updateSkillWeight"
              />
            </div>

            <!-- Add Another Task Button -->
            <button class="w-full" @click="addTask">
              <div
                class="border-2 border-dashed rounded-lg p-6 transition-all duration-200 mt-5 hover:border-[#9c1313] hover:bg-red-50"
              >
                <div class="text-center py-2">
                  <Icon name="mdi:plus" size="3rem" class="text-gray-400 mx-auto" />
                  <p class="text-gray-500 text-lg">
                    Add Another Task
                  </p>
                  <p class="text-gray-400 text-sm mt-2">
                    Build comprehensive training sessions
                  </p>
                </div>
              </div>
            </button>
          </div>

          <!-- Save To Template Section -->
          <div class="mt-5">
            <div class="grid grid-cols-3 gap-3 mt-5">
              <div class="col-span-2">
                <button
                  class="px-6 py-2 w-full bg-[#9c1313] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!canCreate"
                  @click="createSession"
                >
                  Create Template
                </button>
              </div>
              <div class="col-span-1">
                <button
                  class="px-4 py-2 w-full text-gray-600 hover:text-gray-800 transition-colors border-2 border-[#D9D9D9] rounded-lg"
                  @click="emitClose"
                >
                  Cancel
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
import { computed, defineEmits, defineProps, nextTick, ref } from 'vue';
import TaskComponent from '~/components/TaskComponent.vue';

interface Task {
  id: number;
  title: string;
  description: string;
  duration: number;
  selectedSkills: string[];
  skillWeights: Record<string, number>;
}

// Props & Emits
const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: any): void;
}>();

// Session fields
const sessionName = ref('');
const sessionDescription = ref('');

// Task state (unchanged)
const availableSkills = ['Shooting', 'Dribbling', 'Defense', 'Athleticism', 'Basketball IQ', 'Rebounding'];
let taskIdCounter = 1;
const tasks = ref<Task[]>([{
  id: taskIdCounter++,
  title: '',
  description: '',
  duration: 0,
  selectedSkills: [],
  skillWeights: {},
}]);

// Computed total time
const totalTime = computed(() => tasks.value.reduce((sum, t) => sum + (t.duration || 0), 0));

// Add/Remove tasks (unchanged)
function addTask() {
  tasks.value.push({ id: taskIdCounter++, title: '', description: '', duration: 0, selectedSkills: [], skillWeights: {} });
}
function removeTask(id: number) {
  if (tasks.value.length <= 1)
    return;
  const idx = tasks.value.findIndex(t => t.id === id);
  if (idx > -1)
    tasks.value.splice(idx, 1);
}

// Update fields (unchanged)
function updateField({ id, field, value }: { id: number; field: keyof Task; value: any }) {
  const task = tasks.value.find(t => t.id === id);
  if (task)
    (task as any)[field] = value;
}

// Toggle skill (unchanged)
function toggleSkill({ id, skill }: { id: number; skill: string }) {
  const task = tasks.value.find(t => t.id === id);
  if (!task)
    return;
  const idx = task.selectedSkills.indexOf(skill);
  if (idx > -1) {
    task.selectedSkills.splice(idx, 1);
    delete task.skillWeights[skill];
  }
  else {
    task.selectedSkills.push(skill);
    task.skillWeights[skill] = 0;
  }
}
// Weight utils (unchanged)
function maxAllowedWeight(task: Task, skill: string): number {
  const current = task.skillWeights[skill] || 0;
  const otherTotal = task.selectedSkills.reduce((sum, s) => s === skill ? sum : sum + (task.skillWeights[s] || 0), 0);
  return 100 - otherTotal;
}
function updateSkillWeight({ id, skill, value }: { id: number; skill: string; value: number }) {
  const task = tasks.value.find(t => t.id === id);
  if (!task)
    return;
  const clamped = Math.max(0, Math.min(value, maxAllowedWeight(task, skill)));
  task.skillWeights[skill] = clamped;
}

// Template section state
const availableCategories = ref<string[]>([]);
const templateCategory = ref('');
const newCategoryName = ref('');
const showNewCategoryInput = ref(false);
const newCategoryInput = ref<HTMLInputElement | null>(null);

function emitClose() {
  emit('close');
}

// Called when user selects something in the <select>
function handleCategoryChange() {
  if (templateCategory.value === '__new__') {
    // trigger showing the input for new category
    showAddNewCategory();
    // Clear the selection so it doesn't stay on sentinel
    templateCategory.value = '';
  }
  // else: selected an existing category; you could add extra logic here if needed
}

function showAddNewCategory() {
  showNewCategoryInput.value = true;
  nextTick(() => {
    newCategoryInput.value?.focus();
  });
}

// Confirm adding new category
function addNewCategory() {
  const name = newCategoryName.value.trim();
  if (!name) {
    // no input: do nothing or keep input visible?
    return;
  }
  // Check case-insensitive existence
  const exists = availableCategories.value.some(c => c.toLowerCase() === name.toLowerCase());
  if (!exists) {
    availableCategories.value.push(name);
    templateCategory.value = name;
  }
  else {
    // if exists, select the existing one
    const existing = availableCategories.value.find(c => c.toLowerCase() === name.toLowerCase());
    templateCategory.value = existing || '';
  }
  cancelNewCategory();
}

function cancelNewCategory() {
  showNewCategoryInput.value = false;
  newCategoryName.value = '';
}

// Create session (unchanged)
const canCreate = computed(() => {
  return sessionName.value.trim() !== '' && tasks.value.length > 0;
});
function createSession() {
  if (!canCreate.value)
    return;
  const payload = {
    name: sessionName.value,
    description: sessionDescription.value,
    tasks: tasks.value,
    totalTime: totalTime.value,
    createdAt: new Date().toISOString(),
  };
  emit('save', { type: 'session', data: payload });
  sessionName.value = '';
  sessionDescription.value = '';
  tasks.value = [{ id: taskIdCounter++, title: '', description: '', duration: 0, selectedSkills: [], skillWeights: {} }];
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

.slide-down-enter-active {
  transition: transform 0.2s ease-out;
}
.slide-down-enter-from {
  transform: translateY(-10%);
}
.slide-down-leave-active {
  transition: transform 0.2s ease-in;
}
.slide-down-leave-to {
  transform: translateY(-10%);
}

/* Expand transition for template section */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
.expand-enter-to,
.expand-leave-from {
  max-height: 400px;
  opacity: 1;
  transform: translateY(0);
}
</style>
