<template>
  <div class="flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10 mt-[7rem]">
    <!-- Overview Cards -->
    <div class="w-full grid-flow-row grid-rows-2">
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div v-for="(card, index) in cards" :key="index" class="bg-white shadow-md p-4 rounded-md">
          <div class="flex">
            <Icon :name="card.icon" size="1.25rem" style="color: black" class="mr-1" />
            <div class="text-sm text-gray-600">{{ card.label }}</div>
          </div>
          <div class="text-3xl font-bold">{{ card.value }}</div>
          <div class="flex">
            <Icon
              :name="
                card.changeDirection === 'up' ? 'mdi:arrow-top-right' : 'mdi:arrow-bottom-right'
              "
              size="1.25rem"
              :style="{ color: card.changeDirection === 'up' ? 'green' : 'red' }"
              class=""
            />
            <div
              :class="card.changeDirection === 'up' ? 'text-green-500' : 'text-red-500'"
              class="text-sm"
            >
              {{ card.changePercentage }}% {{ card.changePeriod }}
            </div>
          </div>
        </div>
      </div>
      <!-- Middle Sections -->
      <div class="mb-4">
        <!-- Calendar Section -->
        <div class="bg-white shadow-md p-8 rounded-md flex-1 col-span-1">
          <div class="flex">
            <Icon name="mdi:calendar" size="2rem" style="color: black" class="mr-1" />
            <h1 class="text-2xl font-bold">Calendar</h1>
          </div>
          <p class="mb-4">Your scheduled training sessions for this week</p>
          <div class="grid grid-cols-2 gap-4 px-4">
            <div class="flex justify-center items-center">
              <VDatePicker
                expanded
                v-model="selectedDate"
                mode="date"
                :attributes="calendarAttributes"
                class="border-2 border-[#9C1313] rounded-md"
              />
            </div>
            <div class="ml-5">
              <h1 class="font-bold">Upcoming Courses</h1>
              <div v-if="upcomingCourses.length > 0">
                <div
                  v-for="(course, index) in upcomingCourses"
                  :key="index"
                  class="mt-2 bg-white shadow-md rounded-md p-4 transition-shadow hover:shadow-lg"
                  v-motion
                  :initial="{
                    opacity: 0,
                    x: 100,
                  }"
                  :enter="{
                    opacity: 1,
                    x: 0,
                  }"
                  :leave="{
                    x: -100,
                    opacity: 0,
                  }"
                >
                  <h2 class="font-semibold text-gray-700 mb-2">{{ course.name }}</h2>
                  <ul class="list-disc pl-5">
                    <li
                      v-for="(session, sessionIndex) in course.sessions"
                      :key="sessionIndex"
                      class="text-gray-600"
                    >
                      {{ session.name }}
                    </li>
                  </ul>
                </div>
              </div>
              <div
                v-else
                v-motion-pop-visible
                class="flex flex-col justify-center items-center h-full"
              >
                <Icon
                  name="material-symbols:event-busy"
                  size="2rem"
                  style="color: black"
                  class="mb-2"
                />
                <p class="text-center">No sessions scheduled.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const currentDate = ref(new Date());
const selectedDate = ref(new Date());

const cards = ref([
  {
    icon: 'mynaui:academic-hat-solid',
    label: 'Active Courses',
    value: 18,
    changeDirection: 'up',
    changePercentage: 8,
    changePeriod: 'from last month',
  },
  {
    icon: 'mdi:calendar-account',
    label: 'Upcoming Sessions',
    value: 12,
    changeDirection: 'down',
    changePercentage: 5,
    changePeriod: 'from last week',
  },
  {
    icon: 'material-symbols:flag',
    label: 'Flagged Athletes',
    value: 7,
    changeDirection: 'up',
    changePercentage: 10,
    changePeriod: 'from last month',
  },
]);

const courses = ref([
  {
    name: 'Strength Training 101',
    sessions: [
      { name: 'Introduction to Strength Training', date: new Date(2025, 4, 26) },
      { name: 'Advanced Techniques', date: new Date(2025, 4, 28) },
    ],
  },
  {
    name: 'Endurance Running',
    sessions: [
      { name: 'Building Stamina', date: new Date(2025, 4, 27) },
      { name: 'Interval Training', date: new Date(2025, 4, 29) },
    ],
  },
]);

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// show upcoming session for selected date
const upcomingCourses = computed(() => {
  const selected = selectedDate.value;
  const selectedYear = selected.getFullYear();
  const selectedMonth = selected.getMonth();
  const selectedDay = selected.getDate();

  return courses.value
    .map((course) => ({
      name: course.name,
      sessions: course.sessions.filter((session) => {
        const sessionDate = session.date;
        return (
          sessionDate.getFullYear() === selectedYear &&
          sessionDate.getMonth() === selectedMonth &&
          sessionDate.getDate() === selectedDay
        );
      }),
    }))
    .filter((course) => course.sessions.length > 0);
});

const calendarAttributes = computed(() => {
  const attributes = [];
  const sessionDates = courses.value.flatMap((course) =>
    course.sessions.map((session) => session.date)
  );

  // Check if current date is a session date
  const isCurrentDateSession = sessionDates.some((date) => isSameDay(date, currentDate.value));

  // 1. Session dates with light highlight
  attributes.push(
    ...sessionDates.map((date) => ({
      key: `session-${date.toISOString()}`,
      highlight: { color: 'red', fillMode: 'light' },
      dates: date,
    }))
  );

  // 2. Current date (solid if it's a session)
  if (isCurrentDateSession) {
    attributes.push({
      key: 'current-date',
      highlight: { color: 'red', fillMode: 'solid' },
      dates: currentDate.value,
    });
  }

  // 3. Selected date (outline unless current)
  if (!isSameDay(selectedDate.value, currentDate.value)) {
    attributes.push({
      key: 'selected-date',
      highlight: { color: 'red', fillMode: 'outline', class: 'selected-date-outline' },
      dates: selectedDate.value,
    });
  }

  return attributes;
});
</script>

<style></style>
