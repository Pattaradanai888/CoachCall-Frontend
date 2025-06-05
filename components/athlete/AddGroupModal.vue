<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-75 flex items-center justify-center p-4"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-md sm:w-full"
    >
      <div class="px-6 py-4">
        <div class="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Add New Group
          </h3>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 focus:outline-none"
            @click="closeModal"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <form novalidate @submit.prevent="onSubmit">
        <div class="px-6 py-4">
          <AppFormField
            v-model="values.newGroupName"
            name="newGroupName"
            label="Group Name"
            placeholder="Enter group name"
            :error-message="groupNameError || veeErrors.newGroupName?.toString()"
            required
            focus-color="indigo"
          />
        </div>
        <div class="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="submit"
            :disabled="!!groupNameError || !values.newGroupName?.trim()"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            Add Group
          </button>
          <button
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            @click="closeModal"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref, watch } from 'vue';
import { z } from 'zod';
import AppFormField from '~/components/AppFormField.vue';

// Props & Emits with proper typing
defineProps<{ show: boolean }>();
const emit = defineEmits<{
  'update:show': (val: boolean) => void;
  'group-added': (groupName: string) => void;
}>();

// Zod schema & VeeValidate bindings
const groupSchema = toTypedSchema(
  z.object({
    newGroupName: z.string().min(1, 'Group name is required'),
  }),
);

const {
  handleSubmit: veeSubmit,
  errors: veeErrors,
  resetForm: resetVeeForm,
  values,
} = useForm({
  validationSchema: groupSchema,
  initialValues: { newGroupName: '' },
});

const groupNameError = ref<string>();

// Watch for changes in group name for validation
watch(
  () => values.newGroupName,
  (val) => {
    if (!val?.trim()) {
      groupNameError.value = 'Group name is required.';
    }
    else {
      groupNameError.value = undefined;
    }
  },
);

function closeModal(): void {
  resetVeeForm();
  groupNameError.value = undefined;
  emit('update:show', false);
}

const onSubmit = veeSubmit(() => {
  const name = values.newGroupName?.trim();
  if (name) {
    emit('group-added', name);
    closeModal();
  }
});
</script>
