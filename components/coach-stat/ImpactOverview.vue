<template>
  <div class="space-y-6">
    <!-- Roster & Engagement Card -->
    <div class="bg-white rounded-2xl shadow-md p-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4">
        Roster & Engagement
      </h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm font-medium text-gray-600">
            Active Roster
          </p>
          <p class="text-3xl font-bold text-gray-800">
            {{ engagement.activeRosterCount }}
            <span class="text-base font-medium text-green-600">(+{{ engagement.newThisMonth }})</span>
          </p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm font-medium text-gray-600">
            Team Attendance
          </p>
          <p class="text-3xl font-bold text-gray-800">
            {{ engagement.teamAttendanceRate }}%
          </p>
        </div>
      </div>
    </div>

    <!-- Team Skill Progression Card -->
    <div class="bg-white rounded-2xl shadow-md p-6">
      <h3 class="text-lg font-bold text-gray-800 mb-1">
        Team Skill Progression
      </h3>
      <p class="text-sm text-gray-500 mb-4">
        How your team's skills are evolving.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <div class="flex items-baseline mb-4">
            <p class="text-4xl font-bold text-blue-600">
              {{ skill.athletesImprovedPercent }}%
            </p>
            <p class="ml-2 text-gray-600">
              of athletes improved
            </p>
          </div>
          <div v-if="skill.topTrendingSkill" class="mt-2">
            <p class="text-sm font-medium text-gray-500">
              Top Trending Skill
            </p>
            <p class="text-lg font-semibold text-gray-800">
              {{ skill.topTrendingSkill.name }}
              <span class="text-green-600 font-bold">↗ {{ skill.topTrendingSkill.changePercent }}%</span>
            </p>
          </div>
        </div>
        <div class="h-40">
          <ClientOnly>
            <DonutChart :labels="skill.skillFocus.map(s => s.skillName)" :data="skill.skillFocus.map(s => s.weight)" />
            <template #fallback>
              <div class="h-full flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Actionable Insights Card -->
    <div class="bg-white rounded-2xl shadow-md p-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4">
        Actionable Insights
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-semibold text-green-700 mb-2">
            Top Improvers
          </h4>
          <ul class="space-y-2">
            <li v-for="player in topImprovers" :key="player.uuid" class="flex items-center">
              <Icon name="mdi:trending-up" class="text-green-500 mr-3" />
              <span class="font-medium">{{ player.name }}</span>
              <span class="ml-auto text-sm font-mono text-green-600">{{ player.reason }}</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-orange-700 mb-2">
            Needs Attention
          </h4>
          <ul class="space-y-2">
            <li v-for="player in needsAttention" :key="player.uuid" class="flex items-center">
              <Icon name="mdi:alert-circle-outline" class="text-orange-500 mr-3" />
              <span class="font-medium">{{ player.name }}</span>
              <span class="ml-auto text-sm font-mono text-orange-600">{{ player.reason }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EngagementStats, PlayerInsight, TeamSkillStats } from '~/types/coach-stat';
import DonutChart from './charts/DonutChart.vue';

defineProps<{
  engagement: EngagementStats;
  skill: TeamSkillStats;
  topImprovers: PlayerInsight[];
  needsAttention: PlayerInsight[];
}>();
</script>
