import type {
  CourseCreatePayload,
  CourseDetail,
  CourseListEntry,
  Session,
  SessionCompletionPayload,
  SessionCreatePayload,
  SessionTemplate,
  Skill,
} from '~/types/course';
import { useAsyncData, useNuxtApp } from '#app';

export function useCourses() {
  const { $api } = useNuxtApp();

  const fetchCourses = (isArchived: globalThis.Ref<boolean>) => {
    return useAsyncData<CourseListEntry[]>(
      `courses-list-${isArchived.value}`,
      () => $api(`/course`, { params: { is_archived: isArchived.value } }),
      { watch: [isArchived], default: () => [] },
    );
  };

  const fetchAllCourseDetails = () => {
    return useAsyncData<CourseDetail[]>(
      'all-course-details',
      () => $api(`/course/details/all`),
      { default: () => [] },
    );
  };

  const fetchCourseById = (courseId: number) => {
    return useAsyncData<CourseDetail>(
      `course-detail-${courseId}`,
      () => $api(`/course/${courseId}`),
    );
  };

  const updateCourseAthletes = async (courseId: number, athleteUuids: string[]) => {
    return $api<CourseDetail>(`/course/${courseId}/athletes`, {
      method: 'PUT',
      body: athleteUuids,
    });
  };

  const fetchSkills = () => {
    return useAsyncData<Skill[]>(
      'user-skills',
      () => $api('/course/skills'),
      { default: () => [] },
    );
  };

  const createSession = async (payload: SessionCreatePayload) => {
    return $api<Session>('/course/sessions', {
      method: 'POST',
      body: payload,
    });
  };

  const fetchSessionTemplates = () => {
    return useAsyncData<SessionTemplate[]>(
      'session-templates',
      () => $api('/course/sessions', {
        params: { is_template: true },
      }),
      {
        default: () => [],
      },
    );
  };

  const createCourse = async (payload: CourseCreatePayload) => {
    return $api<CourseDetail>('/course', {
      method: 'POST',
      body: payload,
    });
  };

  const uploadCourseImage = async (courseId: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile, imageFile.name);

    return $api<{ message: string; image_url: string }>(`/course/${courseId}/upload-image`, {
      method: 'POST',
      body: formData,
    });
  };

  const findSessionById = (course: CourseDetail | null | undefined, sessionId: number): Session | null => {
    if (!course || !course.sessions) {
      return null;
    }
    return course.sessions.find(session => session.id === sessionId) || null;
  };

  const saveSessionCompletions = async (sessionId: number, payload: SessionCompletionPayload) => {
    return $api(`/course/${sessionId}/complete`, {
      method: 'POST',
      body: payload,
    });
  };

  return {
    fetchCourses,
    fetchAllCourseDetails,
    fetchCourseById,
    fetchSessionTemplates,
    updateCourseAthletes,
    findSessionById,
    createCourse,
    uploadCourseImage,
    fetchSkills,
    createSession,
    saveSessionCompletions,
  };
}
