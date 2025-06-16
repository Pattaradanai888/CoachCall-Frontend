<template>
  <div class="bg-gray-50 rounded-2xl p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">
        Skill Assessment
      </h3>
      <!-- ANNOTATION: Editing functionality removed to align with backend capabilities. -->
      <p class="text-sm text-gray-500">
        Read-only view
      </p>
    </div>

    <div v-if="localScores.length > 0">
      <!-- SSR-Safe Radar Chart -->
      <div class="h-48 w-full mb-6 flex items-center justify-center">
        <canvas ref="radarChartRef" class="max-w-full max-h-full" />
      </div>

      <!-- Skill bars -->
      <div class="space-y-4">
        <div v-for="skill in localScores" :key="skill.skillName" class="flex items-center justify-between">
          <span class="text-sm font-medium">{{ skill.skillName }}</span>
          <div class="w-2/3 flex items-center">
            <div class="w-full h-2 bg-gray-200 rounded-lg overflow-hidden">
              <div class="h-full bg-red-600" :style="{ width: `${skill.currentScore * 10}%` }" />
            </div>
            <span class="w-12 text-right text-sm ml-2">{{ skill.currentScore.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="h-64 flex items-center justify-center text-center text-gray-500">
      <div>
        <Icon name="mdi:chart-bar-stacked" size="2rem" class="text-gray-400" />
        <p>No skill assessment data available.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SkillScore } from '~/types/athlete';

const props = defineProps<{
  skillScores: SkillScore[];
}>();
// ANNOTATION: Dynamic import for Chart.js to ensure it only runs on the client-side.
const Chart = await (import.meta.client ? import('chart.js') : Promise.resolve(null));
if (Chart) {
  Chart.Chart.register(
    Chart.RadarController,
    Chart.RadialLinearScale,
    Chart.PointElement,
    Chart.LineElement,
    Chart.Filler,
    Chart.Tooltip,
    Chart.Legend,
  );
}

const localScores = ref<SkillScore[]>(props.skillScores);
const radarChartRef = ref<HTMLCanvasElement | null>(null);
let radarChart: InstanceType<typeof Chart.Chart> | null = null;

watch(() => props.skillScores, (newVal) => {
  localScores.value = newVal;
  updateRadarChart();
}, { deep: true });

function createRadarChart() {
  if (!process.client || !radarChartRef.value || !Chart || localScores.value.length === 0)
    return;
  const ctx = radarChartRef.value.getContext('2d');
  if (!ctx)
    return;

  radarChart = new Chart.Chart(ctx, {
    type: 'radar',
    data: {
      labels: localScores.value.map(s => s.skillName),
      datasets: [{
        label: 'Current Skills',
        data: localScores.value.map(s => s.currentScore),
        backgroundColor: 'rgba(156, 19, 19, 0.2)',
        borderColor: 'rgba(156, 19, 19, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(156, 19, 19, 1)',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: { beginAtZero: true, min: 0, max: 10, ticks: { stepSize: 2 } },
      },
    },
  });
}

function updateRadarChart() {
  if (!radarChart) {
    // If chart doesn't exist yet, try creating it (e.g., if data arrived after mount)
    createRadarChart();
    return;
  }
  radarChart.data.labels = localScores.value.map(s => s.skillName);
  radarChart.data.datasets[0].data = localScores.value.map(s => s.currentScore);
  radarChart.update('none');
}

onMounted(() => {
  nextTick(() => createRadarChart());
});

onBeforeUnmount(() => {
  radarChart?.destroy();
});
</script>

<style scoped>
/* Custom slider styling */
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9c1313;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9c1313;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type='range']::-webkit-slider-track {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
}

input[type='range']::-moz-range-track {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
  border: none;
}
</style>
