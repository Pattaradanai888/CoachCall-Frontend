import type { AthleteDetail } from '../types/athlete';
import type { CourseDetail, Session } from '../types/course';

import { ref } from 'vue';

// The data structure for a single, completed evaluation
export interface FinalEvaluationData {
  scores: Record<string, number>;
  notes: string;
  time: number; // Time taken for this specific evaluation
}

// The complete data package for the session report
export interface SessionReportData {
  course: CourseDetail | undefined;
  session: Session | undefined;
  participatingAthletes: AthleteDetail[];
  evaluations: Record<string, FinalEvaluationData>; // Key: "athleteId-taskId"
  totalSessionTime: number;
}

// A global, shared state for the report data
const reportData = ref<SessionReportData | null>(null);

export function useSessionReport() {
  /**
   * Sets the report data in the shared state.
   * This is called from start.vue before navigating to the report.
   * @param data - The complete session report data.
   */
  const setReportData = (data: SessionReportData) => {
    reportData.value = data;
  };

  return {
    reportData,
    setReportData,
  };
}
