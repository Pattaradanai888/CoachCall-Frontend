<template>
  <!-- Backdrop -->
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      @click="emitClose"
    />
  </transition>

  <!-- Modal Panel -->
  <transition name="slide-down">
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div
        class="bg-white rounded-2xl w-full max-w-[1140px] mx-auto shadow-lg flex flex-col max-h-[90vh] overflow-hidden"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-[#9C1313] to-red-600 px-6 py-4 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">
                Add Athletes
              </h2>
              <p class="text-red-100 text-sm mt-1">
                Add athletes to {{ course?.title || 'this course' }}
              </p>
            </div>
            <button
              class="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              @click="emitClose"
            >
              <Icon name="mdi:close-thick" size="2rem" />
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto bg-gray-50">
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="flex mb-4">
              <div class="relative w-full shadow-lg">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search Athletes by name or position"
                  class="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:border-[#9C1313] transition"
                >
                <Icon
                  name="mdi:magnify"
                  size="1.25rem"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
              </div>
              <button
                class="flex items-center justify-center shadow-lg p-2 border-gray-300 border rounded-lg ml-2 hover:bg-gray-100 transition"
                @click="toggleFilter"
              >
                <Icon name="mdi:filter-variant" size="1.25rem" class="text-gray-600" />
              </button>
            </div>

            <!-- Enhanced Filter Dropdown -->
            <transition name="fade">
              <div v-if="showFilter" class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Position Filter -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <label v-for="position in availablePositions" :key="position" class="flex items-center text-sm">
                        <input v-model="selectedPositions" type="checkbox" :value="position" class="mr-2 w-4 h-4 text-[#9C1313] border-gray-300 rounded focus:ring-[#9C1313]">
                        <span class="text-gray-700">{{ position }}</span>
                      </label>
                    </div>
                  </div>

                  <!-- Athlete Group Filter -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Athlete Group</label>
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <label v-for="group in availableGroups" :key="group" class="flex items-center text-sm">
                        <input v-model="selectedGroups" type="checkbox" :value="group" class="mr-2 w-4 h-4 text-[#9C1313] border-gray-300 rounded focus:ring-[#9C1313]">
                        <span class="text-gray-700">{{ group }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Filter Actions -->
                <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <button class="text-sm text-gray-600 hover:text-gray-800 underline" @click="clearFilters">
                    Clear All Filters
                  </button>
                  <div class="text-sm text-gray-600">
                    {{ totalAthletes }} athlete{{ totalAthletes !== 1 ? 's' : '' }} found
                  </div>
                </div>
              </div>
            </transition>

            <!-- Athletes Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              <div
                v-for="athlete in filteredAthletes"
                :key="athlete.id"
                class="flex items-center p-3 border border-gray-200 rounded-lg hover:border-[#9C1313] transition cursor-pointer"
                :class="{ 'bg-red-50 border-[#9C1313]': selectedAthletes.includes(athlete.id) }"
                @click="toggleAthlete(athlete.id)"
              >
                <input
                  type="checkbox"
                  :checked="selectedAthletes.includes(athlete.id)"
                  class="mr-4 w-4 h-4 text-[#9C1313] border-gray-300 rounded focus:ring-[#9C1313]"
                  @click.stop
                  @change="toggleAthlete(athlete.id)"
                >
                <div class="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                  <img :src="athlete.avatar" :alt="athlete.name" class="w-full h-full object-cover">
                </div>
                <div class="flex-grow">
                  <h3 class="font-semibold text-gray-900">
                    {{ athlete.name }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    {{ athlete.position }} · {{ athlete.age }} yrs
                  </p>
                  <p class="text-xs text-gray-500">
                    Group: {{ athlete.group }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="!filteredAthletes.length" class="text-center text-gray-500 py-8">
              <Icon name="mdi:account-search-outline" size="3rem" class="mx-auto mb-2" />
              <p>No available athletes match the current filters.</p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-end items-center space-x-3">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
            @click="emitClose"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-red-700 border border-transparent rounded-md shadow-sm hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none"
            :disabled="selectedAthletes.length === 0"
            @click="addSelectedAthletes"
          >
            Add {{ selectedAthletes.length }} Athlete{{ selectedAthletes.length !== 1 ? 's' : '' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// PROPS & EMITS
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  courseId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add-athletes', athleteIds: number[]): void;
}>();

// COMPOSABLES
const { findCourseById } = useCourses();

// STATE
const searchQuery = ref('');
const showFilter = ref(false);
const selectedPositions = ref<string[]>([]);
const selectedGroups = ref<string[]>([]);
const selectedAthletes = ref<number[]>([]); // Holds IDs of athletes to be added

// DATA & COMPUTED PROPERTIES
const course = computed(() => findCourseById(props.courseId));

const currentCourseAthleteIds = computed(() => {
  return course.value?.athletes.map(a => a.id) ?? [];
});

const availableAthletesForCourse = computed<Athlete[]>(() => {
  // Filter out athletes already in the current course from the master list
  return allAthletes.filter(athlete => !currentCourseAthleteIds.value.includes(athlete.id));
});

const filteredAthletes = computed<Athlete[]>(() => {
  return availableAthletesForCourse.value.filter((athlete) => {
    const searchLower = searchQuery.value.toLowerCase();
    const matchesSearch
      = athlete.name.toLowerCase().includes(searchLower)
        || athlete.position?.toLowerCase().includes(searchLower);

    const matchesPosition
      = selectedPositions.value.length === 0
        || (athlete.position && selectedPositions.value.includes(athlete.position));

    const matchesGroup
      = selectedGroups.value.length === 0
        || (athlete.group && selectedGroups.value.includes(athlete.group));

    return matchesSearch && matchesPosition && matchesGroup;
  });
});

const totalAthletes = computed(() => filteredAthletes.value.length);

// Dynamic filter options based on available (unassigned) athletes
const availablePositions = computed(() => {
  const positions = availableAthletesForCourse.value
    .map(a => a.position)
    .filter((p): p is string => !!p); // Type guard to filter out undefined/null
  return [...new Set(positions)].sort();
});

const availableGroups = computed(() => {
  const groups = availableAthletesForCourse.value
    .map(a => a.group)
    .filter((g): g is string => !!g);
  return [...new Set(groups)].sort();
});

// METHODS
function emitClose() {
  emit('close');
}

function toggleFilter() {
  showFilter.value = !showFilter.value;
}

function clearFilters() {
  searchQuery.value = '';
  selectedPositions.value = [];
  selectedGroups.value = [];
}

function toggleAthlete(athleteId: number) {
  const index = selectedAthletes.value.indexOf(athleteId);
  if (index > -1) {
    selectedAthletes.value.splice(index, 1);
  }
  else {
    selectedAthletes.value.push(athleteId);
  }
}

function addSelectedAthletes() {
  // In a real app, you'd make an API call here.
  // We emit an event for the parent to handle.
  emit('add-athletes', selectedAthletes.value);
  // Reset state and close the modal
  selectedAthletes.value = [];
  emitClose();
}
</script>

<style scoped>
/* Transitions for backdrop and modal panel */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
