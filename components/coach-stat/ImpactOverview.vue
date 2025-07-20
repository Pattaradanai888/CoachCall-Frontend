<template>
  <div class="space-y-6">
    <!-- Card 1: Team Growth & Engagement -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center mb-4">
        <Icon name="mdi:account-multiple" class="text-2xl text-blue-700" />
        <h3 class="text-lg font-semibold text-gray-800">
          Team Growth
        </h3>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-[#9C1313]">
            {{ engagement.active_roster_count }}
          </p>
          <p class="text-sm text-gray-600">
            Active Athletes
          </p>
          <p class="text-xs text-green-600 mt-1">
            +{{ engagement.new_athletes_month }} this month
          </p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-[#9C1313]">
            {{ engagement.team_attendance_rate ?? 'N/A' }}
            <span v-if="engagement.team_attendance_rate !== null">%</span>
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

    <!-- Card 2: Coaching Focus & Results (This replaces two old cards) -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center mb-4">
        <Icon name="mdi:target-arrow" class="text-3xl text-blue-500" />
        <h3 class="text-lg font-semibold text-gray-800">
          Focus & Results
        </h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-center">
        <!-- Left Column: The Donut Chart -->
        <div v-if="skill.skill_focus_distribution.length" class="h-48">
          <ClientOnly>
            <DonutChart
              :labels="skill.skill_focus_distribution.map(s => s.skill_name)"
              :data="skill.skill_focus_distribution.map(s => s.weight)"
            />
            <template #fallback>
              <div class="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-500">
                  Loading chart...
                </p>
              </div>
            </template>
          </ClientOnly>
        </div>
        <div v-else class="text-center py-8 text-gray-500 h-48 flex items-center justify-center border rounded-lg">
          <p>No recent task data to show skill focus.</p>
        </div>

        <!-- Right Column: The textual results -->
        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-gray-800">
              Top Focused Skill
            </p>
            <span class="text-sm text-gray-600">
              {{ skill.top_trending_skill?.name || 'N/A' }}
            </span>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800">
              Athletes with Scores
            </p>
            <span class="text-sm text-blue-600 font-semibold">
              {{ skill.athletes_improved_percent }}%
            </span>
            <p class="text-xs text-gray-500">
              Percentage of the team with recorded skill data.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 3: Athlete Highlights -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center mb-6">
        <Icon name="mdi:star-outline" class="text-3xl text-yellow-500" />
        <h3 class="text-lg font-semibold text-gray-800">
          Athlete Highlights
        </h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Top Performers List -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 bg-green-500 rounded-full" />
            <h4 class="font-medium text-gray-800">
              Top Performers
            </h4>
          </div>
          <div v-if="topImprovers.length" class="space-y-3">
            <NuxtLink v-for="player in topImprovers" :key="player.uuid" :to="`/athletes/${player.uuid}`" class="block p-1 -m-1 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center justify-between py-2 px-3">
                <div class="flex items-center gap-3">
                  <img v-if="player.profile_image_url" :src="player.profile_image_url" :alt="player.name" class="w-8 h-8 rounded-full object-cover">
                  <div v-else class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span class="text-green-600 font-medium text-sm">{{ player.name.charAt(0) }}</span>
                  </div>
                  <span class="font-medium text-gray-800">{{ player.name }}</span>
                </div>
                <span class="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">{{ player.reason }}</span>
              </div>
            </NuxtLink>
          </div>
          <div v-else class="text-center text-sm text-gray-500 py-6">
            No top performers with scores yet.
          </div>
        </div>

        <!-- Needs Attention List -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 bg-orange-500 rounded-full" />
            <h4 class="font-medium text-gray-800">
              Needs Attention
            </h4>
          </div>
          <div v-if="needsAttention.length" class="space-y-3">
            <NuxtLink v-for="player in needsAttention" :key="player.uuid" :to="`/athletes/${player.uuid}`" class="block p-1 -m-1 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center justify-between py-2 px-3">
                <div class="flex items-center gap-3">
                  <img v-if="player.profile_image_url" :src="player.profile_image_url" :alt="player.name" class="w-8 h-8 rounded-full object-cover">
                  <div v-else class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span class="text-orange-600 font-medium text-sm">{{ player.name.charAt(0) }}</span>
                  </div>
                  <span class="font-medium text-gray-800">{{ player.name }}</span>
                </div>
                <span class="text-sm text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">{{ player.reason }}</span>
              </div>
            </NuxtLink>
          </div>
          <div v-else class="text-center text-sm text-gray-500 py-6">
            Great! No athletes need special attention.
          </div>
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
