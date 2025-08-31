<template>
  <div class="min-h-screen bg-gray-50">
    <SubNavbar />
    <div class="max-w-[1140px] mx-auto py-8 px-4 lg:px-0">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800">
            Coach Efficiency Dashboard
          </h1>
          <p class="text-gray-600 mt-1">
            Track your productivity and impact on athlete development
          </p>
        </div>
        <button
          class="mt-4 lg:mt-0 bg-[#9C1313] text-white font-semibold py-3 px-5 rounded-xl flex items-center gap-2 hover:bg-[#7A0F0F] transition-all duration-300"
          :disabled="pending"
          @click="() => refresh()"
        >
          <Icon name="mdi:refresh" class="text-xl" :class="{ 'animate-spin': pending }" />
          Refresh Data
        </button>
      </div>

      <div v-if="pending" class="text-center py-24 text-gray-500">
        <div class="inline-block">
          <div class="w-12 h-12 mx-auto mb-3 bg-red-200 rounded-full animate-spin border-4 border-red-700 border-t-transparent" />
          <p class="text-lg">
            Compiling your stats...
          </p>
        </div>
      </div>

      <div v-else-if="error || !data" class="text-center py-24 bg-white rounded-2xl shadow-md">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="mdi:alert-circle-outline" class="w-8 h-8 text-red-500" />
          </div>
          <p class="mt-4 text-gray-700 text-lg font-medium">
            {{ error?.message || 'Could not display statistics.' }}
          </p>
          <button
            class="mt-6 bg-red-700 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-red-800 transition"
            @click="() => refresh()"
          >
            Retry
          </button>
        </div>
      </div>

      <div v-else class="space-y-6">
        <HeroSection :highlight="data.highlight" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ActivityOverview
            :activity="data.activity"
            :efficiency="data.efficiency"
            class="lg:col-span-1"
          />
          <ImpactOverview
            :engagement="data.engagement"
            :skill="data.skill"
            :top-improvers="data.top_improvers"
            :needs-attention="data.needs_attention"
            class="lg:col-span-2"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ActivityOverview from '~/components/coach-stat/ActivityOverview.vue';
import ImpactOverview from '~/components/coach-stat/ImpactOverview.vue';
import HeroSection from '~/components/coach-stat/HeroSection.vue';
import { ref, onMounted } from 'vue';
import type { CoachStatData } from '~/types/coach-stat';
import { useCoachStatData } from '~/composables/useCoachStatData';

// Data fetching - moved to onMounted to avoid SSR issues with auth
const data = ref<CoachStatData | null>(null);
const pending = ref(true);
const error = ref<Error | null>(null);

const { fetchCoachStats, fetchCoachStatsClient } = useCoachStatData();

// Function to fetch coach stats
async function fetchData() {
  pending.value = true;
  error.value = null;
  try {
    const result = await fetchCoachStatsClient();
    data.value = result;
  } catch (err) {
    error.value = err as Error;
  } finally {
    pending.value = false;
  }
}

// Refresh function
const refresh = async () => {
  await fetchData();
};

// Fetch data on client mount only
onMounted(async () => {
  await fetchData();
});
useHead({
  title: 'Coach Efficiency Dashboard - Track Your Impact & Productivity',
  meta: [
    {
      name: 'description',
      content: 'Monitor your coaching efficiency, track athlete development, and measure the impact of data-driven coaching methods.',
    },
  ],
});
</script>
