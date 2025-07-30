<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon :name="highlight.icon" size="1.5rem" class="text-[#9C1313]" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-800">
            {{ getGreeting() }}, Coach!
          </h2>
          <p class="text-gray-600 text-sm">
            {{ highlight.message }}
          </p>
        </div>
      </div>

      <!-- Milestone Badge for all types -->
      <div v-if="showMilestone" class="text-center">
        <div class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
          {{ getMilestoneText() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MotivationalHighlight } from '~/types/coach-stat';

const props = defineProps<{ highlight: MotivationalHighlight }>();

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12)
    return 'Good Morning';
  if (hour < 17)
    return 'Good Afternoon';
  return 'Good Evening';
}

const showMilestone = computed(() => props.highlight.type !== 'DEFAULT');

function getMilestoneText(): string {
  const milestones: Record<string, string> = {
    HIGH_IMPACT: 'High Impact!',
    SKILL_BOOST: 'Skill Boost!',
    PERSONAL_BEST: 'Personal Best!',
    NEW_ATHLETES: 'Team Growth!',
    DEFAULT: '',
  };
  return milestones[props.highlight.type] || '';
}
</script>
