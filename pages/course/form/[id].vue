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

      <!-- Step Components -->
      <CourseInformation
        v-if="currentStep === 1"
        ref="courseInfoComponent"
        :course-data="courseData"
        @edit-step="goToStep"
      />
      <div v-show="currentStep === 2">
        <AddSession
          v-if="currentStep === 2 || isEditMode"
          v-model="sessionData"
          :course-data="courseData"
          @edit-step="goToStep"
        />
      </div>
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
import type { CourseCreatePayload, DroppedItem, SessionCreatePayload, TaskCreatePayload, TaskSkillWeightPayload } from '~/types/course';
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

interface CourseFormData {
  title: string;
  description: string | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  } | null;
  imagePreview: string | null;
  imageFile: File | null;
  start_date: string | null;
  end_date: string | null;
}

// --- FORM STATE ---
const currentStep = ref(1);
const totalSteps = 4;
const courseData = ref<CourseFormData>(
  {
    title: '',
    description: null,
    dateRange: null,
    imagePreview: null,
    imageFile: null,
    start_date: null,
    end_date: null,
  },
);
const sessionData = ref<DroppedItem[]>([]);
const athleteData = ref<AthleteSelectionInfo[]>([]);
const courseInfoComponent = ref<InstanceType<typeof CourseInformation> | null>(null);

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

interface TaskFullPayload {
  id?: number;
  title?: string;
  description?: string | null;
  duration?: number;
  sequence?: number;
  selectedSkillIds?: number[];
  skillWeights?: Record<number | string, number | string>;
}

interface SessionTaskPayload {
  sequence?: number;
  task?: {
    id?: number;
    name?: string;
    description?: string | null;
    duration_minutes?: number;
    skill_weights?: Array<{ skill_id: number; weight: string | number }>;
  };
}

function buildSkillWeightsFromTask(task: TaskFullPayload): TaskSkillWeightPayload[] {
  const rawWeights = task.skillWeights ?? {};
  const fallbackIds = Object.keys(rawWeights)
    .map(id => Number.parseInt(id, 10))
    .filter(id => Number.isFinite(id));
  const selectedIds = Array.isArray(task.selectedSkillIds) && task.selectedSkillIds.length > 0
    ? task.selectedSkillIds
    : fallbackIds;

  const uniqueIds = Array.from(new Set(selectedIds));
  return uniqueIds
    .map((skillId) => {
      const raw = rawWeights[skillId] ?? rawWeights[String(skillId)];
      const percent = typeof raw === 'number' ? raw : Number.parseFloat(String(raw ?? 0));
      const normalized = Number.isFinite(percent) ? percent / 100 : 0;
      return {
        skill_id: skillId,
        weight: normalized,
      } satisfies TaskSkillWeightPayload;
    })
    .filter(entry => entry.weight > 0);
}

function buildTasksFromFullTasks(tasksFull: TaskFullPayload[] | undefined): TaskCreatePayload[] {
  if (!Array.isArray(tasksFull))
    return [];

  return tasksFull.map((task, index) => {
    const skillWeights = buildSkillWeightsFromTask(task);
    return {
      ...(task.id ? { id: task.id } : {}),
      name: task.title || 'Untitled Task',
      description: task.description ?? null,
      duration_minutes: Number.isFinite(task.duration) ? Number(task.duration) : 0,
      sequence: typeof task.sequence === 'number' ? task.sequence : index + 1,
      skill_weights: skillWeights,
    } satisfies TaskCreatePayload;
  });
}

function buildTasksFromSessionTasks(sessionTasks: SessionTaskPayload[] | undefined): TaskCreatePayload[] {
  if (!Array.isArray(sessionTasks))
    return [];

  return sessionTasks.map((sessionTask, index) => {
    const baseTask = sessionTask.task;
    const skillWeights = Array.isArray(baseTask?.skill_weights)
      ? baseTask.skill_weights
        .map(({ skill_id, weight }) => {
          const normalized = typeof weight === 'number' ? weight : Number.parseFloat(String(weight ?? 0));
          return {
            skill_id,
            weight: Number.isFinite(normalized) ? normalized : 0,
          } satisfies TaskSkillWeightPayload;
        })
        .filter(entry => entry.weight > 0)
      : [];

    return {
      ...(baseTask?.id ? { id: baseTask.id } : {}),
      name: baseTask?.name || 'Untitled Task',
      description: baseTask?.description ?? null,
      duration_minutes: baseTask?.duration_minutes ?? 0,
      sequence: typeof sessionTask.sequence === 'number' ? sessionTask.sequence : index + 1,
      skill_weights: skillWeights,
    } satisfies TaskCreatePayload;
  });
}

function mapUiSessionToPayload(session: DroppedItem): SessionCreatePayload {
  const tasksFromFull = buildTasksFromFullTasks(session.tasks_full);
  const fallbackTasks = buildTasksFromSessionTasks(session.tasks as SessionTaskPayload[] | undefined);

  const mergedTasks = tasksFromFull.map((task, index) => {
    const fallbackTask = fallbackTasks[index];
    const mergedSkillWeights = task.skill_weights.length > 0
      ? task.skill_weights
      : fallbackTask?.skill_weights ?? [];

    return {
      ...fallbackTask,
      ...task,
      skill_weights: mergedSkillWeights,
      duration_minutes: task.duration_minutes || fallbackTask?.duration_minutes || 0,
      description: task.description ?? fallbackTask?.description ?? null,
      sequence: task.sequence ?? fallbackTask?.sequence ?? index + 1,
    } satisfies TaskCreatePayload;
  });

  const preparedTasks = mergedTasks.length > 0 ? mergedTasks : fallbackTasks;

  const fallbackDate = courseData.value.start_date ? new Date(courseData.value.start_date) : new Date();
  const scheduledDate = session.date ? new Date(session.date) : fallbackDate;

  return {
    ...(session.id ? { id: session.id } : {}),
    name: session.name || 'Untitled Session',
    description: session.description ?? null,
    scheduled_date: scheduledDate.toISOString(),
    is_template: false,
    tasks: preparedTasks,
  } satisfies SessionCreatePayload;
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
    onError: (error: unknown) => {
      const message = typeof error === 'string'
        ? error
        : error instanceof Error
          ? error.message
          : 'An unknown error occurred while saving the course.';
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
    start_date: (() => {
      const startSource = courseData.value.start_date ?? courseData.value.dateRange?.start?.toISOString();
      return startSource ? new Date(startSource).toISOString().split('T')[0] : '';
    })(),
    end_date: (() => {
      const endSource = courseData.value.end_date ?? courseData.value.dateRange?.end?.toISOString();
      return endSource ? new Date(endSource).toISOString().split('T')[0] : '';
    })(),
    sessions: sessionData.value.map(mapUiSessionToPayload),
    attendee_ids: athleteData.value.map(athlete => athlete.uuid),
  };

  await performSubmit({
    payload: finalPayload,
    imageFile: courseData.value.imageFile || null,
  });
}
</script>
