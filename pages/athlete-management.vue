<template>
  <div>
    <SubNavbar />

    <div class="max-w-[1140px] mx-auto my-10 px-4 lg:px-0">
      <!-- Header + “Create Athlete Profile” button -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold">
            Athlete Management
          </h1>
          <p class="text-gray-600">
            Manage your athletes and track their progress
          </p>
        </div>
        <button
          class="mt-4 lg:mt-0 bg-white text-red-800 font-semibold border-2 border-red-800 px-4 py-2 rounded-xl hover:bg-red-800 hover:text-white flex items-center transition-colors"
          @click="showAddModal = true"
        >
          <Icon name="mdi:plus" size="1.5rem" class="mr-2" />
          <span>Create Athlete Profile</span>
        </button>
      </div>

      <!-- Top row: StatsOverview + LatestAthleteCard -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2">
          <StatsOverview :stats="statsData" />
        </div>
        <div class="lg:col-span-1">
          <LatestAthleteCard :athlete="latestAthlete" />
        </div>
      </div>

      <!-- Bottom row: AthleteList + AthleteDetail -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <AthleteList :athletes="athleteList" :selected-id="selectedAthleteId" @select-athlete="handleSelectAthlete" />
        </div>
        <div class="lg:col-span-2">
          <AthleteDetail
            v-if="selectedAthleteObj" :athlete="selectedAthleteObj"
            :skill-scores="selectedAthleteObj.skillScores" @update-assessment="handleUpdateAssessment"
          />
          <div v-else class="text-gray-500 italic">
            Select an athlete to view details.
          </div>
        </div>
      </div>
    </div>

    <!-- Add Athlete Modal (conditionally shown) -->
    <AddAthleteModal v-model:show="showAddModal" @added="handleNewAthlete" />
  </div>
</template>

<script lang="ts" setup>
import type { Athlete } from '~/types/athlete';
import AddAthleteModal from '~/components/athlete/AddAthleteModal.vue';
import AthleteDetail from '~/components/athlete/AthleteDetail.vue';
import AthleteList from '~/components/athlete/AthleteList.vue';
import LatestAthleteCard from '~/components/athlete/LatestAthleteCard.vue';
// We use the Composition API. These imports assume you have set up `nuxt-icon` globally:
import StatsOverview from '~/components/athlete/StatOverview.vue';

interface SkillScore {
  name: string;
  value: number;
}

interface StatsData {
  today: number;
  week: number;
  month: number;
  trend: number[]; // e.g. data points for the mini line chart
}

// —————— DUMMY / PLACEHOLDER DATA ——————

// (1) The “New Athletes Added” stats + chart
const statsData = ref<StatsData>({
  today: 10,
  week: 25,
  month: 30,
  trend: [5, 8, 7, 10, 12, 15, 18, 20], // just sample numbers
});

// (2) The “Latest Athlete” card
const latestAthlete = ref<Athlete>({
  id: 101,
  name: 'Jason Momoa',
  position: 'Center',
  age: 21,
  height: 185,
  weight: 85,
  dominantHand: 'Right',
  dateOfBirth: '2003-04-15',
  profileImageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
  group: 'Team A',
  totalPowerRate: 7.8,
  developmentRate: 8.2,
  lastAssessmentDate: '2025-05-28',
  skillScores: [
    { name: 'Shooting', value: 7.8 },
    { name: 'Dribbling', value: 7.8 },
    { name: 'Defense', value: 7.8 },
    { name: 'Athleticism', value: 7.8 },
    { name: 'Basketball IQ', value: 7.8 },
    { name: 'Rebounding', value: 7.8 },
  ],
  displayName: '',
  experienceLevel: '',
  jerseyNumber: null,
  createdAt: '',
});

// (3) The list of all athletes (just a few placeholders)
const athleteList = ref<Athlete[]>([
  {
    id: 1,
    name: 'Michael Jordan',
    position: 'Center',
    age: 25,
    height: 178,
    weight: 68,
    dominantHand: 'Right',
    dateOfBirth: '1989-12-14',
    profileImageUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    group: 'Team A',
    totalPowerRate: 9.5,
    developmentRate: 9.0,
    lastAssessmentDate: '2025-05-25',
    skillScores: [
      { name: 'Shooting', value: 9.5 },
      { name: 'Dribbling', value: 9.5 },
      { name: 'Defense', value: 9.0 },
      { name: 'Athleticism', value: 9.5 },
      { name: 'Basketball IQ', value: 9.8 },
      { name: 'Rebounding', value: 8.0 },
    ],
    displayName: '',
    experienceLevel: '',
    jerseyNumber: null,
    createdAt: '',
  },
  {
    id: 2,
    name: 'LeBron James',
    position: 'Forward',
    age: 24,
    height: 205,
    weight: 100,
    dominantHand: 'Left',
    dateOfBirth: '2001-02-06',
    profileImageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    group: 'Team B',
    totalPowerRate: 9.3,
    developmentRate: 8.8,
    lastAssessmentDate: '2025-05-20',
    skillScores: [
      { name: 'Shooting', value: 8.8 },
      { name: 'Dribbling', value: 9.0 },
      { name: 'Defense', value: 9.2 },
      { name: 'Athleticism', value: 9.7 },
      { name: 'Basketball IQ', value: 9.4 },
      { name: 'Rebounding', value: 9.1 },
    ],
    displayName: '',
    experienceLevel: '',
    jerseyNumber: null,
    createdAt: '',
  },
  // …more placeholder athletes…
]);

// (4) Which athlete is currently “selected”?
const selectedAthleteId = ref<number | null>(null);

const selectedAthleteObj = computed(() => {
  return (
    athleteList.value.find(a => a.id === selectedAthleteId.value) || null
  );
});

function handleSelectAthlete(id: number) {
  selectedAthleteId.value = id;
}

// (5) When the user clicks “Create Athlete Profile”
const showAddModal = ref(false);
function handleNewAthlete(newAthlete: Athlete) {
  // In a real app: call your API -> save, then push the returned athlete object
  athleteList.value.push(newAthlete);
  // Optionally: set that new athlete as selected
  selectedAthleteId.value = newAthlete.id;
}

// (6) When the user clicks “Update Assessment” inside AthleteDetail
function handleUpdateAssessment(updatedSkillScores: SkillScore[]) {
  if (!selectedAthleteObj.value)
    return;
  selectedAthleteObj.value.skillScores = updatedSkillScores;
  // In real life: POST to your FastAPI endpoint to save the new scores
}
</script>

<style></style>
