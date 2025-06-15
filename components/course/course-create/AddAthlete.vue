<template>
  <div v-motion-slide-visible-once-top :delay="200" class="bg-white p-6">
    <h2 class="text-2xl font-bold mb-6">
      Add Athletes to Course
    </h2>
    <div class="flex mb-4">
      <div class="relative w-full shadow-lg">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Athletes by name or position"
          class="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:border-[#9C1313] transition duration-300 ease-in-out"
        >
        <Icon
          name="mdi:magnify"
          size="1rem"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      </div>
      <button
        class="flex items-center justify-center shadow-lg p-2 border-gray-300 border rounded-lg ml-1 hover:bg-slate-50"
        @click="toggleFilter"
      >
        <Icon name="mdi:filter-outline" size="1rem" class="text-gray-500 pointer-events-none" />
      </button>
    </div>

    <!-- Enhanced Filter Dropdown -->
    <div v-if="showFilter" class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Position Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
          <div class="space-y-2">
            <label v-for="position in availablePositions" :key="position" class="flex items-center text-sm">
              <input v-model="selectedPositions" type="checkbox" :value="position" class="mr-2 w-4 h-4 text-[#9C1313] border-gray-300 rounded focus:ring-[#9C1313]">
              <span class="text-gray-700">{{ position }}</span>
            </label>
          </div>
        </div>

        <!-- Athlete Group Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Athlete Group</label>
          <div class="space-y-2">
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

    <!-- Athletes Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div
        v-for="athlete in paginatedAthletes"
        :key="athlete.id"
        class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition cursor-pointer"
        @click="toggleAthlete(athlete.id)"
      >
        <input
          type="checkbox"
          :checked="selectedAthletes.includes(athlete.id)"
          class="mr-4 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
            {{ athlete.group }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">
            Performance
          </p>
          <p class="font-semibold text-gray-900">
            {{ athlete.performance }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="!paginatedAthletes.length" class="text-center text-gray-500 py-8">
      No athletes match the current filters.
    </div>

    <!-- REFACTORED PAGINATION -->
    <PaginationBar
      v-model:current-page="currentPage"
      :total-items="totalAthletes"
      :items-per-page="itemsPerPage"
    />
  </div>
</template>

<script>
import PaginationBar from '~/components/PaginationBar.vue';

export default {
  name: 'AddAthletesToCourse',
  components: {
    PaginationBar,
  },
  props: {
    athleteData: { type: Array, default: () => [] },
  },
  data() {
    return {
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 8,
      selectedAthletes: this.athleteData.map(athlete => athlete.id),
      showFilter: false,
      selectedPositions: [],
      selectedGroups: [],
      athletes: [
        { id: 1, name: 'Michael Jordan', position: 'Guard', age: 25, performance: '5.8', group: 'Varsity Team', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
        { id: 2, name: 'Jane Smith', position: 'Center', age: 22, performance: '5.5', group: 'JV Team', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
        { id: 3, name: 'Alex Johnson', position: 'Forward', age: 23, performance: '5.9', group: 'Freshman Team', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
        { id: 4, name: 'Emily Brown', position: 'Guard', age: 24, performance: '5.7', group: 'Varsity Team', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop&crop=face' },
        { id: 5, name: 'Chris Lee', position: 'Forward', age: 21, performance: '6.0', group: 'Elite Squad', avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=100&h=100&fit=crop&crop=face' },
        { id: 6, name: 'Maria Garcia', position: 'Center', age: 26, performance: '5.6', group: 'JV Team', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
        { id: 7, name: 'David Kim', position: 'Guard', age: 20, performance: '5.4', group: 'Training Camp', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
        { id: 8, name: 'LeBron James', position: 'Forward', age: 27, performance: '6.2', group: 'Varsity Team', avatar: 'https://plus.unsplash.com/premium_photo-1688891511339-322b7a485ef2?w=100&h=100&fit=crop&crop=face' },
        { id: 9, name: 'Stephen Curry', position: 'Guard', age: 24, performance: '5.9', group: 'Elite Squad', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face' },
        { id: 10, name: 'Kevin Durant', position: 'Forward', age: 26, performance: '6.1', group: 'Training Camp', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=face' },
        { id: 11, name: 'Giannis Antetokounmpo', position: 'Forward', age: 23, performance: '6.3', group: 'Freshman Team', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face' },
      ],
    };
  },
  computed: {
    availablePositions() {
      return [...new Set(this.athletes.map(athlete => athlete.position))];
    },
    availableGroups() {
      return [...new Set(this.athletes.map(athlete => athlete.group))];
    },

    // --- REFACTORED COMPUTED PROPERTIES ---

    // 1. Get the full list of athletes after applying all filters
    fullFilteredList() {
      let filtered = this.athletes;
      if (this.searchQuery) {
        filtered = filtered.filter(athlete => athlete.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || athlete.position.toLowerCase().includes(this.searchQuery.toLowerCase()));
      }
      if (this.selectedPositions.length > 0) {
        filtered = filtered.filter(athlete => this.selectedPositions.includes(athlete.position));
      }
      if (this.selectedGroups.length > 0) {
        filtered = filtered.filter(athlete => this.selectedGroups.includes(athlete.group));
      }
      return filtered;
    },

    // 2. Get the total count of the filtered list (for the pagination component)
    totalAthletes() {
      return this.fullFilteredList.length;
    },

    // 3. Get the sliced, paginated list for display in the template
    paginatedAthletes() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.fullFilteredList.slice(start, end);
    },
  },
  watch: {
    // These watchers reset the page to 1 when any filter changes
    searchQuery() { this.currentPage = 1; },
    selectedPositions() { this.currentPage = 1; },
    selectedGroups() { this.currentPage = 1; },
    athleteData: {
      handler(newData) { this.selectedAthletes = newData.map(athlete => athlete.id); },
      deep: true,
    },
  },
  methods: {
    toggleAthlete(athleteId) {
      const index = this.selectedAthletes.indexOf(athleteId);
      if (index > -1) {
        this.selectedAthletes.splice(index, 1);
      }
      else {
        this.selectedAthletes.push(athleteId);
      }
    },
    toggleFilter() {
      this.showFilter = !this.showFilter;
    },
    clearFilters() {
      this.selectedPositions = [];
      this.selectedGroups = [];
    },
    // This method is likely exposed to a parent component and should be kept
    getData() {
      return this.athletes.filter(athlete => this.selectedAthletes.includes(athlete.id));
    },
  },
};
</script>
