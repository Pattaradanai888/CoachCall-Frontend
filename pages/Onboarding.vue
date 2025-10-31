<!-- pages/Onboarding.vue -->
<template>
  <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-screen">
    <div class="w-full mx-7 lg:mx-0 mt-[3rem]">
      <h1 class="text-2xl font-bold">
        Welcome to CoachCall
      </h1>
      <p class="text-gray-600">
        Let's set up your account in just a few steps.
      </p>
      <div class="flex justify-center mb-6 mt-2">
        <div class="w-full max-w-4xl">
          <StageProgressBar :labels="steps" :current-step="currentStep" />
        </div>
      </div>

      <div class=" bg-white shadow-md p-4 rounded-md mt-5">
        <div class="mt-8">
          <ProfilePictureTab
            v-show="currentStep === 1"
            :current-profile-image-url="auth.user?.profile?.profile_image_url"
            @error="message => triggerNotification('Error', message, 'error')"
            @image-updated="() => triggerNotification('Success', 'Profile picture updated!', 'success')"
            @image-deleted="() => triggerNotification('Success', 'Profile picture removed.', 'success')"
          />
        </div>

        <div class="mt-8 flex justify-center mx-2 pb-10">
          <div class="flex justify-between w-full">
            <button v-if="currentStep > 1" class="w-32 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors" @click="goToPreviousStep">
              Previous
            </button>
            <div v-else class="w-32" />

            <button v-if="currentStep < totalSteps" class="w-32 bg-[#9C1313] text-white font-bold py-2 rounded-lg hover:bg-[#7A0F0F] shadow-lg transition-colors" @click="goToNextStep">
              Next
            </button>

            <button
              v-else
              class="w-32 font-bold py-2 rounded-lg shadow-lg transition-colors bg-green-600 text-white hover:bg-green-700"
              @click="finishSetup"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>

    <NotificationModal
      :show="showNotification"
      :title="notificationTitle"
      :message="notificationMessage"
      :type="notificationType"
      @close="closeNotification"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from '#app';
import { ref } from 'vue';
import NotificationModal from '~/components/NotificationModal.vue';
import StageProgressBar from '~/components/StageProgressBar.vue';
import { useAuthStore } from '~/stores/auth';

const router = useRouter();
const auth = useAuthStore();
const { $api } = useNuxtApp();

const currentStep = ref(1);
const steps = ['Upload Profile'];
const totalSteps = steps.length;

async function goToNextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
}

function goToPreviousStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

async function finishSetup() {
  try {
    await $api('/profile/onboarding-complete', { method: 'PUT' });

    if (auth.user?.profile) {
      auth.user.profile.has_completed_onboarding = true;
    }

    triggerNotification(
      'Setup Complete!',
      'You will now be redirected to your dashboard.',
      'success',
      () => router.push('/dashboard'),
    );
  }
  catch (error) {
    console.error('Failed to finalize setup:', error);
    triggerNotification('Error', 'Could not finalize your setup. Please try again.', 'error');
  }
}

const showNotification = ref(false);
const notificationTitle = ref('');
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');
const onNotificationClose = ref<(() => void) | null>(null);

function triggerNotification(title: string, message: string, type: 'success' | 'error' = 'success', postCloseAction: (() => void) | null = null) {
  notificationTitle.value = title;
  notificationMessage.value = message;
  notificationType.value = type;
  onNotificationClose.value = postCloseAction;
  showNotification.value = true;
}

function closeNotification() {
  showNotification.value = false;
  if (onNotificationClose.value) {
    onNotificationClose.value();
    onNotificationClose.value = null;
  }
}
</script>