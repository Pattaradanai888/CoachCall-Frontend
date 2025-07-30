<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-screen">
    <div class="w-full mx-7 lg:mx-0 mt-[3rem]">
      <div class="flex justify-center mb-6 mt-2">
        <div class="w-full max-w-4xl">
          <StageProgressBar :current-step="currentStep" />
        </div>
      </div>
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">
          {{ pageTitle }}
        </h1>
        <div v-if="isLoading" class="flex items-center text-gray-500">
          <Icon name="mdi:loading" class="animate-spin mr-2" />
          <span>Loading Course Data...</span>
        </div>
      </div>

      <!-- Step Components (no changes needed here) -->
      <CourseInformation
        v-if="currentStep === 1"
        ref="courseInfoComponent"
        :course-data="courseData"
        @edit-step="goToStep"
      />
      <AddSession
        v-if="currentStep === 2"
        v-model="sessionData"
        :course-data="courseData"
        @edit-step="goToStep"
      />
      <AddAthlete
        v-if="currentStep === 3"
        v-model="athleteData"
        @edit-step="goToStep"
      />
      <PublishCourse
        v-if="currentStep === 4"
        :course-data="courseData"
        :session-data="sessionData"
        :athlete-data="athleteData"
        @edit-step="goToStep"
      />

      <!-- Navigation buttons -->
      <div class="mt-8 flex justify-center mx-2 pb-10">
        <div class="flex justify-between w-full">
          <button v-if="currentStep > 1" class="w-32 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors" @click="goToPreviousStep">
            Previous
          </button>
          <div v-else class="w-32" />
          <button v-if="currentStep < totalSteps" class="w-32 bg-[#9C1313] text-white font-bold py-2 rounded-lg hover:bg-[#7A0F0F] shadow-lg transition-colors" @click="goToNextStep">
            Next
          </button>
          <button
            v-else
            :disabled="!canPublish || isPublishing"
            class="w-32 font-bold py-2 rounded-lg shadow-lg transition-colors"
            :class="[canPublish && !isPublishing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed']"
            @click="publishOrUpdateCourse"
          >
            <span v-if="isPublishing">
              <Icon name="mdi:loading" class="animate-spin" />
              {{ isEditMode ? 'Updating...' : 'Publishing...' }}
            </span>
            <span v-else>{{ submitButtonText }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Modal -->
    <NotificationModal
      :show="showNotification"
      :title="notificationTitle"
      :message="notificationMessage"
      :type="notificationType"
      @close="closeNotification"
    />
  </div>
</template>

<script setup lang="ts">
import type { AthleteSelectionInfo } from '~/types/athlete';
import type { CourseCreatePayload, DroppedItem, SessionCreatePayload } from '~/types/course';
import { useRoute, useRouter } from '#app';
import { StageProgressBar } from '#components';
import { computed, onMounted, ref } from 'vue';
import AddAthlete from '~/components/course/course-create/AddAthlete.vue';
import AddSession from '~/components/course/course-create/AddSession.vue';
import CourseInformation from '~/components/course/course-create/CourseInformation.vue';
import PublishCourse from '~/components/course/course-create/PublishCourse.vue';
// --- MODAL IMPORT ---
import NotificationModal from '~/components/NotificationModal.vue'; // Assuming this is the correct path
import { useCourses } from '~/composables/useCourses';
import { useSubmit } from '~/composables/useSubmit';

// --- NOTIFICATION MODAL STATE ---
const showNotification = ref(false);
const notificationTitle = ref('');
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');
const onNotificationClose = ref<(() => void) | null>(null);

function triggerNotification(title: string, message: string, type: 'success' | 'error' = 'success', postCloseAction: (() => void) | null = null) {
  notificationTitle.value = title;
  notificationMessage.value = message;
  notificationType.value = type;
  onNotificationClose.value = postCloseAction;
  showNotification.value = true;
}

function closeNotification() {
  showNotification.value = false;
  if (onNotificationClose.value) {
    onNotificationClose.value();
    onNotificationClose.value = null; // Reset after execution
  }
}

// --- ROUTE HANDLING & MODE ---
const route = useRoute();
const router = useRouter();
const courseId = computed(() => route.params.id === 'new' ? null : Number(route.params.id));
const isEditMode = computed(() => !!courseId.value);
const isLoading = ref(isEditMode.value); // Initially loading if in edit mode

const pageTitle = computed(() => isEditMode.value ? 'Edit Your Course' : 'Create Your Course');
const submitButtonText = computed(() => isEditMode.value ? 'Update Course' : 'Publish Course');

// --- FORM STATE ---
const currentStep = ref(1);
const totalSteps = 4;
const courseData = ref<any>({});
const sessionData = ref<DroppedItem[]>([]);
const athleteData = ref<AthleteSelectionInfo[]>([]);
const courseInfoComponent = ref<any>(null);

// --- NAVIGATION ---
function saveStep1Data() {
  const component = courseInfoComponent.value;
  if (component && typeof component.getData === 'function') {
    courseData.value = component.getData();
  }
}

function goToNextStep() {
  if (currentStep.value === 1)
    saveStep1Data();
  if (currentStep.value < totalSteps)
    currentStep.value++;
}

function goToPreviousStep() {
  if (currentStep.value === 1)
    saveStep1Data();
  if (currentStep.value > 1)
    currentStep.value--;
}

function goToStep(step: number) {
  if (currentStep.value === 1)
    saveStep1Data();
  if (step >= 1 && step <= totalSteps)
    currentStep.value = step;
}

// --- DATA FETCHING & PRE-FILLING (FOR EDIT MODE) ---
const { fetchCourseById, createCourse, updateCourse, uploadCourseImage } = useCourses();

onMounted(async () => {
  if (isEditMode.value && courseId.value) {
    isLoading.value = true;
    const { data: fetchedCourse, error } = await fetchCourseById(courseId.value);
    isLoading.value = false;

    if (error.value || !fetchedCourse.value) {
      triggerNotification(
        'Load Failed',
        'Failed to load course data. You will be redirected back to the course management page.',
        'error',
        () => router.push('/course-management'),
      );
      return;
    }

    // --- Map fetched data to our local state ---
    const course = fetchedCourse.value;

    // 1. Course Information
    courseData.value = {
      title: course.name,
      description: course.description,
      dateRange: { start: new Date(course.start_date), end: new Date(course.end_date) },
      imagePreview: course.cover_image_url,
      imageFile: null,
      start_date: course.start_date,
      end_date: course.end_date,
    };

    // 2. Athlete Data
    athleteData.value = course.attendees.map(a => ({
      uuid: a.uuid,
      name: a.name,
      profile_image_url: a.profile_image_url,
      positions: a.positions,
      age: null, // Not required by AddAthlete component
      groups: [], // Not required by AddAthlete component
    }));

    // 3. Session Data (This is the most complex mapping)
    sessionData.value = course.sessions.map((s, index) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      total_duration_minutes: s.total_duration_minutes,
      task_count: s.task_count,
      is_template: s.is_template,
      scheduled_date: s.scheduled_date,
      timelineId: `session-${s.id}-${index}`,
      date: new Date(s.scheduled_date),
      tasks: s.tasks, // Required property for DroppedItem interface
      tasks_full: s.tasks.map(st => ({
        id: st.task.id,
        title: st.task.name,
        description: st.task.description,
        duration: st.task.duration_minutes,
        selectedSkillIds: st.task.skill_weights.map(sw => sw.skill_id),
        skillWeights: st.task.skill_weights.reduce((acc, sw) => {
          acc[sw.skill_id] = Number.parseFloat(sw.weight) * 100;
          return acc;
        }, {} as Record<number, number>),
      })),
    }));
  }
});

// --- SUBMISSION LOGIC ---
const canPublish = computed(() => {
  return (
    courseData.value?.title
    && courseData.value?.start_date
    && courseData.value?.end_date
    && sessionData.value.length > 0
  );
});

function mapUiSessionToPayload(session: any): SessionCreatePayload {
  const hasFullTasks = Array.isArray(session.tasks_full) && session.tasks_full.length > 0;
  return {
    name: session.name || 'Untitled Session',
    description: session.description || null,
    scheduled_date: session.date ? new Date(session.date).toISOString() : new Date(courseData.value.start_date).toISOString(),
    is_template: false,
    tasks: hasFullTasks
      ? session.tasks_full.map((task: any) => ({
          name: task.title || 'Untitled Task',
          description: task.description || null,
          duration_minutes: task.duration || 0,
          skill_weights: (task.selectedSkillIds || []).map((skillId: number) => ({
            skill_id: skillId,
            weight: (task.skillWeights[skillId] || 0) / 100,
          })),
        }))
      : [],
  };
}

const { submit: performSubmit, loading: isPublishing } = useSubmit(
  async ({ payload, imageFile }: { payload: CourseCreatePayload; imageFile: File | null }) => {
    let savedCourse;
    if (isEditMode.value && courseId.value) {
      savedCourse = await updateCourse(courseId.value, payload);
    }
    else {
      savedCourse = await createCourse(payload);
    }

    if (!savedCourse || !savedCourse.id)
      throw new Error('Failed to save course.');

    // Only upload image if a *new* file was selected
    if (imageFile) {
      await uploadCourseImage(savedCourse.id, imageFile);
    }
    return savedCourse;
  },
  {
    onSuccess: () => {
      const actionText = isEditMode.value ? 'updated' : 'published';
      triggerNotification(
        `Course ${actionText}`,
        `Your course has been ${actionText} successfully!`,
        'success',
        () => router.push('/course-management'),
      );
    },
    onError: (error) => {
      const message = (error as any)?.message || 'An unknown error occurred while saving the course.';
      triggerNotification('An Error Occurred', message, 'error');
    },
  },
);

async function publishOrUpdateCourse() {
  if (!canPublish.value) {
    triggerNotification(
      'Missing Information',
      'Please complete all required fields (like course title, dates, and at least one session) before proceeding.',
      'error',
    );
    return;
  }

  const finalPayload: CourseCreatePayload = {
    title: courseData.value.title,
    description: courseData.value.description,
    start_date: new Date(courseData.value.start_date).toISOString().split('T')[0],
    end_date: new Date(courseData.value.end_date).toISOString().split('T')[0],
    sessions: sessionData.value.map(mapUiSessionToPayload),
    attendee_ids: athleteData.value.map(athlete => athlete.uuid),
  };

  await performSubmit({
    payload: finalPayload,
    imageFile: courseData.value.imageFile || null,
  });
}
</script>
