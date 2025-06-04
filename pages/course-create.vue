<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-[300px] max-h-[none]">
    <div class="w-full mx-7 lg:mx-0 mt-[3rem]">
      <div class="flex justify-center mb-6 mt-2">
        <div class="w-full max-w-4xl">
          <StageProgressBar :current-step="currentStep" />
        </div>
      </div>

      <h1 class="text-2xl font-bold mb-4">
        Create Your Course
      </h1>

      <!-- Render the current step's component -->
      <component
        :is="currentStageComponent"
        ref="currentComponent"
        :course-data="courseData"
        :session-data="sessionData"
        :athlete-data="athleteData"
        @edit-step="goToStep"
      />

      <!-- Navigation Buttons -->
      <div class="mt-4 flex justify-center mx-2">
        <div class="flex justify-between w-full">
          <!-- Previous -->
          <button
            v-if="currentStep > 1"
            class="w-32 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg"
            @click="goToPreviousStep"
          >
            Previous
          </button>
          <div v-else class="w-32" />

          <!-- Next or Publish -->
          <button
            v-if="currentStep < totalSteps"
            class="w-32 bg-[#9C1313] text-white font-bold py-2 rounded-lg hover:bg-[#7A0F0F] shadow-lg"
            @click="goToNextStep"
          >
            Next
          </button>
          <button
            v-else
            :disabled="!canPublish"
            class="w-32 font-bold py-2 rounded-lg shadow-lg" :class="[
              canPublish
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed',
            ]"
            @click="publishCourse"
          >
            Publish Course
          </button>
        </div>
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
      courseData: {},
      sessionData: [],
      athleteData: [],
      publishInfo: {},
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
    canPublish() {
      // Simple validation (adjust to your actual field names and requirements)
      return (
        this.courseData?.title
        && this.courseData?.description
        && Array.isArray(this.sessionData)
        && this.sessionData.length > 0
        && Array.isArray(this.athleteData)
        && this.athleteData.length > 0
      );
    },
  },
  methods: {
    goToNextStep() {
      if (this.currentStep < this.totalSteps) {
        const currentComponent = this.$refs.currentComponent;
        if (currentComponent?.getData) {
          const data = currentComponent.getData();
          if (this.currentStep === 1)
            this.courseData = data;
          else if (this.currentStep === 2)
            this.sessionData = data;
          else if (this.currentStep === 3)
            this.athleteData = data;
        }
        this.currentStep++;
      }
    },
    goToPreviousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    goToStep(step) {
      if (step >= 1 && step <= this.totalSteps) {
        this.currentStep = step;
      }
    },
    publishCourse() {
      const currentComponent = this.$refs.currentComponent;
      if (currentComponent?.getData) {
        this.publishInfo = currentComponent.getData();
      }

      const fullData = {
        course: this.courseData,
        sessions: this.sessionData,
        athletes: this.athleteData,
        publishInfo: this.publishInfo,
      };

      // Placeholder for future backend integration
      this.handlePublish(fullData);
    },
    handlePublish(data) {
      Console.log('Publishing course with data:', data);
      // Future backend request goes here
      // await fetch('/api/publish-course', { ... });
      this.resetForm();
    },
    resetForm() {
      this.currentStep = 1;
      this.courseData = {};
      this.sessionData = [];
      this.athleteData = [];
      this.publishInfo = {};
    },
  },
};
</script>
