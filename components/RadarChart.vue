<template>
  <div class="radar-chart-container">
    <div class="chart-wrapper">
      <canvas ref="chartCanvas" />
    </div>
    <div v-if="!hasData" class="no-data-overlay">
      <div class="no-data-content">
        <Icon name="mdi:chart-radar" size="2rem" class="text-gray-400 mb-2" />
        <p class="text-gray-500 text-sm">
          No data available
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillPoint } from '~/types/athlete';

interface Props {
  skillData: SkillPoint[];
  maxScore?: number;
  showAnimation?: boolean;
  theme?: 'light' | 'dark';
}

const props = withDefaults(defineProps<Props>(), {
  maxScore: 100,
  showAnimation: true,
  theme: 'light',
});

// Use dynamic import for Chart.js to avoid SSR issues
const Chart = await import('chart.js/auto').then(module => module.default);

const chartCanvas = ref<HTMLCanvasElement>();
let chartInstance: InstanceType<typeof Chart> | null = null;

const hasData = computed(() => props.skillData && props.skillData.length > 0);

const themeColors = computed(() => {
  if (props.theme === 'dark') {
    return {
      primary: '#ef4444', // red-500
      primaryAlpha: 'rgba(239, 68, 68, 0.15)',
      grid: 'rgba(255, 255, 255, 0.1)',
      text: '#f3f4f6', // gray-100
      textSecondary: '#9ca3af', // gray-400
    };
  }
  return {
    primary: '#dc2626', // red-600
    primaryAlpha: 'rgba(220, 38, 38, 0.15)',
    grid: 'rgba(0, 0, 0, 0.1)',
    text: '#374151', // gray-700
    textSecondary: '#6b7280', // gray-500
  };
});

const chartData = computed(() => {
  if (!hasData.value)
    return null;

  const labels = props.skillData.map(skill => skill.skillName);
  const data = props.skillData.map(skill => skill.averageScore);

  return {
    labels,
    datasets: [
      {
        label: 'Skills',
        data,
        backgroundColor: themeColors.value.primaryAlpha,
        borderColor: themeColors.value.primary,
        borderWidth: 2.5,
        pointBackgroundColor: themeColors.value.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: themeColors.value.primary,
        pointHoverBorderWidth: 3,
        fill: true,
        tension: 0.1,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 1,
  animation: {
    duration: props.showAnimation ? 1000 : 0,
    easing: 'easeInOutQuart',
  },
  layout: {
    padding: 0,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: themeColors.value.primary,
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        title: (context: any) => {
          return context[0].label;
        },
        label: (context: any) => {
          return `Score: ${context.parsed.r.toFixed(1)}`;
        },
      },
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: props.maxScore,
      min: 0,
      ticks: {
        stepSize: props.maxScore / 5,
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif',
        },
        color: themeColors.value.textSecondary,
        backdropColor: 'transparent',
        showLabelBackdrop: false,
        z: 1,
      },
      grid: {
        color: themeColors.value.grid,
        lineWidth: 1,
      },
      angleLines: {
        color: themeColors.value.grid,
        lineWidth: 1,
      },
      pointLabels: {
        font: {
          size: 12,
          weight: '600',
          family: 'Inter, system-ui, sans-serif',
        },
        color: themeColors.value.text,
        padding: 0,
        callback(label: string) {
          // Smart truncation for long labels
          if (label.length > 15) {
            return `${label.substring(0, 12)}...`;
          }
          return label;
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'nearest' as const,
  },
  elements: {
    line: {
      borderJoinStyle: 'round' as const,
      borderCapStyle: 'round' as const,
    },
    point: {
      hoverBorderWidth: 3,
    },
  },
}));

function createChart() {
  if (!chartCanvas.value || !hasData.value || !chartData.value)
    return;

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  try {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'radar',
      data: chartData.value,
      options: chartOptions.value,
    });
  }
  catch (error) {
    console.error('Error creating radar chart:', error);
  }
}

function updateChart() {
  if (!chartInstance || !chartData.value)
    return;

  try {
    chartInstance.data = chartData.value;
    chartInstance.options = chartOptions.value;
    chartInstance.update(props.showAnimation ? 'active' : 'none');
  }
  catch (error) {
    console.error('Error updating radar chart:', error);
  }
}

// Watchers
watch(
  () => [props.skillData, props.maxScore, props.theme],
  () => {
    if (hasData.value) {
      if (chartInstance) {
        updateChart();
      }
      else {
        nextTick(() => createChart());
      }
    }
  },
  { deep: true },
);

// Lifecycle
onMounted(() => {
  if (hasData.value) {
    nextTick(() => createChart());
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
</style>
