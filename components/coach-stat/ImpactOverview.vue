<template>
  <div class="space-y-6">
    <!-- Card 1: Team Growth & Engagement -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center mb-4">
        <Icon name="mdi:account-multiple" class="text-2xl text-blue-700" />
        <h3 class="text-lg font-semibold text-gray-800 ml-2">
          Team Growth
        </h3>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Active Roster -->
        <div class="text-center">
          <p class="text-2xl font-bold text-[#9C1313]">
            {{ engagement.active_roster_count }}
          </p>
          <p class="text-sm text-gray-600">
            Active Athletes
          </p>
        </div>
        <!-- New Athletes -->
        <div class="text-center">
          <p class="text-2xl font-bold text-[#9C1313]">
            +{{ engagement.new_athletes_month.current }}
          </p>
          <p class="text-sm text-gray-600">
            New Athletes
          </p>
          <div class="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <Icon
              :name="engagement.new_athletes_month.change_percent >= 0 ? 'mdi:arrow-top-right' : 'mdi:arrow-bottom-right'"
              :class="engagement.new_athletes_month.change_percent >= 0 ? 'text-green-500' : 'text-red-500'"
            />
            <span :class="engagement.new_athletes_month.change_percent >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ Math.abs(engagement.new_athletes_month.change_percent) }}%
            </span>
          </div>
        </div>
        <!-- Team Attendance -->
        <div class="text-center">
          <p class="text-2xl font-bold text-[#9C1313]">
            {{ engagement.team_attendance_rate !== null ? `${engagement.team_attendance_rate}%` : 'N/A' }}
          </p>
          <p class="text-sm text-gray-600">
            Team Attendance
          </p>
          <p class="text-xs text-gray-500">
            This month
          </p>
        </div>
        <!-- Growth Insight -->
        <div class="col-span-2 md:col-span-1 bg-gray-50 p-4 rounded-lg">
          <p class="text-sm font-medium text-gray-800">
            Growth Insight
          </p>
          <div class="mt-1 text-xs text-gray-600">
            <Icon
              :name="engagement.growth_insight.trend_type === 'accelerating' ? 'mdi:trending-up' : 'mdi:trending-down'"
              :class="{ 'text-green-500': engagement.growth_insight.trend_type === 'accelerating', 'text-red-500': engagement.growth_insight.trend_type !== 'accelerating' }"
              class="inline-block mr-1"
            />
            {{ engagement.growth_insight.narrative }}
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: Coaching Focus & Results -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center mb-4">
        <Icon name="mdi:target-arrow" class="text-3xl text-blue-500" />
        <h3 class="text-lg font-semibold text-gray-800 ml-2">
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
              Skill Data Coverage
            </p>
            <span class="text-sm text-blue-600 font-semibold">
              {{ skill.athletes_improved_percent }}%
            </span>
            <p class="text-xs text-gray-500">
              This analysis is based on skill data from {{ Math.round(engagement.active_roster_count * skill.athletes_improved_percent / 100) }} of your {{ engagement.active_roster_count }} athletes.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 3: Athlete Highlights -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center mb-6">
        <Icon name="mdi:star-outline" class="text-3xl text-yellow-500" />
        <h3 class="text-lg font-semibold text-gray-800 ml-2">
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
                  <NuxtImg
                    v-if="player.profile_image_url"
                    :src="player.profile_image_url"
                    :alt="player.name"
                    format="webp"
                    width="32"
                    height="32"
                    loading="lazy"
                    class="w-8 h-8 rounded-full object-cover"
                  />
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
                  <NuxtImg
                    v-if="player.profile_image_url"
                    :src="player.profile_image_url"
                    :alt="player.name"
                    format="webp"
                    width="32"
                    height="32"
                    loading="lazy"
                    class="w-8 h-8 rounded-full object-cover"
                  />
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

defineProps<{ engagement: EngagementStats; skill: TeamSkillStats; topImprovers: PlayerInsight[]; needsAttention: PlayerInsight[] }>();
</script>
