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
            <button
              class="bg-white text-[#9C1313] font-bold border-2 border-[#9C1313] border-solid px-4 py-2 rounded-xl hover:bg-[#9C1313] hover:text-white mx-auto"
            >
              <div class="flex items-center justify-center">
                <Icon name="mdi:plus" size="1.5rem" class="mr-2" />
                <p>Create Course</p>
              </div>
            </button>
          </div>
        </div>

        <CourseCourseOverviewTemplate v-motion-slide-visible-once-left :delay="200" class="mb-12" />

        <CourseCourseOverviewActiveCourse v-motion-slide-visible-once-right :delay="400" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>
