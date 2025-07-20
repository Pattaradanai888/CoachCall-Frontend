<template>
  <div v-motion-slide-visible-once-top :delay="200" class="bg-white p-8">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-2">
        Review & Publish Course
      </h2>
      <p class="text-gray-600">
        Review all the information below before publishing your course.
      </p>
    </div>

    <!-- Course Information Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <Icon name="mdi:file-document" size="1.5rem" class="text-gray-500 mr-2" />
          <h3 class="text-lg font-semibold">
            Course Information
          </h3>
        </div>
        <button
          class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          @click="editCourseInfo"
        >
          <Icon name="mdi:pencil-outline" size="1.2rem" class="mr-1" />
          <span class="text-sm">Edit</span>
        </button>
      </div>

      <div v-if="hasCourseData" class="bg-gray-50 border rounded-lg p-6">
        <div class="flex items-start justify-between gap-6">
          <div class="flex-1">
            <h4 class="text-xl font-semibold mb-3 text-gray-900">
              {{ displayCourseData.title }}
            </h4>
            <p class="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
              {{ displayCourseData.description }}
            </p>

            <div class="space-y-2">
              <div class="flex items-center text-sm text-gray-600">
                <Icon name="mdi:calendar-start" class="w-4 h-4 mr-2 text-green-600" />
                <span class="font-medium">Start:</span>
                <span class="ml-2">{{ formatDate(displayCourseData.start_date) }}</span>
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <Icon name="mdi:calendar-end" class="w-4 h-4 mr-2 text-red-600" />
                <span class="font-medium">End:</span>
                <span class="ml-2">{{ formatDate(displayCourseData.end_date) }}</span>
              </div>
              <div v-if="courseDuration" class="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">
                <Icon name="mdi:clock-outline" class="w-4 h-4 mr-2" />
                <span class="font-medium">Duration: {{ courseDuration }}</span>
              </div>
            </div>
          </div>

          <div v-if="displayCourseData.cover_image_url" class="flex-shrink-0">
            <div class="w-48 h-32 rounded-lg overflow-hidden shadow-md">
              <NuxtImg
                :src="displayCourseData.cover_image_url"
                :alt="displayCourseData.title"
                format="webp"
                width="192"
                height="128"
                loading="lazy"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
          <div v-else class="flex-shrink-0">
            <div class="w-48 h-32 rounded-lg bg-gray-200 flex items-center justify-center">
              <Icon name="mdi:image-off" class="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      <!-- Incomplete Data State -->
      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Icon name="mdi:alert-circle" class="w-8 h-8 text-yellow-600 mx-auto mb-2" />
        <p class="text-yellow-800 font-medium">
          No course information provided
        </p>
        <p class="text-yellow-600 text-sm mt-1">
          Please go back and fill in the course details.
        </p>
      </div>
    </div>

    <!-- Course Session Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <Icon name="mdi:clock-time-eight" size="1.5rem" class="text-gray-500 mr-2" />
          <h3 class="text-lg font-semibold">
            Course Sessions
          </h3>
          <span class="ml-3 text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {{ sessionData.length }} session{{ sessionData.length !== 1 ? 's' : '' }}
          </span>
        </div>
        <button
          class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          @click="editSessions"
        >
          <Icon name="mdi:pencil-outline" size="1.2rem" class="mr-1" />
          <span class="text-sm">Edit</span>
        </button>
      </div>

      <div v-if="sessionData.length > 0" class="space-y-3">
        <div v-for="(session, index) in sessionData" :key="session.timelineId || index" class="bg-gray-50 border rounded-lg p-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-[#9c1313] text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-gray-900 truncate">
                {{ session.name || 'Untitled Session' }}
              </h4>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                <div class="flex items-center">
                  <Icon name="mdi:calendar" class="w-4 h-4 mr-1.5" />
                  <span>{{ session.date ? new Date(session.date).toLocaleDateString() : 'Date not set' }}</span>
                </div>
                <div class="flex items-center">
                  <Icon name="mdi:clock-outline" class="w-4 h-4 mr-1.5" />
                  <span>{{ session.total_duration_minutes || 0 }} min</span>
                </div>
                <div class="flex items-center">
                  <Icon name="mdi:format-list-checks" class="w-4 h-4 mr-1.5" />
                  <span>{{ session.task_count || 0 }} task{{ (session.task_count || 0) !== 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Icon name="mdi:calendar-plus" class="w-8 h-8 text-yellow-600 mx-auto mb-2" />
        <p class="text-yellow-800 font-medium">
          No sessions added
        </p>
      </div>
    </div>

    <!-- Athlete Section -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <Icon name="mdi:account-group" size="1.5rem" class="text-gray-500 mr-2" />
          <h3 class="text-lg font-semibold">
            Athletes
          </h3>
          <span class="ml-3 text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {{ athleteData.length }} athlete{{ athleteData.length !== 1 ? 's' : '' }}
          </span>
        </div>
        <button
          class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          @click="editAthletes"
        >
          <Icon name="mdi:pencil-outline" size="1.2rem" class="mr-1" />
          <span class="text-sm">Edit</span>
        </button>
      </div>

      <div v-if="athleteData.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="athlete in athleteData" :key="athlete.uuid" class="bg-gray-50 border rounded-lg p-3">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mr-4">
              <NuxtImg
                :src="athlete.profile_image_url || '/default-profile.jpg'"
                :alt="athlete.name"
                format="webp"
                width="48"
                height="48"
                loading="lazy"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-semibold text-gray-900 truncate">
                {{ athlete.name }}
              </h4>
              <p class="text-sm text-gray-600 truncate">
                {{ formatAthletePositions(athlete.positions) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Icon name="mdi:account-multiple-plus" class="w-8 h-8 text-yellow-600 mx-auto mb-2" />
        <p class="text-yellow-800 font-medium">
          No athletes added
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Attendee } from '~/types/course';
import { computed } from 'vue';

// --- PROPS & EMITS ---
const props = withDefaults(defineProps<{
  courseData?: any;
  sessionData?: any[];
  athleteData?: Attendee[];
}>(), {
  courseData: () => ({}),
  sessionData: () => [],
  athleteData: () => [],
});

const emit = defineEmits<{
  (e: 'editStep', step: 1 | 2 | 3): void;
}>();

// --- COMPUTED ---
const displayCourseData = computed(() => ({
  title: props.courseData?.title || 'Untitled Course',
  description: props.courseData?.description || 'No description provided.',
  start_date: props.courseData?.start_date,
  end_date: props.courseData?.end_date,
  cover_image_url: props.courseData?.imagePreview || props.courseData?.cover_image_url,
}));

const hasCourseData = computed(() => {
  return !!(props.courseData?.title && props.courseData?.start_date);
});

const courseDuration = computed(() => {
  const start = displayCourseData.value.start_date;
  const end = displayCourseData.value.end_date;
  if (!start || !end)
    return null;
  const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 1)
    return '1 day';
  if (diffDays < 7)
    return `${diffDays} days`;
  const weeks = Math.floor(diffDays / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''}`;
});

// --- METHODS ---
const editCourseInfo = () => emit('editStep', 1);
const editSessions = () => emit('editStep', 2);
const editAthletes = () => emit('editStep', 3);

function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString)
    return 'Not set';
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(dateString));
  }
  catch (e) {
    return 'Invalid Date';
  }
}

function formatAthletePositions(positions?: { id: number; name: string }[]): string {
  if (!positions || positions.length === 0)
    return 'No position specified';
  return positions.map(p => p.name).join(', ');
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = '/default-profile.jpg';
}
</script>

<style scoped>
.border {
  border-color: #e5e7eb;
}
</style>
