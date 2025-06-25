<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
      <div v-else class="mt-6 space-y-4">
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
        class="min-h-[400px] border-2 border-dashed rounded-lg p-6 mt-5"
        :class="{ 'border-gray-300 bg-gray-50': !isDragOver, 'border-blue-500 bg-blue-50': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <div v-if="droppedItems.length === 0" class="text-center py-20">
          <p class="text-gray-500">
            Drop templates here
          </p>
        </div>
        <div v-else ref="timelineContainer" class="space-y-4">
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
</template>

<script setup lang="ts">
import type { SessionCreatePayload, SessionTemplate } from '~/types/course';
import { PaginationBar } from '#components';
import Sortable from 'sortablejs';
import { computed, onUnmounted, ref, watch } from 'vue';
import SessionBuilderModal from '~/components/course/SessionBuilderModal.vue';
import { useCourses } from '~/composables/useCourses';
import { useSubmit } from '~/composables/useSubmit';
import SessionTemplateComponent from './AddSession/SessionTemplate.vue';
import TimelineItem from './AddSession/TimelineItem.vue';

interface DroppedItem extends SessionTemplate {
  timelineId: string;
  date: Date | null;
  tasks_full?: any[];
}

const props = withDefaults(defineProps<{
  modelValue?: DroppedItem[];
  courseData?: any;
}>(), {
  modelValue: () => [],
  courseData: () => ({}),
});

const emit = defineEmits(['update:modelValue', 'editStep']);

const showAddModal = ref(false);
const currentPage = ref(1);
const itemsPerPage = 5;
const searchQuery = ref('');
const droppedItems = ref<DroppedItem[]>([]);
const isDragOver = ref(false);
const timelineContainer = ref<HTMLElement | null>(null);
let sortableInstance: Sortable | null = null;
const editingDateIndex = ref<number | null>(null);
const selectedDate = ref<Date | null>(null);

const { fetchSessionTemplates, fetchSkills, createSession } = useCourses();
const { data: templates, pending: templatesPending, refresh: refreshTemplates } = await fetchSessionTemplates();
const { data: availableSkills } = await fetchSkills();

const { submit: performSaveTemplate } = useSubmit(createSession, {
  onSuccess: () => {
    alert('Template saved successfully!');
    refreshTemplates();
  },
  onError: (err) => {
    alert(`Failed to save template: ${err}`);
  },
});

watch(droppedItems, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });

watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(droppedItems.value)) {
    droppedItems.value = newVal;
  }
}, { immediate: true, deep: true });

const courseStartDate = computed(() => props.courseData?.dateRange?.start ? new Date(props.courseData.dateRange.start) : null);
const courseEndDate = computed(() => props.courseData?.dateRange?.end ? new Date(props.courseData.dateRange.end) : null);

const filteredTemplates = computed(() => {
  if (!templates.value)
    return [];
  const query = searchQuery.value.toLowerCase();
  if (!query)
    return templates.value;
  return templates.value.filter(t => t.name.toLowerCase().includes(query));
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

function handleSessionCreated(sessionData: any) {
  const newItem = { ...sessionData, timelineId: `custom-${Date.now()}`, date: null };
  droppedItems.value.push(newItem);
  closeCreateModal();
}

async function handleTemplateCreated(payload: SessionCreatePayload) {
  await performSaveTemplate(payload);
}

watch(timelineContainer, (newEl) => {
  if (newEl) {
    sortableInstance = Sortable.create(newEl, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: (evt) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          const [movedItem] = droppedItems.value.splice(evt.oldIndex, 1);
          droppedItems.value.splice(evt.newIndex, 0, movedItem);
        }
      },
    });
  }
});

function handleDrop(evt: DragEvent) {
  isDragOver.value = false;
  const templateData = evt.dataTransfer?.getData('template');
  if (templateData) {
    const template: SessionTemplate = JSON.parse(templateData);
    const newItem: DroppedItem = { ...template, date: null, timelineId: `${template.id}-${Date.now()}` };
    droppedItems.value.push(newItem);
  }
}

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
  }
  cancelDateSelection();
}

onUnmounted(() => {
  if (sortableInstance)
    sortableInstance.destroy();
});
</script>
