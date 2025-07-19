<template>
  <div class="space-y-6">
    <!-- Coaching Volume Card -->
    <div class="bg-white rounded-2xl shadow-md p-6">
      <h3 class="text-lg font-bold text-gray-800">
        Your Activity
      </h3>
      <p class="text-sm text-gray-500 mb-6">
        Recent coaching and planning efforts.
      </p>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm font-medium text-gray-600">
            Sessions Conducted
          </p>
          <p class="text-3xl font-bold text-[#9C1313]">
            {{ activity.sessionsConducted }}
          </p>
          <p class="text-xs text-gray-500">
            This Month
          </p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm font-medium text-gray-600">
            Courses Planned
          </p>
          <p class="text-3xl font-bold text-[#9C1313]">
            {{ activity.coursesPlanned }}
          </p>
          <p class="text-xs text-gray-500">
            This Month
          </p>
        </div>
      </div>

      <div class="h-48">
        <ClientOnly>
          <LineChart :labels="activity.weeklySessionTrend.map(t => t.week)" :data="activity.weeklySessionTrend.map(t => t.count)" />
          <template #fallback>
            <div class="h-full flex items-center justify-center text-gray-400">
              Loading chart...
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Workflow Efficiency Card -->
    <div class="bg-white rounded-2xl shadow-md p-6">
      <h3 class="text-lg font-bold text-gray-800">
        Workflow Efficiency
      </h3>
      <div class="flex items-center justify-between mt-4">
        <div>
          <p class="text-4xl font-bold text-green-600">
            {{ efficiency.templateReuseRate }}%
          </p>
          <p class="text-sm text-gray-600">
            Template Reuse Rate
          </p>
        </div>
        <div class="text-right text-sm text-gray-500">
          <p>{{ efficiency.sessionsFromTemplate }} of {{ efficiency.totalSessions }} sessions</p>
          <p>from templates this month.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityStats, EfficiencyStats } from '~/types/coach-stat';
import LineChart from './charts/LineChart.vue';

defineProps<{
  activity: ActivityStats;
  efficiency: EfficiencyStats;
}>();
</script>
