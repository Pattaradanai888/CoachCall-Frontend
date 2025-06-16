<!-- pages/athlete-management.vue -->
<template>
  <div>
    <SubNavbar />
    <div class="max-w-[1140px] mx-auto my-10 px-4 lg:px-0">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold">
            Athlete Management
          </h1>
          <p class="text-gray-600">
            Manage your athletes and track their progress
          </p>
        </div>
        <button class="bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-800 transition" @click="openCreateModal">
          <Icon name="mdi:plus" /> Create Athlete Profile
        </button>
      </div>

      <!-- Loading / Error States -->
      <div v-if="isLoading" class="text-center py-20 text-gray-500">
        <Icon name="svg-spinners:clock" class="w-8 h-8 mx-auto" />
        <p class="mt-2">
          Loading data...
        </p>
      </div>
      <div v-else-if="error && !isDetailsLoading" class="text-center py-20 text-red-500 bg-red-50 rounded-lg">
        <Icon name="mdi:alert-circle-outline" class="w-8 h-8 mx-auto" />
        <p class="mt-2">
          {{ error }}
        </p>
        <button class="mt-4 text-blue-600 hover:underline" @click="fetchAllData">
          Retry
        </button>
      </div>

      <!-- Main Content -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div class="lg:col-span-2">
            <StatOverview v-if="stats" :stats="stats" />
            <div v-else class="h-full bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500">
              Statistics are unavailable.
            </div>
          </div>
          <div class="lg:col-span-1">
            <LatestAthleteCard v-if="latestAthlete" :athlete="latestAthlete" />
            <div v-else class="h-full bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500">
              No recent athletes.
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1">
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
          <div class="lg:col-span-2">
            <div v-if="isDetailsLoading" class="min-h-[400px] flex items-center justify-center bg-white rounded-2xl shadow">
              <Icon name="svg-spinners:clock" class="w-8 h-8" />
              <span class="ml-2">Loading details...</span>
            </div>
            <AthleteDetail
              v-else-if="selectedAthlete"
              :athlete="selectedAthlete"
              :skill-scores="selectedAthlete.skillScores || []"
              @delete-athlete="handleDeleteAthlete"
              @edit-athlete="openEditModal(selectedAthlete)"
            />
            <div v-else class="min-h-[400px] flex items-center justify-center bg-white rounded-2xl shadow text-gray-500">
              Select an athlete to view their details.
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
import type { AthleteDetail } from '~/types/athlete';
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
  selectAthlete, // This now accepts UUID
  prevPage,
  nextPage,
  fetchAllData,
  deleteSelectedAthlete,
} = useAthleteData();

// Modal State Management
const isModalOpen = ref(false);
const athleteToEdit = ref<AthleteDetail | null>(null);

function openCreateModal() {
  athleteToEdit.value = null;
  isModalOpen.value = true;
}

function openEditModal(athlete: AthleteDetail) {
  athleteToEdit.value = athlete;
  isModalOpen.value = true;
}

// When the form is successfully submitted, just refetch everything for consistency
async function onFormSubmitted() {
  isModalOpen.value = false;
  const previouslySelectedUuid = selectedAthlete.value?.uuid;

  await fetchAllData();

  // Try to re-select the athlete that was being edited
  if (previouslySelectedUuid) {
    await selectAthlete(previouslySelectedUuid);
  }
}

async function handleDeleteAthlete() {
  // Confirmation is now inside the AthleteDetail component
  await deleteSelectedAthlete();
}

await fetchAllData();
</script>
