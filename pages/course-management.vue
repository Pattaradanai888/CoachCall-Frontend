<template>
  <div>
    <SubNavbar />

    <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-[300px] max-h-[none]">
      <div class="w-full mx-7 lg:mx-0">
        <div v-motion-slide-visible-once-top class="flex justify-between mb-5">
          <div>
            <h1 class="text-3xl font-bold">
              Course Management
            </h1>
            <p>Manage your athletes and track their progress</p>
          </div>
          <div>
            <NuxtLink to="course-create">
              <button
                class="bg-[#9C1313] text-white font-bold px-2 py-2 rounded-xl hover:bg-[#7A0F0F] mx-auto shadow-lg"
              >
                <div class="flex items-center justify-center">
                  <Icon name="mdi:plus" size="1.5rem" class="mr-2" />
                  <p>Create Course</p>
                </div>
              </button>
            </NuxtLink>
          </div>
        </div>

        <div v-if="templatesPending" class="text-center p-8">
          Loading Templates...
        </div>
        <OverviewTemplate
          v-else
          v-motion-slide-visible-once-left
          :delay="200"
          :templates="sessionTemplates"
          class="mb-12"
        />

        <div v-if="coursesPending" class="text-center p-8">
          Loading Courses...
        </div>
        <OverviewActiveCourse
          v-else
          v-motion-slide-visible-once-right
          :delay="400"
          :courses="coursesWithProgress"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import OverviewActiveCourse from '~/components/course/course-overview/OverviewActiveCourse.vue';
import OverviewTemplate from '~/components/course/course-overview/OverviewTemplate.vue';
import { useCourses } from '~/composables/useCourses';

const { fetchAllCourseDetails, fetchSessionTemplates } = useCourses();

// Use the new function to get all course details
const { data: allCourses, pending: coursesPending } = await fetchAllCourseDetails();

// Calculate progress on the frontend, just like the original mock did
const coursesWithProgress = computed(() => {
  if (!allCourses.value)
    return [];
  return allCourses.value.map((course) => {
    if (!course.sessions || course.sessions.length === 0) {
      return { ...course, progressValue: 0 };
    }
    const completed = course.sessions.filter(s => s.status === 'Complete').length;
    const total = course.sessions.length;
    return {
      ...course,
      progressValue: Math.round((completed / total) * 100),
    };
  });
});

const { data: sessionTemplates, pending: templatesPending } = await fetchSessionTemplates();
</script>
