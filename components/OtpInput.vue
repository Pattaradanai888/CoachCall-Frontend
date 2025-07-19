<template>
  <div class="flex items-center justify-center gap-2">
    <input
      v-for="(digit, index) in otpDigits"
      :key="index"
      :ref="(el) => (inputRefs[index] = el as HTMLInputElement)"
      v-model="otpDigits[index]"
      type="text"
      inputmode="numeric"
      maxlength="1"
      class="w-12 h-14 rounded-lg border text-center text-2xl font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-red-800"
      :class="{ 'border-red-600': digit }"
      @input="handleInput(index)"
      @keydown="handleKeyDown(index, $event)"
      @paste="handlePaste(index, $event)"
      @focus="handleFocus(index)"
    >
  </div>
</template>

<script setup lang="ts">
import { onBeforeUpdate, onMounted, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  numInputs: {
    type: Number,
    default: 6,
  },
});

const emit = defineEmits(['update:modelValue', 'onComplete']);

// An array to hold the value of each individual input box
const otpDigits = ref<string[]>(Array.from({ length: props.numInputs }, () => ''));
// An array to hold the refs to each input element for programmatic focus
const inputRefs = ref<HTMLInputElement[]>([]);

// This ensures the refs array is reset before each component update
onBeforeUpdate(() => {
  inputRefs.value = [];
});

// Automatically focus the first input when the component mounts
onMounted(() => {
  inputRefs.value[0]?.focus();
});

// Sync the internal state with the parent's v-model
watch(() => props.modelValue, (newValue) => {
  if (newValue !== otpDigits.value.join('')) {
    const newDigits = newValue.slice(0, props.numInputs).split('');
    otpDigits.value = newDigits.concat(Array.from({ length: props.numInputs - newDigits.length }).fill('') as string[]);
  }
}, { immediate: true });

// Main logic handler for when a user types in a box
function handleInput(index: number) {
  const originalValue = otpDigits.value[index];

  // FIX: Use a regex to remove any character that is not a digit (0-9)
  const cleanedValue = originalValue.replace(/\D/g, '');

  // Update the model only with the cleaned, single-digit value
  otpDigits.value[index] = cleanedValue.charAt(0);

  // If a digit was successfully entered, move to the next input
  if (otpDigits.value[index] && index < props.numInputs - 1) {
    inputRefs.value[index + 1]?.focus();
  }

  // Combine all digits and emit the full OTP string
  const fullOtp = otpDigits.value.join('');
  emit('update:modelValue', fullOtp);
  if (fullOtp.length === props.numInputs) {
    emit('onComplete', fullOtp);
  }
}

// Handle Backspace to move focus backward
function handleKeyDown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus();
  }
}

// Handle pasting a code into any of the boxes
function handlePaste(index: number, event: ClipboardEvent) {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text').replace(/\D/g, '');
  if (!pastedData)
    return;

  let current_index = index;
  for (let i = 0; i < pastedData.length; i++) {
    if (current_index < props.numInputs) {
      otpDigits.value[current_index] = pastedData[i];
      current_index++;
    }
  }

  const focusIndex = Math.min(index + pastedData.length, props.numInputs - 1);
  inputRefs.value[focusIndex]?.focus();

  handleInput(focusIndex); // Trigger a final check and emit
}

// Select the content of an input on focus for easy replacement
function handleFocus(index: number) {
  inputRefs.value[index]?.select();
}
</script>
