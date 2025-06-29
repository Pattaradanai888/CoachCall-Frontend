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
  </div>
</template>

<script lang="ts" setup>
import type { Session, SessionCreatePayload, SessionTemplate } from '~/types/course';
import OverviewActiveCourse from '~/components/course/course-overview/OverviewActiveCourse.vue';
import OverviewTemplate from '~/components/course/course-overview/OverviewTemplate.vue';
import SessionBuilderModal from '~/components/course/SessionBuilderModal.vue';
import { useCourses } from '~/composables/useCourses';
import { useSubmit } from '~/composables/useSubmit';

const showModal = ref(false);
const editingTemplate = ref<Session | null>(null);
const showConfirmModal = ref(false);
const courseToDelete = ref<{ id: number; name: string } | null>(null);

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

const {
  fetchAllCourseDetails,
  fetchSessionTemplates,
  fetchSkills,
  createSession,
  updateSessionTemplate,
  deleteSessionTemplate,
  deleteCourse,
} = useCourses();

const { data: allCourses, pending: coursesPending, refresh } = await fetchAllCourseDetails();
const { data: sessionTemplates, pending: templatesPending, refresh: refreshTemplates } = await fetchSessionTemplates();
const { data: availableSkills } = await fetchSkills();

const { submit: performSaveTemplate } = useSubmit(createSession, {
  onSuccess: () => {
    alert('Template saved successfully!');
    refreshTemplates();
    closeModal();
  },
  onError: (err: any) => {
    const errorMessage = err?.data?.detail || 'An unknown error occurred.';
    alert(`Failed to save template: ${errorMessage}`);
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
const { submit: performDelete, loading: isDeleting } = useSubmit(deleteCourse, {
  // Make the onSuccess handler ASYNC
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
    alert('Failed to delete course. Please try again.');
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
      alert('Failed to update template. Please try again.');
    },
  },
);

const { submit: performDeleteTemplate } = useSubmit(deleteSessionTemplate, {
  onSuccess: () => {
    alert('Template deleted successfully!');
    refreshTemplates();
  },
  onError: () => {
    alert('Failed to delete template. Please try again.');
  },
});

async function handleRemoveTemplate(templateId: number) {
  // Use a native browser confirm dialog for simplicity
  const confirmed = window.confirm('Are you sure you want to delete this template? This action cannot be undone.');

  if (confirmed) {
    await performDeleteTemplate(templateId);
  }
}

async function updateExistingTemplate(payload: { id: number; data: SessionCreatePayload }) {
  await performUpdateTemplate(payload);
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
</script>
