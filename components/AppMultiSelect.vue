<!-- components/AppMultiSelect.vue -->
<template>
  <div ref="rootEl" class="relative">
    <label v-if="label" class="block text-sm font-semibold text-gray-700 mb-2">
      <Icon v-if="icon" :name="icon" class="inline mr-1" :class="iconColor" />
      {{ label }}
    </label>

    <!-- The main clickable input area -->
    <div
      class="w-full border-2 rounded-lg shadow-sm transition-colors min-h-[44px] flex items-center justify-between p-2 cursor-pointer"
      :class="inputClasses(errorMessage)"
      @click="toggleDropdown"
    >
      <!-- Container for tags or placeholder -->
      <div class="flex-1 flex flex-wrap items-center gap-1">
        <template v-if="selectedOptions.length">
          <span
            v-for="option in selectedOptions"
            :key="option.value"
            class="bg-gray-200 text-gray-800 text-sm font-medium px-2 py-1 rounded-md flex items-center"
          >
            {{ option.label }}
            <button
              type="button"
              class="ml-1.5 text-gray-500 hover:text-gray-900"
              @click.stop="removeOption(option)"
            >
              <Icon name="mdi:close-circle" size="1rem" />
            </button>
          </span>
        </template>
        <span v-else class="text-gray-400 px-1">
          {{ placeholder }}
        </span>
      </div>

      <!-- Dropdown Icon -->
      <div class="ml-2 flex-shrink-0">
        <Icon
          name="mdi:chevron-down"
          size="1.5rem"
          class="text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </div>

    <!-- Dropdown list -->
    <transition name="fade">
      <ul
        v-if="isOpen && availableOptions.length > 0"
        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <li
          v-for="option in availableOptions"
          :key="option.value"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </li>
      </ul>
    </transition>

    <p v-if="errorMessage" class="text-red-500 text-sm mt-1">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { useField } from 'vee-validate';

interface Option {
  value: string | number;
  label: string;
}

const props = withDefaults(defineProps<{
  name: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  icon?: string;
  iconColor?: string;
  focusColor?: string;
}>(), {
  focusColor: 'red',
  placeholder: 'Select options...',
});

const rootEl = ref(null);
const isOpen = ref(false);

// Integrate with VeeValidate
const { value: selectedValues, errorMessage, setValue } = useField<string[]>(props.name, undefined, {
  initialValue: [],
});

const selectedOptions = computed(() =>
  props.options.filter(opt => selectedValues.value.includes(String(opt.value))),
);

const availableOptions = computed(() =>
  props.options.filter(opt => !selectedValues.value.includes(String(opt.value)) && opt.value), // Exclude "no team" option
);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function closeDropdown() {
  isOpen.value = false;
}

function selectOption(option: Option) {
  const newValues = [...selectedValues.value, String(option.value)];
  setValue(newValues);
  closeDropdown();
}

function removeOption(optionToRemove: Option) {
  const newValues = selectedValues.value.filter(val => val !== String(optionToRemove.value));
  setValue(newValues);
}

// Click outside to close
onClickOutside(rootEl, closeDropdown);

function inputClasses(error?: string) {
  if (error) {
    return 'border-red-500';
  }
  if (isOpen.value) {
    return `border-${props.focusColor}-500 ring-1 ring-${props.focusColor}-500`;
  }
  return 'border-gray-300';
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
