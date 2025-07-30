<!-- components/AppFormField.vue -->
<template>
  <div>
    <label v-if="label" class="block text-sm font-semibold text-gray-700 mb-2">
      <Icon v-if="icon" :name="icon" class="inline mr-1" :class="iconColor" />
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
      <span v-if="optional" class="text-gray-500 text-xs ml-1">(Optional)</span>
    </label>

    <!-- Now that Field is imported below, Vue can resolve it -->
    <Field v-slot="{ field, errorMessage }" :name="name">
      <!-- Input -->
      <input
        v-if="type !== 'select' && type !== 'textarea'"
        v-bind="field"
        :type="type"
        :placeholder="placeholder"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :accept="accept"
        :class="inputClasses(errorMessage)"
        class="w-full border-2 h-11 px-4 rounded-lg shadow-sm transition-colors outline-none"
        @change="handleChange"
      >

      <!-- Select -->
      <select
        v-else-if="type === 'select'"
        v-bind="field"
        :class="inputClasses(errorMessage)"
        class="w-full border-2 h-11 px-4 rounded-lg shadow-sm transition-colors outline-none"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <!-- Textarea -->
      <textarea
        v-else
        v-bind="field"
        :placeholder="placeholder"
        :rows="rows || 3"
        :class="inputClasses(errorMessage)"
        class="w-full border-2 h-11 px-4 rounded-lg shadow-sm transition-colors outline-none"
      />

      <!-- Error message -->
      <p v-if="errorMessage" class="text-red-500 text-sm mt-1">
        {{ errorMessage }}
      </p>
    </Field>

    <p v-if="helpText" class="text-xs text-gray-500 mt-1">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate';

interface Option {
  value: string | number;
  label: string;
}

interface Props {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  icon?: string;
  iconColor?: string;
  required?: boolean;
  optional?: boolean;
  readonly?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  accept?: string;
  rows?: number;
  options?: Option[];
  helpText?: string;
  focusColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
});

const emit = defineEmits<{
  change: [event: Event];
}>();

function inputClasses(errorMessage?: string) {
  const base = errorMessage
    ? `border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500`
    : `border-gray-300 focus:ring-2 focus:ring-[#9C1313] focus:border-[#9C1313]`;

  return props.readonly
    ? `${base} bg-gray-50 text-gray-600 cursor-not-allowed`
    : base;
}

function handleChange(event: Event) {
  emit('change', event);
}
</script>
