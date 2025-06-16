<!-- components/AppFormSection.vue -->
<template>
  <div :class="sectionClasses">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <Icon v-if="icon" :name="icon" class="mr-2" :class="iconColor" />
      {{ title }}
      <span v-if="subtitle" class="text-gray-500 text-sm ml-2">{{ subtitle }}</span>
    </h3>

    <div :class="gridClasses">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  variant?: 'default' | 'blue' | 'green' | 'orange' | 'purple' | 'gray';
  columns?: 1 | 2 | 3;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  columns: 2,
});

const sectionClasses = computed(() => {
  const variants = {
    default: '',
    blue: 'bg-blue-50/50 rounded-xl p-6 border border-blue-100',
    green: 'bg-green-50/50 rounded-xl p-6 border border-green-100',
    orange: 'bg-orange-50/50 rounded-xl p-6 border border-orange-100',
    purple: 'bg-purple-50/50 rounded-xl p-6 border border-purple-100',
    gray: 'bg-gray-50/50 rounded-xl p-6 border border-gray-200',
  };
  return variants[props.variant];
});

const gridClasses = computed(() => {
  const columns = {
    1: 'grid grid-cols-1 gap-6',
    2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    3: 'grid grid-cols-1 md:grid-cols-3 gap-6',
  };
  return columns[props.columns];
});
</script>
