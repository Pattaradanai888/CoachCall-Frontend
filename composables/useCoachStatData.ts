// composables/useCoachStatData.ts
import type { CoachStatData } from '~/types/coach-stat';

export function useCoachStatData() {
  const { $api } = useNuxtApp();

  const data = ref<CoachStatData | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  async function fetchData() {
    isLoading.value = true;
    error.value = null;

    try {
      // IMPORTANT: This assumes a new backend endpoint at '/analytics/coach-stats/all'
      // that returns a single JSON object matching the `CoachStatData` type.
      // Until that endpoint is built, we will use mock data.
      //
      // const response = await $api<CoachStatData>('/analytics/coach-stats/all');
      // data.value = response;

      // --- MOCK DATA FOR DEMONSTRATION ---
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      data.value = {
        highlight: {
          type: 'SKILL_BOOST',
          message: 'Your data-driven approach improved team Dribbling by 15% this month - that\'s 3x faster than traditional methods!',
          icon: 'mdi:trending-up',
        },
        activity: {
          sessionsConducted: 18,
          coursesPlanned: 4,
          weeklySessionTrend: [
            { week: '05/05', count: 2 },
            { week: '05/12', count: 3 },
            { week: '05/19', count: 1 },
            { week: '05/26', count: 4 },
            { week: '06/02', count: 2 },
            { week: '06/09', count: 5 },
            { week: '06/16', count: 3 },
            { week: '06/23', count: 4 },
            { week: '06/30', count: 2 },
            { week: '07/07', count: 6 },
            { week: '07/14', count: 3 },
            { week: '07/21', count: 4 },
          ],
        },
        efficiency: {
          templateReuseRate: 75,
          sessionsFromTemplate: 14,
          totalSessions: 18,
        },
        engagement: {
          activeRosterCount: 28,
          newThisMonth: 4,
          teamAttendanceRate: 94,
        },
        skill: {
          athletesImprovedPercent: 89,
          topTrendingSkill: { name: 'Dribbling', changePercent: 15.2 },
          skillFocus: [
            { skillName: 'Shooting', weight: 35 },
            { skillName: 'Defense', weight: 28 },
            { skillName: 'Dribbling', weight: 22 },
            { skillName: 'Rebounding', weight: 15 },
          ],
        },
        topImprovers: [
          { uuid: '1', name: 'Michael Jordan', profileImageUrl: null, reason: '+1.2 Overall', changeValue: 1.2, changeType: 'positive' },
          { uuid: '2', name: 'Sarah Johnson', profileImageUrl: null, reason: '+0.9 Defense', changeValue: 0.9, changeType: 'positive' },
          { uuid: '3', name: 'Alex Chen', profileImageUrl: null, reason: '+0.8 Shooting', changeValue: 0.8, changeType: 'positive' },
        ],
        needsAttention: [
          { uuid: '4', name: 'Jamie Wilson', profileImageUrl: null, reason: 'Missed 3 sessions', changeValue: -3, changeType: 'negative' },
          { uuid: '5', name: 'Taylor Brown', profileImageUrl: null, reason: 'Plateau in skills', changeValue: 0, changeType: 'neutral' },
        ],
      };
      // --- END MOCK DATA ---
    }
    catch (e) {
      error.value = 'Failed to load coach statistics. Please try again.';
      console.error(e);
    }
    finally {
      isLoading.value = false;
    }
  }

  return {
    data,
    isLoading,
    error,
    fetchData,
  };
}
