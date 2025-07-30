<template>
  <canvas ref="chartRef" />
</template>

<script setup lang="ts">
import { CategoryScale, Chart, Filler, LinearScale, LineController, LineElement, PointElement, Tooltip } from 'chart.js';

const props = defineProps<{
  labels: string[];
  data: number[];
}>();

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

const chartRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

function createChart() {
  if (!chartRef.value)
    return;
  const ctx = chartRef.value.getContext('2d');
  if (!ctx)
    return;

  if (chartInstance)
    chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [{
        label: 'Sessions',
        data: props.data,
        borderColor: '#9C1313',
        backgroundColor: 'rgba(156, 19, 19, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#9C1313',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1f2937',
          padding: 10,
          cornerRadius: 4,
          displayColors: false,
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  });
}

onMounted(createChart);
watch(props, createChart, { deep: true });

onBeforeUnmount(() => {
  if (chartInstance)
    chartInstance.destroy();
});
</script>
