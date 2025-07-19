<template>
  <div class="bg-white rounded-2xl shadow-md p-6 border-l-4" :class="borderColor">
    <div class="flex items-center">
      <div class="mr-4 text-3xl" :class="textColor">
        <Icon :name="highlight.icon" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800">
          Good Afternoon, Coach Alex
        </h2>
        <p class="text-gray-600">
          {{ highlight.message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MotivationalHighlight } from '~/types/coach-stat';

const props = defineProps<{ highlight: MotivationalHighlight }>();

const borderColor = computed(() => {
  const colors = {
    SKILL_BOOST: 'border-blue-500',
    PERSONAL_BEST: 'border-green-500',
    NEW_ATHLETES: 'border-purple-500',
    DEFAULT: 'border-red-700',
  };
  return colors[props.highlight.type] || colors.DEFAULT;
});

const textColor = computed(() => {
  const colors = {
    SKILL_BOOST: 'text-blue-500',
    PERSONAL_BEST: 'text-green-500',
    NEW_ATHLETES: 'text-purple-500',
    DEFAULT: 'text-red-700',
  };
  return colors[props.highlight.type] || colors.DEFAULT;
});
</script>
