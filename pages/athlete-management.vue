<!-- pages/athlete-management.vue -->

<template>
  <div class="min-h-screen bg-gray-50">
    <SubNavbar />
    <div class="max-w-[1140px] mx-auto pt-4 pb-8 px-4 lg:px-0">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800">
            Athlete Management
          </h1>
          <p class="text-gray-600 mt-1">
            Manage your athletes and track their progress
          </p>
        </div>
        <button
          class="mt-4 lg:mt-0 bg-[#9C1313] text-white font-semibold py-3 px-5 rounded-xl flex items-center gap-2 hover:bg-[#7A0F0F] transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg shadow-red-700/30"
          @click="openCreateModal"
        >
          <Icon name="mdi:plus" class="text-xl" />
          Create Athlete Profile
        </button>
      </div>

      <!-- Loading / Error States -->
      <div v-if="isLoading" class="text-center py-16 md:py-24 text-gray-500">
        <div class="inline-block animate-pulse">
          <div class="w-12 h-12 mx-auto mb-3 bg-red-200 rounded-full animate-spin border-4 border-red-700 border-t-transparent" />
          <p class="text-lg">
            Loading data...
          </p>
        </div>
      </div>

      <div v-else-if="error && !isDetailsLoading" class="text-center py-16 md:py-24 bg-white rounded-2xl shadow-md">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="mdi:alert-circle-outline" class="w-8 h-8 text-red-500" />
          </div>
          <p class="mt-4 text-gray-700 text-lg font-medium">
            {{ error }}
          </p>
          <button
            class="mt-6 bg-red-700 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-red-800 transition"
            @click="fetchAllData"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <template v-else>
        <!-- Stats Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl shadow-md p-5 md:p-6 h-full">
              <StatOverview v-if="stats" :stats="stats" />
              <div v-else class="h-full flex flex-col items-center justify-center text-gray-500 py-12">
                <Icon name="mdi:chart-line" class="w-12 h-12 opacity-50 mb-4" />
                <p>Statistics are unavailable</p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl shadow-md p-5 md:p-6 h-full">
              <LatestAthleteCard v-if="latestAthlete" :athlete="latestAthlete" />
              <div v-else class="h-full flex flex-col items-center justify-center text-gray-500 py-12">
                <Icon name="mdi:run" class="w-12 h-12 opacity-50 mb-4" />
                <p>No recent athletes</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Athlete List & Details -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Athlete List -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl shadow-md p-5 md:p-6 h-full">
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
          <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl shadow-md p-5 md:p-6 min-h-[500px]">
              <ClientOnly>
                <div v-if="isDetailsLoading || isSkillsLoading" class="min-h-[400px] flex flex-col items-center justify-center">
                  <div class="w-12 h-12 mb-3 bg-red-200 rounded-full animate-spin border-4 border-red-700 border-t-transparent" />
                  <span class="text-gray-600">Loading details...</span>
                </div>

                <AthleteDetail
                  v-else-if="selectedAthlete"
                  :key="`${selectedAthlete.uuid}-${athleteDetailKey}`"
                  :athlete="selectedAthlete"
                  :skill-progression="safeSkillProgression"
                  @delete-athlete="handleDeleteAthlete"
                  @edit-athlete="openEditModal(selectedAthlete)"
                />

                <div v-else class="min-h-[400px] flex flex-col items-center justify-center text-gray-500 py-12">
                  <Icon name="mdi:account-search" class="w-16 h-16 opacity-30 mb-4" />
                  <p class="text-lg texta-center px-4">
                    Select an athlete to view detailed information
                  </p>
                  <p class="mt-2 text-sm text-gray-400">
                    Choose from the list on the left
                  </p>
                </div>

                <template #fallback>
                  <div class="min-h-[400px] flex flex-col items-center justify-center">
                    <div class="w-12 h-12 mb-3 bg-red-200 rounded-full animate-spin border-4 border-red-700 border-t-transparent" />
                    <span class="text-gray-600">Loading...</span>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
      </template>
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
/* Smooth transitions for all interactive elements */
button,
.card {
  transition: all 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid > div {
    min-height: auto !important;
  }
}
</style>
