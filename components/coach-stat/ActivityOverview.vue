<template>
  <div class="space-y-6">
    <!-- Productivity Metrics -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center mb-4">
        <Icon name="mdi:flash" class="text-3xl text-yellow-500" />
        <h3 class="text-lg font-semibold text-gray-800">
          Productivity Metrics
        </h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="text-center">
          <p class="text-2xl font-bold text-[#9C1313]">
            {{ activity.sessions_conducted_month }}
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
            {{ activity.courses_created_month }}
          </p>
          <p class="text-sm text-gray-600">
            Courses Created
          </p>
          <p class="text-xs text-gray-500 mt-1">
            This Month
          </p>
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">
          Weekly Activity
        </h4>
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Average sessions per week</span>
          <span class="font-semibold text-gray-800">
            {{ activity.avg_sessions_per_week }}
          </span>
        </div>
      </div>
    </div>

    <!-- Template Efficiency -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center mb-4">
        <Icon name="mdi:file-document-multiple-outline" class="text-2xl" />
        <h3 class="text-lg font-semibold text-gray-800">
          Template Efficiency
        </h3>
      </div>
      <div class="text-center mb-4">
        <p class="text-3xl font-bold text-green-600">
          {{ efficiency.template_reuse_rate }}%
        </p>
        <p class="text-sm text-gray-600">
          Template Reuse Rate
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ efficiency.sessions_from_template_month }}/{{ efficiency.total_sessions_month }} sessions from templates
        </p>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-2 bg-green-500 rounded-full transition-all duration-300"
          :style="{ width: `${efficiency.template_reuse_rate}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityStats, EfficiencyStats } from '~/types/coach-stat';

defineProps<{
  activity: ActivityStats;
  efficiency: EfficiencyStats;
}>();
</script>
