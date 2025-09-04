// plugins/hydration.ts
import { ref } from 'vue';

export default defineNuxtPlugin((nuxtApp) => {
  const isHydrated = ref(false);

  if (import.meta.client) {
    nuxtApp.hooks.hook('app:mounted', () => {
      isHydrated.value = true;
    });
  }

  return {
    provide: {
      isHydrated: isHydrated,
    },
  };
});