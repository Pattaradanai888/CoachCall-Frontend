<template>
  <!-- Desktop/Tablet Layout (lg and above) -->
  <div class="hidden lg:grid lg:grid-cols-3 gap-4">
    <div v-motion-slide-visible-once-left :delay="200" class="lg:col-span-1 bg-white py-2 px-10">
      <h2 class="text-xl font-bold mb-2">
        Session Templates
      </h2>
      <div class="flex">
        <div class="relative w-full max-w-md shadow-lg">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search Templates"
            class="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300"
          >
          <Icon name="mdi:magnify" size="1rem" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      <div v-if="templatesPending" class="mt-6 text-center py-8 text-gray-500">
        Loading...
      </div>
      <div v-else-if="!paginatedTemplates.length" class="mt-6 text-center py-8">
        <p class="text-gray-500">
          No templates found.
        </p>
      </div>
      <div v-else ref="templatesContainer" class="mt-6 space-y-4">
        <SessionTemplateComponent
          v-for="template in paginatedTemplates"
          :key="template.id"
          :template="template"
        />
      </div>
      <button class="flex items-center justify-center w-full mt-4 p-3 border-2 border-dashed rounded-lg" @click="openCreateModal">
        <Icon name="mdi:plus-circle-outline" size="1.5rem" class="text-gray-600 mr-2" />
        <span class="font-medium text-gray-700">Create New Session</span>
      </button>
      <PaginationBar
        v-if="totalItems > itemsPerPage"
        v-model:current-page="currentPage"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        class="mt-4"
      />
    </div>

    <div v-motion-slide-visible-once-right :delay="200" class="lg:col-span-2 bg-white py-2 px-10">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold mb-1">
            Course Timeline
          </h2>
          <p class="text-sm text-gray-500">
            Total Duration: {{ totalDuration }} minutes | {{ droppedItems.length }} sessions
          </p>
        </div>
        <button
          class="flex items-center justify-center shadow-lg p-2 border-gray-300 border rounded-lg"
          :disabled="droppedItems.length === 0"
          @click="clearTimeline"
        >
          <Icon name="mdi:trash-can-outline" size="1rem" class="text-gray-500" />
        </button>
      </div>
      <div
        ref="timelineDropZone"
        class="min-h-[400px] border-2 border-dashed rounded-lg p-6 mt-5 timeline-drop-zone"
        :class="{ 'border-gray-300 bg-gray-50': !isDragOver, 'border-blue-500 bg-blue-50': isDragOver }"
      >
        <div v-if="droppedItems.length === 0" class="text-center py-20 pointer-events-none">
          <p class="text-gray-500">
            Drop templates here
          </p>
        </div>
        <div v-else class="space-y-4">
          <TimelineItem
            v-for="(item, index) in droppedItems"
            :key="item.timelineId"
            :item="item"
            :index="index"
            @remove="removeItem(index)"
            @edit-date="openDatePicker(index)"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Layout (below lg) -->
  <div class="lg:hidden space-y-6">
    <!-- Toggle between templates and timeline -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <div class="flex rounded-lg bg-gray-100">
        <button
          class="flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200"
          :class="mobileView === 'templates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          @click="mobileView = 'templates'"
        >
          <Icon name="mdi:view-list" size="1rem" class="inline-block mr-2" />
          Templates
        </button>
        <button
          class="flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 relative"
          :class="mobileView === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          @click="mobileView = 'timeline'"
        >
          <Icon name="mdi:timeline-clock" size="1rem" class="inline-block mr-2" />
          Timeline
          <span
            v-if="droppedItems.length > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ droppedItems.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- Templates View -->
    <div v-if="mobileView === 'templates'" v-motion-slide-visible-once-left :delay="200" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 class="text-lg font-bold mb-4">
        Session Templates
      </h2>
      <div class="relative mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Templates"
          class="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 text-sm"
        >
        <Icon name="mdi:magnify" size="1rem" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>
      
      <div v-if="templatesPending" class="text-center py-8 text-gray-500">
        Loading...
      </div>
      <div v-else-if="!paginatedTemplates.length" class="text-center py-8">
        <p class="text-gray-500">
          No templates found.
        </p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="template in paginatedTemplates"
          :key="template.id"
          class="bg-gray-50 rounded-lg border border-gray-200 p-4 relative"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-sm mb-2">
                {{ template.name }}
              </h3>
              <div class="flex items-center space-x-4">
                <span class="text-xs text-gray-500 flex items-center">
                  <Icon name="mdi:format-list-bulleted" size="0.8rem" class="mr-1" />
                  {{ template.task_count }} task{{ template.task_count !== 1 ? 's' : '' }}
                </span>
                <span class="text-xs text-gray-500 flex items-center">
                  <Icon name="mdi:clock-outline" size="0.8rem" class="mr-1" />
                  {{ template.total_duration_minutes }} min
                </span>
              </div>
            </div>
            <button
              class="bg-[#9C1313] text-white hover:bg-[#7A0F0F] px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
              @click="addTemplateToTimeline(template)"
            >
              <Icon name="mdi:plus" size="1rem" class="mr-1" />
              Add
            </button>
          </div>
        </div>
      </div>
      
      <button class="flex items-center justify-center w-full mt-4 p-3 border-2 border-dashed rounded-lg" @click="openCreateModal">
        <Icon name="mdi:plus-circle-outline" size="1.5rem" class="text-gray-600 mr-2" />
        <span class="font-medium text-gray-700">Create New Session</span>
      </button>
      
      <PaginationBar
        v-if="totalItems > itemsPerPage"
        v-model:current-page="currentPage"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        class="mt-4"
      />
    </div>

    <!-- Timeline View -->
    <div v-if="mobileView === 'timeline'" v-motion-slide-visible-once-right :delay="200" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-lg font-bold mb-1">
            Course Timeline
          </h2>
          <p class="text-xs text-gray-500">
            {{ totalDuration }} min | {{ droppedItems.length }} sessions
          </p>
        </div>
        <button
          class="flex items-center justify-center p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors duration-200"
          :disabled="droppedItems.length === 0"
          @click="clearTimeline"
        >
          <Icon name="mdi:trash-can-outline" size="1rem" />
        </button>
      </div>
      
      <div v-if="droppedItems.length === 0" class="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
        <Icon name="mdi:timeline-clock" size="3rem" class="text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 mb-2">
          No sessions added yet
        </p>
        <p class="text-sm text-gray-400">
          Go to Templates to add sessions
        </p>
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="(item, index) in droppedItems"
          :key="item.timelineId"
          class="bg-gray-50 rounded-lg border border-gray-200 p-4 relative"
        >
          <div class="absolute -left-2 -top-2 w-6 h-6 bg-[#9c1313] text-white rounded-full flex items-center justify-center text-xs font-bold">
            {{ index + 1 }}
          </div>
          
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1 pr-2">
              <h3 class="font-semibold text-sm mb-2">
                {{ item.name }}
              </h3>
              <div class="flex items-center space-x-4">
                <span class="text-xs text-gray-500 flex items-center">
                  <Icon name="mdi:format-list-bulleted" size="0.8rem" class="mr-1" />
                  {{ item.task_count ?? item.tasks_full?.length ?? 0 }} task{{ (item.task_count ?? item.tasks_full?.length ?? 0) !== 1 ? 's' : '' }}
                </span>
                <span class="text-xs text-gray-500 flex items-center">
                  <Icon name="mdi:clock-outline" size="0.8rem" class="mr-1" />
                  {{ item.total_duration_minutes }} min
                </span>
              </div>
            </div>
            
            <button
              class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
              @click="removeItem(index)"
            >
              <Icon name="mdi:close" size="1.2rem" />
            </button>
          </div>
          
          <div class="flex items-center justify-between">
            <button
              class="flex items-center text-sm px-3 py-2 rounded-lg transition-colors duration-200 flex-1 mr-2"
              :class="{
                'text-gray-600 bg-gray-100 hover:bg-gray-200': item.date,
                'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300': !item.date,
              }"
              @click="openDatePicker(index)"
            >
              <Icon name="mdi:calendar" size="1rem" class="mr-2" />
              <span v-if="item.date" class="truncate">{{ formatDate(item.date) }}</span>
              <span v-else class="font-medium">Select Date</span>
            </button>
            
            <div class="flex space-x-2">
              <button
                v-if="index > 0"
                class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                @click="moveItemUp(index)"
              >
                <Icon name="mdi:chevron-up" size="1.2rem" />
              </button>
              <button
                v-if="index < droppedItems.length - 1"
                class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                @click="moveItemDown(index)"
              >
                <Icon name="mdi:chevron-down" size="1.2rem" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="editingDateIndex !== null" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" @click.self="cancelDateSelection">
    <div class="bg-white p-6 rounded-lg shadow-xl">
      <h3 class="text-lg font-semibold mb-4">
        Select Session Date
      </h3>
      <VDatePicker v-model="selectedDate" mode="date" :min-date="courseStartDate" :max-date="courseEndDate" />
      <div class="flex justify-end space-x-3 mt-4">
        <button @click="cancelDateSelection">
          Cancel
        </button>
        <button @click="saveDateSelection">
          Save Date
        </button>
      </div>
    </div>
  </div>

  <SessionBuilderModal
    :show="showAddModal"
    mode="timeline"
    :available-skills="availableSkills || []"
    @close="closeCreateModal"
    @create-session="handleSessionCreated"
    @create-template="handleTemplateCreated"
  />

  <!-- Notification Modal for Template Save -->
  <NotificationModal
    :show="showNotification"
    :title="notificationTitle"
    :message="notificationMessage"
    :type="notificationType"
    @close="showNotification = false"
  />
</template>

<script setup lang="ts">
import type { DroppedItem, Session, SessionCreatePayload, SessionTemplate, TaskFull } from '~/types/course';
import { PaginationBar } from '#components';
import Sortable from 'sortablejs';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import SessionBuilderModal from '~/components/course/SessionBuilderModal.vue';
import { useCourses } from '~/composables/useCourses';
import { useSubmit } from '~/composables/useSubmit';
import SessionTemplateComponent from './AddSession/SessionTemplate.vue';
import TimelineItem from './AddSession/TimelineItem.vue';

interface CourseData {
  title?: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  cover_image_url?: string | null;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  } | null;
  imagePreview?: string | null;
  imageFile?: File | null;
}

const props = withDefaults(defineProps<{
  modelValue?: DroppedItem[];
  courseData?: CourseData;
}>(), {
  modelValue: () => [],
  courseData: () => ({}),
});

const emit = defineEmits(['update:modelValue', 'editStep']);

const templatesContainer = ref<HTMLElement | null>(null);
const timelineDropZone = ref<HTMLElement | null>(null);

const showAddModal = ref(false);
const showNotification = ref(false);
const notificationTitle = ref('');
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');
const currentPage = ref(1);
const itemsPerPage = 5;
const searchQuery = ref('');
const droppedItems = ref<DroppedItem[]>([]);
const isDragOver = ref(false);
let timelineSortable: Sortable | null = null;
let templateSortable: Sortable | null = null;
const editingDateIndex = ref<number | null>(null);
const selectedDate = ref<Date | null>(null);
const mobileView = ref<'templates' | 'timeline'>('templates');
const isSyncingFromParent = ref(false); // Flag to prevent emit loop

const { fetchSessionTemplates, fetchSkills, createSession } = useCourses();
const { data: initialTemplates, pending: templatesPending, refresh: refreshTemplates } = await fetchSessionTemplates();

const localTemplates = ref<Session[]>([]);
watch(initialTemplates, (newVal) => {
  if (newVal) {
    localTemplates.value = JSON.parse(JSON.stringify(newVal));
  }
}, { immediate: true, deep: true });

const { data: availableSkills } = await fetchSkills();

const { submit: performSaveTemplate } = useSubmit(createSession, {
  onSuccess: () => {
    notificationTitle.value = 'Success';
    notificationMessage.value = 'Template saved successfully!';
    notificationType.value = 'success';
    showNotification.value = true;
    refreshTemplates();
  },
  onError: (err) => {
    notificationTitle.value = 'Error';
    notificationMessage.value = `Failed to save template: ${err}`;
    notificationType.value = 'error';
    showNotification.value = true;
  },
});

watch(droppedItems, (newVal) => {
  if (isSyncingFromParent.value) {
    return;
  }
  emit('update:modelValue', newVal);
}, { deep: true });

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    return;
  }
  
  // Always sync from parent to ensure data consistency
  // This is critical for edit mode where parent loads data from API
  isSyncingFromParent.value = true;
  droppedItems.value = JSON.parse(JSON.stringify(newVal));
  
  // Reset flag after Vue updates
  nextTick(() => {
    isSyncingFromParent.value = false;
  });
}, { immediate: true, deep: true });

const courseStartDate = computed(() => props.courseData?.dateRange?.start ? new Date(props.courseData.dateRange.start) : null);
const courseEndDate = computed(() => props.courseData?.dateRange?.end ? new Date(props.courseData.dateRange.end) : null);

const filteredTemplates = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query)
    return localTemplates.value;
  return localTemplates.value.filter(t => t.name.toLowerCase().includes(query));
});

const totalItems = computed(() => filteredTemplates.value.length);
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTemplates.value.slice(start, start + itemsPerPage);
});
const totalDuration = computed(() => droppedItems.value.reduce((sum, item) => sum + item.total_duration_minutes, 0));

function openCreateModal() {
  showAddModal.value = true;
}
function closeCreateModal() {
  showAddModal.value = false;
}

function handleSessionCreated(sessionData: SessionTemplate | { id: string; name: string; description: string; total_duration_minutes: number; task_count: number; tasks_full: TaskFull[] }) {
  const newItem = { ...sessionData, timelineId: `custom-${Date.now()}`, date: null, tasks: [], scheduled_date: '' } as DroppedItem;
  droppedItems.value.push(newItem);
  enforceTimelineOrder();
  closeCreateModal();
}

async function handleTemplateCreated(payload: SessionCreatePayload) {
  await performSaveTemplate(payload);
}

/**
 * Sorts the timeline: dated items first (chronologically), then undated items (preserving manual order).
 */
function enforceTimelineOrder() {
  const dated = droppedItems.value.filter(item => item.date);
  const undated = droppedItems.value.filter(item => !item.date);

  // Sort the dated items chronologically
  dated.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  // Combine them back, assigning to the ref's value to trigger reactivity.
  droppedItems.value = [...dated, ...undated];
}

async function initializeSortable() {
  await nextTick();

  if (templateSortable)
    templateSortable.destroy();
  if (timelineSortable)
    timelineSortable.destroy();

  if (templatesContainer.value) {
    templateSortable = new Sortable(templatesContainer.value, {
      group: { name: 'sessions', pull: 'clone', put: false },
      animation: 150,
      draggable: '.session-template',
      sort: false,
      onStart: () => { isDragOver.value = true; },
      onEnd: () => { isDragOver.value = false; },
    });
  }

  if (timelineDropZone.value) {
    timelineSortable = new Sortable(timelineDropZone.value, {
      group: 'sessions',
      animation: 150,
      handle: '.drag-handle',
      draggable: '.timeline-item',
      ghostClass: 'sortable-ghost',
      onEnd: (evt) => {
        isDragOver.value = false;
        if (evt.from === evt.to && evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          const item = droppedItems.value.splice(evt.oldIndex, 1)[0];
          droppedItems.value.splice(evt.newIndex, 0, item);
          // After any manual re-order, enforce the sorting rules
          enforceTimelineOrder();
        }
      },
      onAdd: (evt) => {
        const templateId = Number(evt.item.dataset.id);
        if (Number.isNaN(templateId))
          return;

        const originalTemplate = localTemplates.value.find(t => t.id === templateId);
        if (!originalTemplate)
          return;

        let tasks_full: TaskFull[] = [];
        if (originalTemplate.tasks && Array.isArray(originalTemplate.tasks)) {
          tasks_full = originalTemplate.tasks.map(sessionTask => ({
            id: sessionTask.task?.id || 0,
            title: sessionTask.task?.name || '',
            description: sessionTask.task?.description || '',
            duration: sessionTask.task?.duration_minutes || 0,
            selectedSkillIds: sessionTask.task?.skill_weights?.map(sw => sw.skill_id) || [],
            skillWeights: sessionTask.task?.skill_weights?.reduce((acc, sw) => {
              acc[sw.skill_id] = Number.parseFloat(sw.weight) * 100;
              return acc;
            }, {} as Record<number, number>) || {},
          }));
        }

        const newItem: DroppedItem = {
          id: originalTemplate.id,
          name: originalTemplate.name,
          description: originalTemplate.description,
          total_duration_minutes: originalTemplate.total_duration_minutes,
          task_count: originalTemplate.task_count,
          scheduled_date: originalTemplate.scheduled_date,
          tasks: originalTemplate.tasks,
          date: null,
          timelineId: `${originalTemplate.id}-${Date.now()}`,
          tasks_full,
        };

        if (evt.newIndex !== undefined) {
          droppedItems.value.splice(evt.newIndex, 0, newItem);
          // After adding, enforce the sorting rules to place the new (undated) item correctly
          enforceTimelineOrder();
        }

        evt.item.remove();
      },
    });
  }
}

watch(paginatedTemplates, () => {
  nextTick(() => initializeSortable());
}, { deep: true });

onMounted(() => {
  initializeSortable();
  
  // Check if we should show templates or timeline on mobile based on content
  if (droppedItems.value.length > 0) {
    mobileView.value = 'timeline';
  }
});

onUnmounted(() => {
  if (timelineSortable)
    timelineSortable.destroy();
  if (templateSortable)
    templateSortable.destroy();
});

function removeItem(index: number) {
  droppedItems.value.splice(index, 1);
}

function clearTimeline() {
  droppedItems.value = [];
}

function openDatePicker(index: number) {
  editingDateIndex.value = index;
  selectedDate.value = droppedItems.value[index].date;
}

function cancelDateSelection() {
  editingDateIndex.value = null;
  selectedDate.value = null;
}

function saveDateSelection() {
  if (editingDateIndex.value !== null && selectedDate.value) {
    droppedItems.value[editingDateIndex.value].date = selectedDate.value;
    // After changing a date, enforce the sorting rules
    enforceTimelineOrder();
  }
  cancelDateSelection();
}

// Mobile-specific functions
function addTemplateToTimeline(template: Session) {
  let tasks_full: TaskFull[] = [];
  if (template.tasks && Array.isArray(template.tasks)) {
    tasks_full = template.tasks.map(sessionTask => ({
      id: sessionTask.task?.id || 0,
      title: sessionTask.task?.name || '',
      description: sessionTask.task?.description || '',
      duration: sessionTask.task?.duration_minutes || 0,
      selectedSkillIds: sessionTask.task?.skill_weights?.map(sw => sw.skill_id) || [],
      skillWeights: sessionTask.task?.skill_weights?.reduce((acc, sw) => {
        acc[sw.skill_id] = Number.parseFloat(sw.weight) * 100;
        return acc;
      }, {} as Record<number, number>) || {},
    }));
  }

  const newItem: DroppedItem = {
    id: template.id,
    name: template.name,
    description: template.description,
    total_duration_minutes: template.total_duration_minutes,
    task_count: template.task_count,
    scheduled_date: template.scheduled_date,
    tasks: template.tasks,
    date: null,
    timelineId: `${template.id}-${Date.now()}`,
    tasks_full,
  };

  droppedItems.value.push(newItem);
  enforceTimelineOrder();
  
  // Switch to timeline view to show the added item
  mobileView.value = 'timeline';
}

function moveItemUp(index: number) {
  if (index > 0) {
    const item = droppedItems.value.splice(index, 1)[0];
    droppedItems.value.splice(index - 1, 0, item);
    enforceTimelineOrder();
  }
}

function moveItemDown(index: number) {
  if (index < droppedItems.value.length - 1) {
    const item = droppedItems.value.splice(index, 1)[0];
    droppedItems.value.splice(index + 1, 0, item);
    enforceTimelineOrder();
  }
}

function formatDate(date: string | number | Date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.timeline-drop-zone {
  position: relative;
}

.sortable-ghost {
  opacity: 0.4;
  background: #f3f4f6;
  border: 2px dashed #9ca3af;
}

.sortable-chosen {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.sortable-drag {
  transform: rotate(5deg);
  opacity: 0.8;
}

.timeline-item {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.session-template {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

/* Mobile-specific enhancements */
@media (max-width: 1023px) {
  .session-template {
    cursor: default;
    transform: none !important;
  }
  
  .session-template:hover {
    transform: none !important;
    scale: 1 !important;
  }
  
  .timeline-item {
    cursor: default;
  }
}
</style>
