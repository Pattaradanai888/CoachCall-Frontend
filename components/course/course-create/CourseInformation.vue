<template>
  <div class="bg-white p-10">
    <h2 class="text-xl font-bold mb-2">
      Create New Course
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left Column (Course Details) -->
      <div v-motion-slide-visible-once-left :delay="200">
        <div class="mb-4">
          <h1 class="font-bold mb-2 text-gray-700">
            Title
          </h1>
          <input
            v-model="form.title"
            type="text"
            class="border-2 rounded-lg w-full shadow-lg p-2 h-8 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
            placeholder="Course title"
          >
        </div>
        <div class="mb-4">
          <h1 class="font-bold mb-2 text-gray-700">
            Description
          </h1>
          <textarea
            v-model="form.description"
            class="border-2 rounded-lg w-full shadow-sm p-3 h-48 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
            placeholder="Course description"
          />
        </div>
        <div>
          <h1 class="font-bold mb-2 text-gray-700">
            Start Date
          </h1>
          <div class="relative">
            <input
              v-model="form.startDate"
              type="date"
              class="border-2 rounded-lg w-full shadow-lg p-2 h-8 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
            >
            <Icon
              name="mdi:calendar-blank"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <!-- Right Column (Image Upload) -->
      <div v-motion-slide-visible-once-right :delay="200" class="w-full min-w-0">
        <div class="flex items-center mb-3">
          <Icon name="mdi:image-area" class="w-6 h-6 text-gray-700 mr-2 flex-shrink-0" />
          <h3 class="text-xl font-semibold text-gray-900">
            Course Preview Image
          </h3>
        </div>

        <!-- Image Preview Section -->
        <div v-if="form.imagePreview" class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-gray-700">
              Preview:
            </h3>
            <button
              type="button"
              class="text-red-500 hover:text-red-700 transition-colors"
              aria-label="Remove image"
              @click="removeImage"
            >
              <Icon name="mdi:trash-can" class="w-5 h-5" />
            </button>
          </div>
          <div class="border rounded-lg p-2 bg-gray-50 shadow-sm">
            <img
              :src="form.imagePreview"
              alt="Course Image Preview"
              class="w-full h-auto object-contain rounded-md max-h-48 mx-auto"
            >
            <div class="mt-2 text-xs text-gray-500 text-center">
              Click below to replace image
            </div>
          </div>
        </div>

        <!-- Upload Area -->
        <div
          :class="{ 'border-[#9c1313] bg-red-50': dragOver, 'border-gray-300': !dragOver }"
          class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 mb-6 relative"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          @click="$refs.fileInput.click()"
        >
          <div v-if="!form.imagePreview" class="pointer-events-none">
            <Icon
              name="mdi:cloud-upload"
              :class="{ 'text-[#9c1313]': dragOver }"
              class="w-12 h-12 mx-auto mb-4 transition-colors"
            />
            <p class="text-gray-600 mb-2 font-medium">
              Drag & drop your image here
            </p>
            <p class="text-gray-500 text-sm mb-4">
              or
            </p>
          </div>
          <div v-else class="">
            <span class="">
              Click to Change Image
            </span>
          </div>
          <button
            v-if="!form.imagePreview"
            type="button"
            class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
          >
            Select Image
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="hidden"
            @change="handleFileUpload"
          >
        </div>

        <!-- Requirements Card -->
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm">
          <div class="flex">
            <Icon
              name="mdi:information"
              class="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
            />
            <div>
              <h4 class="font-medium text-gray-900 mb-2">
                Image Requirements:
              </h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li class="flex items-start">
                  <Icon name="mdi:check-circle" class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Supported formats: JPG, PNG, WEBP, GIF</span>
                </li>
                <li class="flex items-start">
                  <Icon name="mdi:check-circle" class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Maximum file size: 5MB</span>
                </li>
                <li class="flex items-start">
                  <Icon name="mdi:check-circle" class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Recommended ratio: 16:9 (landscape)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseInformation',
  props: {
    courseData: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['error'],
  data() {
    return {
      dragOver: false,
      form: {
        title: '',
        description: '',
        startDate: '',
        image: null,
        imagePreview: null,
      },
    };
  },
  watch: {
    courseData: {
      handler(newData) {
        this.form.title = newData.title || '';
        this.form.description = newData.description || '';
        this.form.startDate = newData.startDate || '';
        this.form.imagePreview = newData.image || null;
        this.form.image = null;
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    handleDrop(event) {
      this.dragOver = false;
      const files = event.dataTransfer.files;
      if (files && files.length) {
        this.handleFileUpload({ target: { files } });
      }
    },

    removeImage() {
      this.form.image = null;
      this.form.imagePreview = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file)
        return;

      // File type validation
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.$emit('error', 'Please select a valid image file (JPEG, PNG, WEBP, GIF)');
        return;
      }

      // File size validation
      if (file.size > 5 * 1024 * 1024) {
        this.$emit('error', 'File size exceeds 5MB limit');
        return;
      }

      this.form.image = file;
      this.form.imagePreview = URL.createObjectURL(file);
    },

    getData() {
      return {
        title: this.form.title,
        description: this.form.description,
        startDate: this.form.startDate,
        image: this.form.imagePreview || null,
      };
    },
  },
};
</script>
