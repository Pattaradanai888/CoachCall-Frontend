<template>
  <div>
    <SubNavbar />

    <div class="flex max-w-[1140px] w-full mx-auto my-10 h-auto min-h-[300px] max-h-[none]">
      <div class="w-full mx-7 lg:mx-0">
        <div v-motion-slide-visible-once-top class="flex justify-between mb-5">
          <div>
            <h1 class="text-3xl font-bold">
              Course Management
            </h1>
            <p>Manage your athletes and track their progress</p>
          </div>
          <div>
            <NuxtLink to="/course/form/new">
              <button class="bg-[#9C1313] text-white font-bold px-2 py-2 rounded-xl hover:bg-[#7A0F0F] mx-auto shadow-lg">
                <div class="flex items-center justify-center">
                  <Icon name="mdi:plus" size="1.5rem" class="mr-2" />
                  <p>Create Course</p>
                </div>
              </button>
            </NuxtLink>
          </div>
        </div>

        <div v-motion-slide-visible-once-left :delay="200" class="mb-12">
          <div v-if="templatesPending" class="text-center p-8 bg-white min-h-[250px] flex items-center justify-center">
            Loading Templates...
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

        <div v-motion-slide-visible-once-right :delay="200">
          <div v-if="coursesPending" class="text-center p-8 bg-white min-h-[300px] flex items-center justify-center">
            Loading Courses...
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
    </div>

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
  </div>
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
    const [coursesResult, templatesResult, skillsResult] = await Promise.all([
      fetchAllCourseDetails(),
      fetchSessionTemplates(),
      fetchSkills(),
    ]);
    
    allCourses.value = coursesResult.data.value || [];
    sessionTemplates.value = templatesResult.data.value || [];
    availableSkills.value = skillsResult.data.value || [];
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
    const result = await fetchSessionTemplates();
    sessionTemplates.value = result.data.value || [];
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
