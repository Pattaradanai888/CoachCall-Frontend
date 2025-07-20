<template>
  <div v-motion-slide-visible-once-top :delay="200" class="bg-white p-6">
    <h2 class="text-2xl font-bold mb-6">
      Add Athletes to Course
    </h2>
    <div class="flex mb-4">
      <div class="relative w-full shadow-lg">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Athletes by name or position"
          class="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300"
        >
        <Icon name="mdi:magnify" size="1rem" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>
      <button class="flex items-center justify-center shadow-lg p-2 border-gray-300 border rounded-lg ml-1" @click="showFilter = !showFilter">
        <Icon name="mdi:filter-outline" size="1rem" class="text-gray-500" />
      </button>
    </div>

    <div v-if="showFilter" class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <!-- Filter UI is unchanged -->
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div
        v-for="athlete in paginatedAthletes"
        :key="athlete.uuid"
        class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer"
        @click="toggleAthlete(athlete.uuid)"
      >
        <input
          type="checkbox"
          :checked="selectedAthletes.includes(athlete.uuid)"
          class="mr-4 w-4 h-4"
          @click.stop
          @change="toggleAthlete(athlete.uuid)"
        >
        <div class="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
          <NuxtImg
            :src="athlete.profile_image_url || '/default-profile.jpg'"
            :alt="athlete.name"
            format="webp"
            width="48"
            height="48"
            loading="lazy"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="flex-grow">
          <h3 class="font-semibold">
            {{ athlete.name }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ athlete.positions.map(p => p.name).join(', ') || 'N/A' }}
          </p>
        </div>
      </div>
    </div>

    <PaginationBar v-model:current-page="currentPage" :total-items="totalAthletes" :items-per-page="itemsPerPage" />
  </div>
</template>

<script setup lang="ts">
import type { AthleteSelectionInfo } from '~/types/athlete';
import { computed, ref, watch } from 'vue';
import PaginationBar from '~/components/PaginationBar.vue';
import { useAthleteData } from '~/composables/useAthleteData';

const props = withDefaults(defineProps<{
  modelValue?: AthleteSelectionInfo[];
}>(), {
  modelValue: () => [],
});

const emit = defineEmits(['update:modelValue', 'editStep']);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(8);
const selectedAthletes = ref<string[]>(props.modelValue.map(a => a.uuid));
const showFilter = ref(false);
const selectedPositions = ref<string[]>([]);
const selectedGroups = ref<string[]>([]);

const { fetchAllAthleteSelectionInfo } = useAthleteData();
const { data: athletes } = await fetchAllAthleteSelectionInfo();

watch(selectedAthletes, (newUuids) => {
  if (!athletes.value)
    return;
  const selectedAthleteObjects = athletes.value.filter(a => newUuids.includes(a.uuid));
  emit('update:modelValue', selectedAthleteObjects);
}, { deep: true });

watch(() => props.modelValue, (newVal) => {
  const newUuids = newVal.map(a => a.uuid);
  if (JSON.stringify(newUuids) !== JSON.stringify(selectedAthletes.value)) {
    selectedAthletes.value = newUuids;
  }
}, { immediate: true, deep: true });

const fullFilteredList = computed(() => {
  if (!athletes.value)
    return [];
  return athletes.value.filter((athlete) => {
    const searchMatch = athlete.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const positionMatch = selectedPositions.value.length === 0 || athlete.positions.some(p => selectedPositions.value.includes(p.name));
    const groupMatch = selectedGroups.value.length === 0 || athlete.groups.some(g => selectedGroups.value.includes(g.name));
    return searchMatch && positionMatch && groupMatch;
  });
});

const totalAthletes = computed(() => fullFilteredList.value.length);
const paginatedAthletes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return fullFilteredList.value.slice(start, start + itemsPerPage.value);
});

watch([searchQuery, selectedPositions, selectedGroups], () => {
  currentPage.value = 1;
});

function toggleAthlete(uuid: string) {
  const index = selectedAthletes.value.indexOf(uuid);
  if (index > -1) {
    selectedAthletes.value.splice(index, 1);
  }
  else {
    selectedAthletes.value.push(uuid);
  }
}
</script>
