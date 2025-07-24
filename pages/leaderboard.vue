<template>
  <div class="min-h-screen bg-gray-50">
    <SubNavbar />
    <div class="max-w-[1140px] mx-auto py-8 px-4 lg:px-0">
      <!-- Header Section -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800">
            Athlete Leaderboard
          </h1>
          <p class="text-gray-600 mt-1">
            Ranking athletes by performance and improvement momentum
          </p>
          <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <Icon name="mdi:sort" class="w-4 h-4" />
              <span>Sorted by: </span>
              <span class="capitalize font-medium text-[#9C1313]">
                {{ sortBy }} ({{ sortOrder === 'asc' ? 'ascending' : 'descending' }})
              </span>
            </div>
            <button 
              v-if="sortBy !== 'rank' || sortOrder !== 'asc'"
              class="text-[#9C1313] hover:underline font-medium"
              @click="setSorting('rank'); sortOrder = 'asc'"
            >
              Reset to default
            </button>
          </div>
        </div>
        <div class="mt-4 lg:mt-0 flex items-center gap-3">
          <div class="bg-white px-4 py-2 rounded-xl shadow-sm border">
            <span class="text-sm text-gray-500">Total Athletes:</span>
            <span class="font-bold text-[#9C1313] ml-1">{{ athletes?.length || 0 }}</span>
          </div>
          <button
            class="bg-[#9C1313] text-white font-semibold py-3 px-5 rounded-xl flex items-center gap-2 hover:bg-[#7A0F0F] transition-all duration-300"
            @click="refreshLeaderboard"
          >
            <Icon name="mdi:refresh" class="text-xl" />
            Refresh
          </button>
        </div>
      </div>

      <!-- Leaderboard Content -->
      <div class="grid grid-cols-1 gap-8 xl:grid-cols-4">
        <!-- Main Leaderboard -->
        <div class="xl:col-span-3">
          <!-- Top 3 Podium -->
          <div class="bg-white rounded-xl shadow-sm border mb-6 p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Icon name="mdi:trophy" class="text-[#9C1313]" />
              Top Performers
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                v-for="(athlete, index) in sortedAthletes.slice(0, 3)" 
                :key="athlete.uuid"
                class="relative group cursor-pointer"
                @click="selectAthlete(athlete.uuid)"
              >
                <div 
                  class="bg-white border rounded-xl p-6 text-center transform transition-all duration-300 group-hover:shadow-md"
                  :class="{ 'border-[#9C1313] shadow-sm': selectedAthleteUuid === athlete.uuid }"
                >
                  <div class="relative mb-4">
                    <NuxtImg 
                      :src="athlete.profileImageUrl || '/default-profile.jpg'" 
                      class="w-20 h-20 rounded-full mx-auto border-4 border-gray-100 shadow-sm"
                    />
                    <div 
                      class="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      :class="getPodiumBadgeColor(index)"
                    >
                      {{ athlete.rank }}
                    </div>
                  </div>
                  <h3 class="font-bold text-gray-800 text-lg mb-1">{{ athlete.name }}</h3>
                  <p class="text-gray-600 text-sm mb-3">{{ athlete.position }}</p>
                  <div class="bg-gray-50 border rounded-lg p-3">
                    <p class="text-gray-600 text-xs mb-1">Score</p>
                    <p class="text-gray-800 font-bold text-2xl">{{ (athlete.currentScore || 0).toFixed(1) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Full Leaderboard List -->
          <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div class="bg-gray-50 px-6 py-4 border-b">
              <h2 class="text-lg font-bold text-gray-800">Complete Rankings</h2>
              <p class="text-sm text-gray-600 mt-1">Click column headers to sort</p>
            </div>
            
            <!-- Sortable Header -->
            <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-sm font-semibold text-gray-600 sticky top-0">
              <div 
                class="col-span-1 text-center cursor-pointer hover:text-[#9C1313] transition-colors flex items-center justify-center gap-1"
                @click="setSorting('rank')"
              >
                <span>Rank</span>
                <Icon :name="getSortIcon('rank')" class="w-4 h-4" />
              </div>
              <div class="col-span-5">Athlete</div>
              <div 
                class="col-span-2 text-center cursor-pointer hover:text-[#9C1313] transition-colors flex items-center justify-center gap-1"
                @click="setSorting('score')"
              >
                <span>Score</span>
                <Icon :name="getSortIcon('score')" class="w-4 h-4" />
              </div>
              <div 
                class="col-span-2 text-center cursor-pointer hover:text-[#9C1313] transition-colors flex items-center justify-center gap-1"
                @click="setSorting('growth')"
              >
                <span>Growth</span>
                <Icon :name="getSortIcon('growth')" class="w-4 h-4" />
              </div>
              <div 
                class="col-span-2 text-center cursor-pointer hover:text-[#9C1313] transition-colors flex items-center justify-center gap-1"
                @click="setSorting('momentum')"
              >
                <span>Momentum</span>
                <Icon :name="getSortIcon('momentum')" class="w-4 h-4" />
              </div>
            </div>

            <!-- Scrollable Athlete Rows -->
            <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div
                v-for="athlete in sortedAthletes"
                :key="athlete.uuid"
                class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                :class="{ 'bg-[#9C1313]/5 border-l-4 border-[#9C1313] ml-0': selectedAthleteUuid === athlete.uuid }"
                @click="selectAthlete(athlete.uuid)"
              >
                <!-- Rank -->
                <div class="col-span-1 flex items-center justify-center">
                  <div v-if="athlete.rank <= 3" class="flex items-center justify-center">
                    <Icon 
                      name="mdi:trophy" 
                      class="w-5 h-5"
                      :class="getTrophyColor(athlete.rank)"
                    />
                  </div>
                  <span v-else class="font-semibold text-gray-600">{{ athlete.rank }}</span>
                </div>

                <!-- Athlete Info -->
                <div class="col-span-5 flex items-center">
                  <NuxtImg 
                    :src="athlete.profileImageUrl || '/default-profile.jpg'" 
                    class="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                  <div class="ml-3">
                    <p class="font-semibold text-gray-800">{{ athlete.name }}</p>
                    <p class="text-sm text-gray-500">{{ athlete.position }}</p>
                  </div>
                </div>

                <!-- Score -->
                <div class="col-span-2 flex items-center justify-center">
                  <div class="text-center">
                    <p class="font-bold text-lg text-gray-800">{{ (athlete.currentScore || 0).toFixed(1) }}</p>
                  </div>
                </div>

                <!-- Growth -->
                <div class="col-span-2 flex items-center justify-center">
                  <div 
                    class="flex items-center text-sm font-medium"
                    :class="(athlete.improvementSinceDayOne || 0) >= 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    <Icon 
                      :name="(athlete.improvementSinceDayOne || 0) >= 0 ? 'mdi:arrow-up' : 'mdi:arrow-down'" 
                      class="w-4 h-4 mr-1" 
                    />
                    {{ Math.abs(athlete.improvementSinceDayOne || 0).toFixed(1) }}
                  </div>
                </div>

                <!-- Momentum -->
                <div class="col-span-2 flex items-center justify-center">
                  <div 
                    class="flex items-center text-sm font-medium"
                    :class="(athlete.improvementSlope || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'"
                  >
                    <Icon 
                      :name="(athlete.improvementSlope || 0) >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'" 
                      class="w-4 h-4 mr-1" 
                    />
                    {{ Math.abs(athlete.improvementSlope || 0).toFixed(1) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar - Athlete Detail -->
        <div class="xl:col-span-1">
          <div class="xl:sticky xl:top-8">
            <!-- Mobile notification banner -->
            <div 
              v-if="selectedAthleteUuid && detailedAthlete"
              class="xl:hidden bg-[#9C1313] text-white p-4 rounded-xl mb-4 flex items-center gap-3"
            >
              <Icon name="mdi:account-details" class="w-5 h-5" />
              <div class="flex-1">
                <p class="font-semibold">{{ detailedAthlete.name }}</p>
                <p class="text-sm text-white/80">Details loaded below</p>
              </div>
              <Icon name="mdi:chevron-down" class="w-5 h-5 animate-bounce" />
            </div>
            
            <div id="athlete-detail-card">
              <AthleteDetailCard :athlete="detailedAthlete" :is-loading="isLoadingDetail" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useLeaderboard } from '~/composables/useLeaderboard';
import type { AthleteDetail } from '~/types/leaderboard';
import AthleteDetailCard from '~/components/leaderboard/AthleteDetailCard.vue';

const { fetchLeaderboard, fetchAthleteDetailOptimized } = useLeaderboard();

// Fetch leaderboard data with SSR support
const { data: athletes, pending: _isLoadingAthletes, refresh: refreshAthletesData } = await fetchLeaderboard();

const selectedAthleteUuid = ref<string | null>(null);
const sortBy = ref<'rank' | 'score' | 'growth' | 'momentum'>('rank');
const sortOrder = ref<'asc' | 'desc'>('asc');

// Lazy athlete detail fetching - only when selectedAthleteUuid changes
const detailedAthlete = ref<AthleteDetail | null>(null);
const isLoadingDetail = ref(false);

// Watch for selected athlete changes and fetch details
watch(selectedAthleteUuid, async (uuid) => {
  if (!uuid) {
    detailedAthlete.value = null;
    return;
  }

  isLoadingDetail.value = true;
  try {
    // Use the optimized method that doesn't make duplicate API calls
    const result = await fetchAthleteDetailOptimized(uuid, athletes.value || []);
    detailedAthlete.value = result;
  } catch (error) {
    console.error('Failed to fetch athlete details:', error);
    detailedAthlete.value = null;
  } finally {
    isLoadingDetail.value = false;
  }
}, { immediate: false });

// Computed sorted athletes
const sortedAthletes = computed(() => {
  if (!athletes.value) return [];
  
  const athletesCopy = [...athletes.value];
  
  return athletesCopy.sort((a, b) => {
    let aValue: number;
    let bValue: number;
    
    switch (sortBy.value) {
      case 'score':
        aValue = a.currentScore || 0;
        bValue = b.currentScore || 0;
        break;
      case 'growth':
        aValue = a.improvementSinceDayOne || 0;
        bValue = b.improvementSinceDayOne || 0;
        break;
      case 'momentum':
        aValue = a.improvementSlope || 0;
        bValue = b.improvementSlope || 0;
        break;
      case 'rank':
      default:
        aValue = a.rank || 0;
        bValue = b.rank || 0;
        break;
    }
    
    if (sortOrder.value === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
});

// Watch for athletes data and auto-select first athlete
watch(athletes, (newAthletes) => {
  if (newAthletes && newAthletes.length > 0 && !selectedAthleteUuid.value) {
    selectedAthleteUuid.value = newAthletes[0].uuid;
  }
}, { immediate: true });

const selectAthlete = (uuid: string) => {
  selectedAthleteUuid.value = uuid;
  
  // On mobile, scroll to detail card smoothly
  if (import.meta.client && window.innerWidth < 1280) { // xl breakpoint
    setTimeout(() => {
      const detailCard = document.getElementById('athlete-detail-card');
      if (detailCard) {
        detailCard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest' 
        });
      }
    }, 100);
  }
};

const refreshLeaderboard = async () => {
  await refreshAthletesData();
  // If there's a selected athlete, refresh their detail too
  if (selectedAthleteUuid.value) {
    const uuid = selectedAthleteUuid.value;
    selectedAthleteUuid.value = null; // Reset to trigger re-fetch
    selectedAthleteUuid.value = uuid;
  }
};

const setSorting = (column: 'rank' | 'score' | 'growth' | 'momentum') => {
  if (sortBy.value === column) {
    // Toggle order if same column
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new column with default order
    sortBy.value = column;
    sortOrder.value = column === 'rank' ? 'asc' : 'desc'; // Rank ascending by default, others descending
  }
};

const getSortIcon = (column: 'rank' | 'score' | 'growth' | 'momentum') => {
  if (sortBy.value !== column) return 'mdi:sort';
  return sortOrder.value === 'asc' ? 'mdi:sort-ascending' : 'mdi:sort-descending';
};

// Design helper functions
const getPodiumBadgeColor = (index: number) => {
  switch (index) {
    case 0: return 'bg-[#9C1313] text-white';  // 1st place
    case 1: return 'bg-gray-500 text-white';   // 2nd place
    case 2: return 'bg-orange-500 text-white'; // 3rd place
    default: return 'bg-gray-400 text-white';
  }
};

const getTrophyColor = (rank: number) => {
  switch (rank) {
    case 1: return 'text-[#9C1313]';
    case 2: return 'text-gray-500'; 
    case 3: return 'text-orange-500';
    default: return 'text-gray-300';
  }
};
</script>