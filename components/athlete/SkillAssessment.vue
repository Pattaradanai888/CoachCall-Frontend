<template>
  <div class="bg-gray-50 rounded-2xl p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">
        Skill Assessment
      </h3>
      <button
        class="text-blue-600 text-sm hover:underline"
        @click="toggleEdit"
      >
        {{ isEditing ? 'Cancel' : 'Update Assessment' }}
      </button>
    </div>

    <!-- SSR-Safe Radar Chart -->
    <div class="h-48 w-full mb-6 flex items-center justify-center">
      <ClientOnly>
        <canvas
          ref="radarChartRef"
          class="max-w-full max-h-full"
        />
        <template #fallback>
          <div class="text-gray-400 italic">
            Loading radar chart...
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Skill bars -->
    <div class="space-y-4">
      <div
        v-for="(skill, idx) in localScores"
        :key="skill.name"
        class="flex items-center justify-between"
      >
        <span class="text-sm font-medium">{{ skill.name }}</span>
        <div class="w-2/3 flex items-center">
          <input
            v-if="isEditing"
            v-model.number="localScores[idx].value"
            type="range"
            min="0"
            max="10"
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            @input="updateRadarChart"
          >
          <div
            v-else
            class="w-full h-2 bg-gray-200 rounded-lg overflow-hidden"
          >
            <div
              class="h-full bg-red-600"
              :style="{ width: `${skill.value * 10}%` }"
            />
          </div>
          <span class="w-12 text-right text-sm ml-2">{{
            skill.value.toFixed(1)
          }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="isEditing"
      class="mt-6 flex justify-end"
    >
      <button
        class="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900"
        @click="save"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

interface SkillScore {
  name: string;
  value: number;
}

const props = defineProps<{
  skillScores: SkillScore[];
}>();

const emit = defineEmits<{
  (e: 'saveScores', newScores: SkillScore[]): void;
}>();

// Local state
const localScores = ref<SkillScore[]>(
  JSON.parse(JSON.stringify(props.skillScores)),
);
const isEditing = ref(false);
const radarChartRef = ref<HTMLCanvasElement>();

// Dynamic imports for client-side only
let Chart: any = null;
let radarChart: any = null;

// Watch for prop changes
watch(
  () => props.skillScores,
  (newVal) => {
    localScores.value = JSON.parse(JSON.stringify(newVal));
    updateRadarChart();
  },
);

// Client-side only chart creation
async function createRadarChart() {
  // Skip if running on server
  if (process.server || !radarChartRef.value)
    return;

  try {
    // Dynamic import Chart.js components
    const chartModule = await import('chart.js');
    Chart = chartModule.Chart;

    // Register required components
    Chart.register(
      chartModule.RadarController,
      chartModule.RadialLinearScale,
      chartModule.PointElement,
      chartModule.LineElement,
      chartModule.Filler,
      chartModule.Tooltip,
      chartModule.Legend,
    );

    const ctx = radarChartRef.value.getContext('2d');
    if (!ctx)
      return;

    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: localScores.value.map(skill => skill.name),
        datasets: [
          {
            label: 'Current Skills',
            data: localScores.value.map(skill => skill.value),
            backgroundColor: 'rgba(156, 19, 19, 0.2)',
            borderColor: 'rgba(156, 19, 19, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(156, 19, 19, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(156, 19, 19, 0.8)',
            borderWidth: 1,
            callbacks: {
              label: (context: any) => {
                return `${context.label}: ${context.parsed.r.toFixed(1)}/10`;
              },
            },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 10,
            ticks: {
              stepSize: 2,
              color: 'rgba(107, 114, 128, 0.6)',
              font: {
                size: 10,
              },
            },
            grid: {
              color: 'rgba(107, 114, 128, 0.3)',
              lineWidth: 1,
            },
            angleLines: {
              color: 'rgba(107, 114, 128, 0.3)',
              lineWidth: 1,
            },
            pointLabels: {
              color: 'rgba(55, 65, 81, 0.8)',
              font: {
                size: 11,
                weight: '500',
              },
            },
          },
        },
        elements: {
          line: {
            tension: 0.1,
          },
        },
        interaction: {
          intersect: false,
          mode: 'point',
        },
      },
    });
  }
  catch (error) {
    console.warn('Failed to load Chart.js:', error);
  }
}

// Update radar chart data
function updateRadarChart() {
  if (!radarChart || process.server)
    return;

  radarChart.data.datasets[0].data = localScores.value.map(skill => skill.value);
  radarChart.update('none');
}

// Component methods
function toggleEdit() {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    localScores.value = JSON.parse(JSON.stringify(props.skillScores));
    updateRadarChart();
  }
}

function save() {
  emit('saveScores', JSON.parse(JSON.stringify(localScores.value)));
  isEditing.value = false;
}

// Client-side initialization
onMounted(() => {
  nextTick(() => {
    createRadarChart();
  });
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
