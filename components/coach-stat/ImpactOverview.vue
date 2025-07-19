<template>
  <div class="space-y-6">
    <!-- Team Growth Stats -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        Team Growth
      </h3>

      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-[#9C1313]">
            {{ engagement.activeRosterCount }}
          </p>
          <p class="text-sm text-gray-600">
            Active Athletes
          </p>
          <p class="text-xs text-green-600 mt-1">
            +{{ engagement.newThisMonth }} this month
          </p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-[#9C1313]">
            {{ engagement.teamAttendanceRate }}%
          </p>
          <p class="text-sm text-gray-600">
            Team Attendance
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Average this month
          </p>
        </div>
      </div>
    </div>

    <!-- Skill Development -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        Skill Development
      </h3>

      <div class="text-center mb-4">
        <p class="text-3xl font-bold text-blue-600">
          {{ skill.athletesImprovedPercent }}%
        </p>
        <p class="text-sm text-gray-600">
          of athletes improved this month
        </p>
      </div>

      <div v-if="skill.topTrendingSkill" class="bg-gray-50 rounded-lg p-3">
        <p class="text-xs text-gray-500 mb-1">
          Top Improving Skill
        </p>
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-800">
            {{ skill.topTrendingSkill.name }}
          </span>
          <span class="text-green-600 font-semibold text-sm">
            +{{ skill.topTrendingSkill.changePercent }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Athlete Performance Lists -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-6">
        Athlete Performance
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 bg-green-500 rounded-full" />
            <h4 class="font-medium text-gray-800">
              Top Improvers
            </h4>
          </div>

          <div class="space-y-3">
            <div
              v-for="player in topImprovers"
              :key="player.uuid"
              class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 font-medium text-sm">
                    {{ player.name.charAt(0) }}
                  </span>
                </div>
                <span class="font-medium text-gray-800">{{ player.name }}</span>
              </div>
              <span class="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                {{ player.reason }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 bg-orange-500 rounded-full" />
            <h4 class="font-medium text-gray-800">
              Needs Attention
            </h4>
          </div>

          <div class="space-y-3">
            <div
              v-for="player in needsAttention"
              :key="player.uuid"
              class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span class="text-orange-600 font-medium text-sm">
                    {{ player.name.charAt(0) }}
                  </span>
                </div>
                <span class="font-medium text-gray-800">{{ player.name }}</span>
              </div>
              <span class="text-sm text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                {{ player.reason }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EngagementStats, PlayerInsight, TeamSkillStats } from '~/types/coach-stat';

defineProps<{
  engagement: EngagementStats;
  skill: TeamSkillStats;
  topImprovers: PlayerInsight[];
  needsAttention: PlayerInsight[];
}>();
</script>
