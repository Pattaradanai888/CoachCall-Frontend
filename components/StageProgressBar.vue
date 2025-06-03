//StageProgressBar
<template>
  <div class="bg-white p-4">
    <!-- Progress Steps -->
    <div class="relative flex items-center space-x-8 overflow-hidden">
      <!-- Progress Line -->
      <div
        class="absolute left-0 top-1/2 w-full h-1 bg-gray-300"
        :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
      />

      <!-- Progress Circles -->
      <template v-for="(step, index) in steps" :key="index">
        <div
          :class="[
            {
              'border-red-500 bg-red-500': index < currentStep,
              'border-red-500 bg-red-500 text-white': index === currentStep,
              'border-gray-300 bg-white': index > currentStep,
            },
          ]"
          :style="{ left: `${(index / (totalSteps - 1)) * 100}%` }"
          class="absolute inset-y-0 w-6 h-6 rounded-full border-2 flex items-center justify-center"
        >
          <span v-if="index < currentStep" class="text-white text-xl font-bold">✓</span>
        </div>
      </template>
    </div>

    <!-- Step Labels -->
    <div class="mt-2 flex space-x-8">
      <span
        v-for="(label, index) in labels"
        :key="index"
        class="text-sm font-medium" :class="[
          {
            'text-red-500': index === currentStep - 1, // Highlight only the current step
            'text-gray-500': index < currentStep - 1, // Completed steps remain gray
            'text-gray-500': index > currentStep - 1, // Pending steps remain gray
          },
        ]"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentStep: {
      type: Number,
      required: true,
      validator(value) {
        return value >= 0 && value <= 4; // Assuming 4 steps
      },
    },
    totalSteps: {
      type: Number,
      default: 4,
    },
    steps: {
      type: Array,
      default: () => [1, 2, 3, 4],
    },
    labels: {
      type: Array,
      default: () => ['Course Information', 'Add Session', 'Add Athlete', 'Publish Course'],
    },
  },
};
</script>

<style scoped>
/* Ensure the progress line is positioned correctly */
.progress-line {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
</style>
