<template>
  <div class="bg-white rounded-2xl shadow p-6">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4"
    >
      <div>
        <h2 class="text-xl font-semibold">
          New Athletes Added
        </h2>
        <p class="text-gray-500 text-sm">
          Track additions over time
        </p>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div>
          <p class="text-gray-600 text-sm">
            This day
          </p>
          <p class="text-2xl font-bold">
            {{ stats.today > 99 ? '99+' : stats.today }}
          </p>
        </div>
        <Icon
          name="mdi:calendar-today"
          size="2rem"
          class="text-gray-400"
        />
      </div>
      <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div>
          <p class="text-gray-600 text-sm">
            This week
          </p>
          <p class="text-2xl font-bold">
            {{ stats.week > 99 ? '99+' : stats.week }}
          </p>
        </div>
        <Icon
          name="mdi:calendar-week-begin"
          size="2rem"
          class="text-gray-400"
        />
      </div>
      <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div>
          <p class="text-gray-600 text-sm">
            This month
          </p>
          <p class="text-2xl font-bold">
            {{ stats.month > 999 ? '999+' : stats.month }}
          </p>
        </div>
        <Icon
          name="mdi:calendar-month"
          size="2rem"
          class="text-gray-400"
        />
      </div>
    </div>

    <!-- Mini line-chart placeholder: you can replace this with e.g. Chart.js or ApexCharts later -->
    <div class="h-32">
      <canvas
        ref="lineChartRef"
        class="w-full h-full"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js';
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
  stats: StatsData;
}>();

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
);

interface StatsData {
  today: number;
  week: number;
  month: number;
  trend: number[];
}

const lineChartRef = ref<HTMLCanvasElement | null>(null);
let lineChart: Chart<'line', number[], string> | null = null;

onMounted(() => {
  if (lineChartRef.value) {
    lineChart = new Chart(lineChartRef.value, {
      type: 'line',
      data: {
        labels: props.stats.trend.map((_, idx) => `Day ${idx + 1}`),
        datasets: [
          {
            label: 'New Athletes',
            data: props.stats.trend,
            borderColor: 'rgba(156, 19, 19, 0.7)',
            backgroundColor: 'rgba(156, 19, 19, 0.2)',
            tension: 0.3,
            fill: true,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: true },
          y: { display: true },
        },
      },
    });
  }
});

watch(
  () => props.stats.trend,
  (newTrend) => {
    if (lineChart) {
      lineChart.data.labels = newTrend.map((_, idx) => `Day ${idx + 1}`);
      lineChart.data.datasets![0].data = newTrend;
      lineChart.update();
    }
  },
);
</script>

<style>
/* no extra styles needed—Tailwind covers everything */
</style>
