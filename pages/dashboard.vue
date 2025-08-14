<template>
  <div>
    <SubNavbar />
  <ClientOnly>
      <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-[300px]">
        <div v-if="pending" class="flex justify-center items-center py-20 text-gray-500">
          <p>Loading Dashboard...</p>
        </div>
        <div v-else class="w-full mx-7 lg:mx-0">
          <!-- Overview Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
            <div v-for="(card, index) in cards" :key="index" class="bg-white shadow-md p-4 rounded-md">
              <div class="flex items-center">
                <Icon :name="card.icon" size="1.25rem" class="mr-2" />
                <div class="text-sm text-gray-600">
                  {{ card.label }}
                </div>
              </div>
              <div class="text-2xl sm:text-3xl font-bold">
                {{ card.value }}
              </div>
              <div v-if="'changeDirection' in card && 'changePercentage' in card && card.changeDirection && card.changePercentage" class="flex items-center">
                <Icon :name="card.changeDirection === 'up' ? 'mdi:arrow-top-right' : 'mdi:arrow-bottom-right'" size="1.25rem" :style="{ color: card.changeDirection === 'up' ? 'green' : 'red' }" />
                <div :class="card.changeDirection === 'up' ? 'text-green-500' : 'text-red-500'" class="text-sm">
                  {{ card.changePercentage }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Calendar Section -->
          <div class="bg-white shadow-md p-4 sm:p-8 rounded-md flex-1">
            <div class="flex items-center">
              <Icon name="mdi:calendar" size="2rem" class="mr-2" />
              <h1 class="text-xl sm:text-2xl font-bold">
                Calendar
              </h1>
            </div>
            <p class="mb-4 text-sm sm:text-base">
              Your scheduled training sessions. Click a day to see details.
            </p>
            <div class="flex flex-col lg:flex-row gap-4 px-0 sm:px-4">
              <!-- Calendar Component -->
              <div class="flex justify-center w-full lg:w-1/2">
                <VDatePicker
                  v-model="selectedDate"
                  expanded
                  mode="date"
                  :attributes="calendarAttributes"
                  locale="en-US"
                  class="border-2 border-[#9C1313] rounded-md"
                />
              </div>

              <!-- Right-hand Side Panel -->
              <div class="mt-4 lg:mt-0 lg:ml-5 w-full lg:w-1/2 flex flex-col">
                <!-- Header for the panel -->
                <div class="flex justify-between items-center mb-2 flex-shrink-0">
                  <h1 class="font-bold text-lg">
                    <span v-if="viewMode === 'today'">Today's Focus</span>
                    <span v-else-if="viewMode === 'agenda'">Upcoming Agenda</span>
                    <span v-else>Sessions on {{ formatSelectedDate }}</span>
                  </h1>
                  <button class="text-sm text-blue-600 hover:underline" @click="toggleViewMode">
                    <span v-if="viewMode === 'today'">View Full Agenda →</span>
                    <span v-else>← Back to Today</span>
                  </button>
                </div>

                <!-- Scrollable Content Area -->
                <div class="flex-grow overflow-y-auto pr-2">
                  <!-- TODAY'S VIEW -->
                  <div v-if="viewMode === 'today'" class="space-y-4">
                    <DashboardSessionGroup
                      title="Upcoming Today"
                      icon="mdi:clock-outline"
                      :sessions="sessionsForToday.upcoming"
                      color-class="text-blue-700"
                    />
                    <DashboardSessionGroup
                      title="Completed Today"
                      icon="mdi:check-circle-outline"
                      :sessions="sessionsForToday.completed"
                      color-class="text-green-700"
                    />
                    <p v-if="sessionsForToday.total === 0" class="text-center text-gray-500 pt-10">
                      No sessions scheduled for today.
                    </p>
                  </div>

                  <!-- AGENDA VIEW -->
                  <div v-else-if="viewMode === 'agenda'" class="space-y-3">
                    <div v-if="agendaSessions.length > 0">
                      <NuxtLink
                        v-for="event in agendaSessions"
                        :key="`agenda-${event.id}`"
                        :to="getEventPath(event)"
                        class="block p-3 rounded-lg transition-all border-2 bg-blue-50 border-blue-200 hover:border-red-500"
                      >
                        <p class="font-semibold text-gray-800">
                          {{ event.title }}
                        </p>
                        <p class="text-sm font-medium text-blue-700">
                          {{ formatEventDate(event.date) }}
                        </p>
                      </NuxtLink>
                    </div>
                    <p v-else class="text-center text-gray-500 pt-10">
                      Nothing scheduled for the week ahead.
                    </p>
                  </div>

                  <!-- SELECTED DAY VIEW -->
                  <div v-else class="space-y-4">
                    <DashboardSessionGroup
                      title="Upcoming"
                      icon="mdi:clock-outline"
                      :sessions="sessionsOnSelectedDate.upcoming"
                      color-class="text-blue-700"
                    />
                    <DashboardSessionGroup
                      title="Completed"
                      icon="mdi:check-circle-outline"
                      :sessions="sessionsOnSelectedDate.completed"
                      color-class="text-green-700"
                    />
                    <DashboardSessionGroup
                      title="Missed"
                      icon="mdi:alert-circle-outline"
                      :sessions="sessionsOnSelectedDate.missed"
                      color-class="text-gray-500"
                    />
                    <p v-if="sessionsOnSelectedDate.total === 0" class="text-center text-gray-500 pt-10">
                      No sessions scheduled for this day.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #fallback>
        <div />
      </template>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import type { EventItem, CourseListEntry } from '~/types/course';

const { $api } = useNuxtApp();

const [
  { data: events, pending },
  { data: activeCourses },
] = await Promise.all([
  useAsyncData<EventItem[]>('coach-events-all', () => $api('/course/events/all'), {
    default: () => [],
    server: false, // Disable SSR to prevent hydration mismatch
  }),
  useAsyncData<CourseListEntry[]>('active-courses', () => $api('/course', { params: { is_archived: false } }), {
    default: () => [],
    server: false, // Disable SSR to prevent hydration mismatch
  }),
]);

type ViewMode = 'today' | 'agenda' | 'selected_day';
const viewMode = ref<ViewMode>('today');

const now = new Date();
const selectedDate = ref(new Date(now.getFullYear(), now.getMonth(), now.getDate()));

function createSafeDate(dateString?: string): Date {
  if (import.meta.server && !dateString) {
    return new Date(Date.UTC(2024, 0, 1));
  }
  return dateString ? new Date(dateString) : new Date();
}

function isSameDay(d1: Date, d2: Date): boolean {
  const utc1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return utc1.getTime() === utc2.getTime();
}

function getTodayUTC(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getStatusInfo(event: EventItem): {
  label: 'Upcoming' | 'Completed' | 'Missed';
  color: 'blue' | 'green' | 'gray';
} {
  const eventDate = createSafeDate(event.date);
  const today = getTodayUTC();

  if (event.is_complete) {
    return { label: 'Completed', color: 'green' };
  }
  if (eventDate < today) {
    return { label: 'Missed', color: 'gray' };
  }
  return { label: 'Upcoming', color: 'blue' };
}

const cards = computed(() => [
  {
    icon: 'mynaui:academic-hat-solid',
    label: 'Active Courses',
    value: Array.isArray(activeCourses.value) ? activeCourses.value.length : 0,
  },
  {
    icon: 'mdi:calendar-account',
    label: 'Upcoming Sessions',
    value: events.value?.filter(e => getStatusInfo(e).label === 'Upcoming').length ?? 0,
  },
]);

const sessionsOnSelectedDate = computed(() => {
  if (!events.value)
    return { upcoming: [], completed: [], missed: [], total: 0 };

  const filtered = events.value.filter(event =>
    isSameDay(createSafeDate(event.date), selectedDate.value),
  );

  return {
    upcoming: filtered.filter(e => getStatusInfo(e).label === 'Upcoming'),
    completed: filtered.filter(e => getStatusInfo(e).label === 'Completed'),
    missed: filtered.filter(e => getStatusInfo(e).label === 'Missed'),
    total: filtered.length,
  };
});

const sessionsForToday = computed(() => {
  if (!events.value)
    return { upcoming: [], completed: [], total: 0 };

  const today = getTodayUTC();
  const filtered = events.value.filter(event =>
    isSameDay(createSafeDate(event.date), today),
  );

  return {
    upcoming: filtered.filter(e => getStatusInfo(e).label === 'Upcoming'),
    completed: filtered.filter(e => getStatusInfo(e).label === 'Completed'),
    total: filtered.length,
  };
});

const agendaSessions = computed(() => {
  if (!events.value)
    return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events.value
    .filter((event) => {
      const isUpcoming = getStatusInfo(event).label === 'Upcoming';
      const eventDate = createSafeDate(event.date);
      const isOnOrAfterToday = eventDate >= today;
      return isUpcoming && isOnOrAfterToday;
    })
    // Sort all upcoming events by date, soonest first.
    .sort((a, b) => createSafeDate(a.date).getTime() - createSafeDate(b.date).getTime());
});

const calendarAttributes = computed(() =>
  (events.value || []).map(event => ({
    key: event.id,
    dot: { color: getStatusInfo(event).color },
    dates: createSafeDate(event.date),
    popover: {
      label: `${event.title} (${getStatusInfo(event).label})`,
      visibility: 'hover',
    },
  })),
);

const formatSelectedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
});

function formatEventDate(dateString: string): string {
  return createSafeDate(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function getEventPath(event: EventItem): string {
  const courseSegment = event.type === 'course' ? event.course_id : 'quick';
  return getStatusInfo(event).label === 'Completed'
    ? `/course-detail/${courseSegment}/session/${event.id}/report`
    : `/course-detail/${courseSegment}/session/${event.id}`;
}

function toggleViewMode() {
  if (viewMode.value === 'today') {
    viewMode.value = 'agenda';
  }
  else {
    viewMode.value = 'today';
    const today = new Date();
    selectedDate.value = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
}

watch(selectedDate, (newDate, oldDate) => {
  if (oldDate && newDate && !isSameDay(newDate, oldDate)) {
    viewMode.value = 'selected_day';
  }
});

useHead({
  title: 'Coach Dashboard',
  meta: [
    { name: 'description', content: 'Coach dashboard for managing training sessions and courses' },
  ],
});
</script>
