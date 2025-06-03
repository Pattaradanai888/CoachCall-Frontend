<template>
  <div class="bg-white rounded-lg shadow-md border border-gray-200 p-4 relative group timeline-item">
    <div class="absolute -left-3 -top-3 w-6 h-6 bg-[#9c1313] text-white rounded-full flex items-center justify-center text-xs font-bold">
      {{ index + 1 }}
    </div>
    <div class="flex justify-between items-start">
      <div class="flex items-center space-x-3 flex-1">
        <div class="drag-handle w-8 h-8 bg-[#fdcdcd] rounded-lg flex items-center justify-center hover:bg-[#ffa5a5] transition-colors cursor-grab active:cursor-grabbing">
          <Icon name="mdi:drag-horizontal-variant" size="1rem" class="text-[#9c1313]" />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-sm">
            {{ item.title }}
          </h3>
          <p class="text-xs text-gray-500">
            Difficulty: {{ item.difficulty }}
          </p>
          <div class="flex items-center space-x-4 mt-1">
            <span class="text-xs text-gray-400 flex items-center">
              <Icon name="mdi:format-list-bulleted" size="0.8rem" class="mr-1" />
              {{ item.tasks }} task{{ item.tasks > 1 ? 's' : '' }}
            </span>
            <span class="text-xs text-gray-400 flex items-center">
              <Icon name="mdi:clock-outline" size="0.8rem" class="mr-1" />
              {{ item.duration }} min{{ item.duration > 1 ? 's' : '' }}
            </span>
          </div>
          <div class="flex space-x-2 mt-2">
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2 no-drag">
        <button
          class="flex items-center text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          @click="$emit('edit-date', index)"
        >
          <Icon name="mdi:calendar" size="1rem" class="mr-1" />
          <span class="hidden sm:inline">{{ formatDate(item.date) }}</span>
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

<script setup>
const props = defineProps(['item', 'index']);

function formatDate(date) {
  const d = new Date(date);
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}
</script>
