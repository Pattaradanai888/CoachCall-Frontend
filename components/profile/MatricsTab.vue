<!-- components/profile/MatricsTab.vue -->
<template>
  <div class="max-w-lg mx-auto">
    <div v-motion-slide-visible-once-bottom class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <!-- Header -->
      <div class="flex items-center mb-6">
        <Icon name="mdi:poll" class="w-8 h-8 text-gray-700 mr-3 flex-shrink-0" />
        <div>
          <h3 class="text-xl font-semibold text-gray-900">
            Performance Metrics
          </h3>
          <p class="text-gray-600 text-sm sm:text-base">
            Customize 6 key metrics skill
          </p>
        </div>
      </div>

      <!-- Metrics List -->
      <div class="space-y-4">
        <!-- Loading State -->
        <div v-if="skillsLoading" class="space-y-4">
          <div v-for="i in 6" :key="`loading-${i}`" class="flex items-center justify-between bg-gray-100 rounded-md p-3 border border-gray-200 animate-pulse">
            <div class="bg-gray-300 h-4 w-32 rounded" />
            <div class="bg-gray-300 h-5 w-5 rounded" />
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="skillsError" class="text-center py-6">
          <div class="text-red-600 mb-2">
            <Icon name="mdi:alert-circle" class="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load skills</p>
          </div>
          <p class="text-gray-600 text-sm">Please try again later.</p>
        </div>

        <!-- Data State -->
        <div v-else-if="metrics" class="space-y-4">
          <div v-for="metric in metrics" :key="metric.id">
            <!-- Editing State -->
            <div
              v-if="editingMetricId === metric.id"
              class="flex items-center justify-between bg-white rounded-md p-3 border-2 border-red-500 shadow-sm"
            >
              <input
                v-model="editingMetricName"
                type="text"
                class="w-full text-gray-900 bg-transparent focus:outline-none"
                placeholder="Enter metric name"
                @keyup.enter="saveMetric"
                @keyup.esc="cancelEditing"
              >
              <div class="flex items-center space-x-3 ml-2 flex-shrink-0">
                <button aria-label="Save metric" @click="saveMetric">
                  <Icon name="mdi:check" class="w-6 h-6 text-green-600 hover:text-green-700 transition-colors" />
                </button>
                <button aria-label="Cancel edit" @click="cancelEditing">
                  <Icon name="mdi:close" class="w-6 h-6 text-red-600 hover:text-red-700 transition-colors" />
                </button>
              </div>
            </div>

            <!-- Default State -->
            <div
              v-else
              class="flex items-center justify-between bg-white rounded-md p-3 border border-gray-200"
            >
              <span class="text-gray-800">{{ metric.name }}</span>
              <button aria-label="Edit metric" @click="startEditing(metric)">
                <Icon name="mdi:pencil" class="w-5 h-5 text-gray-500 hover:text-gray-800 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCourses } from '#imports';
import type { Skill as Metric } from '~/types/course';

const { fetchSkills, updateSkill } = useCourses();
const { data: fetchedSkills, pending: skillsLoading, error: skillsError, refresh: refreshSkills } = fetchSkills();

const metrics = ref<Metric[]>([]);
watch(fetchedSkills, (newSkills) => {
  if (newSkills) {
    metrics.value = JSON.parse(JSON.stringify(newSkills));
  }
}, { immediate: true });

// --- State for Editing ---
const editingMetricId = ref<number | null>(null);
const editingMetricName = ref('');

function startEditing(metric: Metric) {
  editingMetricId.value = metric.id;
  editingMetricName.value = metric.name;
}

function cancelEditing() {
  editingMetricId.value = null;
  editingMetricName.value = '';
}

async function saveMetric() {
  if (editingMetricId.value === null || !editingMetricName.value.trim()) {
    return;
  }

  const metricId = editingMetricId.value;
  const newName = editingMetricName.value.trim();

  try {
    await updateSkill(metricId, { name: newName });
    await refreshSkills();

  } catch (error) {
    console.error('Failed to update metric:', error);
    alert('Error: Could not save the metric.');
  } finally {
    cancelEditing();
  }
}
</script>