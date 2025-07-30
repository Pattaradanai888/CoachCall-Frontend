<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">
        Skill Progression
      </h3>
      <p class="text-sm text-gray-500">
        Read-only view
      </p>
    </div>

    <div v-if="combinedSkills.length > 0">
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

      <div class="space-y-4">
        <div v-for="skill in combinedSkills" :key="skill.skillId" class="flex items-center justify-between">
          <span class="text-sm font-medium flex-none w-32 truncate" :title="skill.skillName">
            {{ skill.skillName }}
          </span>
          <div class="flex-1 flex items-center">
            <div class="w-full h-2 bg-gray-200 rounded-lg overflow-hidden relative">
              <div
                class="h-full bg-red-600 transition-all duration-300"
                :style="{ width: `${(skill.currentScore / 100) * 100}%` }"
              />
              <div
                v-if="skill.dayOneScore > 0"
                class="absolute top-[-2px] bottom-[-2px] w-0.5 bg-gray-700 opacity-60"
                :style="{ left: `${(skill.dayOneScore / 100) * 100}%` }"
                :title="`Day One Score: ${formatScore(skill.dayOneScore)}`"
              />
            </div>
            <div class="w-28 text-right text-sm ml-2 font-mono flex flex-col items-end leading-tight">
              <span>{{ formatScore(skill.currentScore) }}</span>
              <span
                v-if="skill.dayOneScore > 0"
                class="text-xs"
                :class="getChangeClass(skill.currentScore - skill.dayOneScore)"
              >
                {{ formatChange(skill.currentScore - skill.dayOneScore) }}
              </span>
            </div>
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
import type { AthleteSkillProgression, SkillScore } from '~/types/athlete';
import RadarChart from '~/components/RadarChart.vue';

const props = defineProps<{
  skillProgression: AthleteSkillProgression;
}>();

const combinedSkills = computed(() => {
  const dayOneMap = new Map(
    (props.skillProgression?.dayOne || []).map(s => [s.skillId, s.currentScore]),
  );

  return (props.skillProgression?.current || [])
    .filter(skill =>
      skill
      && skill.skillName
      && typeof skill.currentScore === 'number'
      && !Number.isNaN(skill.currentScore),
    )
    .map(currentSkill => ({
      skillId: currentSkill.skillId,
      skillName: currentSkill.skillName,
      currentScore: currentSkill.currentScore,
      dayOneScore: dayOneMap.get(currentSkill.skillId) ?? 0,
    }));
});

const chartData = computed(() => {
  const toSkillPoint = (skill: SkillScore) => ({
    skillName: skill.skillName,
    averageScore: skill.currentScore,
  });

  return {
    dayOne: (props.skillProgression?.dayOne || []).map(toSkillPoint),
    current: (props.skillProgression?.current || []).map(toSkillPoint),
  };
});

function formatChange(change: number): string {
  if (change === 0)
    return '±0.0';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}`;
}

function getChangeClass(change: number): string {
  if (change > 0)
    return 'text-green-600';
  if (change < 0)
    return 'text-orange-600';
  return 'text-gray-500';
}

function formatScore(score: number): string {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return '0.0';
  }
  return score.toFixed(1);
}
</script>
