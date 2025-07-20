import type {
  LeaderboardAthlete,
  AthleteDetail,
  SkillProgressionDetail,
} from '~/types/leaderboard';

interface BackendLeaderboardAthlete {
  uuid: string;
  name: string;
  position: string;
  profile_image_url: string | null;
  rank: number;
  current_score: number;
  improvement_since_day_one: number;
  improvement_slope: number;
}

interface BackendLeaderboardResponse {
  athletes: BackendLeaderboardAthlete[];
}

interface AthleteSkillProgressionResponse {
  day_one: { skill_name: string; average_score: number }[];
  current: { skill_name: string; average_score: number }[];
}

function transformBackendAthlete(backendAthlete: BackendLeaderboardAthlete): LeaderboardAthlete {
  return {
    uuid: backendAthlete.uuid,
    name: backendAthlete.name,
    position: backendAthlete.position,
    profileImageUrl: backendAthlete.profile_image_url,
    rank: backendAthlete.rank,
    currentScore: backendAthlete.current_score,
    improvementSinceDayOne: backendAthlete.improvement_since_day_one,
    improvementSlope: backendAthlete.improvement_slope,
  };
}

export function useLeaderboard() {
  const { $api } = useNuxtApp();

  // SSR-optimized leaderboard data fetching with proper cache key
  const fetchLeaderboard = () => {
    return useAsyncData<LeaderboardAthlete[]>(
      'leaderboard-athletes',
      async () => {
        const response = await $api<BackendLeaderboardResponse>('/analytics/leaderboard');
        // Transform the backend response to frontend format
        return response.athletes?.map(transformBackendAthlete) || [];
      },
      {
        default: () => [],
        server: true, // Ensure SSR
      },
    );
  };

  // SSR-friendly athlete detail fetching with individual cache keys
  const fetchAthleteDetail = (athleteUuid: string | globalThis.Ref<string>) => {
    const uuid = typeof athleteUuid === 'string' ? athleteUuid : unref(athleteUuid);
    
    return useAsyncData<AthleteDetail | null>(
      `athlete-detail-${uuid}`,
      async () => {
        // Skip if no UUID is provided
        if (!uuid) {
          return null;
        }

        try {
          // First get base athlete data from leaderboard
          const leaderboardResponse = await $api<BackendLeaderboardResponse>('/analytics/leaderboard');
          const backendAthleteData = leaderboardResponse.athletes?.find(athlete => athlete.uuid === uuid);
          
          if (!backendAthleteData) {
            console.warn(`Athlete with UUID ${uuid} not found in leaderboard`);
            return null;
          }

          // Transform to frontend format
          const baseAthleteData = transformBackendAthlete(backendAthleteData);

          // Then fetch skill progression data
          const skillProgression = await $api<AthleteSkillProgressionResponse>(
            `/athlete/${uuid}/skill-progression`,
          );

          const mappedSkills: SkillProgressionDetail[] = skillProgression.current.map((currentSkill) => {
            const dayOneSkill = skillProgression.day_one.find(
              s => s.skill_name === currentSkill.skill_name,
            );
            return {
              skillName: currentSkill.skill_name,
              currentScore: currentSkill.average_score,
              dayOneScore: dayOneSkill ? dayOneSkill.average_score : 0,
            };
          });

          return {
            ...baseAthleteData,
            skillProgression: mappedSkills,
          } as AthleteDetail;
        } catch (error) {
          console.error(`Failed to fetch details for athlete ${uuid}:`, error);
          return null;
        }
      },
      {
        default: () => null,
        server: true, // Enable SSR
        // Only watch if it's a ref
        ...(typeof athleteUuid !== 'string' && { watch: [athleteUuid] }),
        transform: (data: AthleteDetail | null) => data,
      },
    );
  };

  // Refresh leaderboard data - useful for manual refresh
  const refreshLeaderboard = async () => {
    return await refreshCookie('leaderboard-athletes');
  };

  // Refresh specific athlete detail
  const refreshAthleteDetail = async (athleteUuid: string) => {
    return await refreshCookie(`athlete-detail-${athleteUuid}`);
  };

  return {
    fetchLeaderboard,
    fetchAthleteDetail,
    refreshLeaderboard,
    refreshAthleteDetail,
  };
}