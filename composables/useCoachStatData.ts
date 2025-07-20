// composables/useCoachStatData.ts
import type { CoachStatData } from '~/types/coach-stat';

export function useCoachStatData() {
  const { $api } = useNuxtApp();
  const fetchCoachStats = () => {
    return useAsyncData<CoachStatData>(
      'coach-dashboard-stats',
      () => $api<CoachStatData>('/analytics/coach-stats/all'),

      {
        server: true,
        default: () => null,
        transform: (data: CoachStatData) => data || null,
      },
    );
  };

  return {
    fetchCoachStats,
  };
}
