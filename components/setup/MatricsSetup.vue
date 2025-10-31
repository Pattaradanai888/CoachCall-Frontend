<!-- components/setup/matricsSetup.vue -->
<template>
  <div class="min-h-screen items-center justify-center bg-white p-4 sm:p-10">
    <header class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Choose Performance Skills</h1>
        <p class="mt-1 text-base text-gray-600">Select up to 6 key skills to track athlete development</p>
      </div>
      <div class="flex-shrink-0 rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-700">
        {{ selectionCount }} of {{ maxSelection }} selected
      </div>
    </header>

    <main>
      <!-- Basketball Fundamentals Section -->
      <section class="mb-8">
        <h2 class="mb-4 text-lg font-bold">
          Basketball Fundamentals
        </h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <button
            v-for="skill in fundamentalSkills"
            :key="skill.name"
            :class="isSkillSelected(skill.name) ? 'border-red-800 bg-red-800 text-white' : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'"
            :disabled="!isSkillSelected(skill.name) && selectionCount >= maxSelection"
            class="rounded-lg border py-3 px-2 text-center text-sm font-medium shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
            @click="toggleFundamentalSkill(skill)"
          >
            {{ skill.name }}
          </button>
        </div>
      </section>

      <!-- Custom Skills Input Section -->
      <section class="mb-6">
        <h2 class="mb-4 text-lg font-bold text-gray-800">Custom Skills</h2>
        <div class="flex gap-3">
          <input
            v-model="newCustomSkillName"
            placeholder="Add your own skills"
            class="block w-full flex-grow rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-red-700 focus:ring-red-700"
            :disabled="selectionCount >= maxSelection"
            @keyup.enter="addCustomSkill"
          >
          <button
            :disabled="selectionCount >= maxSelection"
            class="flex-shrink-0 rounded-lg bg-red-800 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-red-800/60"
            @click="addCustomSkill"
          >
            + Add
          </button>
        </div>
      </section>

      <!-- Selected Skills List Section -->
      <section>
        <h1 class="mb-4 text-lg font-bold text-gray-800">Selected Skills</h1>
        <div v-if="selectedSkills.length === 0" class="flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-4">
          <p class="text-gray-400">No custom skills added yet</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="skill in selectedSkills"
            :key="skill.name"
            class="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 p-3"
          >
            <span class="font-medium text-gray-800">{{ skill.name }}</span>
            <button class="text-red-500 hover:text-red-700" @click="removeSelectedSkill(skill.name)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useNuxtApp } from '#app';
import type { SkillCreate } from '~/types/course';


const { $api } = useNuxtApp();

const maxSelection = 6;

const fundamentalSkills = ref<SkillCreate[]>([
  { name: 'Shooting' },
  { name: 'Dribbling' },
  { name: 'Passing' },
  { name: 'Defense' },
  { name: 'Rebounding' },
  { name: 'Speed & Agility' },
]);

const newCustomSkillName = ref('');
const selectedSkills = ref<SkillCreate[]>([]);

const selectionCount = computed(() => selectedSkills.value.length);

const isSkillSelected = (skillName: string): boolean => {
  return selectedSkills.value.some(s => s.name === skillName);
};

const addCustomSkill = () => {
  const skillName = newCustomSkillName.value.trim();
  if (skillName && selectionCount.value < maxSelection) {
    if (!isSkillSelected(skillName)) {
      const newSkill: SkillCreate = { name: skillName };
      selectedSkills.value.push(newSkill);
    }
    newCustomSkillName.value = '';
  }
};

const toggleFundamentalSkill = (skill: SkillCreate) => {
  const index = selectedSkills.value.findIndex(s => s.name === skill.name);
  if (index > -1) {
    selectedSkills.value.splice(index, 1);
  } else if (selectionCount.value < maxSelection) {
    selectedSkills.value.push(skill);
  }
};

const removeSelectedSkill = (skillName: string) => {
  const index = selectedSkills.value.findIndex(s => s.name === skillName);
  if (index > -1) {
    selectedSkills.value.splice(index, 1);
  }
};

async function saveSkills(): Promise<{ success: boolean; error?: string }> {
  if (selectedSkills.value.length === 0) {
    return { success: true };
  }
  
  const creationPromises = selectedSkills.value.map((skill: SkillCreate) => {
    return $api('/course/skills', {
      method: 'POST',
      body: skill,
    });
  });

  try {
    await Promise.all(creationPromises);
    console.log('Successfully saved all skills:', selectedSkills.value.map(s => s.name));
    return { success: true };
  }
  catch (err: unknown) {
    console.error('Failed to save one or more skills:', err);
    const errorData = err && typeof err === 'object' && 'data' in err ? (err as { data?: { message?: string } }).data : null;
    const errorMessage = errorData?.message || 'An error occurred while saving your skills.';
    return { success: false, error: errorMessage };
  }
}

defineExpose({
  saveSkills,
  selectionCount,
});

useHead({
  title: 'Choose Performance Skills',
});
</script>