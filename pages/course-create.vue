<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-screen">
    <div class="w-full mx-7 lg:mx-0 mt-[3rem]">
      <div class="flex justify-center mb-6 mt-2">
        <div class="w-full max-w-4xl">
          <StageProgressBar :current-step="currentStep" />
        </div>
      </div>
      <h1 class="text-2xl font-bold mb-4">
        Create Your Course
      </h1>
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
            @click="publishCourse"
          >
            <span v-if="isPublishing">Publishing...</span>
            <span v-else>Publish Course</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AthleteSelectionInfo } from '~/types/athlete';
import type { CourseCreatePayload, SessionCreatePayload } from '~/types/course';
import { navigateTo } from '#app';
import { StageProgressBar } from '#components';
import { computed, ref } from 'vue';
import AddAthlete from '~/components/course/course-create/AddAthlete.vue';
import AddSession from '~/components/course/course-create/AddSession.vue';
import CourseInformation from '~/components/course/course-create/CourseInformation.vue';
import PublishCourse from '~/components/course/course-create/PublishCourse.vue';
import { useCourses } from '~/composables/useCourses';
import { useSubmit } from '~/composables/useSubmit';

const currentStep = ref(1);
const totalSteps = 4;

const courseData = ref<any>({});
const sessionData = ref<any[]>([]);
const athleteData = ref<AthleteSelectionInfo[]>([]);

const courseInfoComponent = ref<any>(null);

function saveStep1Data() {
  const component = courseInfoComponent.value;
  if (component && typeof component.getData === 'function') {
    courseData.value = component.getData();
  }
}

function goToNextStep() {
  if (currentStep.value === 1) {
    saveStep1Data();
  }
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
}

function goToPreviousStep() {
  if (currentStep.value === 1) {
    saveStep1Data();
  }
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function goToStep(step: 1 | 2 | 3 | 4) {
  if (currentStep.value === 1) {
    saveStep1Data();
  }
  if (step >= 1 && step <= totalSteps) {
    currentStep.value = step;
  }
}

const canPublish = computed(() => {
  return (
    courseData.value?.title
    && courseData.value?.start_date
    && courseData.value?.end_date
    && sessionData.value.length > 0
  );
});

const { createCourse, uploadCourseImage } = useCourses();

const { submit: performPublish, loading: isPublishing } = useSubmit(
  async (payload: CourseCreatePayload, imageFile: File | null) => {
    const newCourse = await createCourse(payload);
    if (!newCourse || !newCourse.id)
      throw new Error('Failed to create course.');

    if (imageFile) {
      await uploadCourseImage(newCourse.id, imageFile);
    }
    return newCourse;
  },
  {
    onSuccess: () => {
      alert('Course published successfully!');
      navigateTo('/course-management');
    },
    onError: (error) => {
      const message = (error as any)?.message || 'An unknown error occurred.';
      alert(`An error occurred: ${message}`);
    },
  },
);

function mapUiSessionToPayload(session: any): SessionCreatePayload {
  const hasFullTasks = Array.isArray(session.tasks_full) && session.tasks_full.length > 0;

  if (!hasFullTasks) {
    console.warn(`Session "${session.name}" is from a template and lacks task details. It will be created with no tasks.`);
  }

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

async function publishCourse() {
  if (!canPublish.value) {
    alert('Please complete all required fields before publishing.');
    return;
  }

  console.log('Final data before publishing:', {
    course: JSON.parse(JSON.stringify(courseData.value)),
    sessions: JSON.parse(JSON.stringify(sessionData.value)),
    athletes: JSON.parse(JSON.stringify(athleteData.value)),
  });

  const finalPayload: CourseCreatePayload = {
    title: courseData.value.title,
    description: courseData.value.description,
    start_date: new Date(courseData.value.start_date).toISOString().split('T')[0],
    end_date: new Date(courseData.value.end_date).toISOString().split('T')[0],
    sessions: sessionData.value.map(mapUiSessionToPayload),
    attendee_ids: athleteData.value.map(athlete => athlete.uuid),
  };

  await performPublish(finalPayload, courseData.value.imageFile || null);
}
</script>
