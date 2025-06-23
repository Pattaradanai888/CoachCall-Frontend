import type { CourseDetail, CourseListEntry, Session, SessionTemplate } from '~/types/course';
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

  const findSessionById = (course: CourseDetail | null | undefined, sessionId: number): Session | null => {
    if (!course || !course.sessions) {
      return null;
    }
    return course.sessions.find(session => session.id === sessionId) || null;
  };

  return {
    fetchCourses,
    fetchAllCourseDetails,
    fetchCourseById,
    fetchSessionTemplates,
    updateCourseAthletes,
    findSessionById,
  };
}
