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

const chartColors = ['#9C1313', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

function createChart() {
  if (!chartRef.value || !props.data.length || !props.labels.length) {
    return;
  }

  const ctx = chartRef.value.getContext('2d');
  if (!ctx) {
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        backgroundColor: chartColors.slice(0, props.data.length),
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
          labels: {
            boxWidth: 12,
            font: { size: 12 },
            padding: 15,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels?.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i] as number;
                  const backgroundColor = data.datasets[0].backgroundColor;
                  const bgColor = Array.isArray(backgroundColor) ? backgroundColor[i] : backgroundColor;
                  return {
                    text: `${label}: ${value.toFixed(1)}%`,
                    fillStyle: bgColor as string,
                    strokeStyle: data.datasets[0].borderColor as string,
                    lineWidth: data.datasets[0].borderWidth as number,
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed;
              return `${label}: ${value.toFixed(1)}%`;
            },
          },
        },
      },
    },
  });
}

onMounted(createChart);
watch(() => [props.data, props.labels], createChart, { deep: true });

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
