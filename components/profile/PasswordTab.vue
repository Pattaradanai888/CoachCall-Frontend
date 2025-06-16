<template>
  <div class="max-w-lg mx-auto">
    <div v-motion-slide-visible-once-bottom class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div class="flex items-center mb-6">
        <Icon name="mdi:lock" class="w-6 h-6 text-gray-700 mr-2 flex-shrink-0" />
        <h3 class="text-xl font-semibold text-gray-900">
          Change Password
        </h3>
      </div>
      <p class="text-gray-600 mb-6 text-sm sm:text-base">
        Update your password to keep your account secure.
      </p>

      <form class="space-y-6" @submit.prevent="submitUpdatePassword">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <div class="relative">
            <input
              v-model="passwordForm.current"
              :type="showPasswords.current ? 'text' : 'password'"
              placeholder="Enter current password"
              autocomplete="current-password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
            >
            <button
              type="button"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Toggle current password visibility"
              @click="showPasswords.current = !showPasswords.current"
            >
              <Icon :name="showPasswords.current ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <div class="relative">
            <input
              v-model="passwordForm.new"
              :type="showPasswords.new ? 'text' : 'password'"
              placeholder="Enter new password"
              autocomplete="new-password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
            >
            <button
              type="button"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Toggle new password visibility"
              @click="showPasswords.new = !showPasswords.new"
            >
              <Icon :name="showPasswords.new ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <div class="relative">
            <input
              v-model="passwordForm.confirm"
              :type="showPasswords.confirm ? 'text' : 'password'"
              placeholder="Confirm New Password"
              autocomplete="new-password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
            >
            <button
              type="button"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Toggle confirm password visibility"
              @click="showPasswords.confirm = !showPasswords.confirm"
            >
              <Icon :name="showPasswords.confirm ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
            </button>
          </div>
          <p
            v-if="passwordForm.new !== passwordForm.confirm && passwordForm.confirm"
            class="text-red-500 text-sm mt-1"
          >
            Passwords do not match.
          </p>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 class="font-medium text-gray-900 mb-2">
            Password Requirements:
          </h4>
          <ul class="text-sm space-y-1">
            <li
              :class="passwordValidation.length ? 'text-green-600' : 'text-red-600'"
              class="flex items-center"
            >
              <Icon
                :name="passwordValidation.length ? 'mdi:check' : 'mdi:close'"
                class="w-4 h-4 mr-2 flex-shrink-0"
              />
              At least 8 characters
            </li>
            <li
              :class="passwordValidation.lowercase ? 'text-green-600' : 'text-red-600'"
              class="flex items-center"
            >
              <Icon
                :name="passwordValidation.lowercase ? 'mdi:check' : 'mdi:close'"
                class="w-4 h-4 mr-2 flex-shrink-0"
              />
              One lowercase letter
            </li>
            <li
              :class="passwordValidation.uppercase ? 'text-green-600' : 'text-red-600'"
              class="flex items-center"
            >
              <Icon
                :name="passwordValidation.uppercase ? 'mdi:check' : 'mdi:close'"
                class="w-4 h-4 mr-2 flex-shrink-0"
              />
              One uppercase letter
            </li>
            <li
              :class="passwordValidation.number ? 'text-green-600' : 'text-red-600'"
              class="flex items-center"
            >
              <Icon
                :name="passwordValidation.number ? 'mdi:check' : 'mdi:close'"
                class="w-4 h-4 mr-2 flex-shrink-0"
              />
              One number
            </li>
            <li
              :class="passwordValidation.special ? 'text-green-600' : 'text-red-600'"
              class="flex items-center"
            >
              <Icon
                :name="passwordValidation.special ? 'mdi:check' : 'mdi:close'"
                class="w-4 h-4 mr-2 flex-shrink-0"
              />
              <p>One special character (!@#$%^&amp;*(),.?":{}|&lt;&gt;)</p>
            </li>
          </ul>
        </div>

        <p v-if="submissionError" class="text-red-500 text-sm mt-1 bg-red-50 p-3 rounded-md">
          {{ submissionError }}
        </p>

        <button
          type="submit"
          :disabled="!isPasswordFormValid || loading"
          class="w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useSubmit } from '~/composables/useSubmit';

const emit = defineEmits<{
  (e: 'updated'): void;
  (e: 'error', message: string): void;
}>();

const { $api } = useNuxtApp();

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: '',
});

const showPasswords = reactive({
  current: false,
  new: false,
  confirm: false,
});

const passwordValidation = computed(() => {
  const password = passwordForm.new;
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
});

const isPasswordFormValid = computed(() => {
  return (
    Object.values(passwordValidation.value).every(Boolean)
    && passwordForm.new === passwordForm.confirm
    && passwordForm.current.length > 0
    && passwordForm.new.length > 0
  );
});

const { loading, submissionError, submit: changePassword } = useSubmit(
  data => $api('/profile/change-password', {
    method: 'POST',
    body: data,
  }),
  {
    onSuccess: () => {
      passwordForm.current = '';
      passwordForm.new = '';
      passwordForm.confirm = '';
      Object.keys(showPasswords).forEach(key => (showPasswords[key as keyof typeof showPasswords] = false));
      emit('updated');
    },
    onError: (err) => {
      emit('error', err || 'Failed to update password.');
    },
  },
);

async function submitUpdatePassword() {
  if (!isPasswordFormValid.value) {
    emit('error', 'Please ensure all password requirements are met.');
    return;
  }

  await changePassword({
    current_password: passwordForm.current,
    new_password: passwordForm.new,
    confirm_password: passwordForm.confirm,
  });
}
</script>
