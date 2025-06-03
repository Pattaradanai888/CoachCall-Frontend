<template>
  <div class="bg-white p-10">
    <h2 class="text-xl font-bold mb-2">
      Create New Course
    </h2>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <div class="mb-2">
          <h1 class="font-bold mb-1">
            Title
          </h1>
          <input
            type="text"
            class="border-2 rounded-lg w-full shadow-lg p-2 h-8 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
          >
        </div>
        <div class="mb-2">
          <h1 class="font-bold mb-1">
            Description
          </h1>
          <textarea
            class="border-2 rounded-lg w-full shadow-lg p-2 h-48 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
          />
        </div>
        <div>
          <h1 class="font-bold mb-1">
            Date
          </h1>
          <div class="relative">
            <input
              type="date"
              class="border-2 rounded-lg w-full shadow-lg p-2 h-8 border-[#d9d9d9] focus:border-[#9c1313] focus:outline focus:outline-[#9c1313]"
            >
            <Icon
              name="mdi:calendar-blank"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#bcbcbc] pointer-events-none"
            />
          </div>
        </div>
      </div>
      <div v-motion-slide-visible-once-right :delay="200" class="w-full min-w-0">
        <div class="flex items-center mb-1">
          <Icon name="mdi:camera" class="w-6 h-6 text-gray-700 mr-2 flex-shrink-0" />
          <h3 class="text-xl font-semibold text-gray-900">
            Upload New Picture
          </h3>
        </div>
        <p class="text-gray-600 mb-6 text-sm sm:text-base">
          Upload a new profile picture.
        </p>
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-gray-400 transition-colors mb-6"
        >
          <Icon name="mdi:cloud-upload" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600 mb-2 text-sm sm:text-base">
            Drop file here
          </p>
          <p class="text-gray-500 text-sm mb-4">
            or
          </p>
          <button
            type="button"
            class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Browse File
          </button>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="hidden"
            aria-label="File input for profile picture"
          >
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex items-start">
            <Icon
              name="mdi:information"
              class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
            />
            <div class="min-w-0">
              <h4 class="font-medium text-gray-900 mb-2">
                Image Requirements:
              </h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Supported formats: JPG, PNG, WEBP, GIF</li>
                <li>• Maximum file size: 5MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
</script>
