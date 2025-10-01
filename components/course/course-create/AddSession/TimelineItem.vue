<template>
  <div class="bg-white rounded-lg shadow-md border border-gray-200 p-4 relative group timeline-item">
    <div class="absolute -left-3 -top-3 w-6 h-6 bg-[#9c1313] text-white rounded-full flex items-center justify-center text-xs font-bold">
      {{ index + 1 }}
    </div>
    <div class="flex justify-between items-start">
      <div class="flex items-center space-x-3 flex-1">
        <div class="drag-handle w-8 h-8 bg-[#fdcdcd] rounded-lg hidden lg:flex items-center justify-center hover:bg-[#ffa5a5] transition-colors cursor-grab active:cursor-grabbing">
          <Icon name="mdi:drag-horizontal-variant" size="1rem" class="text-[#9c1313]" />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-sm">
            {{ item.name }}
          </h3>
          <div class="flex items-center space-x-4 mt-1">
            <span class="text-xs text-gray-400 flex items-center">
              <Icon name="mdi:format-list-bulleted" size="0.8rem" class="mr-1" />
              {{ item.task_count ?? item.tasks_full?.length ?? 0 }} task{{ (item.task_count ?? item.tasks_full?.length ?? 0) !== 1 ? 's' : '' }}
            </span>
            <span class="text-xs text-gray-400 flex items-center">
              <Icon name="mdi:clock-outline" size="0.8rem" class="mr-1" />
              {{ item.total_duration_minutes }} min
            </span>
          </div>
        </div>
      </div>
      <div class="hidden lg:flex items-center space-x-2 no-drag">
        <button
          class="flex items-center text-sm px-2 py-1 rounded transition-colors"
          :class="{
            'text-gray-600 hover:text-gray-800 hover:bg-gray-100': item.date,
            'text-yellow-700 bg-yellow-100 hover:bg-yellow-200': !item.date,
          }"
          @click="$emit('editDate', index)"
        >
          <Icon name="mdi:calendar" size="1rem" class="mr-1" />
          <span class="hidden sm:inline">
            <span v-if="item.date">{{ formatDate(item.date) }}</span>
            <span v-else class="font-medium">Select a Date</span>
          </span>
        </button>
        <button
          class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
          @click="$emit('remove', index)"
        >
          <Icon name="mdi:trash-can-outline" size="1rem" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const _props = defineProps(['item', 'index']);
defineEmits(['editDate', 'remove']);

function formatDate(date: string | number | Date) {
  if (!date)
    return ''; // Handle null or undefined date
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
</script>
