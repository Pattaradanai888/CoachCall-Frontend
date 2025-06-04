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
          placeholder="Search Template"
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
      <div v-if="showFilter" class="mt-4 p-3 bg-gray-50 rounded-lg">
        <div class="mb-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select v-model="filterDifficulty" class="w-full px-3 py-1 border border-gray-300 rounded-md text-sm">
            <option value="">
              All Levels
            </option>
            <option value="beginner">
              Beginner
            </option>
            <option value="intermediate">
              Intermediate
            </option>
            <option value="advanced">
              Advanced
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Athletes Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div
        v-for="athlete in filteredAthletes"
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
          <img
            :src="athlete.avatar"
            :alt="athlete.name"
            class="w-full h-full object-cover"
          >
        </div>
        <div class="flex-grow">
          <h3 class="font-semibold text-gray-900">
            {{ athlete.name }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ athlete.position }} · {{ athlete.age }} yrs
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

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-600">
        Showing {{ startIndex }}-{{ endIndex }} of {{ totalAthletes }} athlete{{ totalAthletes !== 1 ? 's' : '' }}
      </p>
      <div class="flex items-center space-x-2">
        <button
          :disabled="currentPage === 1"
          class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="previousPage"
        >
          <Icon name="mdi:arrow-left" size="1rem" />
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          class="px-3 py-1 rounded text-sm" :class="[
            currentPage === page
              ? 'bg-[#9C1313] text-white'
              : 'text-gray-700 hover:bg-gray-100',
          ]"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          :disabled="currentPage === totalPages"
          class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="nextPage"
        >
          <Icon name="mdi:arrow-right" size="1rem" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddAthletesToCourse',
  props: {
    athleteData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 8,
      selectedAthletes: this.athleteData.map(athlete => athlete.id), // Initialize with existing athlete IDs
      showFilter: false,
      filterDifficulty: '',
      athletes: [
        { id: 1, name: 'Michel Jordon', position: 'Center', age: 25, performance: '5.8', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
        { id: 2, name: 'Michel Jordon', position: 'Center', age: 25, performance: '5.8', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
        { id: 3, name: 'Michel Jordon', position: 'Center', age: 25, performance: '5.8', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
        { id: 4, name: 'Michel Jordon', position: 'Center', age: 25, performance: '5.8', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
        { id: 5, name: 'Michel Jordon', position: 'Center', age: 25, performance: '5.8', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
        { id: 6, name: 'Michel Jordon', position: 'Center', age: 25, performance: '5.8', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
        { id: 7, name: 'Michel Jordon', position: 'Center', age: 25, performance: '5.8', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
        { id: 8, name: 'Michel Jordon', position: 'Center', age: 25, performance: '5.8', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
        { id: 9, name: 'LeBron James', position: 'Forward', age: 27, performance: '6.2', avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=100&h=100&fit=crop&crop=face' },
        { id: 10, name: 'Stephen Curry', position: 'Guard', age: 24, performance: '5.9', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop&crop=face' },
        { id: 11, name: 'Kevin Durant', position: 'Forward', age: 26, performance: '6.1', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
        { id: 12, name: 'Giannis Antetokounmpo', position: 'Forward', age: 23, performance: '6.3', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
      ],
    };
  },
  computed: {
    filteredAthletes() {
      const filtered = this.athletes;
      if (this.filterDifficulty) {
        // Add filtering logic if difficulty is used (currently not in athletes data)
      }
      return filtered
        .filter(athlete =>
          athlete.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          || athlete.position.toLowerCase().includes(this.searchQuery.toLowerCase()),
        )
        .slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage,
        );
    },
    totalAthletes() {
      return this.athletes.filter(athlete =>
        athlete.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        || athlete.position.toLowerCase().includes(this.searchQuery.toLowerCase()),
      ).length;
    },
    totalPages() {
      return Math.ceil(this.totalAthletes / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endIndex() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalAthletes);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 1);
      const end = Math.min(this.totalPages, this.currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1; // Reset to first page when searching
    },
    athleteData: {
      handler(newData) {
        this.selectedAthletes = newData.map(athlete => athlete.id);
      },
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
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPage(page) {
      this.currentPage = page;
    },
    toggleFilter() {
      this.showFilter = !this.showFilter;
    },
    getData() {
      return this.athletes.filter(athlete => this.selectedAthletes.includes(athlete.id));
    },
  },
};
</script>
