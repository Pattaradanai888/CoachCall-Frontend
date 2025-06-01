<template>
  <div class="bg-gray-50 rounded-2xl p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">
        Skill Assessment
      </h3>
      <button
        class="text-blue-600 text-sm hover:underline"
        @click="toggleEdit"
      >
        {{ isEditing ? 'Cancel' : 'Update Assessment' }}
      </button>
    </div>

    <!-- Radar chart placeholder: you can integrate a real radar chart (e.g. Chart.js) later -->
    <div
      class="h-48 w-full mb-6 flex items-center justify-center text-gray-400 italic"
    >
      Radar Chart Placeholder
    </div>

    <!-- Skill bars -->
    <div class="space-y-4">
      <div
        v-for="(skill, idx) in localScores"
        :key="skill.name"
        class="flex items-center justify-between"
      >
        <span class="text-sm font-medium">{{ skill.name }}</span>
        <div class="w-2/3 flex items-center">
          <input
            v-if="isEditing"
            v-model.number="localScores[idx].value"
            type="range"
            min="0"
            max="10"
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          >
          <div
            v-else
            class="w-full h-2 bg-gray-200 rounded-lg overflow-hidden"
          >
            <div
              class="h-full bg-red-600"
              :style="{ width: `${skill.value * 10}%` }"
            />
          </div>
          <span class="w-12 text-right text-sm ml-2">{{
            skill.value.toFixed(1)
          }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="isEditing"
      class="mt-6 flex justify-end"
    >
      <button
        class="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900"
        @click="save"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

interface SkillScore {
  name: string;
  value: number;
}

const props = defineProps<{
  skillScores: SkillScore[];
}>();

const emit = defineEmits<{
  (e: 'saveScores', newScores: SkillScore[]): void;
}>();

// We create a local editable copy when the user clicks “Update Assessment”
const localScores = ref<SkillScore[]>(
  JSON.parse(JSON.stringify(props.skillScores)),
);
const isEditing = ref(false);

watch(
  () => props.skillScores,
  (newVal) => {
    localScores.value = JSON.parse(JSON.stringify(newVal));
  },
);

function toggleEdit() {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    // if they cancelled, revert local to props
    localScores.value = JSON.parse(JSON.stringify(props.skillScores));
  }
}

function save() {
  emit('saveScores', JSON.parse(JSON.stringify(localScores.value)));
  isEditing.value = false;
}
</script>

<style>
/* All styling is Tailwind only */
</style>
