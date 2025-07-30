<template>
  <div v-if="athlete" class="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300">
    <!-- Mobile header indicator -->
    <div class="xl:hidden bg-[#9C1313] text-white px-4 py-2 text-center">
      <p class="text-sm font-medium">Athlete Details</p>
    </div>
    
    <!-- Header -->
    <div class="bg-gray-50 border-b border-gray-200 p-6">
      <div class="flex items-center">
        <div class="relative">
          <NuxtImg 
            :src="athlete.profileImageUrl || '/default-profile.jpg'" 
            class="w-16 h-16 rounded-full border-2 border-gray-200 transition-transform duration-200 hover:scale-105"
          />
          <div class="absolute -top-1 -right-1 bg-[#9C1313] text-white w-6 h-6 rounded-full flex items-center justify-center font-medium text-xs shadow-lg">
            {{ athlete.rank }}
          </div>
        </div>
        <div class="ml-4 flex-1">
          <h2 class="text-lg font-semibold text-gray-800">{{ athlete.name }}</h2>
          <p class="text-gray-600">{{ athlete.position }}</p>
          <div class="mt-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <span class="text-sm text-gray-600">Current Score: </span>
            <span class="font-semibold text-gray-800">{{ (athlete.currentScore || 0).toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Icon name="mdi:chart-line" class="text-[#9C1313]" />
        Performance Metrics
      </h3>
      
      <div class="grid grid-cols-1 gap-4">
        <!-- Total Growth -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium mb-1">Total Growth</p>
              <p class="text-xl font-semibold text-gray-800">
                {{ (athlete.improvementSinceDayOne || 0) >= 0 ? '+' : '' }}{{ (athlete.improvementSinceDayOne || 0).toFixed(1) }} pts
              </p>
              <p class="text-xs text-gray-500">Since day one</p>
            </div>
            <Icon 
              name="mdi:arrow-up" 
              class="w-6 h-6"
              :class="(athlete.improvementSinceDayOne || 0) >= 0 ? 'text-green-600' : 'text-red-600'"
            />
          </div>
        </div>

        <!-- Momentum -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium mb-1">Momentum</p>
              <p class="text-xl font-semibold text-gray-800">
                {{ athlete.improvementSlope >= 0 ? '+' : '' }}{{ athlete.improvementSlope.toFixed(1) }}
              </p>
              <p class="text-xs text-gray-500">Score change per session</p>
            </div>
            <Icon 
              :name="athlete.improvementSlope >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'" 
              class="w-6 h-6"
              :class="athlete.improvementSlope >= 0 ? 'text-blue-600' : 'text-orange-600'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Skill Breakdown -->
    <div class="p-6 pt-0">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Icon name="mdi:target" class="text-[#9C1313]" />
        Skill Progression
      </h3>
      
      <div class="space-y-3">
        <div v-for="skill in athlete.skillProgression" :key="skill.skillName" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium text-gray-800">{{ skill.skillName }}</span>
            <span class="text-sm text-gray-600">
              {{ skill.currentScore.toFixed(1) }}%
            </span>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-[#9C1313] h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(skill.currentScore, 100)}%` }"
            />
          </div>
          
          <!-- Improvement Badge -->
          <div class="mt-2 flex justify-between items-center">
            <span class="text-xs text-gray-500">
              Started: {{ skill.dayOneScore.toFixed(1) }}%
            </span>
            <span 
              class="text-xs font-medium"
              :class="skill.currentScore > skill.dayOneScore 
                ? 'text-green-600' 
                : skill.currentScore < skill.dayOneScore 
                  ? 'text-red-600'
                  : 'text-gray-600'"
            >
              {{ skill.currentScore > skill.dayOneScore ? '+' : '' }}{{ (skill.currentScore - skill.dayOneScore).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="isLoading" class="bg-white rounded-xl border border-gray-200 p-8 text-center">
    <div class="animate-spin w-8 h-8 border-2 border-[#9C1313] border-t-transparent rounded-full mx-auto mb-4" />
    <h3 class="text-base font-medium text-gray-600 mb-2">Loading Details</h3>
    <p class="text-gray-500 text-sm">Fetching athlete information...</p>
  </div>

  <!-- Empty State -->
  <div v-else class="bg-white rounded-xl border border-gray-200 p-8 text-center">
    <Icon name="mdi:account-search" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 class="text-base font-medium text-gray-600 mb-2">Select an Athlete</h3>
    <p class="text-gray-500 text-sm">Choose an athlete from the leaderboard to view their detailed performance metrics.</p>
  </div>
</template>

<script setup lang="ts">
import type { AthleteDetail } from '~/types/leaderboard';

defineProps<{
  athlete: AthleteDetail | null;
  isLoading?: boolean;
}>();
</script>