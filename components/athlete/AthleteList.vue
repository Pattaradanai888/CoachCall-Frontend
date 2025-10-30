<template>
  <div :class="{ 'opacity-50 pointer-events-none': loading }">
    <div class="px-6 py-4 border-b">
      <h2 class="text-lg font-semibold">
        Athletes
      </h2>
      <p class="text-gray-500 text-sm">
        <span v-if="isMobile" class="sm:hidden">Tap an athlete to view details below</span>
        <span v-else class="hidden sm:inline">Select an athlete to view details</span>
      </p>
    </div>

    <!-- Fixed height container to prevent layout shifts -->
    <div class="h-[400px] flex flex-col">
      <ul v-if="athletes.length > 0" class="flex-1 overflow-y-auto min-h-0">
        <li
          v-for="ath in athletes"
          :key="ath.uuid"
          class="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors duration-150 touch-target"
          :class="[ath.uuid === selectedUuid ? 'bg-red-50 border-l-4 border-red-600' : '']"
          @click="handleAthleteClick(ath)"
        >
          <div class="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
            <NuxtImg
              v-if="ath.profileImageUrl"
              :src="ath.profileImageUrl"
              format="webp"
              width="40"
              height="40"
              alt="avatar"
              loading="lazy"
              class="object-cover w-full h-full"
              placeholder="/default-profile.jpg"
            />
            <div v-else class="bg-gray-200 w-full h-full flex items-center justify-center text-gray-400">
              <Icon name="mdi:account" size="1.25rem" />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-medium truncate" :class="[ath.uuid === selectedUuid ? 'text-red-800' : '']">
              {{ ath.name }}
            </p>
            <p class="text-gray-500 text-xs flex items-center">
              <Icon name="mdi:account-switch" size="1rem" class="mr-1 flex-shrink-0" />
              <span class="truncate">Position: {{ ath.position }}, {{ ath.age ?? 'N/A' }} yrs</span>
            </p>
          </div>
          <!-- Mobile scroll indicator -->
          <div v-if="isMobile" class="sm:hidden flex items-center text-red-600">
            <Icon name="mdi:arrow-down" size="1.25rem" />
          </div>
        </li>
      </ul>
      <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-500 py-8 px-4">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon name="mdi:account-search" size="2rem" class="text-gray-400" />
        </div>
        <p class="text-base font-medium text-gray-700 mb-1">No athletes found</p>
        <p class="text-sm text-gray-500 text-center">Create your first athlete profile to get started</p>
      </div>

      <!-- Pagination controls -->
      <div class="px-4 py-3 border-t flex justify-between items-center flex-shrink-0 bg-white">
        <div class="flex items-center text-sm text-gray-500">
          <div v-if="loading" class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-red-800" />
            <span class="ml-2">Loading...</span>
          </div>
        </div>
        <div class="flex">
          <button
            type="button"
            class="px-3 py-1 bg-red-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-150"
            :disabled="!hasPrev || loading"
            @click="emitPrev"
          >
            Prev
          </button>
          <button
            type="button"
            class="ml-2 px-3 py-1 bg-red-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-150"
            :disabled="!hasNext || loading"
            @click="emitNext"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AthleteListEntry } from '~/types/athlete';

defineProps<{
  athletes: AthleteListEntry[];
  selectedUuid: string | null;
  hasPrev: boolean;
  hasNext: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'selectAthlete', uuid: string): void;
  (e: 'prevPage'): void;
  (e: 'nextPage'): void;
}>();

// Reactive mobile detection
const isMobile = ref(false);

onMounted(() => {
  // Set initial value
  isMobile.value = window.innerWidth <= 640;
  
  // Add resize listener for reactive updates
  const handleResize = () => {
    isMobile.value = window.innerWidth <= 640;
  };
  
  window.addEventListener('resize', handleResize);
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});

function handleAthleteClick(athlete: AthleteListEntry) {
  // Always emit the selection event first
  emit('selectAthlete', athlete.uuid);
  
  // On mobile, scroll to athlete details section after selection
  if (isMobile.value) {
    setTimeout(() => {
      const athleteDetailsSection = document.getElementById('athlete-details-section');
      if (athleteDetailsSection) {
        athleteDetailsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest' 
        });
      }
    }, 100); // Small delay to allow the selection to update first
  }
}

function emitPrev() {
  emit('prevPage');
}

function emitNext() {
  emit('nextPage');
}
</script>
