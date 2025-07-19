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
          message: 'Team Dribbling is up 12% in the last 30 days.',
          icon: 'mdi:arrow-top-right-bold-box-outline',
        },
        activity: {
          sessionsConducted: 12,
          coursesPlanned: 3,
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
          templateReuseRate: 60,
          sessionsFromTemplate: 6,
          totalSessions: 10,
        },
        engagement: {
          activeRosterCount: 24,
          newThisMonth: 3,
          teamAttendanceRate: 92,
        },
        skill: {
          athletesImprovedPercent: 82,
          topTrendingSkill: { name: 'Dribbling', changePercent: 8.5 },
          skillFocus: [
            { skillName: 'Shooting', weight: 40 },
            { skillName: 'Defense', weight: 30 },
            { skillName: 'Dribbling', weight: 20 },
            { skillName: 'Rebounding', weight: 10 },
          ],
        },
        topImprovers: [
          { uuid: '1', name: 'Michel Jordan', profileImageUrl: null, reason: '+0.8 Overall', changeValue: 0.8, changeType: 'positive' },
          { uuid: '2', name: 'Jane Doe', profileImageUrl: null, reason: '+0.6 Overall', changeValue: 0.6, changeType: 'positive' },
        ],
        needsAttention: [
          { uuid: '3', name: 'John Smith', profileImageUrl: null, reason: 'Missed 2 sessions', changeValue: -2, changeType: 'negative' },
          { uuid: '4', name: 'Emily White', profileImageUrl: null, reason: 'Skill Stagnated', changeValue: 0, changeType: 'neutral' },
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
