<template>
  <div class="grid grid-cols-3 gap-4">
    <!-- Left Panel: Session Template with Pagination -->
    <div v-motion-slide-visible-once-left :delay="200" class="lg:col-span-1 bg-white py-2 px-10">
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
    <div v-motion-slide-visible-once-right :delay="200" class="lg:col-span-2 bg-white py-2 px-10">
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
          <button
            class="flex items-center justify-center shadow-lg p-2 border-gray-300 border rounded-lg hover:bg-slate-50 transition-colors"
            @click="addNewSession"
          >
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

  <!-- Enhanced Date Picker Modal with VCalendar -->
  <div
    v-if="editingDateIndex !== null"
    class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
    @click.self="cancelDateSelection"
  >
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
      <h3 class="text-lg font-semibold mb-4">
        Select Session Date
      </h3>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
        <VDatePicker
          v-model="selectedDate"
          mode="date"
          :min-date="courseStartDate"
          :max-date="courseEndDate"
          :disabled-dates="[]"
          class="w-full"
        >
          <template #default="{ inputValue, inputEvents }">
            <input
              :value="inputValue"
              placeholder="Select a date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-colors"
              readonly
              v-on="inputEvents"
            >
          </template>
        </VDatePicker>
      </div>

      <!-- Session availability section -->
      <div v-if="selectedDate" class="mt-6">
        <h4 class="font-medium text-gray-700 mb-3 flex items-center">
          <Icon name="mdi:calendar-check" class="mr-2 text-blue-500" />
          Sessions on {{ formatDisplayDate(selectedDate) }}
        </h4>

        <div
          class="border rounded-lg overflow-hidden"
          :class="{ 'border-green-200 bg-green-50': sessionsOnSelectedDate.length === 0, 'border-yellow-200 bg-yellow-50': sessionsOnSelectedDate.length > 0 }"
        >
          <div v-if="sessionsOnSelectedDate.length === 0" class="p-4 text-center">
            <p class="text-green-700 font-medium">
              <Icon name="mdi:check-circle" class="mr-1 inline-block" />
              No sessions scheduled - this day is available
            </p>
          </div>

          <div v-else>
            <div class="bg-gray-50 px-4 py-2 border-b flex items-center">
              <Icon name="mdi:alert-circle" class="mr-2 text-yellow-500" />
              <span class="text-sm font-medium text-gray-700">
                {{ sessionsOnSelectedDate.length }} session{{ sessionsOnSelectedDate.length !== 1 ? 's' : '' }} scheduled
              </span>
            </div>
            <div class="max-h-40 overflow-y-auto scroll-container">
              <div
                v-for="(session, index) in sessionsOnSelectedDate"
                :key="index"
                class="px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-800">
                      {{ session.title }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      Duration: {{ session.duration }} minutes
                    </p>
                  </div>
                  <span
                    v-if="isSameDay(session.date, selectedDate)"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    Current
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          @click="cancelDateSelection"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          :disabled="!selectedDate || !isDateInRange(selectedDate)"
          @click="saveDateSelection"
        >
          Save Date
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sortable from 'sortablejs';
import { computed, defineProps, onUnmounted, ref, watch } from 'vue';
import SessionTemplate from './AddSession/SessionTemplate.vue';
import TimelineItem from './AddSession/TimelineItem.vue';

const props = defineProps({
  sessionData: {
    type: Array,
    default: () => [],
  },
  courseData: {
    type: Object,
    default: () => ({}),
  },
});

// Computed properties for date range
const courseStartDate = computed(() => {
  if (props.courseData?.dateRange?.start) {
    return new Date(props.courseData.dateRange.start);
  }
  if (props.courseData?.startDate) {
    return new Date(props.courseData.startDate);
  }
  return null;
});

const courseEndDate = computed(() => {
  if (props.courseData?.dateRange?.end) {
    return new Date(props.courseData.dateRange.end);
  }
  if (props.courseData?.endDate) {
    return new Date(props.courseData.endDate);
  }
  return null;
});

// Pagination state
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
  let arr = templates.value;
  if (searchQuery.value) {
    arr = arr.filter(t =>
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      || t.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase())),
    );
  }
  if (filterDifficulty.value) {
    arr = arr.filter(t => t.difficulty === filterDifficulty.value);
  }
  return arr;
});

const totalItems = computed(() => filteredTemplates.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTemplates.value.slice(start, start + itemsPerPage);
});

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
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

// Timeline / Drag-Drop state
const droppedItems = ref([]);
const isDragOver = ref(false);
const timelineContainer = ref(null);
const dropZone = ref(null);
let sortableInstance = null;

const totalDuration = computed(() =>
  droppedItems.value.reduce((sum, item) => sum + item.duration, 0),
);

watch(
  () => props.sessionData,
  (newSessions) => {
    if (Array.isArray(newSessions) && newSessions.length) {
      droppedItems.value = newSessions.map(item => ({
        ...item,
        date: typeof item.date === 'string' ? new Date(item.date) : item.date,
      }));
    }
    else {
      droppedItems.value = [];
    }
  },
  { immediate: true },
);

watch(timelineContainer, (newContainer) => {
  if (newContainer) {
    sortableInstance = Sortable.create(timelineContainer.value, {
      animation: 200,
      easing: 'cubic-bezier(1, 0, 0, 1)',
      dragClass: 'timeline-drag',
      ghostClass: 'timeline-ghost',
      chosenClass: 'timeline-chosen',
      handle: '.drag-handle',
      filter: '.no-drag',
      preventOnFilter: false,
      onEnd: (evt) => {
        if (evt.oldIndex !== evt.newIndex) {
          const moved = droppedItems.value.splice(evt.oldIndex, 1)[0];
          droppedItems.value.splice(evt.newIndex, 0, moved);
        }
      },
    });
  }
  else if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
});

function handleDragOver(evt) {
  evt.preventDefault();
  isDragOver.value = true;
}
function handleDragLeave() {
  isDragOver.value = false;
}
function handleDrop(evt) {
  evt.preventDefault();
  const templateData = evt.dataTransfer.getData('template');
  if (templateData) {
    const template = JSON.parse(templateData);
    addItemToTimeline(template);
  }
  isDragOver.value = false;
}

function addItemToTimeline(template) {
  const newItem = {
    ...template,
    date: null, // No default date, set to null to prompt user
    id: `${template.id}-${Date.now()}`,
  };
  droppedItems.value.push(newItem);
}

// Add new session via plus button
function addNewSession() {
  // Create a default new session with no date
  const newSession = {
    id: `new-${Date.now()}`,
    title: 'New Session',
    difficulty: 'beginner',
    tasks: 1,
    duration: 30,
    tags: ['Custom'],
    date: null, // No default date, set to null to prompt user
  };
  droppedItems.value.push(newSession);
}
function removeItem(index) {
  droppedItems.value.splice(index, 1);
  if (!droppedItems.value.length && sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
}

function clearTimeline() {
  if (droppedItems.value.length) {
    droppedItems.value = [];
    if (sortableInstance) {
      sortableInstance.destroy();
      sortableInstance = null;
    }
  }
}

// Date Picker
const editingDateIndex = ref(null);
const selectedDate = ref(null);

// Enhanced session availability
const sessionsOnSelectedDate = computed(() => {
  if (!selectedDate.value)
    return [];

  return droppedItems.value.filter((item, index) => {
    if (index === editingDateIndex.value)
      return false;

    if (!item.date)
      return false;

    const sessionDate = new Date(item.date);
    const selected = new Date(selectedDate.value);

    return (
      sessionDate.getFullYear() === selected.getFullYear()
      && sessionDate.getMonth() === selected.getMonth()
      && sessionDate.getDate() === selected.getDate()
    );
  });
});

function formatDisplayDate(date) {
  if (!date)
    return '';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function isSameDay(date1, date2) {
  if (!date1 || !date2)
    return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
  );
}

function isDateInRange(date) {
  if (!date)
    return false;
  const checkDate = new Date(date);

  // Set time to start of day for comparison
  checkDate.setHours(0, 0, 0, 0);

  const startDate = courseStartDate.value;
  const endDate = courseEndDate.value;

  if (!startDate || !endDate)
    return true;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Set time to start of day for comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return checkDate >= start && checkDate <= end;
}

function openDatePicker(index) {
  editingDateIndex.value = index;
  const currentDate = droppedItems.value[index].date;
  if (currentDate) {
    selectedDate.value = new Date(currentDate);
  }
  else {
    selectedDate.value = null;
  }
}

function cancelDateSelection() {
  editingDateIndex.value = null;
  selectedDate.value = null;
}

function saveDateSelection() {
  if (editingDateIndex.value !== null && selectedDate.value) {
    const selected = new Date(selectedDate.value);

    droppedItems.value[editingDateIndex.value].date = selected;
    editingDateIndex.value = null;
    selectedDate.value = null;
  }
}

function getData() {
  return droppedItems.value;
}
defineExpose({ getData });

onUnmounted(() => {
  if (sortableInstance) {
    sortableInstance.destroy();
  }
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
.scroll-container::-webkit-scrollbar {
  width: 6px;
}
.scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.scroll-container::-webkit-scrollbar-thumb:hover {
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
