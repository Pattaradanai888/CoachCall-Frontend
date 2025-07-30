<template>
  <div>
    <ConfirmModal
      :show="isModalVisible"
      :title="modalTitle"
      :message="modalMessage"
      confirm-text="Go to Login"
      cancel-text="Close"
      @confirm="handleModalConfirm"
      @close="handleModalClose"
    />

    <div
      class="bg-white rounded-xl shadow-lg flex max-w-[1140px] w-full mx-auto h-[600px] max-h-[80vh] my-10 mt-[6.5rem]"
    >
      <div class="relative w-1/2 rounded-l-xl overflow-hidden">
        <NuxtImg
          src="/auth-bg.png"
          alt="Basketball player"
          class="object-cover w-full h-full"
          fetchpriority="high"
          quality="80"
          format="webp"
          width="570"
          height="600"
        />
        <div class="absolute inset-0 bg-black bg-opacity-30 flex items-end p-6">
          <div class="text-white">
            <h2 class="text-2xl font-bold">
              ELEVATE YOUR GAME
            </h2>
            <p class="text-sm mt-1">
              Connect with coaches and players to take your basketball skills to the next level
            </p>
          </div>
        </div>
      </div>

      <div v-motion-pop :delay="100" class="w-1/2 p-12 flex flex-col justify-center">
        <h2 class="text-2xl font-bold mb-2 text-center">
          Create New <span class="text-red-800">Password</span>
        </h2>
        <p class="text-gray-600 mb-4 text-center">
          Your new password must be different from previously used passwords.
        </p>

        <form class="space-y-3" @submit.prevent="onSubmit">
          <div v-if="resetStore.error" class="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            {{ resetStore.error }}
          </div>

          <div class="flex flex-col">
            <div class="relative flex items-center border rounded-lg px-3 py-2 shadow-md">
              <Icon name="mdi:password" size="1.5rem" style="color: black" class="mr-2" />
              <input
                id="password"
                v-model="password"
                :type="showPasswords.password ? 'text' : 'password'"
                placeholder="New Password"
                autocomplete="new-password"
                class="w-full outline-none pr-10"
              >
              <button type="button" class="absolute right-3" @click="showPasswords.password = !showPasswords.password">
                <Icon :name="showPasswords.password ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
              </button>
            </div>
            <p v-if="errors.password" class="text-sm text-red-600 mt-1">
              {{ errors.password }}
            </p>
          </div>

          <div class="flex flex-col">
            <div class="relative flex items-center border rounded-lg px-3 py-2 shadow-md">
              <Icon name="mdi:password" size="1.5rem" style="color: black" class="mr-2" />
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showPasswords.confirm ? 'text' : 'password'"
                placeholder="Confirm New Password"
                autocomplete="new-password"
                class="w-full outline-none pr-10"
              >
              <button type="button" class="absolute right-3" @click="showPasswords.confirm = !showPasswords.confirm">
                <Icon :name="showPasswords.confirm ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="text-sm text-red-600 mt-1">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 mb-2">
              Password Requirements:
            </h4>
            <ul class="text-sm space-y-1">
              <li :class="passwordValidation.length ? 'text-green-600' : 'text-red-600'" class="flex items-center">
                <Icon :name="passwordValidation.length ? 'mdi:check' : 'mdi:close'" class="w-4 h-4 mr-2 flex-shrink-0" />
                At least 8 characters
              </li>
              <li :class="passwordValidation.lowercase ? 'text-green-600' : 'text-red-600'" class="flex items-center">
                <Icon :name="passwordValidation.lowercase ? 'mdi:check' : 'mdi:close'" class="w-4 h-4 mr-2 flex-shrink-0" />
                One lowercase letter
              </li>
              <li :class="passwordValidation.uppercase ? 'text-green-600' : 'text-red-600'" class="flex items-center">
                <Icon :name="passwordValidation.uppercase ? 'mdi:check' : 'mdi:close'" class="w-4 h-4 mr-2 flex-shrink-0" />
                One uppercase letter
              </li>
              <li :class="passwordValidation.number ? 'text-green-600' : 'text-red-600'" class="flex items-center">
                <Icon :name="passwordValidation.number ? 'mdi:check' : 'mdi:close'" class="w-4 h-4 mr-2 flex-shrink-0" />
                One number
              </li>
              <li :class="passwordValidation.special ? 'text-green-600' : 'text-red-600'" class="flex items-center">
                <Icon :name="passwordValidation.special ? 'mdi:check' : 'mdi:close'" class="w-4 h-4 mr-2 flex-shrink-0" />
                One special character
              </li>
            </ul>
          </div>

          <button
            type="submit"
            :disabled="resetStore.isLoading"
            class="w-full bg-red-800 text-white py-2 rounded-lg hover:bg-red-900 transition mt-5 disabled:opacity-50"
          >
            {{ resetStore.isLoading ? 'Resetting Password...' : 'Reset Password' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { z } from 'zod';
import ConfirmModal from '~/components/ConfirmModal.vue';
import { usePasswordResetStore } from '~/stores/passwordReset';

const isModalVisible = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

const resetPasswordSchema = toTypedSchema(
  z.object({
    password: z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/).regex(/[!@#$%^&*(),.?":{}|<>]/),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords don\'t match',
    path: ['confirmPassword'],
  }),
);

const { handleSubmit, errors } = useForm({ validationSchema: resetPasswordSchema });
const { value: password } = useField<string>('password');
const { value: confirmPassword } = useField<string>('confirmPassword');
const resetStore = usePasswordResetStore();
const showPasswords = reactive({ password: false, confirm: false });

const passwordValidation = computed(() => {
  const pwd = password.value || '';
  return {
    length: pwd.length >= 8,
    lowercase: /[a-z]/.test(pwd),
    uppercase: /[A-Z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  };
});

onMounted(() => {
  if (!resetStore.verifiedOtp) {
    navigateTo('/reset-password');
  }
});

const onSubmit = handleSubmit(async (values) => {
  const success = await resetStore.resetPassword(values.password);
  if (success) {
    modalTitle.value = 'Password Reset Successfully';
    modalMessage.value = 'Your password has been changed. You can now log in with your new credentials.';
    isModalVisible.value = true;
  }
});

function handleModalConfirm() {
  isModalVisible.value = false;
  navigateTo('/login');
}

function handleModalClose() {
  isModalVisible.value = false;
  navigateTo('/login');
}
</script>
