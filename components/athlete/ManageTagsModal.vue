<!-- components/athlete/ManageTagsModal.vue -->
<template>
  <transition name="modal-backdrop">
    <div
      v-if="show"
      class="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-75 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <transition name="modal-content">
        <div
          v-if="show"
          class="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-md sm:w-full"
        >
          <div class="px-6 py-4">
            <div class="flex justify-between items-center pb-3 border-b border-gray-200">
              <div class="flex items-center space-x-2">
                <Icon :name="icon" :class="`text-${color}-600`" size="1.5rem" />
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ title }}
                </h3>
              </div>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                @click="closeModal"
              >
                <Icon name="mdi:close" size="1.5rem" />
              </button>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="px-6 py-2 text-sm text-red-700 bg-red-50 border-l-4 border-red-400 p-4">
            {{ error }}
          </div>

          <!-- Item List -->
          <div class="px-6 py-4 max-h-60 overflow-y-auto">
            <p v-if="isLoading" class="text-gray-500 text-sm">
              <Icon name="svg-spinners:ring-resize" class="inline-block mr-2" /> Loading {{ entityName.toLowerCase() }}s...
            </p>
            <p v-else-if="items.length === 0" class="text-gray-500 text-sm">
              No {{ entityName.toLowerCase() }}s created yet. Add one below.
            </p>
            <ul v-else class="space-y-2">
              <li
                v-for="item in items"
                :key="item.id"
                class="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <span class="text-gray-800 font-medium">{{ item.name }}</span>
                <button
                  type="button"
                  :title="`Delete ${entityName.toLowerCase()}`"
                  class="text-red-500 hover:text-red-700 transition-colors"
                  @click="handleDelete(item.id, item.name)"
                >
                  <Icon name="mdi:trash-can-outline" size="1.2rem" />
                </button>
              </li>
            </ul>
          </div>

          <!-- Add New Item Form -->
          <form novalidate class="border-t border-gray-200" @submit.prevent="onAddItemSubmit">
            <div class="px-6 py-4">
              <label :for="`new-${entityName.toLowerCase()}-name`" class="block text-sm font-semibold text-gray-700 mb-2">Add New {{ entityName }}</label>
              <div class="flex items-stretch space-x-2">
                <AppFormField
                  :name="`new${entityName}Name`"
                  :placeholder="`Enter new ${entityName.toLowerCase()} name`"
                  class="flex-grow"
                  :focus-color="color"
                />
                <button
                  type="submit"
                  :class="`bg-${color}-600 hover:bg-${color}-700 focus:ring-${color}-500`"
                  class="flex-shrink-0 inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#9C1313] hover:bg-[#7A0F0F] focus:ring-[#9C1313]"
                  :disabled="!meta.valid || isSubmitting"
                >
                  <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" size="1.2rem" />
                  <Icon v-else name="mdi:plus" size="1.2rem" />
                </button>
              </div>
            </div>
          </form>

          <div class="bg-gray-50 px-6 py-3 text-right rounded-b-lg">
            <button
              type="button"
              :class="`focus:ring-${color}-500`"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm"
              @click="closeModal"
            >
              Done
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

interface Item {
  id: number;
  name: string;
}

// Props
const props = defineProps<{
  show: boolean;
  title: string;
  icon: string;
  color: string;
  apiEndpoint: string;
  entityName: string;
}>();

// Emits
const emit = defineEmits<{
  'update:show': (val: boolean) => void;
  'tags-updated': () => void;
}>();

// State
const { $api } = useNuxtApp();
const items = ref<Item[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref<string | null>(null);
let hasChanges = false;

// Dynamic validation schema
const fieldName = `new${props.entityName}Name`;
const validationSchema = toTypedSchema(
  z.object({
    [fieldName]: z.string().min(2, 'Must be at least 2 characters'),
  }),
);

const { handleSubmit, resetForm, meta } = useForm({
  validationSchema,
  initialValues: { [fieldName]: '' },
});

// API Functions
async function fetchItems() {
  isLoading.value = true;
  error.value = null;
  try {
    items.value = await $api<Item[]>(props.apiEndpoint);
  }
  catch (apiError: any) {
    error.value = apiError.data?.detail || `Failed to load ${props.entityName.toLowerCase()}s.`;
  }
  finally {
    isLoading.value = false;
  }
}

const onAddItemSubmit = handleSubmit(async (values) => {
  if (isSubmitting.value)
    return;
  isSubmitting.value = true;
  error.value = null;
  try {
    await $api(props.apiEndpoint, {
      method: 'POST',
      body: { name: values[fieldName].trim() },
    });
    resetForm();
    hasChanges = true;
    await fetchItems();
  }
  catch (apiError: any) {
    error.value = apiError.data?.detail || `Failed to create ${props.entityName.toLowerCase()}.`;
  }
  finally {
    isSubmitting.value = false;
  }
});

async function handleDelete(itemId: number, itemName: string) {
  if (!confirm(`Are you sure you want to delete the ${props.entityName.toLowerCase()} "${itemName}"?`))
    return;
  error.value = null;
  try {
    await $api(`${props.apiEndpoint}/${itemId}`, { method: 'DELETE' });
    hasChanges = true;
    await fetchItems();
  }
  catch (apiError: any) {
    error.value = apiError.data?.detail || `Failed to delete ${props.entityName.toLowerCase()}.`;
  }
}

function closeModal() {
  if (hasChanges) {
    emit('tags-updated');
  }
  emit('update:show', false);
  resetForm();
  error.value = null;
  hasChanges = false;
}

watch(() => props.show, (isVisible) => {
  if (isVisible)
    fetchItems();
});
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}
.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
