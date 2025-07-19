<template>
  <div class="space-y-6">
    <!-- Productivity Metrics -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        Productivity Metrics
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="text-center">
          <p class="text-2xl font-bold text-[#9C1313]">
            {{ activity.sessionsConducted }}
          </p>
          <p class="text-sm text-gray-600">
            Sessions Conducted
          </p>
          <p class="text-xs text-gray-500 mt-1">
            This Month
          </p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-[#9C1313]">
            {{ activity.coursesPlanned }}
          </p>
          <p class="text-sm text-gray-600">
            Courses Created
          </p>
          <p class="text-xs text-gray-500 mt-1">
            This Month
          </p>
        </div>
      </div>

      <!-- Simple Weekly Summary -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">
          Weekly Activity
        </h4>
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Average sessions per week</span>
          <span class="font-semibold text-gray-800">
            {{ averageWeeklySession }}
          </span>
        </div>
      </div>
    </div>

    <!-- Template Efficiency -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        Template Efficiency
      </h3>

      <div class="text-center mb-4">
        <p class="text-3xl font-bold text-green-600">
          {{ efficiency.templateReuseRate }}%
        </p>
        <p class="text-sm text-gray-600">
          Template Reuse Rate
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ efficiency.sessionsFromTemplate }}/{{ efficiency.totalSessions }} sessions from templates
        </p>
      </div>

      <!-- Simple Progress Bar -->
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-2 bg-green-500 rounded-full transition-all duration-300"
          :style="{ width: `${efficiency.templateReuseRate}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityStats, EfficiencyStats } from '~/types/coach-stat';

const props = defineProps<{
  activity: ActivityStats;
  efficiency: EfficiencyStats;
}>();

const averageWeeklySession = computed(() => {
  const total = props.activity.weeklySessionTrend.reduce((sum: number, week: any) => sum + week.count, 0);
  return Math.round(total / props.activity.weeklySessionTrend.length);
});
</script>
