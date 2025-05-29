<template>
  <div class="max-w-lg mx-auto">
    <div v-motion-slide-visible-once-bottom class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div class="flex items-center mb-6">
        <Icon name="mdi:account-edit" class="w-6 h-6 text-gray-700 mr-2 flex-shrink-0" />
        <h3 class="text-xl font-semibold text-gray-900">Display Name</h3>
      </div>
      <p class="text-gray-600 mb-6 text-sm sm:text-base">
        Update your display name that will be shown to other users.
      </p>

      <form class="space-y-6" @submit.prevent="submitUpdateDisplayName">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> Current Display Name </label>
          <div class="relative">
            <input
              :value="initialFullname"
              type="text"
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 pr-10"
            />
            <Icon name="mdi:check" class="absolute right-3 top-2.5 w-5 h-5 text-green-500" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> New Display Name </label>
          <input
            v-model="newFullname"
            type="text"
            placeholder="Enter new display name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            @input="validateFullname"
          />
          <p v-if="fullnameError" class="text-red-500 text-sm mt-1">
            {{ fullnameError }}
          </p>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 class="font-medium text-gray-900 mb-2">Requirements:</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• 2-50 characters long</li>
            <li>• Letters, numbers, spaces, hyphens, underscores, and periods only</li>
            <li>• Cannot be empty or contain only spaces</li>
          </ul>
        </div>

        <button
          type="submit"
          :disabled="loading || !isFullnameValid || newFullname === initialFullname"
          class="w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Updating...' : 'Update Display Name' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const props = defineProps<{
  initialFullname: string;
}>();

const emit = defineEmits<{
  (e: 'updated' | 'error', newName: string): void;
}>();

const auth = useAuthStore();
const { $api } = useNuxtApp();

const newFullname = ref('');
const loading = ref(false);
const fullnameError = ref<string | null>(null);

onMounted(() => {
  // newFullname.value = props.initialFullname; // Optionally prefill or keep it empty
});

watch(
  () => props.initialFullname,
  () => {
    // If the prop changes (e.g. after successful update), reset error and potentially newFullname
    fullnameError.value = null;
    // newFullname.value = ''; // Or keep as is if user is mid-typing
  }
);

const isFullnameValid = computed(() => {
  const name = newFullname.value.trim();
  return name.length >= 2 && name.length <= 50 && /^[a-zA-Z0-9 ._-]*$/.test(name) && name !== '';
});

const validateFullname = () => {
  const name = newFullname.value.trim();
  if (name === '') {
    fullnameError.value = 'Display name cannot be empty.';
    return false;
  }
  if (name.length < 2 || name.length > 50) {
    fullnameError.value = 'Must be 2-50 characters.';
    return false;
  }
  if (!/^[a-zA-Z0-9 ._-]*$/.test(name)) {
    fullnameError.value = 'Contains invalid characters.';
    return false;
  }
  if (name === props.initialFullname) {
    fullnameError.value = 'New name must be different.';
    // This case is handled by button disabled state, but error message is good.
    return true; // Still "valid" format-wise, just not different
  }
  fullnameError.value = null;
  return true;
};

const submitUpdateDisplayName = async () => {
  if (!validateFullname() || newFullname.value.trim() === props.initialFullname) {
    if (newFullname.value.trim() === props.initialFullname) {
      fullnameError.value = 'New display name must be different from current.';
    }
    return;
  }

  loading.value = true;
  try {
    const response = await $api<{
      fullname: string;
      id: number;
      email: string;
      profile_image_url?: string | null;
    }>('/profile/me', {
      method: 'PUT',
      body: { fullname: newFullname.value.trim() },
    });

    auth.setUserData(response); // Update Pinia store

    emit('updated', response.fullname);
    newFullname.value = ''; // Reset form field after successful update
    fullnameError.value = null;
  } catch {
    const message = 'Failed to update display name';
    emit('error', message);
    fullnameError.value = message;
  } finally {
    loading.value = false;
  }
};
</script>
