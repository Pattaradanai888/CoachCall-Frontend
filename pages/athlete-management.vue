<!-- pages/athlete-management.vue -->

<template>
  <div class="min-h-screen bg-gray-50">
    <SubNavbar />
    <div class="max-w-[1140px] mx-auto pt-4 pb-8 px-3 sm:px-4 lg:px-6 xl:px-0">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row lg:flex-row justify-between items-start sm:items-center lg:items-center mb-6 sm:mb-8">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 truncate">
            Athlete Management
          </h1>
          <p class="text-sm sm:text-base text-gray-600 mt-1">
            Manage your athletes and track their progress
          </p>
        </div>
        <button
          class="hidden sm:flex mt-3 sm:mt-0 w-full sm:w-auto bg-[#9C1313] text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl items-center justify-center sm:justify-start gap-2 hover:bg-[#7A0F0F] transition-colors duration-200 text-sm sm:text-base shadow-md hover:shadow-lg min-h-[44px] min-w-[44px]"
          :disabled="isLoading"
          @click="openCreateModal"
        >
          <Icon v-if="!isLoading" name="mdi:plus" class="text-lg sm:text-xl" />
          <div v-else class="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <template v-if="!isLoading">
            <span class="hidden xs:inline">Create Athlete Profile</span>
            <span class="xs:hidden">Add Athlete</span>
          </template>
          <span v-else class="text-sm sm:text-base">Loading...</span>
        </button>
      </div>

      <!-- Loading / Error States -->
      <div v-if="isLoading" class="text-center py-12 sm:py-16 md:py-24 text-gray-500">
        <div class="inline-block animate-pulse">
          <div class="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 bg-red-200 rounded-full animate-spin border-4 border-red-700 border-t-transparent" />
          <p class="text-base sm:text-lg">
            Loading data...
          </p>
        </div>
      </div>

      <div v-else-if="error && !isDetailsLoading" class="text-center py-12 sm:py-16 md:py-24 bg-white rounded-2xl shadow-md mx-2 sm:mx-0">
        <div class="max-w-md mx-auto px-4">
          <div class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="mdi:alert-circle-outline" class="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
          <p class="mt-4 text-gray-700 text-base sm:text-lg font-medium">
            {{ error }}
          </p>
          <button
            class="mt-6 bg-red-700 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-red-800 transition text-sm sm:text-base min-h-[44px] min-w-[44px]"
            @click="fetchAllData"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <template v-else>
        <!-- Stats Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6 mb-6 sm:mb-8">
          <div class="lg:col-span-2 order-2 lg:order-1">
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 md:p-6 h-full min-h-[200px] sm:min-h-[250px]">
              <StatOverview v-if="stats" :stats="stats" />
              <div v-else class="h-full flex flex-col items-center justify-center text-gray-500 py-8 sm:py-12">
                <Icon name="mdi:chart-line" class="w-10 h-10 sm:w-12 sm:h-12 opacity-50 mb-3 sm:mb-4" />
                <p class="text-sm sm:text-base">Statistics are unavailable</p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1 order-1 lg:order-2">
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 md:p-6 h-full min-h-[200px] sm:min-h-[250px]">
              <LatestAthleteCard v-if="latestAthlete" :athlete="latestAthlete" />
              <div v-else class="h-full flex flex-col items-center justify-center text-gray-500 py-8 sm:py-12">
                <Icon name="mdi:run" class="w-10 h-10 sm:w-12 sm:h-12 opacity-50 mb-3 sm:mb-4" />
                <p class="text-sm sm:text-base">No recent athletes</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Athlete List & Details -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-6">
          <!-- Athlete List -->
          <div id="athlete-list-section" class="xl:col-span-1 order-1 mobile-scroll-target">
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 md:p-6 h-full max-h-[600px] xl:max-h-none">
              <!-- Mobile header for athlete list -->
              <div class="xl:hidden mb-4 pb-3 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Icon name="mdi:account-group" class="w-5 h-5 text-red-600" />
                  Athletes
                  <span class="ml-auto text-sm font-normal text-gray-500">
                    {{ athletes.length }} found
                  </span>
                </h2>
              </div>
              <AthleteList
                :athletes="athletes"
                :selected-uuid="selectedAthlete?.uuid ?? null"
                :has-prev="page > 1"
                :has-next="hasNextPage"
                :loading="isListLoading"
                @select-athlete="selectAthlete"
                @prev-page="prevPage"
                @next-page="nextPage"
              />
            </div>
          </div>

          <!-- Athlete Details -->
          <div id="athlete-details-section" class="xl:col-span-2 order-2 mobile-scroll-target">
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 md:p-6 min-h-[400px] sm:min-h-[500px]">
              <!-- Mobile notification banner -->
              <div 
                v-if="selectedAthlete"
                class="xl:hidden bg-[#9C1313] text-white p-4 rounded-xl mb-4 flex items-center gap-3 shadow-lg animate-fade-in"
              >
                <Icon name="mdi:account-details" class="w-5 h-5" />
                <div class="flex-1">
                  <p class="font-semibold">{{ selectedAthlete.displayName }}</p>
                  <p class="text-sm text-white/80">Athlete details loaded</p>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="mdi:check-circle" class="w-5 h-5" />
                </div>
              </div>
              
              <!-- Mobile header for athlete details -->
              <div class="xl:hidden mb-4 pb-3 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Icon name="mdi:account-details" class="w-5 h-5 text-red-600" />
                  <span v-if="selectedAthlete">{{ selectedAthlete.displayName }}</span>
                  <span v-else>Athlete Details</span>
                </h2>
              </div>
              <ClientOnly>
                <div v-if="isDetailsLoading || isSkillsLoading" class="min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 mb-3 bg-red-200 rounded-full animate-spin border-4 border-red-700 border-t-transparent" />
                  <span class="text-sm sm:text-base text-gray-600">Loading details...</span>
                </div>

                <AthleteDetail
                  v-else-if="selectedAthlete"
                  :key="`${selectedAthlete.uuid}-${athleteDetailKey}`"
                  :athlete="selectedAthlete"
                  :skill-progression="safeSkillProgression"
                  @delete-athlete="handleDeleteAthlete"
                  @edit-athlete="openEditModal(selectedAthlete)"
                />

                <div v-else class="min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center text-gray-500 py-8 sm:py-12">
                  <Icon name="mdi:account-search" class="w-12 h-12 sm:w-16 sm:h-16 opacity-30 mb-3 sm:mb-4" />
                  <p class="text-base sm:text-lg text-center px-4">
                    Select an athlete to view detailed information
                  </p>
                  <p class="mt-2 text-xs sm:text-sm text-gray-400 text-center px-4">
                    <span class="hidden sm:inline">Choose from the list on the left</span>
                    <span class="sm:hidden">Choose from the list above</span>
                  </p>
                </div>

                <template #fallback>
                  <div class="min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 mb-3 bg-red-200 rounded-full animate-spin border-4 border-red-700 border-t-transparent" />
                    <span class="text-sm sm:text-base text-gray-600">Loading...</span>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Mobile Floating Action Button (visible only on small screens) -->
    <div class="fixed bottom-6 right-4 sm:hidden z-50">
      <button
        class="floating-action-button bg-[#9C1313] text-white hover:bg-[#7A0F0F] disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] min-w-[56px]"
        aria-label="Create Athlete Profile"
        :disabled="isLoading"
        @click="openCreateModal"
      >
        <Icon v-if="!isLoading" name="mdi:plus" class="text-2xl" />
        <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </button>
    </div>

    <!-- Modals -->
    <ClientOnly>
      <AthleteFormModal
        v-model:show="isModalOpen"
        :athlete="athleteToEdit"
        @submitted="onFormSubmitted"
      />
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import type { AthleteDetail, SkillScore } from '~/types/athlete';
import LatestAthleteCard from '~/components/athlete/LatestAthleteCard.vue';
import StatOverview from '~/components/athlete/StatOverview.vue';
import { useAthleteData } from '~/composables/useAthleteData';

// All data fetching logic is now in the composable
const {
  athletes,
  stats,
  latestAthlete,
  selectedAthlete,
  page,
  hasNextPage,
  isLoading,
  isListLoading,
  isDetailsLoading,
  error,
  selectAthlete,
  prevPage,
  nextPage,
  fetchAllData,
  deleteSelectedAthlete,
  fetchAthleteSkillProgression,
} = useAthleteData();

// Modal State Management
const isModalOpen = ref(false);
const athleteToEdit = ref<AthleteDetail | null>(null);
const athleteDetailKey = ref(0);

function openCreateModal() {
  athleteToEdit.value = null;
  isModalOpen.value = true;
}

function openEditModal(athlete: AthleteDetail) {
  athleteToEdit.value = athlete;
  isModalOpen.value = true;
}

const selectedAthleteUuid = computed(() => selectedAthlete.value?.uuid);
const { data: skillProgression, pending: isSkillsLoading } = fetchAthleteSkillProgression(selectedAthleteUuid);

// Safe skillProgression with fallback
const safeSkillProgression = computed(() => {
  if (!skillProgression.value || !skillProgression.value.dayOne || !skillProgression.value.current) {
    return { dayOne: [] as SkillScore[], current: [] as SkillScore[] };
  }
  return skillProgression.value;
});

// When the form is successfully submitted, refresh data and force component update
async function onFormSubmitted() {
  isModalOpen.value = false;
  const previouslySelectedUuid = selectedAthlete.value?.uuid;

  // Clear the selected athlete first to force a clean state
  if (selectedAthlete.value) {
    // Temporarily clear the selection
    selectedAthlete.value = null;
  }

  // Refresh all data
  await fetchAllData();

  if (previouslySelectedUuid) {
    await nextTick();

    await selectAthlete(previouslySelectedUuid);

    athleteDetailKey.value += 1;
  }
}


async function handleDeleteAthlete() {
  // Confirmation is now inside the AthleteDetail component
  await deleteSelectedAthlete();
}

// Only fetch data on client-side to avoid hydration issues
onMounted(async () => {
  await fetchAllData();
});
</script>

<style scoped>
/* Mobile-specific adjustments */
@media (max-width: 640px) {
  .grid > div {
    min-height: auto !important;
  }
  
  /* Account for floating action button */
  .min-h-screen {
    padding-bottom: 5rem;
  }
}

/* Extra large screens optimization */
@media (min-width: 1280px) {
  .max-w-\[1140px\] {
    max-width: 1200px;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .cursor-pointer {
    min-height: 48px;
    display: flex;
    align-items: center;
  }
  
  .hover\:bg-gray-100:hover {
    background-color: transparent;
  }
  
  button:active,
  .cursor-pointer:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}

/* Smooth scrolling enhancements */
@media (max-width: 1279px) {
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  .overflow-y-auto::-webkit-scrollbar {
    width: 4px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(156, 19, 19, 0.3);
    border-radius: 2px;
  }
}

/* Print styles */
@media print {
  .bg-gray-50 {
    background: white !important;
  }
  
  .shadow-md {
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
  }
  
  .fixed {
    display: none !important;
  }
}
</style>
