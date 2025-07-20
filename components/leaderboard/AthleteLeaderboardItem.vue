<template>
  <div
    class="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0"
    :class="{ 'bg-[#9C1313]/5 border-l-4 border-[#9C1313]': isSelected }"
    @click="emit('select')"
  >
    <!-- Rank -->
    <div class="col-span-1 flex items-center justify-center">
      <div v-if="athlete.rank <= 3" class="flex items-center justify-center">
        <Icon 
          name="mdi:trophy" 
          class="w-6 h-6"
          :class="getTrophyColor(athlete.rank)"
        />
      </div>
      <span v-else class="font-semibold text-gray-600">{{ athlete.rank }}</span>
    </div>

    <!-- Athlete Info -->
    <div class="col-span-5 flex items-center">
      <NuxtImg 
        :src="athlete.profileImageUrl || '/default-profile.jpg'" 
        class="w-12 h-12 rounded-full border-2 border-gray-200"
      />
      <div class="ml-3">
        <p class="font-semibold text-gray-800">{{ athlete.name }}</p>
        <p class="text-sm text-gray-500">{{ athlete.position }}</p>
      </div>
    </div>

    <!-- Score -->
    <div class="col-span-2 flex items-center justify-center">
      <div class="text-center">
        <p class="font-bold text-lg text-gray-800">{{ athlete.currentScore.toFixed(1) }}</p>
      </div>
    </div>

    <!-- Growth -->
    <div class="col-span-2 flex items-center justify-center">
      <div 
        class="flex items-center px-3 py-1 rounded-full text-sm font-semibold"
        :class="athlete.improvementSinceDayOne >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
      >
        <Icon 
          :name="athlete.improvementSinceDayOne >= 0 ? 'mdi:arrow-up-bold' : 'mdi:arrow-down-bold'" 
          class="w-4 h-4 mr-1" 
        />
        {{ Math.abs(athlete.improvementSinceDayOne).toFixed(1) }}
      </div>
    </div>

    <!-- Momentum -->
    <div class="col-span-2 flex items-center justify-center">
      <div 
        class="flex items-center px-3 py-1 rounded-full text-sm font-semibold"
        :class="athlete.improvementSlope >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'"
      >
        <Icon 
          :name="athlete.improvementSlope >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'" 
          class="w-4 h-4 mr-1" 
        />
        {{ Math.abs(athlete.improvementSlope).toFixed(1) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardAthlete } from '~/types/leaderboard';

defineProps<{
  athlete: LeaderboardAthlete;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();

// Design helper function
const getTrophyColor = (rank: number) => {
  switch (rank) {
    case 1: return 'text-yellow-500';
    case 2: return 'text-gray-400'; 
    case 3: return 'text-orange-500';
    default: return 'text-gray-300';
  }
};
</script>