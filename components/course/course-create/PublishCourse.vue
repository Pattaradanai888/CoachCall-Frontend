<template>
  <div class="bg-white p-8">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-2">
        Preview
      </h2>
    </div>

    <!-- Course Information Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <Icon name="mdi:file-document" size="1.5rem" class="text-gray-500 pointer-events-none mr-1" />
          <h3 class="text-lg font-semibold">
            Course Information
          </h3>
        </div>
        <button @click="editCourseInfo">
          <Icon name="mdi:pencil-outline" size="1.5rem" class="text-gray-500 pointer-events-none" />
        </button>
      </div>
      <div v-if="courseData.title" class="bg-white border rounded-lg p-6 flex items-center justify-between">
        <div>
          <h4 class="text-lg font-semibold mb-2">
            {{ courseData.title }}
          </h4>
          <p class="text-gray-600 mb-4">
            {{ courseData.description }}
          </p>
          <div class="text-sm text-gray-500">
            <span class="mr-6">Start: {{ courseData.startDate }}</span>
            <span>End: {{ courseData.endDate }}</span>
          </div>
        </div>
        <div class="ml-6">
          <img :src="courseData.image" :alt="courseData.title" class="w-32 h-24 object-cover rounded-lg">
        </div>
      </div>
      <div v-else class="text-gray-500">
        No course information provided
      </div>
    </div>

    <!-- Course Session Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <Icon name="mdi:clock-time-eight" size="1.5rem" class="text-gray-500 pointer-events-none mr-1" />
          <h3 class="text-lg font-semibold">
            Course Session
          </h3>
        </div>
        <button @click="editSessions">
          <Icon name="mdi:pencil-outline" size="1.5rem" class="text-gray-500 pointer-events-none" />
        </button>
      </div>
      <div v-if="sessionData.length > 0" class="space-y-4">
        <div v-for="(session, index) in sessionData" :key="index" class="bg-white border rounded-lg p-4 flex items-center">
          <div class="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
            {{ index + 1 }}
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold">
                  {{ session.title }}
                </h4>
                <div class="text-sm text-gray-600 mt-1">
                  <span class="mr-4">Difficulty: {{ session.difficulty }}</span>
                  <span class="mr-4 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ session.date }}
                  </span>
                </div>
                <div class="text-sm text-gray-500 mt-2 flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zm-10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span class="mr-4">{{ session.tasks }} task</span>
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ session.duration }} minute</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500 space-x-4">
                  <span>Accuracy</span>
                  <span>Stamina</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500">
        No sessions added
      </div>
    </div>

    <!-- Athlete Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <Icon name="mdi:account-group" size="1.5rem" class="text-gray-500 pointer-events-none mr-1" />
          <h3 class="text-lg font-semibold">
            Athlete
          </h3>
        </div>
        <button @click="editAthletes">
          <Icon name="mdi:pencil-outline" size="1.5rem" class="text-gray-500 pointer-events-none" />
        </button>
      </div>
      <div v-if="athleteData.length > 0" class="grid grid-cols-2 gap-4">
        <div v-for="athlete in athleteData" :key="athlete.id" class="bg-white border rounded-lg p-4 flex items-center justify-between">
          <div class="flex items-center">
            <img :src="athlete.avatar" :alt="athlete.name" class="w-12 h-12 rounded-full mr-3">
            <div>
              <h4 class="font-semibold">
                {{ athlete.name }}
              </h4>
              <p class="text-sm text-gray-600">
                {{ athlete.position }} · {{ athlete.age }} yrs
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">
              Performance
            </p>
            <p class="font-semibold">
              {{ athlete.performance }}
            </p>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500">
        No athletes added
      </div>
    </div>

    <!-- Publish Button -->
    <div class="flex justify-end items-center pt-6 border-t">
      <button
        class="px-6 py-2 bg-red-600 text-white rounded-lg font-medium"
        :class="{ 'opacity-50 cursor-not-allowed': !isDataComplete, 'hover:bg-red-700': isDataComplete }"
        :disabled="!isDataComplete"
        @click="publishCourse"
      >
        Publish Course
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CoursePreview',
  props: {
    courseData: {
      type: Object,
      default: () => ({}),
    },
    sessionData: {
      type: Array,
      default: () => [],
    },
    athleteData: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    isDataComplete() {
      return this.courseData.title && this.sessionData.length > 0 && this.athleteData.length > 0;
    },
  },
  methods: {
    publishCourse() {
      this.$emit('publish-course', {
        courseInfo: this.courseData,
        sessions: this.sessionData,
        athletes: this.athleteData,
      });
      console.log('Course published successfully!');
    },
    editCourseInfo() {
      this.$emit('edit-step', 1);
    },
    editSessions() {
      this.$emit('edit-step', 2);
    },
    editAthletes() {
      this.$emit('edit-step', 3);
    },
  },
};
</script>

<style scoped>
.border {
  border-color: #e5e7eb;
}
</style>
