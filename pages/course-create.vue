<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-[300px] max-h-[none]">
    <div class="w-full mx-7 lg:mx-0 mt-[3rem]">
      <h1 class="text-2xl font-bold mb-4">
        Create Your Course
      </h1>
      <StageProgressBar :current-step="currentStep" />
      <component :is="currentStageComponent" />
      <div class="mt-4">
        <button
          v-if="currentStep > 1"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
          @click="goToPreviousStep"
        >
          Previous
        </button>
        <button
          v-if="currentStep < totalSteps"
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          @click="goToNextStep"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { StageProgressBar } from '#components';
import AddAthlete from '~/components/course/course-create/AddAthlete.vue';
import AddSession from '~/components/course/course-create/AddSession.vue';
import CourseInformation from '~/components/course/course-create/CourseInformation.vue';
import PublishCourse from '~/components/course/course-create/PublishCourse.vue';

export default {
  components: {
    StageProgressBar,
    CourseInformation,
    AddSession,
    AddAthlete,
    PublishCourse,
  },
  data() {
    return {
      currentStep: 1,
      totalSteps: 4,
    };
  },
  computed: {
    currentStageComponent() {
      switch (this.currentStep) {
        case 1: return 'CourseInformation';
        case 2: return 'AddSession';
        case 3: return 'AddAthlete';
        case 4: return 'PublishCourse';
        default: return 'CourseInformation';
      }
    },
  },
  methods: {
    goToNextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    },
    goToPreviousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
  },
};
</script>
