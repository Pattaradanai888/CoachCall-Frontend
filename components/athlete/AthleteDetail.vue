<!-- components/athlete/AthleteDetail.vue -->
<template>
  <div>
    <!-- A simple root wrapper for the component's template -->
    <div class="flex flex-col lg:flex-row gap-6 lg:gap-x-8">
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
            <NuxtImg v-if="athlete.profileImageUrl" :src="athlete.profileImageUrl" alt="Profile" class="object-cover object-center w-full h-full" placeholder="/default-profile.jpg" width="112" height="112" />
            <div v-else class="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
              <Icon name="mdi:account" size="2rem" />
            </div>
          </div>
        </div>

        <div class="space-y-2 text-gray-700 text-sm">
          <!-- Basic Info -->
          <div class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:calendar-account" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Age</span>
            <span class="font-medium">{{ athlete.age }} years</span>
          </div>

          <div class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:calendar-clock" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Date of Birth</span>
            <span class="font-medium">{{ formattedDateOfBirth }}</span>
          </div>

          <div v-if="athlete.preferredName" class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:account-heart" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Preferred Name</span>
            <span class="font-medium">{{ athlete.preferredName }}</span>
          </div>

          <!-- Physical -->
          <div class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:ruler" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Height</span>
            <span class="font-medium">{{ athlete.height ? `${athlete.height} cm` : 'Not set' }}</span>
          </div>

          <div class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:scale-bathroom" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Weight</span>
            <span class="font-medium">{{ athlete.weight ? `${athlete.weight} kg` : 'Not set' }}</span>
          </div>

          <!-- Basketball Info -->
          <div class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:account-switch" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Position</span>
            <span class="font-medium">{{ positionsText }}</span>
          </div>

          <div class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:hand-right" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Dominant Hand</span>
            <span class="font-medium">{{ dominantHandText }}</span>
          </div>

          <div class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:star" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Experience Level</span>
            <span class="font-medium">{{ experienceLevelText }}</span>
          </div>

          <!-- Team -->
          <div class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:shield-account" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Group</span>
            <span class="font-medium">{{ groupsText }}</span>
          </div>

          <div class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:tshirt-crew" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Jersey Number</span>
            <span class="font-medium">{{ jerseyNumberText }}</span>
          </div>

          <!-- Contact -->
          <div v-if="athlete.phoneNumber" class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:phone" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Phone</span>
            <span class="font-medium">{{ athlete.phoneNumber }}</span>
          </div>

          <div v-if="hasEmergencyContact" class="flex items-center py-2 border-b border-gray-100">
            <Icon name="mdi:account-alert" size="1.2rem" class="mr-3 text-gray-400" />
            <span class="text-gray-500 w-32">Emergency</span>
            <span class="font-medium">{{ athlete.emergencyContactName || athlete.emergencyContactPhone }}</span>
          </div>

          <!-- Notes -->
          <div v-if="athlete.notes" class="pt-2">
            <div class="flex items-start py-2">
              <Icon name="mdi:note-text" size="1.2rem" class="mr-3 text-gray-400 mt-0.5" />
              <div class="flex-1">
                <span class="text-gray-500 block mb-2">Coach Notes</span>
                <p class="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg">{{ athlete.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1">
        <!-- Apply the container styling here in the parent -->
        <div class="bg-gray-50 rounded-2xl p-6 h-full">
          <SkillAssessment v-if="skillProgression" :skill-progression="skillProgression" />
        </div>
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
// The script tag is unchanged
import type { AthleteDetail, AthleteSkillProgression } from '~/types/athlete';
import { computed, ref } from 'vue';
import { formatDateWithFallback } from '~/utils/dateUtils';
import SkillAssessment from './SkillAssessment.vue';

const props = defineProps<{
  athlete: AthleteDetail;
  skillProgression: AthleteSkillProgression;
}>();

const emit = defineEmits<{
  (e: 'deleteAthlete'): void;
  (e: 'editAthlete'): void;
}>();

const showConfirmDeleteModal = ref(false);

const formattedDateOfBirth = computed(() => formatDateWithFallback(props.athlete.dateOfBirth, 'Not set'));
const positionsText = computed(() => props.athlete.positions.length > 0 ? props.athlete.positions.map(p => p.name).join(', ') : 'Not set');
const groupsText = computed(() => props.athlete.groups.length > 0 ? props.athlete.groups.map(g => g.name).join(', ') : 'Not assigned');
const dominantHandText = computed(() => props.athlete.dominantHand || 'Not set');
const experienceLevelText = computed(() => props.athlete.experienceLevel?.name || 'Not set');
const jerseyNumberText = computed(() => props.athlete.jerseyNumber ? `#${props.athlete.jerseyNumber}` : 'Not assigned');
const hasEmergencyContact = computed(() => !!(props.athlete.emergencyContactName || props.athlete.emergencyContactPhone));

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
