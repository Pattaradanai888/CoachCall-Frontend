<template>
  <canvas ref="chartRef" />
</template>

<script setup lang="ts">
import { ArcElement, Chart, DoughnutController, Legend, Tooltip } from 'chart.js';

const props = defineProps<{
  labels: string[];
  data: number[];
}>();

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const chartRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const chartColors = ['#9C1313', '#4b5563', '#1d4ed8', '#d97706', '#059669'];

function createChart() {
  if (!chartRef.value)
    return;
  const ctx = chartRef.value.getContext('2d');
  if (!ctx)
    return;

  if (chartInstance)
    chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        backgroundColor: chartColors,
        borderColor: '#fff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: { boxWidth: 12, font: { size: 12 }, padding: 15 },
        },
        tooltip: {
          callbacks: {
            label: context => `${context.label}: ${context.formattedValue}%`,
          },
        },
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
