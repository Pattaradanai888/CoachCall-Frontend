<template>
  <div class="flex justify-center w-full overflow-x-auto px-2">
    <div
      ref="navContainer"
      class="relative bg-gray-100 rounded-lg p-1 inline-flex mt-[6rem] overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full"
    >
      <!-- Moving background indicator -->
      <div
        class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out"
        :style="{
          left: `${indicatorLeft}px`,
          width: `${indicatorWidth}px`,
        }"
      />

      <!-- Navigation items -->
      <NuxtLink
        v-for="item in navItems"
        :key="item.id"
        :to="item.route"
        :class="[
          'relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap',
          activeTab === item.id ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900',
        ]"
      >
        <Icon :name="item.icon" class="w-5 h-5" filled />
        {{ item.label }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'mdi:home',
    route: '/dashboard',
  },
  { id: 'course', label: 'Course', icon: 'mdi:book-open-variant', route: 'course-management' },
  { id: 'athlete', label: 'Athlete', icon: 'mdi:account', route: '#' },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: 'mdi:chart-line',
    route: '#',
  },
  { id: 'coach-stat', label: 'Coach stat', icon: 'mdi:chart-box', route: '#' },
];

const activeTab = ref('');
const indicatorLeft = ref(0);
const indicatorWidth = ref(0);
const navContainer = ref<HTMLElement | null>(null);

const updateIndicator = () => {
  nextTick(() => {
    if (!navContainer.value) return;
    const activeButton = navContainer.value.querySelector(`a[href="${route.path}"]`) as HTMLElement;
    if (activeButton) {
      const containerRect = navContainer.value.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      indicatorLeft.value = buttonRect.left - containerRect.left + navContainer.value.scrollLeft;
      indicatorWidth.value = buttonRect.width;
    }
  });
};

onMounted(() => {
  activeTab.value = route.path;
  updateIndicator();

  setTimeout(updateIndicator, 100);

  // Resize observer to update on screen size change
  const resizeObserver = new ResizeObserver(updateIndicator);
  if (navContainer.value) {
    resizeObserver.observe(navContainer.value);
  }
});

watch(
  () => route.path,
  (newPath) => {
    activeTab.value = newPath;
    updateIndicator();
  }
);
</script>

<style scoped>
/* Optional: Hide scrollbars on mobile for better aesthetics */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
