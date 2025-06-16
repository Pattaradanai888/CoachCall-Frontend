<template>
  <div v-if="profile" class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
    <!-- Profile Info -->
    <div v-motion-slide-visible-once-left class="lg:col-span-1 w-full">
      <div class="text-center">
        <NuxtImg
          :src="profile.profile?.profile_image_url || '/default-profile.jpg'"
          fetchpriority="high"
          alt="Profile Picture"
          width="128"
          height="128"
          class="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-100 object-cover"
          placeholder
        />
        <h2 class="text-2xl font-bold text-gray-900 break-words">
          {{ profile.profile?.display_name }}
        </h2>
        <p class="text-gray-600 break-all text-sm sm:text-base">
          {{ profile.email }}
        </p>

        <div class="mt-6 space-y-2">
          <div class="flex items-center justify-center text-gray-700 text-sm sm:text-base">
            <Icon name="mdi:book-outline" class="w-5 h-5 mr-2 flex-shrink-0" />
            <span>Total Course: {{ totalCourses }}</span>
          </div>
          <div class="flex items-center justify-center text-gray-700 text-sm sm:text-base">
            <Icon name="mdi:account-group" class="w-5 h-5 mr-2 flex-shrink-0" />
            <span>Total Athlete: {{ totalAthletes }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements -->
    <div v-motion-slide-visible-once-right :delay="200" class="lg:col-span-2 w-full min-w-0">
      <div class="flex items-center mb-6">
        <Icon name="mdi:trophy" class="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" />
        <h3 class="text-xl font-semibold text-gray-900">
          Achievements
        </h3>
      </div>
      <div v-if="achievements.length === 0" class="text-center text-gray-500 py-4">
        No achievements yet.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="(achievement, index) in achievements"
          :key="achievement.id"
          v-motion-slide-visible-once-bottom
          :delay="300 + index * 100"
          class="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow w-full min-w-0"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <Icon :name="achievement.icon" class="w-8 h-8 text-yellow-600" />
            </div>
            <div class="flex-grow min-w-0">
              <h4 class="font-semibold text-gray-900 break-words">
                {{ achievement.title }}
              </h4>
              <p class="text-sm text-gray-600 mb-2 break-words">
                {{ achievement.description }}
              </p>
              <p class="text-xs text-gray-500 break-words">
                Achieved on {{ achievement.date }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-10 text-gray-500">
    Loading profile information...
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types/auth';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

defineProps<{
  profile: User | null;
  achievements: Achievement[];
  totalCourses: number;
  totalAthletes: number;
}>();
</script>
