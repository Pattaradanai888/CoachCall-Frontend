<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { navigateTo, useRoute } from '#imports';
import { nextTick, onMounted, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';

onMounted(() => {
  const authStore = useAuthStore();
  const route = useRoute();

  watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated, wasAuthenticated) => {
      if (wasAuthenticated && !isAuthenticated) {
        if (route.path !== '/login' && route.path !== '/register') {
          await nextTick();
          navigateTo('/login', { replace: true });
        }
      }
    },
  );
});
</script>
