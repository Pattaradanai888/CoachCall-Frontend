<template>
  <div class="p-6 flex flex-col items-center">
    <h2 class="text-xl font-semibold mb-4">
      Latest Athlete
    </h2>
    <div
      class="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-200 mb-4"
    >
      <NuxtImg
        v-if="athlete.profileImageUrl"
        :src="athlete.profileImageUrl"
        alt="Profile"
        format="webp"
        width="112"
        height="112"
        loading="lazy"
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
    <div class="text-center space-y-1">
      <p class="font-bold text-lg">
        {{ athlete.name }}
      </p>
      <p class="text-gray-600 text-sm flex items-center justify-center">
        <Icon
          name="mdi:account-switch"
          size="1rem"
          class="mr-1"
        />
        {{ athlete.positions }}
      </p>
      <p class="text-gray-600 text-sm flex items-center justify-center">
        <Icon
          name="mdi:calendar"
          size="1rem"
          class="mr-1"
        />
        Age: {{ athlete.age }}
      </p>
      <p class="text-gray-600 text-sm flex items-center justify-center">
        <Icon name="mdi:ruler" size="1rem" class="mr-1" />
        Height: {{ athlete.height || 'Undefined' }}{{ athlete.height ? ' cm' : '' }}
      </p>
      <p class="text-gray-600 text-sm flex items-center justify-center">
        <Icon name="mdi:scale-bathroom" size="1rem" class="mr-1" />
        Weight: {{ athlete.weight || 'Undefined' }}{{ athlete.weight ? ' kg' : '' }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AthleteDetail } from '~/types/athlete';

defineProps<{ athlete: AthleteDetail }>();
</script>

<style>
/* Pure Tailwind styling, no extra CSS needed */
</style>
