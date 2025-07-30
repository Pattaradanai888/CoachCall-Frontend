<template>
  <!-- Only render the entire block if there are sessions to display -->
  <div v-if="sessions.length > 0">
    <h3 class="font-bold mb-2 flex items-center border-b pb-1" :class="colorClass">
      <Icon :name="icon" class="mr-2" />
      {{ title }} ({{ sessions.length }})
    </h3>
    <div class="space-y-2">
      <NuxtLink
        v-for="event in sessions"
        :key="event.id"
        :to="getEventPath(event)"
        class="block p-3 rounded-lg transition-all border-2"
        :class="getStatusInfo(event).bgClass"
      >
        <p class="font-semibold text-gray-800">
          {{ event.title }}
        </p>
        <p v-if="event.type === 'course'" class="text-xs text-gray-500">
          Part of: {{ event.course_name }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { EventItem } from '~/types/course';

defineProps({
  title: {
    type: String,
    required: true,
  },
  sessions: {
    type: Array as () => EventItem[],
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  colorClass: {
    type: String,
    default: 'text-gray-700',
  },
});

// Re-create the helper functions locally within this component
// This makes the component self-contained
function getStatusInfo(event: EventItem) {
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (event.is_complete) {
    return { bgClass: 'bg-green-50 border-green-200 hover:border-green-400' };
  }
  if (eventDate < today) {
    return { bgClass: 'bg-gray-100 border-gray-300 hover:border-gray-400' };
  }
  return { bgClass: 'bg-blue-50 border-blue-200 hover:border-blue-400' };
}

function getEventPath(event: EventItem): string {
  const courseSegment = event.type === 'course' ? event.course_id : 'quick';
  return event.is_complete
    ? `/course-detail/${courseSegment}/session/${event.id}/report`
    : `/course-detail/${courseSegment}/session/${event.id}`;
}
</script>
