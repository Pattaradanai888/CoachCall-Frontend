import type {
  CourseCreatePayload,
  CourseDetail,
  CourseListEntry,
  Session,
  SessionCompletionPayload,
  SessionCreatePayload,
  SessionReportData,
  Skill,
} from '~/types/course';

export function useCourses() {
  const { $api } = useNuxtApp();

  // SSR-optimized data fetching with proper cache keys
  const fetchCourses = (isArchived: boolean | globalThis.Ref<boolean>) => {
    const archivedValue = typeof isArchived === 'boolean' ? isArchived : unref(isArchived);

    return useAsyncData<CourseListEntry[]>(
      `courses-list-${archivedValue}`,
      () => $api(`/course`, { params: { is_archived: archivedValue } }),
      {
        default: () => [],
        server: true, // Ensure SSR
        // Only watch if it's a ref
        ...(typeof isArchived !== 'boolean' && { watch: [isArchived] }),
      },
    );
  };

  const fetchAllCourseDetails = () => {
    return useAsyncData<CourseDetail[]>(
      'all-course-details',
      () => $api(`/course/details/all`),
      {
        default: () => [],
        server: true,
        // Add cache TTL for better performance
        transform: (data: CourseDetail[]) => data || [],
      },
    );
  };

  const fetchCourseById = (courseId: number | string) => {
    const id = typeof courseId === 'string' ? Number.parseInt(courseId, 10) : courseId;

    return useAsyncData<CourseDetail>(
      `course-detail-${id}`,
      () => $api(`/course/${id}`),
      {
        server: true,
        // Add error handling for SSR
        default: () => null,
        transform: (data: CourseDetail) => data || null,
      },
    );
  };

  const fetchSkills = () => {
    return useAsyncData<Skill[]>(
      'user-skills',
      () => $api('/course/skills'),
      {
        default: () => [],
        server: true,
        // Cache skills as they don't change often
        transform: (data: Skill[]) => data || [],
      },
    );
  };

  const fetchSessionTemplates = () => {
    return useAsyncData<Session[]>(
      'session-templates',
      () => $api('/course/sessions', {
        params: { is_template: true },
      }),
      {
        default: () => [],
        server: true,
        transform: (data: Session[]) => data || [],
      },
    );
  };

  const fetchSessionReport = (sessionId: number | string) => {
    const id = typeof sessionId === 'string' ? Number.parseInt(sessionId, 10) : sessionId;

    return useAsyncData<SessionReportData>(
      `session-report-${id}`,
      () => $api(`/course/session/${id}/report`),
      {
        server: true,
        default: () => null,
        transform: (data: SessionReportData) => data || null,
      },
    );
  };

  // Client-side only mutations (these shouldn't run during SSR)
  const updateCourseAthletes = async (courseId: number, athleteUuids: string[]) => {
    if (import.meta.server) {
      throw new Error('updateCourseAthletes should not be called during SSR');
    }

    return $api<CourseDetail>(`/course/${courseId}/athletes`, {
      method: 'PUT',
      body: athleteUuids,
    });
  };

  const createSession = async (payload: SessionCreatePayload) => {
    if (import.meta.server) {
      throw new Error('createSession should not be called during SSR');
    }

    return $api<Session>('/course/sessions', {
      method: 'POST',
      body: payload,
    });
  };

  const updateSessionTemplate = async (sessionId: number, payload: SessionCreatePayload) => {
    if (import.meta.server) {
      throw new Error('updateSessionTemplate should not be called during SSR');
    }

    return $api<Session>(`/course/sessions/${sessionId}`, {
      method: 'PUT',
      body: payload,
    });
  };

  const deleteSessionTemplate = async (sessionId: number) => {
    if (import.meta.server) {
      throw new Error('deleteSessionTemplate should not be called during SSR');
    }

    return $api<void>(`/course/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  };

  const createCourse = async (payload: CourseCreatePayload) => {
    if (import.meta.server) {
      throw new Error('createCourse should not be called during SSR');
    }

    return $api<CourseDetail>('/course', {
      method: 'POST',
      body: payload,
    });
  };

  const updateCourse = async (courseId: number, payload: CourseCreatePayload) => {
    if (import.meta.server) {
      throw new Error('updateCourse should not be called during SSR');
    }

    return $api<CourseDetail>(`/course/${courseId}`, {
      method: 'PUT',
      body: payload,
    });
  };

  const updateCourseArchiveStatus = async (courseId: number, is_archived: boolean) => {
    if (import.meta.server) {
      throw new Error('updateCourseArchiveStatus should not be called during SSR');
    }

    return $api<CourseDetail>(`/course/${courseId}/archive-status`, {
      method: 'PUT',
      body: { is_archived },
    });
  };

  const deleteCourse = async (courseId: number) => {
    if (import.meta.server) {
      throw new Error('deleteCourse should not be called during SSR');
    }

    return $api<{ message: string; deleted_course_id: number }>(`/course/${courseId}`, {
      method: 'DELETE',
    });
  };

  const uploadCourseImage = async (courseId: number, imageFile: File) => {
    if (import.meta.server) {
      throw new Error('uploadCourseImage should not be called during SSR');
    }

    const formData = new FormData();
    formData.append('file', imageFile, imageFile.name);

    return $api<{ message: string; image_url: string }>(`/course/${courseId}/upload-image`, {
      method: 'POST',
      body: formData,
    });
  };

  const updateSessionStatus = async (sessionId: number, status: 'Complete' | 'To do') => {
    if (import.meta.server) {
      throw new Error('updateSessionStatus should not be called during SSR');
    }

    return $api<Session>(`/course/session/${sessionId}/status`, {
      method: 'PUT',
      body: { status },
    });
  };

  const saveSessionCompletions = async (sessionId: number, payload: SessionCompletionPayload) => {
    if (import.meta.server) {
      throw new Error('saveSessionCompletions should not be called during SSR');
    }

    return $api(`/course/session/${sessionId}/complete`, {
      method: 'POST',
      body: payload,
    });
  };

  // Pure utility functions (SSR-safe)
  const findSessionById = (course: CourseDetail | null | undefined, sessionId: number): Session | null => {
    if (!course || !course.sessions) {
      return null;
    }
    return course.sessions.find(session => session.id === sessionId) || null;
  };

  return {
    // SSR-safe data fetching
    fetchCourses,
    fetchAllCourseDetails,
    fetchCourseById,
    fetchSessionTemplates,
    fetchSkills,
    fetchSessionReport,

    // Client-side mutations
    updateCourseAthletes,
    createSession,
    updateSessionTemplate,
    deleteSessionTemplate,
    createCourse,
    updateCourse,
    updateCourseArchiveStatus,
    deleteCourse,
    uploadCourseImage,
    saveSessionCompletions,
    updateSessionStatus,

    // Utility functions
    findSessionById,
  };
}
