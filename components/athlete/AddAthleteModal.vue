<template>
  <!-- Backdrop -->
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    />
  </transition>

  <!-- Modal Panel -->
  <transition name="slide-down">
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div
        class="bg-white rounded-2xl w-full max-w-[1200px] mx-auto shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <!-- Header -->
        <div
          class="flex justify-between items-center px-8 py-6 border-b bg-gradient-to-r from-red-800 to-red-700 text-white"
        >
          <div>
            <h2 class="text-2xl font-bold">
              Add New Athlete
            </h2>
            <p class="text-red-100 text-sm mt-1">
              Fill in the athlete's information below
            </p>
          </div>
          <button
            class="text-red-100 hover:text-white transition-colors"
            @click="close"
          >
            <Icon name="mdi:close" size="1.8rem" />
          </button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="px-8 py-6">
            <!-- Basic Information -->
            <AppFormSection
              title="Basic Information"
              icon="mdi:account-circle"
              icon-color="text-red-700"
              class="mb-8"
            >
              <template #default>
                <div class="space-y-5">
                  <AppFormField
                    name="name"
                    label="Full Name"
                    placeholder="Enter athlete's full name"
                    icon="mdi:account"
                    icon-color="text-red-600"
                    required
                  />

                  <AppFormField
                    name="preferredName"
                    label="Preferred Name / Nickname"
                    placeholder="How coaches should call this athlete (e.g., 'Jay' for 'Jayson')"
                    icon="mdi:account-heart"
                    icon-color="text-red-600"
                    optional
                    help-text="This helps coaches communicate more easily with the athlete"
                  />

                  <div class="flex space-x-4">
                    <AppFormField
                      name="dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      icon="mdi:calendar"
                      icon-color="text-red-600"
                      required
                    />
                    <AppFormField
                      name="age"
                      label="Age"
                      type="number"
                      icon="mdi:calendar-account"
                      icon-color="text-red-600"
                      readonly
                    />
                  </div>
                </div>

                <AppPhotoUpload
                  :preview-url="previewUrl"
                  :file-input="fileInput"
                  @file-change="onFileChange"
                  @remove-photo="removePhoto"
                  @trigger-file-input="triggerFileInput"
                />
              </template>
            </AppFormSection>

            <!-- Advanced Sections Toggle -->
            <div
              class="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
            >
              <button
                type="button"
                class="w-full flex items-center justify-between text-left hover:bg-white/50 p-3 rounded-lg transition-all duration-200"
                @click="showAdvancedInfo = !showAdvancedInfo"
              >
                <div class="flex items-center">
                  <Icon
                    :name="showAdvancedInfo
                      ? 'mdi:chevron-down'
                      : 'mdi:chevron-right'"
                    size="1.5rem"
                    class="text-red-600 mr-3 transition-transform duration-200"
                  />
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">
                      Additional Information
                    </h3>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ showAdvancedInfo ? 'Hide' : 'Show' }}
                      contact, physical, basketball, and team details
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span
                    class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium"
                  >Optional</span>
                  <Icon name="mdi:information-outline" class="text-gray-400" size="1.2rem" />
                </div>
              </button>
            </div>

            <!-- Advanced Sections -->
            <transition name="expand">
              <div v-if="showAdvancedInfo" class="space-y-8">
                <!-- Contact Information -->
                <AppFormSection
                  title="Contact Information"
                  subtitle="(For emergencies and communication)"
                  icon="mdi:phone-in-talk"
                  icon-color="text-blue-600"
                  variant="blue"
                >
                  <AppFormField
                    name="phoneNumber"
                    label="Phone Number"
                    type="tel"
                    placeholder="Contact number for emergencies"
                    icon="mdi:phone"
                    icon-color="text-blue-600"
                    focus-color="blue"
                  />

                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      <Icon
                        name="mdi:account-alert"
                        class="inline mr-1 text-blue-600"
                      />
                      Emergency Contact
                    </label>
                    <div class="flex space-x-3">
                      <AppFormField
                        name="emergencyContactName"
                        placeholder="Name"
                        focus-color="blue"
                      />
                      <AppFormField
                        name="emergencyContactPhone"
                        type="tel"
                        placeholder="Phone"
                        focus-color="blue"
                      />
                    </div>
                  </div>
                </AppFormSection>

                <!-- Physical Information -->
                <AppFormSection
                  title="Physical Information"
                  subtitle="(Can be updated later during assessments)"
                  icon="mdi:human-male-height"
                  icon-color="text-green-600"
                  variant="green"
                >
                  <AppFormField
                    name="weight"
                    label="Weight (kg)"
                    type="number"
                    placeholder="Enter weight in kilograms"
                    icon="mdi:scale-bathroom"
                    icon-color="text-green-600"
                    min="0"
                    step="0.1"
                    focus-color="green"
                  />

                  <AppFormField
                    name="height"
                    label="Height (cm)"
                    type="number"
                    placeholder="Enter height in centimeters"
                    icon="mdi:ruler"
                    icon-color="text-green-600"
                    min="0"
                    focus-color="green"
                  />
                </AppFormSection>

                <!-- Basketball Information -->
                <AppFormSection
                  title="Basketball Information"
                  subtitle="(For players with experience)"
                  icon="mdi:basketball"
                  icon-color="text-orange-600"
                  variant="orange"
                  :columns="3"
                >
                  <AppFormField
                    name="position"
                    label="Primary Position"
                    type="select"
                    icon="mdi:account-switch"
                    icon-color="text-orange-600"
                    :options="[...POSITIONS]"
                    focus-color="orange"
                  />

                  <AppFormField
                    name="dominantHand"
                    label="Dominant Hand"
                    type="select"
                    icon="mdi:hand-right"
                    icon-color="text-orange-600"
                    :options="[...DOMINANT_HANDS]"
                    focus-color="orange"
                  />

                  <AppFormField
                    name="experienceLevel"
                    label="Experience Level"
                    type="select"
                    icon="mdi:star"
                    icon-color="text-orange-600"
                    :options="[...EXPERIENCE_LEVELS]"
                    focus-color="orange"
                  />
                </AppFormSection>

                <!-- Team Assignment -->
                <AppFormSection
                  title="Team Assignment"
                  subtitle="(Can be assigned later if unsure)"
                  icon="mdi:account-group"
                  icon-color="text-purple-600"
                  variant="purple"
                >
                  <div class="flex items-center space-x-2">
                    <!-- 1) Wrap the <AppFormField> in a flex-1 so it expands -->
                    <div class="flex-1">
                      <AppFormField
                        name="group"
                        label="Team/Group"
                        type="select"
                        icon="mdi:shield-account"
                        icon-color="text-purple-600"
                        :options="[...GROUPS]"
                        focus-color="purple"
                      />
                    </div>

                    <!-- 2) "+" button always on the right -->
                    <button
                      type="button"
                      class="mt-6 h-10 w-10 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      title="Create new team/group"
                      @click="showAddGroupModal = true"
                    >
                      <Icon name="mdi:plus" size="1.2rem" />
                    </button>
                  </div>

                  <AppFormField
                    name="jerseyNumber"
                    label="Jersey Number"
                    type="number"
                    placeholder="Preferred jersey number"
                    icon="mdi:tshirt-crew"
                    icon-color="text-purple-600"
                    min="0"
                    max="99"
                    focus-color="purple"
                  />
                </AppFormSection>

                <!-- Additional Notes -->
                <AppFormSection
                  title="Additional Notes"
                  icon="mdi:note-text"
                  icon-color="text-gray-600"
                  variant="gray"
                  :columns="1"
                >
                  <AppFormField
                    name="notes"
                    label="Coach Notes"
                    type="textarea"
                    placeholder="Any special notes, medical conditions, goals, or other relevant information..."
                    icon="mdi:clipboard-text"
                    icon-color="text-gray-600"
                    :rows="3"
                    focus-color="gray"
                  />
                </AppFormSection>
              </div>
            </transition>
          </div>

          <!-- Action Buttons -->
          <div
            class="px-8 py-6 border-t bg-gray-50 flex justify-between items-center"
          >
            <p class="text-sm text-gray-600">
              <span class="text-red-500">*</span> Required fields
            </p>
            <div class="flex space-x-3">
              <button
                type="button"
                class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                @click="close"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="bg-red-700 text-white px-8 py-3 rounded-lg hover:bg-red-800 transition-colors font-semibold shadow-lg"
              >
                <Icon name="mdi:account-plus" class="inline mr-2" />
                Add Athlete
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </transition>

  <!-- NOTE: Import & use AddGroupModal here -->
  <AddGroupModal
    v-model:show="showAddGroupModal"
    @group-added="handleNewGroup"
  />
</template>

<script setup lang="ts">
import type { Athlete } from '~/types/athlete';
import { ref, watch } from 'vue';
import AddGroupModal from '~/components/athlete/AddGroupModal.vue';
import {
  DOMINANT_HANDS,
  EXPERIENCE_LEVELS,
  GROUPS,
  POSITIONS,
} from '~/types/athlete';

// Props & Emits
const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  'update:show': [val: boolean];
  'athleteAdded': [athlete: Athlete];
}>();

// Initialize composable first to avoid "use before define" error
const {
  handleSubmit,
  resetFormData,
  previewUrl,
  fileInput,
  triggerFileInput,
  onFileChange,
  removePhoto,
  createAthlete,
} = useAthleteForm();

// Local state
const show = ref(props.show);
const showAdvancedInfo = ref(false);
const showAddGroupModal = ref(false);

watch(
  () => props.show,
  (val) => {
    show.value = val;
  },
);

watch(
  () => show.value,
  (val) => {
    emit('update:show', val);
    if (!val) {
      resetFormData();
      showAdvancedInfo.value = false;
    }
  },
);

function close(): void {
  show.value = false;
}

function handleNewGroup(newGroupName: string): void {
  // Remove console.log for production code
  // You might want to add the new group to your GROUPS array here
  // GROUPS.push({ value: newGroupName, label: newGroupName });

  // Close the AddGroupModal after adding the group
  showAddGroupModal.value = false;
}

const submitForm = handleSubmit((formValues) => {
  const newAthlete = createAthlete(formValues);
  emit('athleteAdded', newAthlete);
  close();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: all 0.3s ease-out;
}
.slide-down-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}
.slide-down-leave-active {
  transition: all 0.2s ease-in;
}
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.expand-enter-active {
  transition: all 0.4s ease-out;
  overflow: hidden;
}
.expand-leave-active {
  transition: all 0.3s ease-in;
  overflow: hidden;
}
.expand-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
.expand-enter-to,
.expand-leave-from {
  max-height: 2000px;
  opacity: 1;
  transform: translateY(0);
}

.max-h-\[90vh\]::-webkit-scrollbar {
  width: 6px;
}
.max-h-\[90vh\]::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.max-h-\[90vh\]::-webkit-scrollbar-thumb {
  background: #c53030;
  border-radius: 3px;
}
.max-h-\[90vh\]::-webkit-scrollbar-thumb:hover {
  background: #9b2c2c;
}
</style>
