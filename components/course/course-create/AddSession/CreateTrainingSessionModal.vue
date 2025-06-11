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
              class="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              @click="$emit('close')"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-4 gap-3">
            <div class="col-span-3">
              <div class="mb-2">
                <h1 class="font-bold text-gray-700 mb-1">
                  Session Name
                </h1>
                <input
                  type="text"
                  class="border-2 rounded-lg w-full shadow-lg p-2 h-11 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
                  placeholder="Session title"
                >
              </div>

              <div>
                <h1 class="font-bold mb-1 text-gray-700">
                  Session Description
                </h1>
                <textarea
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
          <div
            v-for="(task, index) in tasks"
            :key="task.id"
            class="bg-white shadow-lg mt-5 p-6 relative"
          >
            <!-- Delete Task Button (show only if there's more than 1 task) -->
            <button
              v-if="tasks.length > 1"
              class="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              @click="removeTask(task.id)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
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
                  v-model="task.title"
                  type="text"
                  class="border-2 rounded-lg w-full shadow-lg p-2 h-11 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
                  placeholder="Task title"
                >
              </div>
              <div>
                <h1 class="font-bold text-gray-700 mb-1">
                  Duration (min)
                </h1>
                <input
                  v-model.number="task.duration"
                  type="number"
                  class="border-2 rounded-lg w-full shadow-lg p-2 h-11 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
                  placeholder="Duration in minutes"
                >
              </div>
            </div>

            <div>
              <h1 class="font-bold mb-1 text-gray-700">
                Task Description
              </h1>
              <textarea
                v-model="task.description"
                class="border-2 rounded-lg w-full shadow-sm p-3 h-20 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
                placeholder="Task description"
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
                    task.selectedSkills.includes(skill)
                      ? 'bg-[#9c1313] text-white border-[#9c1313]'
                      : 'bg-white border-[#D9D9D9] hover:bg-[#FF4444] hover:text-white',
                  ]"
                  @click="toggleSkill(task.id, skill)"
                >
                  {{ skill }}
                </button>
              </div>

              <!-- Slider Section -->
              <div v-if="task.selectedSkills.length > 0" class="relative w-full mt-5">
                <div class="mb-2">
                  <div class="flex justify-between mb-5">
                    <div>
                      <h1 class="font-bold">
                        Weight Distribution
                      </h1>
                    </div>
                    <p class="rounded-lg text-white px-2" :class="[getTaskTotalWeight(task) === 100 ? 'bg-[#EB001B]' : 'bg-orange-500']">
                      {{ getTaskTotalWeight(task) }}% Total
                    </p>
                  </div>

                  <!-- Slider for each selected skill -->
                  <div
                    v-for="skill in task.selectedSkills"
                    :key="skill"
                    class="mb-4"
                  >
                    <div class="flex justify-between mb-2">
                      <span class="text-sm font-bold text-gray-700">{{ skill }}</span>
                      <span class="text-sm font-bold text-gray-700">{{ task.skillWeights[skill] || 0 }}%</span>
                    </div>
                    <div class="relative">
                      <!-- Background track -->
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <!-- Progress bar -->
                        <div
                          class="h-full bg-[#9c1313] rounded-full transition-all duration-150"
                          :style="{ width: `${task.skillWeights[skill] || 0}%` }"
                        />
                      </div>
                      <!-- Slider input -->
                      <input
                        :value="task.skillWeights[skill] || 0"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        class="absolute top-0 left-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-input"
                        @input="updateSkillWeight(task.id, skill, $event.target.value)"
                      >
                    </div>
                  </div>

                  <!-- Optional warning if total is 100 and user tries but cannot increase -->
                  <div v-if="getTaskTotalWeight(task) === 100" class="mt-1 text-gray-600 text-sm">
                    Total is 100%. To increase a skill, first reduce others.
                  </div>
                </div>
              </div>
              <!-- End Slider -->
            </div>
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

          <!-- Save To Template Section -->
          <div class="mt-5">
            <button
              class="w-full bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
              @click="toggleTemplateSection"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <svg
                    class="w-5 h-5 text-gray-600 mr-3 transition-transform duration-200"
                    :class="{ 'rotate-90': showTemplateSection }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <div class="text-left">
                    <h3 class="font-semibold text-gray-800">
                      Save As Template
                    </h3>
                    <p class="text-sm text-gray-500">
                      Save this training session as a template for future use.
                    </p>
                  </div>
                </div>
                <div class="flex items-center">
                  <span class="bg-red-200 text-red-600 text-xs px-2 py-1 rounded-full mr-2">Optional</span>
                  <div class="w-5 h-5 border border-gray-300 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            <!-- Expandable Template Section -->
            <transition name="expand">
              <div v-if="showTemplateSection" class="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div class="relative">
                      <select
                        v-model="templateCategory"
                        class="w-full border-2 rounded-lg shadow-sm p-3 border-gray-300 focus:border-[#9c1313] focus:outline-none focus:ring-1 focus:ring-[#9c1313] appearance-none"
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
                      </select>

                      <!-- Custom dropdown arrow -->
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <!-- Add new category button -->
                    <button
                      v-if="!showNewCategoryInput"
                      class="mt-3 flex items-center text-[#9c1313] hover:text-red-700 transition-colors"
                      @click="showAddNewCategory"
                    >
                      <Icon name="mdi:plus" size="1.5rem" class="text-[#9c1313] mx-auto" />
                      Add new category
                    </button>

                    <!-- New category input -->
                    <div v-if="showNewCategoryInput" class="mt-3 flex items-center space-x-2">
                      <input
                        ref="newCategoryInput"
                        v-model="newCategoryName"
                        type="text"
                        placeholder="Category name"
                        class="flex-1 border-2 rounded-lg shadow-sm p-2 border-gray-300 focus:border-[#9c1313] focus:outline-none focus:ring-1 focus:ring-[#9c1313]"
                        @keyup.enter="addNewCategory"
                        @keyup.escape="cancelNewCategory"
                      >
                      <button
                        class="px-3 py-2 bg-[#9c1313] text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        :disabled="!newCategoryName.trim()"
                        @click="addNewCategory"
                      >
                        Add
                      </button>
                      <button
                        class="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                        @click="cancelNewCategory"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div class="flex justify-end space-x-3 pt-2">
                    <button
                      class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      @click="cancelTemplate"
                    >
                      Cancel
                    </button>
                    <button
                      class="px-6 py-2 bg-[#9c1313] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!templateCategory"
                      @click="saveTemplate"
                    >
                      Save Template
                    </button>
                  </div>
                </div>
              </div>
            </transition>
            <div class="grid grid-cols-3 gap-3 mt-5">
              <div class="col-span-2">
                <button
                  class="px-6 py-2 w-full bg-[#9c1313] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Session
                </button>
              </div>
              <div class="col-span-1">
                <button
                  class="px-4 py-2 w-full text-gray-600 hover:text-gray-800 transition-colors border-2 border-[#D9D9D9] rounded-lg"
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
import { computed, defineProps, nextTick, ref } from 'vue';

interface Task {
  id: number;
  title: string;
  description: string;
  duration: number;
  selectedSkills: string[];
  skillWeights: Record<string, number>;
}

const props = defineProps<{
  show: boolean;
}>();

const availableSkills = ['Shooting', 'Dribbling', 'Defense', 'Athleticism', 'Basketball IQ', 'Rebounding'];
let taskIdCounter = 1;

// Initialize with one task
const tasks = ref<Task[]>([
  {
    id: taskIdCounter++,
    title: '',
    description: '',
    duration: 0,
    selectedSkills: [],
    skillWeights: {},
  },
]);

// Category management
const availableCategories = ref([]);
const templateCategory = ref('');
const newCategoryName = ref('');
const showNewCategoryInput = ref(false);
const newCategoryInput = ref<HTMLInputElement | null>(null);

// Template section state
const showTemplateSection = ref(false);
const templateName = ref('');
const templateDescription = ref('');

// Computed total time - sum of all task durations
const totalTime = computed(() => {
  return tasks.value.reduce((sum, task) => sum + (task.duration || 0), 0);
});

// Add a new task
function addTask() {
  tasks.value.push({
    id: taskIdCounter++,
    title: '',
    description: '',
    duration: 0,
    selectedSkills: [],
    skillWeights: {},
  });
}

// Remove a task by ID
function removeTask(taskId: number) {
  const index = tasks.value.findIndex(task => task.id === taskId);
  if (index > -1) {
    tasks.value.splice(index, 1);
  }
}

// Find task by ID
function findTask(taskId: number): Task | undefined {
  return tasks.value.find(task => task.id === taskId);
}

// Toggle skill selection for a specific task
function toggleSkill(taskId: number, skill: string) {
  const task = findTask(taskId);
  if (!task)
    return;

  const idx = task.selectedSkills.indexOf(skill);
  if (idx > -1) {
    // Remove: delete its weight
    task.selectedSkills.splice(idx, 1);
    delete task.skillWeights[skill];
  }
  else {
    // Add: initialize to 0 so user can assign manually
    task.selectedSkills.push(skill);
    task.skillWeights[skill] = 0;
  }
}

// Get total weight for a specific task
function getTaskTotalWeight(task: Task): number {
  return task.selectedSkills.reduce((sum, skill) => sum + (task.skillWeights[skill] || 0), 0);
}

// Compute max allowed weight for a skill in a specific task
function maxAllowedWeight(task: Task, skill: string): number {
  const current = task.skillWeights[skill] || 0;
  const otherTotal = getTaskTotalWeight(task) - current;
  return 100 - otherTotal;
}

// Update skill weight for a specific task
function updateSkillWeight(taskId: number, skill: string, rawValue: string) {
  const task = findTask(taskId);
  if (!task)
    return;

  let numValue = Number.parseInt(rawValue, 10);
  if (isNaN(numValue))
    numValue = 0;

  // Clamp between 0 and the dynamic max
  const maxAllowed = maxAllowedWeight(task, skill);
  const clamped = Math.max(0, Math.min(numValue, maxAllowed));
  task.skillWeights[skill] = clamped;

  // Force the slider to show the clamped value if it was constrained
  if (clamped !== numValue) {
    // Find the slider element and update its value
    const sliders = document.querySelectorAll('.slider-input');
    sliders.forEach((slider: HTMLInputElement) => {
      if (slider.value === rawValue) {
        slider.value = clamped.toString();
      }
    });
  }
}

// Category management functions
function showAddNewCategory() {
  showNewCategoryInput.value = true;
  nextTick(() => {
    newCategoryInput.value?.focus();
  });
}

function addNewCategory() {
  if (!newCategoryName.value.trim())
    return;

  const newCategory = newCategoryName.value.trim();

  // Check if category already exists (case insensitive)
  const exists = availableCategories.value.some(
    cat => cat.toLowerCase() === newCategory.toLowerCase(),
  );

  if (!exists) {
    availableCategories.value.push(newCategory);
    templateCategory.value = newCategory; // Auto-select the new category
  }
  else {
    templateCategory.value = availableCategories.value.find(
      cat => cat.toLowerCase() === newCategory.toLowerCase(),
    ) || '';
  }

  cancelNewCategory();
}

function cancelNewCategory() {
  showNewCategoryInput.value = false;
  newCategoryName.value = '';
}

function handleCategoryChange() {
  // This function can be used for additional logic when category changes
  console.log('Category changed to:', templateCategory.value);
}

// Template section functions
function toggleTemplateSection() {
  showTemplateSection.value = !showTemplateSection.value;
}

function cancelTemplate() {
  showTemplateSection.value = false;
  templateName.value = '';
  templateDescription.value = '';
  templateCategory.value = '';
  cancelNewCategory();
}

function saveTemplate() {
  if (!templateCategory.value)
    return;

  // Here you would typically save the template to your backend/database
  const templateData = {
    name: templateName.value,
    description: templateDescription.value,
    category: templateCategory.value,
    tasks: tasks.value,
    createdAt: new Date().toISOString(),
  };

  // Reset the form and close the section
  cancelTemplate();
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

/* Custom slider styling with proper constraint */
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
}

.slider-input::-webkit-slider-track {
  background: transparent;
  height: 8px;
}

.slider-input::-moz-range-track {
  background: transparent;
  height: 8px;
}

/* Ensure the slider thumb doesn't extend beyond the visual progress */
.slider-input::-webkit-slider-thumb {
  margin-top: -9px; /* Center the thumb on the track */
}

.slider-input::-moz-range-thumb {
  margin-top: -9px; /* Center the thumb on the track */
  border: none;
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
