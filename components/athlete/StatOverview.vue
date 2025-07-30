<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <div>
        <h2 class="text-xl font-semibold">
          New Athletes Added
        </h2>
        <p class="text-gray-500 text-sm">
          Track additions over time
        </p>
      </div>
      <!-- Insights Badge -->
      <div v-if="stats.insights && stats.insights.week_change_percent !== null && stats.insights.is_growing !== null" class="mt-2 sm:mt-0">
        <span
          class="px-3 py-1 rounded-full text-sm font-medium" :class="[
            stats.insights.is_growing
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800',
          ]"
        >
          {{ stats.insights.is_growing ? '↗' : '↘' }}
          {{ Math.abs(stats.insights.week_change_percent) }}% vs last week
        </span>
      </div>
    </div>

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
        <div>
          <p class="text-blue-600 text-sm font-medium">
            Today
          </p>
          <p class="text-2xl font-bold text-blue-900">
            {{ formatCount(stats.today) }}
          </p>
        </div>
        <Icon name="mdi:calendar-today" size="1.5rem" class="text-blue-400" />
      </div>

      <div class="flex items-center justify-between bg-green-50 p-4 rounded-lg">
        <div>
          <p class="text-green-600 text-sm font-medium">
            This Week
          </p>
          <p class="text-2xl font-bold text-green-900">
            {{ formatCount(stats.week) }}
          </p>
          <p v-if="stats.insights?.avg_daily" class="text-xs text-green-600">
            {{ stats.insights.avg_daily }}/day avg
          </p>
        </div>
        <Icon name="mdi:calendar-week-begin" size="1.5rem" class="text-green-400" />
      </div>

      <div class="flex items-center justify-between bg-purple-50 p-4 rounded-lg">
        <div>
          <p class="text-purple-600 text-sm font-medium">
            This Month
          </p>
          <p class="text-2xl font-bold text-purple-900">
            {{ formatCount(stats.month) }}
          </p>
        </div>
        <Icon name="mdi:calendar-month" size="1.5rem" class="text-purple-400" />
      </div>

      <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div>
          <p class="text-gray-600 text-sm font-medium">
            Total
          </p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatCount(stats.total) }}
          </p>
        </div>
        <Icon name="mdi:account-group" size="1.5rem" class="text-gray-400" />
      </div>
    </div>

    <!-- Quick Insights -->
    <div v-if="stats.insights" class="mb-4 p-3 bg-gray-50 rounded-lg">
      <div class="flex flex-wrap gap-4 text-sm text-gray-600">
        <span v-if="stats.insights.peak_day">
          <strong>Peak day:</strong> {{ stats.insights.peak_day }}
        </span>
        <span v-if="stats.insights.avg_daily > 0">
          <strong>Daily average:</strong> {{ stats.insights.avg_daily }} athletes
        </span>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="h-40">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm font-medium text-gray-700">
          7-Day Trend
        </h3>
        <div class="text-xs text-gray-500">
          Last 7 days
        </div>
      </div>

      <canvas
        v-if="stats.trend_detailed && stats.trend_detailed.length > 0"
        ref="lineChartRef"
        class="w-full h-full"
      />
      <div
        v-else
        class="flex items-center justify-center h-full text-gray-500 border-2 border-dashed border-gray-200 rounded-lg"
      >
        <div class="text-center">
          <Icon name="mdi:chart-line" size="2rem" class="text-gray-300 mb-2" />
          <p>No trend data available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AthleteCreationStatus } from '~/types/athlete';
import { CategoryScale, Chart, Filler, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip } from 'chart.js';

const props = defineProps<{
  stats: AthleteCreationStatus;
}>();

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

const lineChartRef = ref<HTMLCanvasElement | null>(null);
let lineChart: Chart | null = null;

function formatCount(count: number): string {
  if (count >= 1000)
    return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function createChart() {
  if (!lineChartRef.value || !props.stats.trend_detailed?.length)
    return;
  const ctx = lineChartRef.value.getContext('2d');
  if (!ctx)
    return;
  if (lineChart)
    lineChart.destroy();

  const labels = props.stats.trend_detailed.map(item => item.formatted_date);
  const data = props.stats.trend_detailed.map(item => item.count);

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'New Athletes',
        data,
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  });
}

onMounted(createChart);
watch(() => props.stats.trend_detailed, createChart, { deep: true });
</script>
