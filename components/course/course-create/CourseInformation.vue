<template>
  <div class="bg-white p-4 sm:p-6 lg:p-8 xl:p-10">
    <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
      Course Information
    </h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      <!-- Left Column: Title, Description, Duration -->
      <div v-motion-slide-visible-once-left :delay="200" class="order-1">
        <div class="mb-4 sm:mb-6">
          <h1 class="font-bold mb-2 text-sm sm:text-base text-gray-700">
            Title
          </h1>
          <input
            v-model="form.title"
            type="text"
            class="border-2 rounded-lg w-full shadow-sm sm:shadow-lg p-3 sm:p-2 h-12 sm:h-11 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313] text-sm sm:text-base transition-colors"
            placeholder="Course title"
          >
        </div>
        <div class="mb-4 sm:mb-6">
          <h1 class="font-bold mb-2 text-sm sm:text-base text-gray-700">
            Description
          </h1>
          <textarea
            v-model="form.description"
            class="border-2 rounded-lg w-full shadow-sm p-3 h-32 sm:h-48 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313] text-sm sm:text-base transition-colors resize-none"
            placeholder="Course description"
          />
        </div>
        <div>
          <h1 class="font-bold mb-2 text-sm sm:text-base text-gray-700">
            Course Duration
          </h1>
          <div class="space-y-3 sm:space-y-4">
            <div v-if="form.dateRange?.start && form.dateRange?.end" class="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div class="text-xs sm:text-sm text-gray-600 flex-1 min-w-0">
                  <span class="font-medium">Selected Duration:</span>
                  <div class="mt-1 break-words">
                    <span class="text-gray-900 block sm:inline">{{ formatDate(form.dateRange.start) }}</span>
                    <span class="mx-0 sm:mx-2 text-gray-500 block sm:inline">to</span>
                    <span class="text-gray-900 block sm:inline">{{ formatDate(form.dateRange.end) }}</span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    Duration: {{ calculateDuration(form.dateRange.start, form.dateRange.end) }}
                  </div>
                </div>
                <button
                  type="button"
                  class="text-red-500 hover:text-red-700 transition-colors p-1 touch-target flex-shrink-0"
                  title="Clear dates"
                  @click="clearDateRange"
                >
                  <Icon name="mdi:close" class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              class="w-full border-2 rounded-lg shadow-sm sm:shadow-lg p-3 sm:p-4 h-auto min-h-[48px] sm:min-h-[44px] border-[#d9d9d9] hover:border-[#9c1313] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313] transition-colors text-left touch-target"
              @click="showDatePicker = !showDatePicker"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div v-if="!form.dateRange?.start || !form.dateRange?.end" class="text-gray-500 text-sm sm:text-base">
                    Click to select course start and end dates
                  </div>
                  <div v-else class="text-gray-900 text-sm sm:text-base break-words">
                    {{ formatDate(form.dateRange.start) }} - {{ formatDate(form.dateRange.end) }}
                  </div>
                </div>
                <Icon
                  name="mdi:calendar"
                  class="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform"
                  :class="{ 'rotate-180': showDatePicker }"
                />
              </div>
            </button>

            <div v-if="showDatePicker" class="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white shadow-lg">
              <VDatePicker
                v-model.range="dateRange"
                mode="dateTime"
                :masks="{ input: 'MMM DD, YYYY HH:mm' }"
                :min-date="new Date()"
                class="w-full"
              />
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 pt-4 border-t border-gray-100 gap-3">
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="text-xs sm:text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors touch-target"
                    @click="setQuickDuration(7)"
                  >
                    1 Week
                  </button>
                  <button
                    type="button"
                    class="text-xs sm:text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors touch-target"
                    @click="setQuickDuration(30)"
                  >
                    1 Month
                  </button>
                  <button
                    type="button"
                    class="text-xs sm:text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors touch-target"
                    @click="setQuickDuration(90)"
                  >
                    3 Months
                  </button>
                </div>
                <button
                  type="button"
                  class="text-sm px-4 py-2 bg-[#9c1313] text-white rounded-md hover:bg-[#7a0f0f] transition-colors touch-target w-full sm:w-auto"
                  @click="showDatePicker = false"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Image Upload -->
      <div v-motion-slide-visible-once-right :delay="200" class="w-full min-w-0 order-2">
        <div class="flex items-center mb-3 sm:mb-4">
          <Icon name="mdi:image-area" class="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mr-2 flex-shrink-0" />
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900">
            Course Preview Image
          </h3>
        </div>

        <div v-if="form.imagePreview" class="mb-4 sm:mb-6">
          <div class="flex justify-between items-center mb-2 sm:mb-3">
            <h3 class="font-bold text-sm sm:text-base text-gray-700">
              Preview:
            </h3>
            <button
              type="button"
              class="text-red-500 hover:text-red-700 transition-colors p-1 touch-target"
              aria-label="Remove image"
              @click="removeImage"
            >
              <Icon name="mdi:trash-can" class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div class="border rounded-lg p-2 sm:p-3 bg-gray-50 shadow-sm">
            <NuxtImg
              :src="form.imagePreview"
              alt="Course Image Preview"
              format="webp"
              width="400"
              height="192"
              loading="lazy"
              class="w-full h-auto object-contain rounded-md max-h-32 sm:max-h-48 mx-auto"
            />
            <div class="mt-2 text-xs sm:text-sm text-gray-500 text-center">
              Click below to replace image
            </div>
          </div>
        </div>

        <div
          :class="{ 'border-[#9c1313] bg-red-50': dragOver, 'border-gray-300': !dragOver }"
          class="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-all duration-300 mb-4 sm:mb-6 relative touch-target"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          @click="fileInput?.click()"
        >
          <div v-if="!form.imagePreview" class="pointer-events-none">
            <Icon
              name="mdi:cloud-upload"
              :class="{ 'text-[#9c1313]': dragOver }"
              class="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 transition-colors"
            />
            <p class="text-gray-600 mb-2 font-medium text-sm sm:text-base">
              Drag & drop your image here
            </p>
            <p class="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">
              or
            </p>
          </div>
          <div v-else class="py-2">
            <span class="text-sm sm:text-base text-gray-600">
              Click to Change Image
            </span>
          </div>
          <button
            v-if="!form.imagePreview"
            type="button"
            class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm text-sm sm:text-base touch-target"
          >
            Select Image
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="hidden"
            @change="handleFileUpload"
          >
        </div>

        <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 shadow-sm">
          <div class="flex flex-col sm:flex-row gap-3">
            <Icon
              name="mdi:information"
              class="w-5 h-5 text-blue-600 flex-shrink-0 self-start"
            />
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                Image Requirements:
              </h4>
              <ul class="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-1">
                <li class="flex items-start gap-2">
                  <Icon name="mdi:check-circle" class="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span class="break-words">Supported formats: JPG, PNG, WEBP, GIF</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon name="mdi:check-circle" class="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Maximum file size: 5MB</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon name="mdi:check-circle" class="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Recommended ratio: 16:9 (landscape)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Notification Modal for file upload errors -->
  <NotificationModal
    :show="modalState.show"
    :title="modalState.title"
    :message="modalState.message"
    :type="modalState.type"
    @close="modalState.show = false"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface CourseFormState {
  title: string;
  description: string;
  dateRange: DateRange;
  imageFile: File | null;
  imagePreview: string | null;
}

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
  courseData?: CourseData;
}>(), {
  courseData: () => ({}),
});

const dragOver = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const showDatePicker = ref(false);

const form = reactive<CourseFormState>({
  title: '',
  description: '',
  dateRange: { start: null, end: null },
  imageFile: null,
  imagePreview: null,
});

// State for the notification modal
const modalState = reactive({
  show: false,
  title: '',
  message: '',
  type: 'error' as 'success' | 'error',
});

// Helper function to show the error modal
function showErrorModal(title: string, message: string) {
  modalState.title = title;
  modalState.message = message;
  modalState.type = 'error';
  modalState.show = true;
}

// Create a computed property for the date range that v-calendar can work with
const dateRange = computed({
  get() {
    // Return undefined if either date is null to satisfy v-calendar
    if (!form.dateRange.start || !form.dateRange.end) {
      return undefined;
    }
    return {
      start: form.dateRange.start,
      end: form.dateRange.end,
    };
  },
  set(value: { start: Date; end: Date } | undefined) {
    if (value) {
      form.dateRange.start = value.start;
      form.dateRange.end = value.end;
    }
    else {
      form.dateRange.start = null;
      form.dateRange.end = null;
    }
  },
});

watch(() => props.courseData, (newData) => {
  if (!newData)
    return;
  form.title = newData.title || '';
  form.description = newData.description || '';

  if (newData.dateRange) {
    form.dateRange = {
      start: newData.dateRange.start ? new Date(newData.dateRange.start) : null,
      end: newData.dateRange.end ? new Date(newData.dateRange.end) : null,
    };
  }
  else {
    form.dateRange = { start: null, end: null };
  }

  form.imagePreview = newData.imagePreview || null;
  form.imageFile = newData.imageFile || null;
}, { immediate: true, deep: true });

function formatDate(date: Date | string | null | undefined): string {
  if (!date)
    return '';
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime()))
      return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }
  catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

function calculateDuration(start: Date | string | null | undefined, end: Date | string | null | undefined): string {
  if (!start || !end)
    return '';
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
      return '';

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1)
      return '1 day';
    if (diffDays < 7)
      return `${diffDays} days`;
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    if (remainingDays === 0)
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    return `${weeks} week${weeks > 1 ? 's' : ''} and ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  }
  catch (error) {
    console.error('Error calculating duration:', error);
    return '';
  }
}

function clearDateRange() {
  form.dateRange = { start: null, end: null };
}

function setQuickDuration(days: number) {
  const start = new Date();
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + days - 1);
  end.setHours(17, 0, 0, 0);
  form.dateRange = { start, end };
}

function handleDrop(event: DragEvent) {
  dragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0)
    processFile(files[0]);
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0)
    processFile(target.files[0]);
}

function processFile(file: File) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  // Helper to reset the file input so the user can re-select the same file after an error
  const resetFileInput = () => {
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  if (!validTypes.includes(file.type)) {
    showErrorModal('Invalid File Type', 'Please select a valid image file (JPG, PNG, WEBP, GIF).');
    resetFileInput();
    return;
  }

  if (file.size > maxFileSize) {
    showErrorModal('File Too Large', 'The uploaded file exceeds the 5MB size limit. Please choose a smaller file.');
    resetFileInput();
    return;
  }

  form.imageFile = file;
  form.imagePreview = URL.createObjectURL(file);
}

function removeImage() {
  // Revoke the object URL to free up memory
  if (form.imagePreview) {
    URL.revokeObjectURL(form.imagePreview);
  }
  form.imageFile = null;
  form.imagePreview = null;
  if (fileInput.value)
    fileInput.value.value = '';
}

function getData() {
  return {
    title: form.title,
    description: form.description,
    dateRange: form.dateRange,
    imageFile: form.imageFile,
    imagePreview: form.imagePreview,
    start_date: form.dateRange.start ? form.dateRange.start.toISOString() : null,
    end_date: form.dateRange.end ? form.dateRange.end.toISOString() : null,
  };
}

defineExpose({ getData });
</script>
