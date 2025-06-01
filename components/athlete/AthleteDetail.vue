<template>
  <div class="bg-white rounded-2xl shadow p-6">
    <div class="flex flex-col lg:flex-row">
      <!-- Left: Basic Info -->
      <div class="flex-1">
        <h2 class="text-2xl font-semibold mb-4">
          {{ athlete.name }}
        </h2>
        <div
          class="w-24 h-24 md:w-28 md:h-28 overflow-hidden border-2 border-gray-200 mb-4 justify-self-center"
        >
          <NuxtImg
            v-if="athlete.profileImageUrl"
            :src="athlete.profileImageUrl"
            alt="Profile"
            class="object-cover w-full h-full"
          />
          <div
            v-else
            class="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500"
          >
            <Icon
              name="mdi:account"
              size="2rem"
            />
          </div>
        </div>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-gray-600 text-sm mb-6"
        >
          <div class="flex items-center">
            <Icon
              name="mdi:calendar-account"
              size="1.25rem"
              class="mr-2"
            />
            <span>Age: {{ athlete.age }} years</span>
          </div>
          <div class="flex items-center">
            <Icon
              name="mdi:account-switch"
              size="1.25rem"
              class="mr-2"
            />
            <span>Position: {{ athlete.position }}</span>
          </div>
          <div class="flex items-center">
            <Icon
              name="mdi:account-group"
              size="1.25rem"
              class="mr-2"
            />
            <span>Group: {{ athlete.group }}</span>
          </div>
          <div class="flex items-center">
            <Icon
              name="mdi:hand-right"
              size="1.25rem"
              class="mr-2"
            />
            <span>Dominant Hand: {{ athlete.dominantHand }}</span>
          </div>
          <div class="flex items-center">
            <Icon
              name="mdi:ruler"
              size="1.25rem"
              class="mr-2"
            />
            <span>Height: {{ athlete.height }} cm</span>
          </div>
          <div class="flex items-center">
            <Icon
              name="mdi:scale-bathroom"
              size="1.25rem"
              class="mr-2"
            />
            <span>Weight: {{ athlete.weight }} kg</span>
          </div>
          <div class="flex items-center">
            <Icon
              name="mdi:calendar-clock"
              size="1.25rem"
              class="mr-2"
            />
            <span>Date of Birth: {{ athlete.dateOfBirth }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Skill Assessment -->
      <div class="flex-1 mt-6 lg:mt-0 lg:ml-8">
        <SkillAssessment
          :skill-scores="skillScores"
          @save-scores="saveSkillScores"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps } from 'vue';
import SkillAssessment from './SkillAssessment.vue';

interface SkillScore {
  name: string;
  value: number;
}

interface Athlete {
  id: number;
  name: string;
  position: string;
  age: number;
  height: number;
  weight: number;
  dominantHand: string;
  dateOfBirth: string;
  profileImageUrl: string | null;
  group: string;
  totalPowerRate: number;
  developmentRate: number;
  lastAssessmentDate: string | null;
  skillScores: SkillScore[];
}

defineProps<{
  athlete: Athlete;
  skillScores: SkillScore[];
}>();

const emit = defineEmits<{
  (e: 'updateAssessment', newScores: SkillScore[]): void;
}>();

function saveSkillScores(newScores: SkillScore[]) {
  emit('updateAssessment', newScores);
}
</script>

<style>
/* Rely on Tailwind only */
</style>
