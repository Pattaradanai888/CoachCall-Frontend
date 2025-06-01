<template>
  <!-- Backdrop -->
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    />
  </transition>

  <!-- Modal Panel -->
  <transition name="slide-down">
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl w-full max-w-[1140px] mx-auto shadow-lg overflow-hidden">
        <div class="flex justify-between items-center px-6 py-4 border-b">
          <h2 class="text-xl font-semibold">
            Add Athlete
          </h2>
          <button class="text-gray-500 hover:text-gray-800" @click="close()">
            <Icon name="mdi:close" size="1.5rem" />
          </button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-6">
            <!-- Left column: Text inputs -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <Icon name="mdi:account" class="inline mr-1" /> Name
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border-gray-400 border h-8 px-2 rounded-lg shadow-md focus:ring-red-800 focus:border-red-800"
                >
              </div>
              <div class="flex space-x-2">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <Icon name="mdi:calendar" class="inline mr-1" /> Date of Birth
                  </label>
                  <input
                    v-model="form.dateOfBirth"
                    type="date"
                    required
                    class="w-full border-gray-400 border h-8 px-2 rounded-lg shadow-md focus:ring-red-800 focus:border-red-800"
                  >
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <Icon name="mdi:calendar-account" class="inline mr-1" /> Age
                  </label>
                  <input
                    v-model.number="form.age"
                    type="number"
                    :readonly="true"
                    class="w-full border-gray-400 border px-2 h-8 bg-gray-100 rounded-lg"
                  >
                </div>
              </div>
              <div class="flex space-x-2">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <Icon name="mdi:scale-bathroom" class="inline mr-1" /> Weight
                  </label>
                  <input
                    v-model.number="form.weight"
                    type="number"
                    placeholder="kg"
                    min="0"
                    required
                    class="w-full border-gray-400 border px-2 h-8 rounded-lg shadow-sm focus:ring-red-800 focus:border-red-800"
                  >
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <Icon name="mdi:ruler" class="inline mr-1" /> Height
                  </label>
                  <input
                    v-model.number="form.height"
                    type="number"
                    placeholder="cm"
                    min="0"
                    required
                    class="w-full border-gray-400 border px-2 h-8 rounded-lg shadow-sm focus:ring-red-800 focus:border-red-800"
                  >
                </div>
              </div>
              <div class="flex space-x-2">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <Icon name="mdi:account-switch" class="inline mr-1" /> Position
                  </label>
                  <input
                    v-model="form.position"
                    type="text"
                    required
                    class="w-full border-gray-400 border px-2 h-8 rounded-lg shadow-sm focus:ring-red-800 focus:border-red-800"
                  >
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <Icon name="mdi:hand-right" class="inline mr-1" /> Dominant Hand
                  </label>
                  <select
                    v-model="form.dominantHand"
                    required
                    class="w-full border-gray-400 border h-8 px-2 rounded-lg shadow-sm focus:ring-red-800 focus:border-red-800"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option>Right</option>
                    <option>Left</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <Icon name="mdi:account-group" class="inline mr-1" /> Group
                </label>
                <select
                  v-model="form.group"
                  required
                  class="w-full border-gray-400 border h-8 px-2 rounded-lg shadow-sm focus:ring-red-800 focus:border-red-800"
                >
                  <option value="" disabled>
                    Select group
                  </option>
                  <option>Team A</option>
                  <option>Team B</option>
                  <option>Under-18</option>
                  <!-- Replace these with real group data when your backend is live -->
                </select>
              </div>
            </div>

            <!-- Right column: Picture upload -->
            <div class="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
              <Icon name="mdi:cloud-upload" size="3rem" class="text-gray-400 mb-2" />
              <p class="text-gray-500 text-sm mb-3">
                Drag &amp; Drop file here
              </p>
              <p class="text-gray-500 text-sm mb-3">
                or
              </p>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
              >
              <button
                type="button"
                class="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900"
                @click="$refs.fileInput.click()"
              >
                Browse File
              </button>
              <div v-if="previewUrl" class="mt-4">
                <NuxtImg
                  :src="previewUrl"
                  alt="Preview"
                  class="h-24 w-24 object-cover rounded-full"
                />
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t flex justify-end">
            <button
              type="submit"
              class="bg-red-800 text-white px-6 py-2 rounded hover:bg-red-900"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps, ref, watch } from 'vue';

interface NewAthleteForm {
  name: string;
  dateOfBirth: string;
  age: number;
  weight: number;
  height: number;
  position: string;
  dominantHand: string;
  group: string;
  profileImageFile: File | null;
  profileImageUrl: string | null;
}

// 1) Accept a prop called `show` (instead of `modelValue`)
const props = defineProps<{
  show: boolean;
}>();

// 2) We will emit `update:show` to close/open the modal, and `added` when a new athlete is created
const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
  (e: 'added', athlete: any): void;
}>();

// Local ref to mirror props.show
const show = ref(props.show);
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
      resetForm();
    }
  },
);

// The form model
const form = ref<NewAthleteForm>({
  name: '',
  dateOfBirth: '',
  age: 0,
  weight: 0,
  height: 0,
  position: '',
  dominantHand: '',
  group: '',
  profileImageFile: null,
  profileImageUrl: null,
});

const previewUrl = ref<string | null>(null);

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    form.value.profileImageFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewUrl.value = ev.target?.result as string;
      form.value.profileImageUrl = previewUrl.value;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Auto‐calculate age whenever dateOfBirth changes
watch(
  () => form.value.dateOfBirth,
  (dob) => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      form.value.age = age;
    }
  },
);

function close() {
  show.value = false;
}

function resetForm() {
  form.value = {
    name: '',
    dateOfBirth: '',
    age: 0,
    weight: 0,
    height: 0,
    position: '',
    dominantHand: '',
    group: '',
    profileImageFile: null,
    profileImageUrl: null,
  };
  previewUrl.value = null;
}

function submitForm() {
  // In a real app, you would:
  // 1. Upload `form.profileImageFile` + the rest of `form` to your FastAPI backend
  // 2. Wait for FastAPI to return the newly created Athlete record (including a real `id` and `profile_image_url`)
  // 3. Emit that new Athlete object so the parent can add it into the list

  // For now, just emit a dummy Athlete object
  const newAthlete = {
    id: Math.floor(Math.random() * 1000) + 100, // placeholder ID
    name: form.value.name,
    position: form.value.position,
    age: form.value.age,
    height: form.value.height,
    weight: form.value.weight,
    dominantHand: form.value.dominantHand,
    dateOfBirth: form.value.dateOfBirth,
    profileImageUrl: form.value.profileImageUrl,
    group: form.value.group,
    totalPowerRate: 0,
    developmentRate: 0,
    lastAssessmentDate: null,
    skillScores: [
      { name: 'Shooting', value: 0 },
      { name: 'Dribbling', value: 0 },
      { name: 'Defense', value: 0 },
      { name: 'Athleticism', value: 0 },
      { name: 'Basketball IQ', value: 0 },
      { name: 'Rebounding', value: 0 },
    ],
  };

  emit('added', newAthlete);
  close();
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: transform 0.2s ease-out;
}
.slide-down-enter-from {
  transform: translateY(-10%);
}
.slide-down-leave-active {
  transition: transform 0.2s ease-in;
}
.slide-down-leave-to {
  transform: translateY(-10%);
}
</style>
