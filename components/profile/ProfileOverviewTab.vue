<template>
  <div v-if="profile" class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 min-h-64">
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
      </div>
    </div>

    <!-- Recent Activity -->
    <div v-motion-slide-visible-once-right :delay="200" class="lg:col-span-2 w-full min-w-0">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center">
          <Icon name="mdi:history" class="w-6 h-6 mr-2 flex-shrink-0" />
          <h3 class="text-xl font-semibold text-gray-900">
            Recent Activity
          </h3>
        </div>
      </div>
      
      <div v-if="activityLoading" class="space-y-4">
        <div v-for="i in 5" :key="`loading-${i}`" class="bg-gray-100 rounded-lg p-4 animate-pulse">
          <div class="flex items-center space-x-3">
            <div class="bg-gray-300 h-10 w-10 rounded-full" />
            <div class="flex-1">
              <div class="bg-gray-300 h-4 w-32 rounded mb-2" />
              <div class="bg-gray-300 h-3 w-48 rounded" />
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="activityError" class="text-center text-red-500 py-4">
        <Icon name="mdi:alert-circle" class="w-8 h-8 mx-auto mb-2" />
        <p>Failed to load recent activity</p>
      </div>
      
      <div v-else-if="recentActivities && recentActivities.length === 0" class="text-center text-gray-500 py-8">
        <Icon name="mdi:calendar-clock" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p class="mb-2">No recent activity</p>
        <NuxtLink 
          to="/dashboard" 
          class="text-blue-600 hover:text-blue-700 font-medium"
        >
          Start your first session
        </NuxtLink>
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="activity in recentActivities?.slice(0, 5)"
          :key="activity.id"
          class="rounded-lg p-4 hover:shadow-md transition-all duration-200 w-full min-w-0 border-2"
          :class="getActivityBackgroundClass(activity)"
        >
          <NuxtLink :to="getActivityPath(activity)" class="block">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="getActivityIconClass(activity)"
                >
                  <Icon :name="getActivityIcon(activity)" class="w-5 h-5 text-white" />
                </div>
              </div>
              <div class="flex-grow min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold text-gray-900 break-words text-sm">
                    {{ activity.title }}
                  </h4>
                  <span class="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {{ formatActivityDate(activity.date) }}
                  </span>
                </div>
                <div class="flex items-center mt-1 text-xs text-gray-600">
                  <Icon name="mdi:tag-outline" class="w-3 h-3 mr-1" />
                  <span class="capitalize">{{ activity.type.replace('_', ' ') }}</span>
                  <span v-if="activity.course_name" class="ml-2 text-gray-500">
                    • {{ activity.course_name }}
                  </span>
                  <span class="ml-auto flex items-center" :class="getStatusClass(activity)">
                    <Icon :name="getStatusIcon(activity)" class="w-3 h-3 mr-1" />
                    {{ getStatusText(activity) }}
                  </span>
                </div>
              </div>
            </div>
          </NuxtLink>
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
import type { EventItem } from '~/types/course';

defineProps<{
  profile: User | null;
}>();

// Fetch recent activities (events)
const { $api } = useNuxtApp();
const { data: recentActivities, pending: activityLoading, error: activityError } = await useAsyncData<EventItem[]>(
  'profile-recent-activities',
  () => $api('/course/events/all'),
  {
    default: () => [],
    server: false,
    transform: (data: EventItem[]) => {
      if (!data) return [];
      // Sort by date (most recent first) and limit to 10 items
      return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    },
  },
);

// Utility functions for activity display
function getActivityPath(activity: EventItem): string {
  if (activity.type === 'quick_session') {
    return `/quick-session/${activity.id}`;
  }
  if (activity.is_complete) {
    return `/course-detail/${activity.course_id}/session/${activity.id}/report`;
  }
  return `/course-detail/${activity.course_id}/session/${activity.id}`;
}

function getActivityIcon(activity: EventItem): string {
  if (activity.type === 'quick_session') {
    return 'mdi:flash';
  }
  return activity.is_complete ? 'mdi:check-circle' : 'mdi:play-circle';
}

function getActivityBackgroundClass(activity: EventItem): string {
  // Use the same color scheme as dashboard
  const activityDate = new Date(activity.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (activity.is_complete) {
    return 'bg-green-50 border-green-200 hover:border-green-400';
  }
  if (activityDate < today) {
    return 'bg-red-100 border-red-300 hover:border-red-400';
  }
  return 'bg-blue-50 border-blue-200 hover:border-blue-400';
}

function getActivityIconClass(activity: EventItem): string {
  // Use same color logic as background but for solid icons
  const activityDate = new Date(activity.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (activity.is_complete) {
    return 'bg-green-500';
  }
  if (activityDate < today) {
    return 'bg-red-500';
  }
  return 'bg-blue-500';
}

function getStatusIcon(activity: EventItem): string {
  if (activity.is_complete) {
    return 'mdi:check-circle-outline';
  }
  const activityDate = new Date(activity.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (activityDate < today) {
    return 'mdi:alert-circle-outline';
  }
  return 'mdi:clock-outline';
}

function getStatusClass(activity: EventItem): string {
  if (activity.is_complete) {
    return 'text-green-600';
  }
  const activityDate = new Date(activity.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (activityDate < today) {
    return 'text-red-600';
  }
  return 'text-blue-600';
}

function getStatusText(activity: EventItem): string {
  if (activity.is_complete) {
    return 'Completed';
  }
  const activityDate = new Date(activity.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (activityDate < today) {
    return 'Missed';
  }
  return 'Upcoming';
}

function formatActivityDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset hours for comparison
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  const activityDate = new Date(date);
  activityDate.setHours(0, 0, 0, 0);
  
  if (activityDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (activityDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    const diffTime = today.getTime() - activityDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
}
</script>
