<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">
        Skill Assessment
      </h3>
      <p class="text-sm text-gray-500">
        Read-only view
      </p>
    </div>

    <div v-if="validSkills.length > 0">
      <!-- SSR-Safe Radar Chart using our dedicated component -->
      <ClientOnly>
        <div class="h-56 sm:h-64 w-full mb-6 flex items-center justify-center overflow-hidden">
          <div class="w-full h-full max-w-sm max-h-sm">
            <RadarChart
              :skill-data="chartData"
              :max-score="100"
            />
          </div>
        </div>
        <template #fallback>
          <div class="h-56 sm:h-64 w-full mb-6 flex items-center justify-center bg-gray-100 rounded-lg">
            <span class="text-gray-500">Loading chart...</span>
          </div>
        </template>
      </ClientOnly>

      <!-- Skill bars -->
      <div class="space-y-4">
        <div v-for="skill in validSkills" :key="skill.skillName" class="flex items-center justify-between">
          <span class="text-sm font-medium flex-none w-32">
            {{ skill.skillName }}
          </span>
          <div class="flex-1 flex items-center">
            <div class="w-full h-2 bg-gray-200 rounded-lg overflow-hidden">
              <div
                class="h-full bg-red-600 transition-all duration-300"
                :style="{ width: `${(skill.currentScore / 100) * 100}%` }"
              />
            </div>
            <span class="w-12 text-right text-sm ml-2 font-mono">
              {{ formatScore(skill.currentScore) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="h-64 flex items-center justify-center text-center text-gray-500">
      <div>
        <Icon name="mdi:chart-bar-stacked" size="2rem" class="text-gray-400" />
        <p>No skill assessment data available.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SkillScore } from '~/types/athlete';
import RadarChart from '~/components/RadarChart.vue'; // Import the component

const props = defineProps<{
  skillScores: SkillScore[];
}>();

// Filter out invalid skill scores (this is still useful)
const validSkills = computed(() => {
  return props.skillScores.filter((skill) => {
    return skill
      && skill.skillName
      && typeof skill.currentScore === 'number'
      && !Number.isNaN(skill.currentScore);
  });
});

const chartData = computed(() => {
  return validSkills.value.map(skill => ({
    skillName: skill.skillName,
    averageScore: skill.currentScore,
  }));
});

function formatScore(score: number): string {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return '0.0';
  }
  return score.toFixed(1);
}
</script>

<style scoped>
/* Custom slider styling */
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9c1313;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9c1313;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type='range']::-webkit-slider-track {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
}

input[type='range']::-moz-range-track {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
  border: none;
}
</style>
