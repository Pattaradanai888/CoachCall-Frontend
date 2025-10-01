<template>
  <div
    :data-id="template.id"
    class="session-template bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-move hover:shadow-lg transition-all duration-200 hover:scale-105 lg:block"
  >
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 bg-gray-100 rounded-lg hidden lg:flex items-center justify-center hover:bg-gray-200 transition-colors">
        <Icon name="mdi:drag-horizontal-variant" size="1rem" class="text-gray-600" />
      </div>
      <div class="flex-1">
        <h3 class="font-semibold text-sm">
          {{ template.name }}
        </h3>
        <div class="flex items-center space-x-4 mt-1">
          <span class="text-xs text-gray-400 flex items-center">
            <Icon name="mdi:format-list-bulleted" size="0.8rem" class="mr-1" />
            {{ template.task_count }} task{{ template.task_count !== 1 ? 's' : '' }}
          </span>
          <span class="text-xs text-gray-400 flex items-center">
            <Icon name="mdi:clock-outline" size="0.8rem" class="mr-1" />
            {{ template.total_duration_minutes }} min
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session } from '~/types/course';

defineProps<{
  template: Session;
}>();
</script>
