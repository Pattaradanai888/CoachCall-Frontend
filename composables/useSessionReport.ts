import type { SessionReportData } from '../types/course';

const reportData = ref<SessionReportData | null>(null);

export function useSessionReport() {
  const setReportData = (data: SessionReportData) => {
    reportData.value = data;
  };

  return {
    reportData,
    setReportData,
  };
}
