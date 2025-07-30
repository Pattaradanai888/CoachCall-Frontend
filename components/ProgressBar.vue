<template>
  <div>
    <div class="flex justify-between">
      <p>Progress</p>
      <p>{{ Math.round(percentage) }}%</p>
    </div>
    <div class="relative w-full h-4 overflow-hidden rounded-lg bg-gray-200">
      <div
        class="absolute top-0 left-0 h-full bg-[#9C1313] transition-all duration-300"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: number;
  max: number;
}>();

const percentage = computed(() => (props.max > 0 ? (props.value / props.max) * 100 : 0));
</script>
