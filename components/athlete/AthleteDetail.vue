<!-- components/athlete/AthleteDetailView.vue -->
<template>
  <div class="p-6">
    <div class="flex flex-col lg:flex-row">
      <div class="flex-1">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-2xl font-semibold">
            {{ athlete.displayName }}
          </h2>
          <div class="flex space-x-2">
            <button
              class="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
              aria-label="Edit athlete"
              @click="openEditModal"
            >
              <Icon name="mdi:pencil" size="1.25rem" />
              <span class="text-sm font-medium hidden sm:inline">Edit</span>
            </button>
            <div class="relative group">
              <button
                class="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
                aria-label="Delete athlete"
                @click="onDeleteClick"
              >
                <Icon name="mdi:delete-outline" size="1.25rem" />
                <span class="text-sm font-medium hidden sm:inline">Delete</span>
              </button>
              <div class="absolute right-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap sm:hidden">
                Delete athlete
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center mb-4">
          <div class="w-24 h-24 md:w-28 md:h-28 overflow-hidden border-2 border-gray-200 rounded-full">
            <NuxtImg v-if="athlete.profileImageUrl" :src="athlete.profileImageUrl" alt="Profile" class="object-cover object-center w-full h-full" placeholder="/default-profile.jpg" />
            <div v-else class="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
              <Icon name="mdi:account" size="2rem" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-gray-600 text-sm mb-6">
          <div class="flex items-center">
            <Icon name="mdi:calendar-account" size="1.25rem" class="mr-2" /><span>Age: {{ athlete.age }} years</span>
          </div>
          <div class="flex items-center">
            <Icon name="mdi:account-switch" size="1.25rem" class="mr-2" /><span>Position: {{ positionsText }}</span>
          </div>
          <div class="flex items-center">
            <Icon name="mdi:account-group" size="1.25rem" class="mr-2" /><span>Group: {{ groupsText }}</span>
          </div>
          <div class="flex items-center">
            <Icon name="mdi:hand-right" size="1.25rem" class="mr-2" /><span>Dominant Hand: {{ athlete.dominantHand }}</span>
          </div>
          <div class="flex items-center">
            <Icon name="mdi:ruler" size="1.25rem" class="mr-2" /><span>Height: {{ athlete.height ? `${athlete.height} cm` : 'N/A' }}</span>
          </div>
          <div class="flex items-center">
            <Icon name="mdi:scale-bathroom" size="1.25rem" class="mr-2" /><span>Weight: {{ athlete.weight ? `${athlete.weight} kg` : 'N/A' }}</span>
          </div>
          <div class="flex items-center col-span-1 sm:col-span-2">
            <Icon name="mdi:calendar-clock" size="1.25rem" class="mr-2" /><span>Date of Birth: {{ formattedDateOfBirth }}</span>
          </div>
        </div>
      </div>

      <div class="flex-1 mt-6 lg:mt-0 lg:ml-8">
        <SkillAssessment v-if="skillScores" :skill-scores="skillScores" />
      </div>
    </div>

    <ConfirmModal
      :show="showConfirmDeleteModal"
      title="Delete Athlete"
      :message="`Are you sure you want to permanently delete ${athlete.name}? This action cannot be undone and will remove all associated data, including skill assessments.`"
      confirm-text="Yes, Delete"
      variant="danger"
      @close="showConfirmDeleteModal = false"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script lang="ts" setup>
import type { AthleteDetail, SkillScore } from '~/types/athlete';
import { computed, ref } from 'vue';
import { formatDateWithFallback } from '~/utils/dateUtils';
import SkillAssessment from './SkillAssessment.vue';

const props = defineProps<{
  athlete: AthleteDetail;
  skillScores: SkillScore[];
}>();

const emit = defineEmits<{
  (e: 'deleteAthlete'): void;
  (e: 'editAthlete'): void;
}>();

const showConfirmDeleteModal = ref(false);

const formattedDateOfBirth = computed(() => formatDateWithFallback(props.athlete.dateOfBirth, 'Not specified'));
const positionsText = computed(() => props.athlete.positions.length > 0 ? props.athlete.positions.map(p => p.name).join(', ') : 'Not specified');
const groupsText = computed(() => props.athlete.groups.length > 0 ? props.athlete.groups.map(g => g.name).join(', ') : 'No group assigned');

function onDeleteClick() {
  showConfirmDeleteModal.value = true;
}

function handleConfirmDelete() {
  emit('deleteAthlete');
  showConfirmDeleteModal.value = false;
}

function openEditModal() {
  emit('editAthlete');
}
</script>
