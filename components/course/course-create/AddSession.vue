<template>
  <div class="grid grid-cols-3 gap-4">
    <!-- Left Panel: Session Template with Pagination -->
    <div class="lg:col-span-1 bg-white py-2 px-10">
      <h2 class="text-xl font-bold mb-2">
        Session Template
      </h2>
      <div class="flex">
        <div class="relative w-full max-w-md shadow-lg">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search Template"
            class="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:border-[#9C1313] transition duration-300 ease-in-out"
          >
          <Icon
            name="mdi:magnify"
            size="1rem"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
        <button
          class="flex items-center justify-center shadow-lg p-2 border-gray-300 border rounded-lg ml-1 hover:bg-slate-50"
          @click="toggleFilter"
        >
          <Icon name="mdi:filter-outline" size="1rem" class="text-gray-500 pointer-events-none" />
        </button>
      </div>
      <div v-if="showFilter" class="mt-4 p-3 bg-gray-50 rounded-lg">
        <div class="mb-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select v-model="filterDifficulty" class="w-full px-3 py-1 border border-gray-300 rounded-md text-sm">
            <option value="">
              All Levels
            </option>
            <option value="beginner">
              Beginner
            </option>
            <option value="intermediate">
              Intermediate
            </option>
            <option value="advanced">
              Advanced
            </option>
          </select>
        </div>
      </div>
      <div class="mt-6 space-y-4">
        <SessionTemplate
          v-for="template in paginatedTemplates"
          :key="template.id"
          :template="template"
        />
      </div>
      <div v-if="filteredTemplates.length === 0" class="mt-6 text-center py-8">
        <Icon name="mdi:magnify" size="2rem" class="text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500">
          No templates found
        </p>
      </div>
      <div v-if="totalPages > 1" class="mt-4 flex justify-center items-center space-x-2">
        <button
          class="px-2 py-1 rounded-md hover:bg-gray-200"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <Icon name="mdi:arrow-left" size="1rem" />
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          class="px-2 py-1 rounded-md"
          :class="{ 'bg-[#9C1313] text-white': currentPage === page, 'hover:bg-gray-200': currentPage !== page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          class="px-2 py-1 rounded-md hover:bg-gray-200"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          <Icon name="mdi:arrow-right" size="1rem" />
        </button>
      </div>
    </div>

    <!-- Right Panel: Course Timeline -->
    <div class="lg:col-span-2 bg-white py-2 px-10">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold mb-1">
            Course Timeline
          </h2>
          <p class="text-sm text-gray-500">
            Total Duration: {{ totalDuration }} minutes | {{ droppedItems.length }} session{{ droppedItems.length !== 1 ? 's' : '' }}
          </p>
        </div>
        <div class="flex space-x-2">
          <button
            class="flex items-center justify-center shadow-lg p-2 border-gray-300 border rounded-lg hover:bg-slate-50 transition-colors"
            :disabled="droppedItems.length === 0"
            :class="{ 'opacity-50 cursor-not-allowed': droppedItems.length === 0 }"
            @click="clearTimeline"
          >
            <Icon name="mdi:trash-can-outline" size="1rem" class="text-gray-500" />
          </button>
          <button class="flex items-center justify-center shadow-lg p-2 border-gray-300 border rounded-lg hover:bg-slate-50 transition-colors">
            <Icon name="mdi:plus" size="1rem" class="text-gray-500" />
          </button>
        </div>
      </div>
      <div
        ref="dropZone"
        class="min-h-[400px] border-2 border-dashed rounded-lg p-6 transition-all duration-200 mt-5"
        :class="{ 'border-gray-300 bg-gray-50': !isDragOver, 'border-blue-500 bg-blue-50 scale-102': isDragOver }"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <div v-if="droppedItems.length === 0" class="text-center py-20">
          <Icon name="mdi:drag" size="3rem" class="text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">
            Drop templates here to build your course
          </p>
          <p class="text-gray-400 text-sm mt-2">
            Drag and drop from the left panel
          </p>
        </div>
        <div v-else ref="timelineContainer" :key="droppedItems.length" class="space-y-4">
          <TimelineItem
            v-for="(item, index) in droppedItems"
            :key="item.id"
            :item="item"
            :index="index"
            @remove="removeItem"
            @edit-date="openDatePicker"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Date Picker Modal -->
  <div
    v-if="editingDateIndex !== null"
    class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
    @click.self="cancelDateSelection"
  >
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold mb-4">
        Select Session Date
      </h3>
      <div class="mb-4">
        <input
          v-model="selectedDate"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        >
      </div>
      <div class="flex justify-end space-x-3">
        <button
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          @click="cancelDateSelection"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          @click="saveDateSelection"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sortable from 'sortablejs';
import SessionTemplate from './AddSession/SessionTemplate.vue';
import TimelineItem from './AddSession/TimelineItem.vue';

// --- Pagination Logic ---
const currentPage = ref(1);
const itemsPerPage = 5;
const searchQuery = ref('');
const filterDifficulty = ref('');
const showFilter = ref(false);

const templates = ref([
  { id: 1, title: 'Shooting Drills', difficulty: 'intermediate', tasks: 5, duration: 40, tags: ['Accuracy', 'Stamina'] },
  { id: 2, title: 'Dribbling Practice', difficulty: 'beginner', tasks: 3, duration: 25, tags: ['Ball Control', 'Speed'] },
  { id: 3, title: 'Defense Training', difficulty: 'advanced', tasks: 7, duration: 60, tags: ['Positioning', 'Tackling'] },
  { id: 4, title: 'Passing Techniques', difficulty: 'intermediate', tasks: 4, duration: 35, tags: ['Teamwork', 'Precision'] },
  { id: 5, title: 'Fitness Training', difficulty: 'beginner', tasks: 6, duration: 45, tags: ['Endurance', 'Strength'] },
  { id: 6, title: 'Tactical Analysis', difficulty: 'advanced', tasks: 8, duration: 90, tags: ['Strategy', 'Analysis'] },
  { id: 7, title: 'Conditioning', difficulty: 'intermediate', tasks: 5, duration: 50, tags: ['Endurance', 'Speed'] },
  { id: 8, title: 'Shooting Accuracy', difficulty: 'beginner', tasks: 4, duration: 30, tags: ['Precision', 'Technique'] },
]);

const filteredTemplates = computed(() => {
  let filtered = templates.value;
  if (searchQuery.value) {
    filtered = filtered.filter(template =>
      template.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      || template.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase())),
    );
  }
  if (filterDifficulty.value) {
    filtered = filtered.filter(template => template.difficulty === filterDifficulty.value);
  }
  return filtered;
});

const totalItems = computed(() => filteredTemplates.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTemplates.value.slice(start, end);
});

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value)
    currentPage.value = page;
}
function prevPage() {
  if (currentPage.value > 1)
    currentPage.value--;
}
function nextPage() {
  if (currentPage.value < totalPages.value)
    currentPage.value++;
}
function toggleFilter() {
  showFilter.value = !showFilter.value;
}

// --- Timeline and Drag-Drop Logic ---
const droppedItems = ref([]);
const isDragOver = ref(false);
const timelineContainer = ref(null);
const dropZone = ref(null);
let sortableInstance = null;

const totalDuration = computed(() => {
  return droppedItems.value.reduce((sum, item) => sum + item.duration, 0);
});

watch(timelineContainer, (newContainer) => {
  if (newContainer) {
    initSortable();
  }
  else if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
});

function initSortable() {
  sortableInstance = Sortable.create(timelineContainer.value, {
    animation: 200,
    easing: 'cubic-bezier(1, 0, 0, 1)',
    dragClass: 'timeline-drag',
    ghostClass: 'timeline-ghost',
    chosenClass: 'timeline-chosen',
    handle: '.drag-handle',
    filter: '.no-drag',
    preventOnFilter: false,
    onEnd: (event) => {
      if (event.oldIndex !== event.newIndex) {
        const movedItem = droppedItems.value.splice(event.oldIndex, 1)[0];
        droppedItems.value.splice(event.newIndex, 0, movedItem);
      }
    },
  });
}

function handleDragOver(event) {
  event.preventDefault();
  isDragOver.value = true;
}
function handleDragLeave() {
  isDragOver.value = false;
}
function handleDrop(event) {
  event.preventDefault();
  const templateData = event.dataTransfer.getData('template');
  if (templateData) {
    const template = JSON.parse(templateData);
    addItemToTimeline(template);
  }
  isDragOver.value = false;
}
function addItemToTimeline(template) {
  const newItem = { ...template, date: new Date(), id: `${template.id}-${Date.now()}` };
  droppedItems.value.push(newItem);
}
function removeItem(index) {
  const removedItem = droppedItems.value[index];
  droppedItems.value.splice(index, 1);
  if (droppedItems.value.length === 0 && sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
}
function clearTimeline() {
  if (droppedItems.value.length > 0) {
    droppedItems.value = [];
    if (sortableInstance) {
      sortableInstance.destroy();
      sortableInstance = null;
    }
  }
}

// --- Date Picker Logic ---
const editingDateIndex = ref(null);
const selectedDate = ref(null);

function openDatePicker(index) {
  editingDateIndex.value = index;
  const currentDate = new Date(droppedItems.value[index].date);
  selectedDate.value = currentDate.toISOString().split('T')[0];
}
function cancelDateSelection() {
  editingDateIndex.value = null;
  selectedDate.value = null;
}
function saveDateSelection() {
  if (editingDateIndex.value !== null && selectedDate.value) {
    droppedItems.value[editingDateIndex.value].date = new Date(selectedDate.value);
    editingDateIndex.value = null;
    selectedDate.value = null;
  }
}

// --- Cleanup ---
onUnmounted(() => {
  if (sortableInstance)
    sortableInstance.destroy();
});
</script>

<style scoped>
.transition-all {
  transition: all 0.2s ease-in-out;
}
.timeline-item {
  transition: all 0.3s ease;
  z-index: 1;
}
.timeline-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
.timeline-drag {
  transform: rotate(3deg) scale(1.05);
  opacity: 0.8;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 10;
}
.timeline-ghost {
  opacity: 0.3;
  background: #f3f4f6 !important;
  border: 2px dashed #d1d5db !important;
}
.timeline-chosen {
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
  transform: scale(1.02);
  border-color: #3b82f6 !important;
}
.drag-handle {
  cursor: grab;
}
.drag-handle:active {
  cursor: grabbing;
}
.no-drag {
  cursor: default;
}
.scale-102 {
  transform: scale(1.02);
}
.space-y-4::-webkit-scrollbar {
  width: 6px;
}
.space-y-4::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.space-y-4::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.space-y-4::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
@media (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
  .lg\:col-span-1,
  .lg\:col-span-2 {
    grid-column: span 1;
  }
}
</style>
