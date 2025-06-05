<template>
  <div class="bg-white rounded-2xl shadow overflow-hidden">
    <div class="px-6 py-4 border-b">
      <h2 class="text-lg font-semibold">
        Athlete
      </h2>
      <p class="text-gray-500 text-sm">
        Select an athlete to view details
      </p>
    </div>
    <ul class="max-h-[400px] overflow-y-auto">
      <li
        v-for="ath in athletes"
        :key="ath.id"
        class="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100" :class="[
          ath.id === selectedId ? 'bg-red-50' : '',
        ]"
        @click="() => selectAthlete(ath.id)"
      >
        <div class="w-10 h-10 rounded-full overflow-hidden mr-3">
          <NuxtImg
            v-if="ath.profileImageUrl"
            :src="ath.profileImageUrl"
            alt="avatar"
            class="object-cover w-full h-full"
          />
          <div
            v-else
            class="bg-gray-200 w-full h-full flex items-center justify-center text-gray-400"
          >
            <Icon
              name="mdi:account"
              size="1.25rem"
            />
          </div>
        </div>
        <div>
          <p class="font-medium">
            {{ ath.name }}
          </p>
          <p class="text-gray-500 text-xs flex items-center">
            <Icon
              name="mdi:account-switch"
              size="1rem"
              class="mr-1"
            />
            {{ ath.position }}, {{ ath.age }} yrs
          </p>
        </div>
      </li>
    </ul>
    <div class="px-4 py-3 border-t flex justify-end">
      <!-- You can put pagination controls here if you want -->
      <button
        class="px-3 py-1 bg-red-800 text-white rounded disabled:opacity-50"
        disabled
      >
        Prev
      </button>
      <button class="ml-2 px-3 py-1 bg-red-800 text-white rounded">
        Next
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Athlete } from '~/types/athlete';

defineProps<{
  athletes: Athlete[];
  selectedId: number | null;
}>();

const emit = defineEmits<{
  (e: 'selectAthlete', id: number): void;
}>();

function selectAthlete(id: number) {
  emit('selectAthlete', id);
}
</script>

<style>
/* everything is Tailwind */
</style>
