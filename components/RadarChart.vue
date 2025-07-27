<!-- components/RadarChart.vue -->
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
  skillData: { [key: string]: SkillPoint[] } | SkillPoint[];
  maxScore?: number;
  showAnimation?: boolean;
  theme?: 'light' | 'dark';
}

const props = withDefaults(defineProps<Props>(), {
  maxScore: 100,
  showAnimation: true,
  theme: 'light',
});

const Chart = await import('chart.js/auto').then(module => module.default);

const chartCanvas = ref<HTMLCanvasElement>();
let chartInstance: InstanceType<typeof Chart> | null = null;

const hasData = computed(() => {
  if (!props.skillData)
    return false;
  if (Array.isArray(props.skillData)) {
    return props.skillData.length > 0;
  }
  return Object.values(props.skillData).some(arr => arr.length > 0);
});

const themeColors = computed(() => {
  if (props.theme === 'dark') {
    return {
      primary: '#ef4444', // red-500
      primaryAlpha: 'rgba(239, 68, 68, 0.2)',
      secondary: '#9ca3af', // gray-400
      secondaryAlpha: 'rgba(156, 163, 175, 0.1)',
      grid: 'rgba(255, 255, 255, 0.1)',
      text: '#f3f4f6', // gray-100
      textSecondary: '#9ca3af', // gray-400
    };
  }
  return {
    primary: '#dc2626', // red-600
    primaryAlpha: 'rgba(220, 38, 38, 0.2)',
    secondary: '#9ca3af', // gray-400
    secondaryAlpha: 'rgba(156, 163, 175, 0.1)',
    grid: 'rgba(0, 0, 0, 0.1)',
    text: '#374151', // gray-700
    textSecondary: '#6b7280', // gray-500
  };
});

const chartData = computed(() => {
  if (!hasData.value)
    return null;

  if (Array.isArray(props.skillData)) {
    const labels = props.skillData.map(skill => skill.skillName);
    const data = props.skillData.map(skill => skill.averageScore);
    return {
      labels,
      datasets: [{
        label: 'Skills',
        data,
        backgroundColor: themeColors.value.primaryAlpha,
        borderColor: themeColors.value.primary,
        borderWidth: 2.5,
        pointBackgroundColor: themeColors.value.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        fill: true,
        tension: 0.1,
      }],
    };
  }

  const dataObject = props.skillData;
  const keys = Object.keys(dataObject);
  const allSkillNames = new Set<string>();
  Object.values(dataObject).forEach((skillArray) => {
    if (Array.isArray(skillArray)) {
      skillArray.forEach((skill) => {
        allSkillNames.add(skill.skillName);
      });
    }
  });
  const labels = Array.from(allSkillNames);

  // Create datasets with proper ordering - secondary datasets first, then primary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datasets: any[] = [];

  // First, add secondary datasets (before, dayOne) - these will be rendered first (behind)
  const secondaryKeys = keys.filter(key => key === 'before' || key === 'dayOne');
  const primaryKeys = keys.filter(key => key === 'current' || key === 'after');

  // Add secondary datasets first (they'll be rendered behind)
  secondaryKeys.forEach((key) => {
    const datasetData = dataObject[key] || [];
    const scoreMap = new Map(datasetData.map(s => [s.skillName, s.averageScore]));
    const orderedData = labels.map(label => scoreMap.get(label) ?? 0);

    const labelMap: { [key: string]: string } = {
      dayOne: 'Day One',
      current: 'Current',
      before: 'Before',
      after: 'After',
    };

    datasets.push({
      label: labelMap[key] || key,
      data: orderedData,
      backgroundColor: themeColors.value.secondaryAlpha,
      borderColor: themeColors.value.secondary,
      borderWidth: 1.5,
      pointBackgroundColor: themeColors.value.secondary,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 1,
      pointRadius: 3,
      fill: true,
      tension: 0.1,
      order: 2, // Higher order = rendered behind
    });
  });

  // Then add primary datasets (they'll be rendered on top)
  primaryKeys.forEach((key) => {
    const datasetData = dataObject[key] || [];
    const scoreMap = new Map(datasetData.map(s => [s.skillName, s.averageScore]));
    const orderedData = labels.map(label => scoreMap.get(label) ?? 0);

    const labelMap: { [key: string]: string } = {
      dayOne: 'Day One',
      current: 'Current',
      before: 'Before',
      after: 'After',
    };

    datasets.push({
      label: labelMap[key] || key,
      data: orderedData,
      backgroundColor: themeColors.value.primaryAlpha,
      borderColor: themeColors.value.primary,
      borderWidth: 3,
      pointBackgroundColor: themeColors.value.primary,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      fill: true,
      tension: 0.1,
      order: 1, // Lower order = rendered on top
    });
  });

  return { labels, datasets };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 1,
  animation: {
    duration: props.showAnimation ? 1000 : 0,
    easing: 'easeInOutQuart' as const,
  },
  layout: {
    padding: 0,
  },
  plugins: {
    legend: {
      display: !Array.isArray(props.skillData), // Only display legend for multiple datasets
      position: 'top' as const,
      labels: {
        color: themeColors.value.text,
        font: {
          size: 12,
          family: 'Inter, system-ui, sans-serif',
        },
        boxWidth: 12,
        padding: 20,
        // Sort legend items to show primary datasets first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sort: (a: any, b: any) => {
          const primaryLabels = ['Current', 'After'];
          const aIsPrimary = primaryLabels.includes(a.text);
          const bIsPrimary = primaryLabels.includes(b.text);

          if (aIsPrimary && !bIsPrimary)
            return -1;
          if (!aIsPrimary && bIsPrimary)
            return 1;
          return 0;
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (context: any) => {
          return context[0].label;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: (context: any) => {
          const label = context.dataset.label || '';
          const value = context.parsed.r.toFixed(1);
          return `${label}: ${value}`;
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
          if (typeof label !== 'string') {
            return '';
          }
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

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  try {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'radar',
      data: chartData.value,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: chartOptions.value as any,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartInstance.options = chartOptions.value as any;
    chartInstance.update(props.showAnimation ? 'active' : 'none');
  }
  catch (error) {
    console.error('Error updating radar chart:', error);
  }
}

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
