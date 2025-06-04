<template>
  <div class="">
    <!-- Scrollable progress container -->
    <div ref="container" class="relative overflow-x-auto pb-4 hide-scrollbar flex justify-center">
      <!-- Progress Steps -->
      <div class="steps relative flex min-w-max mx-auto">
        <!-- Background Line (Full line) -->
        <div class="progress absolute top-4 left-0 w-full h-[2px] bg-[#ACACA6] z-[-1]" />

        <!-- Active Progress Line -->
        <div
          v-motion="{
            initial: { width: 0 },
            enter: {
              width: `${progressWidth}px`,
              transition: { duration: 1000, ease: 'easeInOut' },
            },
          }"
          class="percent absolute top-4 h-[2px] bg-[#9C1313] z-1"
          :style="{ width: `${progressWidth}px`, left: `${progressLeft}px` }"
        />

        <!-- Progress Circles -->
        <div
          v-for="(step, index) in steps"
          :key="index"
          ref="stepRefs"
          class="relative z-10 flex flex-col items-center flex-shrink-0"
          @click="$emit('stepClicked', index + 1)"
        >
          <div
            class="step w-8 h-8 rounded-full flex items-center justify-center transition-all duration-1000"
            :class="{
              selected: index === currentStep - 1,
              completed: index < currentStep - 1,
            }"
          >
            <Icon
              v-if="index < currentStep - 1"
              v-motion="{
                initial: { scale: 0 },
                enter: {
                  scale: 1,
                  transition: { duration: 300, ease: 'easeOut' },
                },
              }"
              name="mdi:check"
              size="1.5rem"
              class="text-white"
            />
            <span
              v-else
              class="font-bold"
              :class="index === currentStep - 1 ? 'text-[#9C1313]' : 'text-[#ACACA6]'"
            >
              {{ index + 1 }}
            </span>
          </div>

          <!-- Step Labels -->
          <div
            class="mt-3 text-sm font-medium transition-all duration-1000 whitespace-nowrap"
            :class="index === currentStep - 1 ? 'text-[#9C1313]' : index < currentStep - 1 ? 'text-[#9C1313]' : 'text-[#ACACA6]'"
          >
            {{ labels[index] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMotion } from '@vueuse/motion';
import { nextTick, ref, watch } from 'vue';

export default {
  props: {
    currentStep: {
      type: Number,
      required: true,
      validator(value) {
        return value >= 0 && value <= 4;
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

  emits: ['stepClicked'],

  setup(props) {
    const container = ref(null);
    const stepRefs = ref([]);
    const progressLeft = ref(0);
    const progressWidth = ref(0);

    const updateProgress = () => {
      nextTick(() => {
        if (
          props.currentStep > 1
          && stepRefs.value.length >= props.currentStep
        ) {
          const firstEl = stepRefs.value[0];
          const currentEl = stepRefs.value[props.currentStep - 1];

          const start = firstEl.offsetLeft + firstEl.offsetWidth / 2;
          const end = currentEl.offsetLeft + currentEl.offsetWidth / 2;

          progressLeft.value = start;
          progressWidth.value = end - start;
        }
        else {
          progressLeft.value = 0;
          progressWidth.value = 0;
        }
      });
    };

    const scrollToCurrent = () => {
      nextTick(() => {
        if (!container.value || !stepRefs.value.length)
          return;

        const containerWidth = container.value.offsetWidth;
        const currentStepIndex = props.currentStep - 1;
        const currentStepEl = stepRefs.value[currentStepIndex];

        if (!currentStepEl)
          return;

        const center = currentStepEl.offsetLeft + currentStepEl.offsetWidth / 2;
        const scrollPosition = center - containerWidth / 2;

        container.value.scrollTo({
          left: scrollPosition,
          behavior: 'smooth',
        });
      });
    };

    watch(
      () => props.currentStep,
      () => {
        updateProgress();
        scrollToCurrent();
      },
      { immediate: true },
    );

    return {
      container,
      stepRefs,
      progressLeft,
      progressWidth,
    };
  },
};
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.min-w-max {
  min-width: max-content;
}
.steps {
  position: relative;
  display: flex;
  gap: 8rem;
}
.step {
  background: #fff;
  border: 2px solid #acaca6;
}
.step.selected {
  border: 2px solid #9c1313;
}
.step.completed {
  border: 2px solid #9c1313;
  background: #9c1313;
}
</style>
