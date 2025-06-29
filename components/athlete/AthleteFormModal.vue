<!-- components/athlete/AthleteFormModal.vue -->
<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="close" />
  </transition>

  <transition name="slide-down">
    <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 px-4" @click.self="close">
      <div class="bg-white rounded-2xl w-full max-w-[1200px] mx-auto shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" @click.stop>
        <!-- Error State -->
        <div v-if="submissionError" class="flex items-center justify-center py-4 px-8 text-white bg-red-600">
          <Icon name="mdi:alert-circle-outline" size="1.5rem" class="mr-2" />
          <span>{{ submissionError }}</span>
          <button class="ml-auto text-white hover:text-red-100" @click="submissionError = null">
            <Icon name="mdi:close" size="1.2rem" />
          </button>
        </div>

        <!-- Form Content -->
        <div>
          <!-- Header -->
          <div class="flex justify-between items-center px-8 py-6 border-b bg-gradient-to-r from-red-800 to-red-700 text-white">
            <div>
              <h2 class="text-2xl font-bold">
                {{ title }}
              </h2><p class="text-red-100 text-sm mt-1">
                Fill in the athlete's information below
              </p>
            </div>
            <button class="text-red-100 hover:text-white transition-colors" @click="close">
              <Icon name="mdi:close" size="1.8rem" />
            </button>
          </div>

          <form @submit.prevent="submitForm">
            <div class="px-8 py-6">
              <AppFormSection title="Basic Information" icon="mdi:account-circle" icon-color="text-red-700" class="mb-8">
                <template #default>
                  <div class="space-y-5">
                    <AppFormField name="name" label="Full Name" placeholder="Enter athlete's full name" icon="mdi:account" icon-color="text-red-600" required />
                    <AppFormField name="preferredName" label="Preferred Name / Nickname" placeholder="How coaches should call this athlete" icon="mdi:account-heart" icon-color="text-red-600" optional help-text="This helps coaches communicate more easily with the athlete" />
                    <div class="flex space-x-4">
                      <AppFormField class="flex-1" name="dateOfBirth" label="Date of Birth" type="date" icon="mdi:calendar" icon-color="text-red-600" required />
                      <AppFormField class="flex-1" name="age" label="Age" type="number" icon="mdi:calendar-account" icon-color="text-red-600" readonly />
                    </div>
                  </div>
                  <AppPhotoUpload :preview-url="previewUrl" @file-change="onFileChange" @remove-photo="onRemovePhoto" />
                </template>
              </AppFormSection>

              <div class="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <button type="button" class="w-full flex items-center justify-between text-left hover:bg-white/50 p-3 rounded-lg transition-all duration-200" :aria-expanded="showAdvancedInfo" aria-controls="advanced-info-section" @click="toggleAdvancedSection">
                  <div class="flex items-center">
                    <Icon :name="showAdvancedInfo ? 'mdi:chevron-down' : 'mdi:chevron-right'" size="1.5rem" class="text-red-600 mr-3 transition-transform duration-200" :class="{ 'rotate-90': showAdvancedInfo }" />
                    <div>
                      <h3 class="text-lg font-semibold text-gray-800">
                        Additional Information
                      </h3><p class="text-sm text-gray-600 mt-1">
                        {{ showAdvancedInfo ? 'Hide' : 'Show' }} contact, physical, basketball, and team details
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <transition name="expand">
                <div v-if="showAdvancedInfo" id="advanced-info-section" class="space-y-8">
                  <AppFormSection title="Contact Information" subtitle="(For emergencies and communication)" icon="mdi:phone-in-talk" icon-color="text-blue-600" variant="blue">
                    <AppFormField name="phoneNumber" label="Phone Number" type="tel" placeholder="Contact number for emergencies" icon="mdi:phone" icon-color="text-blue-600" focus-color="blue" />
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2"><Icon name="mdi:account-alert" class="inline mr-1 text-blue-600" /> Emergency Contact</label>
                      <div class="flex space-x-3">
                        <AppFormField class="flex-1" name="emergencyContactName" placeholder="Name" focus-color="blue" />
                        <AppFormField class="flex-1" name="emergencyContactPhone" type="tel" placeholder="Phone" focus-color="blue" />
                      </div>
                    </div>
                  </AppFormSection>

                  <AppFormSection title="Physical Information" subtitle="(Can be updated later during assessments)" icon="mdi:human-male-height" icon-color="text-green-600" variant="green">
                    <AppFormField name="weight" label="Weight (kg)" type="number" placeholder="Enter weight in kilograms" icon="mdi:scale-bathroom" icon-color="text-green-600" min="0" step="0.1" focus-color="green" />
                    <AppFormField name="height" label="Height (cm)" type="number" placeholder="Enter height in centimeters" icon="mdi:ruler" icon-color="text-green-600" min="0" focus-color="green" />
                  </AppFormSection>

                  <AppFormSection title="Basketball Information" subtitle="(For players with experience)" icon="mdi:basketball" icon-color="text-orange-600" variant="orange" :columns="3">
                    <div class="flex items-start space-x-2">
                      <AppMultiSelect
                        name="positionIds"
                        label="Positions"
                        icon="mdi:account-switch"
                        icon-color="text-orange-600"
                        :options="positionOptions"
                        placeholder="Select positions..."
                        focus-color="orange"
                        class="flex-1"
                      />
                      <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors mt-7" title="Manage all positions" @click="showManagePositionsModal = true">
                        <Icon name="mdi:cog" size="1.3rem" />
                      </button>
                    </div>
                    <AppFormField name="dominantHand" label="Dominant Hand" type="select" icon="mdi:hand-right" icon-color="text-orange-600" :options="DOMINANT_HANDS" focus-color="orange" />
                    <AppFormField name="experienceLevelId" label="Experience Level" type="select" icon="mdi:star" icon-color="text-orange-600" :options="EXPERIENCE_LEVELS" focus-color="orange" />
                  </AppFormSection>

                  <AppFormSection title="Team Assignment" subtitle="(Can be assigned later if unsure)" icon="mdi:account-group" icon-color="text-purple-600" variant="purple">
                    <div class="flex items-start space-x-2">
                      <AppMultiSelect
                        name="groupIds"
                        label="Team/Group"
                        icon="mdi:shield-account"
                        icon-color="text-purple-600"
                        :options="groupOptions"
                        placeholder="Select teams/groups..."
                        focus-color="purple"
                        class="flex-1"
                      />
                      <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors mt-7" title="Manage all groups" @click="showManageGroupsModal = true">
                        <Icon name="mdi:cog" size="1.3rem" />
                      </button>
                    </div>
                    <AppFormField name="jerseyNumber" label="Jersey Number" type="number" placeholder="Preferred jersey number" icon="mdi:tshirt-crew" icon-color="text-purple-600" min="0" max="99" focus-color="purple" />
                  </AppFormSection>

                  <AppFormSection title="Additional Notes" icon="mdi:note-text" icon-color="text-gray-600" variant="gray" :columns="1">
                    <AppFormField name="notes" label="Coach Notes" type="textarea" placeholder="Any special notes, medical conditions, goals, or other relevant information..." icon="mdi:clipboard-text" icon-color="text-gray-600" :rows="3" focus-color="gray" />
                  </AppFormSection>
                </div>
              </transition>
            </div>

            <div class="px-8 py-6 border-t bg-gray-50 flex justify-between items-center">
              <p class="text-sm text-gray-600">
                <span class="text-red-500">*</span> Required fields
              </p>
              <div class="flex space-x-3">
                <button type="button" class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" @click="close">
                  Cancel
                </button>
                <button v-if="isEditMode" type="button" class="px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium" @click="resetFormToOriginal">
                  Reset
                </button>
                <button type="submit" class="bg-red-700 text-white px-8 py-3 rounded-lg hover:bg-red-800 transition-colors font-semibold shadow-lg disabled:opacity-50" :disabled="isSubmitting">
                  <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" class="inline mr-2" />
                  <Icon v-else :name="isEditMode ? 'mdi:content-save' : 'mdi:account-plus'" class="inline mr-2" />
                  {{ submitButtonText }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>

  <ClientOnly>
    <ManageTagsModal
      v-model:show="showManageGroupsModal"
      title="Manage Groups"
      icon="mdi:account-group"
      color="indigo"
      api-endpoint="/athlete/groups"
      entity-name="Group"
      @tags-updated="onGroupsUpdated"
    />
    <ManageTagsModal
      v-model:show="showManagePositionsModal"
      title="Manage Positions"
      icon="mdi:account-switch"
      color="orange"
      api-endpoint="/athlete/positions"
      entity-name="Position"
      @tags-updated="onPositionsUpdated"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { AthleteDetail, Group, Position } from '~/types/athlete';
import AppMultiSelect from '~/components/AppMultiSelect.vue';
import ManageTagsModal from '~/components/athlete/ManageTagsModal.vue';
import { useAthleteForm } from '~/composables/useAthleteForm';
import { DOMINANT_HANDS, EXPERIENCE_LEVELS } from '~/types/athlete';

const props = defineProps<{
  show: boolean;
  athlete?: AthleteDetail | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
  (e: 'submitted'): void; // The only event needed for the parent
}>();

const athleteRef = computed(() => props.athlete ?? null);

const {
  values,
  isEditMode,
  isSubmitting,
  submissionError,
  submit,
  resetForm,
  previewUrl,
  handlePhotoUpload,
  handlePhotoRemove,
  setFieldValue,
} = useAthleteForm(athleteRef);

const { $api } = useNuxtApp();

const showManageGroupsModal = ref(false);
const showManagePositionsModal = ref(false);
const showAdvancedInfo = ref(false);

const groupOptions = ref<Array<{ value: string | number; label: string }>>([]);
const positionOptions = ref<Array<{ value: string | number; label: string }>>([]);

const isLoadingGroups = ref(false);
const isLoadingPositions = ref(false);

const title = computed(() => (isEditMode.value ? 'Edit Athlete' : 'Add New Athlete'));
const submitButtonText = computed(() => (isSubmitting.value ? (isEditMode.value ? 'Saving...' : 'Adding...') : (isEditMode.value ? 'Save Changes' : 'Add Athlete')));

async function loadGroups() {
  isLoadingGroups.value = true;
  try {
    const groups = await $api<Group[]>('/athlete/groups');
    groupOptions.value = groups.map(g => ({ value: g.id.toString(), label: g.name }));
  }
  catch (error) {
    console.error('Failed to load groups:', error);
    groupOptions.value = [];
  }
  finally {
    isLoadingGroups.value = false;
  }
}

async function loadPositions() {
  isLoadingPositions.value = true;
  try {
    const positions = await $api<Position[]>('/athlete/positions');
    positionOptions.value = positions.map(p => ({ value: p.id.toString(), label: p.name }));
  }
  catch (error) {
    console.error('Failed to load positions:', error);
    positionOptions.value = [];
  }
  finally {
    isLoadingPositions.value = false;
  }
}

async function onGroupsUpdated() {
  const previouslySelectedGroupIds = [...(values.groupIds || [])];
  await loadGroups();
  const validGroupIds = previouslySelectedGroupIds.filter(id =>
    groupOptions.value.some(option => option.value === id),
  );
  setFieldValue('groupIds', validGroupIds);
}

async function onPositionsUpdated() {
  const previouslySelectedPositionIds = [...(values.positionIds || [])];
  await loadPositions();
  const validPositionIds = previouslySelectedPositionIds.filter(id =>
    positionOptions.value.some(option => option.value === id),
  );
  setFieldValue('positionIds', validPositionIds);
}

function toggleAdvancedSection() {
  showAdvancedInfo.value = !showAdvancedInfo.value;
}
function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file)
    handlePhotoUpload(file);
}
function onRemovePhoto() {
  handlePhotoRemove();
}

async function submitForm() {
  const success = await submit();
  if (success) {
    // Announce success to the parent. The parent will refresh the data.
    emit('submitted');
    close();
  }
}

function close() {
  showAdvancedInfo.value = false;
  emit('update:show', false);
}

function resetFormToOriginal() {
  resetForm();
}

watch(() => props.show, async (isVisible) => {
  if (isVisible) {
    if (isEditMode.value) {
      showAdvancedInfo.value = true;
    }
    else {
      showAdvancedInfo.value = false;
    }

    await Promise.all([
      loadGroups(),
      loadPositions(),
    ]);

    resetForm();
  }
}, { immediate: true });
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 1500px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
