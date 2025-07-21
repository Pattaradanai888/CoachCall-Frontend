<!-- components/setup/matricsSetup.vue -->
<template>
  <!-- ... Your existing template is unchanged ... -->
  <div class="min-h-screen items-center justify-center bg-white p-4 sm:p-10">
    <header class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Choose Performance Metrics</h1>
        <p class="mt-1 text-base text-gray-600">Select up to 6 key metrics to track athlete development</p>
      </div>
      <div class="flex-shrink-0 rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-700">
        {{ selectionCount }} of {{ maxSelection }} selected
      </div>
    </header>

    <main>
      <!-- Basketball Fundamentals Section -->
      <section class="mb-8">
        <h2 class="mb-4 text-lg font-bold">
          Basketball Fundamentals
        </h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <button
            v-for="metric in fundamentalMetrics"
            :key="metric.id"
            :class="isMetricSelected(metric.id) ? 'border-red-800 bg-red-800 text-white' : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'"
            :disabled="!isMetricSelected(metric.id) && selectionCount >= maxSelection"
            class="rounded-lg border py-3 px-2 text-center text-sm font-medium shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
            @click="toggleFundamentalMetric(metric)"
          >
            {{ metric.name }}
          </button>
        </div>
      </section>

      <!-- Custom Metrics Input Section -->
      <section class="mb-6">
        <h2 class="mb-4 text-lg font-bold text-gray-800">Custom Metrics</h2>
        <div class="flex gap-3">
          <input
            v-model="newCustomMetric"
            placeholder="Add your own matrics"
            class="block w-full flex-grow rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-red-700 focus:ring-red-700"
            :disabled="selectionCount >= maxSelection"
            @keyup.enter="addCustomMetric"
          >
          <button
            :disabled="selectionCount >= maxSelection"
            class="flex-shrink-0 rounded-lg bg-red-800 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-red-800/60"
            @click="addCustomMetric"
          >
            + Add
          </button>
        </div>
      </section>

      <!-- Selected Metrics List Section -->
      <section>
        <h1 class="mb-4 text-lg font-bold text-gray-800">Selected Metrics</h1>
        <div v-if="selectedMetrics.length === 0" class="flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-4">
          <p class="text-gray-400">No custom metrics added yet</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="metric in selectedMetrics"
            :key="metric.id"
            class="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 p-3"
          >
            <span class="font-medium text-gray-800">{{ metric.name }}</span>
            <button class="text-red-500 hover:text-red-700" @click="removeSelectedMetric(metric.id)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useNuxtApp } from '#app';

interface Metric {
  id: number;
  name: string;
}

const { $api } = useNuxtApp();

const maxSelection = 6;

const fundamentalMetrics = ref<Metric[]>([
  { id: 1, name: 'Shooting' },
  { id: 2, name: 'Dribbling' },
  { id: 3, name: 'Passing' },
  { id: 4, name: 'Defense' },
  { id: 5, name: 'Rebounding' },
  { id: 6, name: 'Speed & Agility' },
]);

const newCustomMetric = ref('');
const selectedMetrics = ref<Metric[]>([]);
const nextCustomMetricId = ref(7);

const selectionCount = computed(() => selectedMetrics.value.length);

const isMetricSelected = (metricId: number): boolean => {
  return selectedMetrics.value.some(m => m.id === metricId);
};

const addCustomMetric = () => {
  const metricName = newCustomMetric.value.trim();
  if (metricName && selectionCount.value < maxSelection) {
    const newMetric: Metric = { id: nextCustomMetricId.value++, name: metricName };
    selectedMetrics.value.push(newMetric);
    newCustomMetric.value = '';
  }
};

const toggleFundamentalMetric = (metric: Metric) => {
  const index = selectedMetrics.value.findIndex(m => m.id === metric.id);
  if (index > -1) {
    selectedMetrics.value.splice(index, 1);
  } else if (selectionCount.value < maxSelection) {
    selectedMetrics.value.push(metric);
  }
};

const removeSelectedMetric = (metricId: number) => {
  const index = selectedMetrics.value.findIndex(m => m.id === metricId);
  if (index > -1) {
    selectedMetrics.value.splice(index, 1);
  }
};

// matricsSetup.vue

async function saveMetrics(): Promise<{ success: boolean; error?: string }> {
  if (selectedMetrics.value.length === 0) {
    return { success: true }; // Nothing to save
  }

  const creationPromises = selectedMetrics.value.map(metric => {
    return $api('/course/skills', {
      method: 'POST',
      body: {
        name: metric.name,
      },
    });
  });

  try {
    await Promise.all(creationPromises);
    
    console.log('Successfully saved all skills:', selectedMetrics.value.map(m => m.name));
    return { success: true };
  }
  catch (err: any) {
    console.error('Failed to save one or more metrics:', err);
    const errorMessage = err.data?.message || 'An error occurred while saving your metrics.';
    return { success: false, error: errorMessage };
  }
}
defineExpose({
  saveMetrics,
});

useHead({
  title: 'Choose Performance Metrics',
});
</script>