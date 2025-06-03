<template>
  <div
    draggable="true"
    class="bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-move hover:shadow-lg transition-all duration-200 hover:scale-105"
    @dragstart="startDrag"
  >
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
        <Icon name="mdi:drag-horizontal-variant" size="1rem" class="text-gray-600" />
      </div>
      <div class="flex-1">
        <h3 class="font-semibold text-sm">
          {{ template.title }}
        </h3>
        <p class="text-xs text-gray-500">
          Difficulty: {{ template.difficulty }}
        </p>
        <div class="flex items-center space-x-4 mt-1">
          <span class="text-xs text-gray-400 flex items-center">
            <Icon name="mdi:format-list-bulleted" size="0.8rem" class="mr-1" />
            {{ template.tasks }} task{{ template.tasks > 1 ? 's' : '' }}
          </span>
          <span class="text-xs text-gray-400 flex items-center">
            <Icon name="mdi:clock-outline" size="0.8rem" class="mr-1" />
            {{ template.duration }} min{{ template.duration > 1 ? 's' : '' }}
          </span>
        </div>
        <div class="flex space-x-2 mt-2">
          <span
            v-for="tag in template.tags"
            :key="tag"
            class="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['template']);

function startDrag(event) {
  event.dataTransfer.setData('template', JSON.stringify(props.template));
  event.dataTransfer.effectAllowed = 'copy';
}
</script>
