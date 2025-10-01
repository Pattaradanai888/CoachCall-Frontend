<template>
  <div class="min-h-screen bg-[#FAFAFA] page-with-fab">
    <SubNavbar />

    <div class="max-w-[1140px] mx-auto pt-2 sm:pt-4 pb-6 sm:pb-8 px-3 sm:px-4 lg:px-0 h-auto min-h-[300px]">
      <!-- Loading State -->
      <div v-if="coursesPending && templatesPending" class="w-full text-center py-16 sm:py-24 text-gray-500">
        <div class="inline-block">
          <div class="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 bg-red-200 rounded-full animate-spin border-4 border-red-700 border-t-transparent" />
          <p class="text-base sm:text-lg">
            Loading Course Management...
          </p>
        </div>
      </div>
      
      <!-- Main Content -->
      <div v-else class="w-full">
        <div v-motion-slide-visible-once-top class="flex flex-col sm:flex-row lg:flex-row justify-between items-start sm:items-center lg:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
              Course Management
            </h1>
            <p class="text-sm sm:text-base text-gray-600 mt-1 break-words">Manage your athletes and track their progress</p>
          </div>
          <div class="w-full sm:w-auto flex-shrink-0 create-button-desktop">
            <NuxtLink to="/course/form/new" class="block w-full sm:w-auto">
              <button class="w-full sm:w-auto bg-[#9C1313] text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-[#7A0F0F] shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 min-h-[44px]">
                <div class="flex items-center justify-center">
                  <Icon name="mdi:plus" size="1.25rem" class="sm:size-6 mr-2" />
                  <p class="text-sm sm:text-base whitespace-nowrap">Create Course</p>
                </div>
              </button>
            </NuxtLink>
          </div>
        </div>

        <!-- Templates Section -->
        <div v-motion-slide-visible-once-left :delay="200" class="mb-8 sm:mb-12">
          <div v-if="templatesPending" class="text-center p-6 sm:p-8 bg-white rounded-xl shadow-sm min-h-[200px] sm:min-h-[250px] flex items-center justify-center">
            <div class="inline-block">
              <div class="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 bg-red-200 rounded-full animate-spin border-2 border-red-700 border-t-transparent" />
              <p class="text-sm sm:text-base text-gray-500">Loading Templates...</p>
            </div>
          </div>
          <OverviewTemplate
            v-else
            :templates="sessionTemplates"
            @open-create-modal="openCreateModal"
            @open-edit-modal="openEditModal"
            @remove-template="handleRemoveTemplate"
            @start-quick-session="handleStartQuickSession"
          />
        </div>

        <!-- Courses Section -->
        <div v-motion-slide-visible-once-right :delay="200">
          <div v-if="coursesPending" class="text-center p-6 sm:p-8 bg-white rounded-xl shadow-sm min-h-[250px] sm:min-h-[300px] flex items-center justify-center">
            <div class="inline-block">
              <div class="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 bg-red-200 rounded-full animate-spin border-2 border-red-700 border-t-transparent" />
              <p class="text-sm sm:text-base text-gray-500">Loading Courses...</p>
            </div>
          </div>
          <OverviewActiveCourse
            v-else
            :courses="coursesWithProgress"
            @edit-course="handleEditCourse"
            @remove-course="promptForDelete"
            @toggle-archive="promptForArchive"
          />
        </div>
      </div>
    </div> <!-- Close container div -->

    <!-- Mobile Floating Action Button (visible only on small screens) -->
    <NuxtLink to="/course/form/new">
      <button
        class="floating-action-button bg-[#9C1313] text-white hover:bg-[#7A0F0F] min-h-[56px] min-w-[56px]"
        aria-label="Create Course"
      >
        <Icon name="mdi:plus" class="text-2xl" />
      </button>
    </NuxtLink>

    <!-- Modals at root level -->
    <SessionBuilderModal
      :show="showModal"
      mode="template"
      :available-skills="availableSkills || []"
      :initial-data="editingTemplate"
      @close="closeModal"
      @create-template="saveNewTemplate"
      @update-template="(data) => { if (editingTemplate) updateExistingTemplate({ id: editingTemplate.id, data }) }"
    />
    <ConfirmModal
      :show="showConfirmModal"
      title="Confirm Deletion"
      :message="`Are you sure you want to delete the course '${courseToDelete?.name}'? This action cannot be undone.`"
      confirm-text="Delete"
      @close="closeConfirmModal"
      @confirm="handleConfirmDelete"
    />
    <ConfirmModal
      :show="showArchiveConfirmModal"
      :title="archiveModalTitle"
      :message="archiveModalMessage"
      :confirm-text="archiveModalActionText"
      @close="closeArchiveConfirmModal"
      @confirm="handleConfirmArchive"
    />
    <ConfirmModal
      :show="showTemplateDeleteConfirmModal"
      title="Confirm Template Deletion"
      message="Are you sure you want to delete this template? This action cannot be undone."
      confirm-text="Delete"
      @close="closeTemplateDeleteConfirmModal"
      @confirm="handleConfirmTemplateDelete"
    />
    <NotificationModal
      :show="showNotificationModal"
      :title="notificationTitle"
      :message="notificationMessage"
      :type="notificationType"
      @close="closeNotificationModal"
    />
  </div> <!-- Close root div -->
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import type { Session, SessionCreatePayload, SessionTemplate, CourseDetail, Skill } from '~/types/course';
import OverviewActiveCourse from '~/components/course/course-overview/OverviewActiveCourse.vue';
import OverviewTemplate from '~/components/course/course-overview/OverviewTemplate.vue';
import SessionBuilderModal from '~/components/course/SessionBuilderModal.vue';
import NotificationModal from '~/components/NotificationModal.vue';
import { useCourses } from '~/composables/useCourses';
import { useSubmit } from '~/composables/useSubmit';

const router = useRouter();
const showModal = ref(false);
const editingTemplate = ref<Session | null>(null);
const showConfirmModal = ref(false);
const courseToDelete = ref<{ id: number; name: string } | null>(null);
const showArchiveConfirmModal = ref(false);
const courseToArchive = ref<{ id: number; name: string; is_archived: boolean } | null>(null);
const showTemplateDeleteConfirmModal = ref(false);
const templateToDelete = ref<number | null>(null);

// Notification modal state
const showNotificationModal = ref(false);
const notificationTitle = ref('');
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');

const archiveModalTitle = computed(() => courseToArchive.value?.is_archived ? 'Unarchive Course' : 'Archive Course');
const archiveModalMessage = computed(() => {
  if (!courseToArchive.value)
    return '';
  const action = courseToArchive.value.is_archived ? 'unarchive' : 'archive';
  return `Are you sure you want to ${action} the course "${courseToArchive.value.name}"?`;
});
const archiveModalActionText = computed(() => courseToArchive.value?.is_archived ? 'Unarchive' : 'Archive');

// Notification functions
function showNotification(title: string, message: string, type: 'success' | 'error' = 'success') {
  notificationTitle.value = title;
  notificationMessage.value = message;
  notificationType.value = type;
  showNotificationModal.value = true;
}

function closeNotificationModal() {
  showNotificationModal.value = false;
}

// Data fetching - moved to onMounted to avoid SSR issues with auth
const allCourses = ref<CourseDetail[]>([]);
const coursesPending = ref(true);
const sessionTemplates = ref<SessionTemplate[]>([]);
const templatesPending = ref(true);
const availableSkills = ref<Skill[]>([]);

const {
  fetchAllCourseDetails,
  fetchSessionTemplates,
  fetchSkills,
  fetchAllCourseDetailsClient,
  fetchSessionTemplatesClient,
  fetchSkillsClient,
  createSession,
  createSessionFromTemplate,
  updateSessionTemplate,
  deleteSession,
  deleteCourse,
  updateCourseArchiveStatus,
} = useCourses();

// Function to fetch all data
async function fetchAllData() {
  coursesPending.value = true;
  templatesPending.value = true;
  
  try {
    // Use client-side functions for auth-protected data fetching
    const [coursesResult, templatesResult, skillsResult] = await Promise.all([
      fetchAllCourseDetailsClient(),
      fetchSessionTemplatesClient(),
      fetchSkillsClient(),
    ]);
    
    allCourses.value = coursesResult || [];
    sessionTemplates.value = templatesResult || [];
    availableSkills.value = skillsResult || [];
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    coursesPending.value = false;
    templatesPending.value = false;
  }
}

// Refresh functions
const refresh = async () => {
  await fetchAllData();
};

const refreshTemplates = async () => {
  try {
    const result = await fetchSessionTemplatesClient();
    sessionTemplates.value = result || [];
  } catch (error) {
    console.error('Failed to refresh templates:', error);
  }
};

// Fetch data on client mount only
onMounted(async () => {
  await fetchAllData();
});

// Define performDeleteTemplate early so it can be used in functions below
const { submit: performDeleteTemplate } = useSubmit(deleteSession, {
  onSuccess: () => {
    showNotification('Success', 'Template deleted successfully!', 'success');
    refreshTemplates();
    closeTemplateDeleteConfirmModal();
  },
  onError: () => {
    showNotification('Error', 'Failed to delete template. Please try again.', 'error');
    closeTemplateDeleteConfirmModal();
  },
});

function promptForTemplateDelete(templateId: number) {
  templateToDelete.value = templateId;
  showTemplateDeleteConfirmModal.value = true;
}

function closeTemplateDeleteConfirmModal() {
  showTemplateDeleteConfirmModal.value = false;
  templateToDelete.value = null;
}

async function handleConfirmTemplateDelete() {
  if (!templateToDelete.value)
    return;
  await performDeleteTemplate(templateToDelete.value);
}

function openCreateModal() {
  editingTemplate.value = null;
  showModal.value = true;
}

function openEditModal(template: SessionTemplate) {
  editingTemplate.value = template as Session;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingTemplate.value = null;
}

function handleEditCourse(courseId: number) {
  navigateTo(`/course/form/${courseId}`);
}

const { submit: performSaveTemplate } = useSubmit(createSession, {
  onSuccess: () => {
    showNotification('Success', 'Template saved successfully!', 'success');
    refreshTemplates();
    closeModal();
  },
  onError: (err: any) => {
    const errorMessage = err?.data?.detail || 'An unknown error occurred.';
    showNotification('Error', `Failed to save template: ${errorMessage}`, 'error');
  },
});

async function saveNewTemplate(payload: SessionCreatePayload) {
  await performSaveTemplate(payload);
}

function promptForDelete(course: { id: number; name: string }) {
  courseToDelete.value = course;
  showConfirmModal.value = true;
}

function closeConfirmModal() {
  showConfirmModal.value = false;
  courseToDelete.value = null;
}

const { submit: performDelete } = useSubmit(deleteCourse, {
  onSuccess: async () => {
    try {
      await refresh();
    }
    catch (refreshError) {
      console.error('Failed to refresh course list after deletion:', refreshError);
    }
    closeConfirmModal();
  },
  onError: () => {
    showNotification('Error', 'Failed to delete course. Please try again.', 'error');
    closeConfirmModal();
  },
});

async function handleConfirmDelete() {
  if (!courseToDelete.value)
    return;
  await performDelete(courseToDelete.value.id);
}

const { submit: performUpdateTemplate } = useSubmit(
  ({ id, data }: { id: number; data: SessionCreatePayload }) => updateSessionTemplate(id, data),
  {
    onSuccess: () => {
      refreshTemplates();
      closeModal();
    },
    onError: () => {
      showNotification('Error', 'Failed to update template. Please try again.', 'error');
    },
  },
);

async function handleRemoveTemplate(templateId: number) {
  promptForTemplateDelete(templateId);
}

async function updateExistingTemplate(payload: { id: number; data: SessionCreatePayload }) {
  await performUpdateTemplate(payload);
}

function promptForArchive(course: { id: number; name: string; is_archived: boolean }) {
  courseToArchive.value = course;
  showArchiveConfirmModal.value = true;
}

function closeArchiveConfirmModal() {
  showArchiveConfirmModal.value = false;
  courseToArchive.value = null;
}

const { submit: performArchive } = useSubmit(
  (courseToUpdate: { id: number; is_archived: boolean }) => updateCourseArchiveStatus(courseToUpdate.id, !courseToUpdate.is_archived),
  {
    onSuccess: async () => {
      try {
        await refresh();
      }
      catch (refreshError) {
        console.error('Failed to refresh course list after archive:', refreshError);
      }
      closeArchiveConfirmModal();
    },
    onError: () => {
      showNotification('Error', 'Failed to update course status. Please try again.', 'error');
      closeArchiveConfirmModal();
    },
  },
);

async function handleConfirmArchive() {
  if (!courseToArchive.value)
    return;
  await performArchive(courseToArchive.value);
}

const coursesWithProgress = computed(() => {
  if (!allCourses.value) {
    return [];
  }
  return allCourses.value
    .filter(Boolean)
    .map((course) => {
      if (!course.sessions || course.sessions.length === 0) {
        return { ...course, progressValue: 0 };
      }
      const completed = course.sessions.filter(s => s.status === 'Complete').length;
      const total = course.sessions.length;
      return {
        ...course,
        progressValue: Math.round((completed / total) * 100),
      };
    });
});

async function handleStartQuickSession(template: SessionTemplate) {
  try {
    const newSession = await createSessionFromTemplate(template as Session);
    if (newSession && newSession.id) {
      router.push(`/course-detail/quick/session/${newSession.id}`);
    }
    else {
      showNotification('Error', 'Failed to create quick session instance.', 'error');
    }
  }
  catch (error: any) {
    const errorMessage = error?.data?.detail || 'An unknown error occurred.';
    showNotification('Error', `Could not start quick session: ${errorMessage}`, 'error');
  }
}
</script>

<style scoped>
/* Browser-specific scrolling enhancements */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
</style>
