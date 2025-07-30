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

  // Optimized athlete detail fetching that reuses leaderboard data
  const fetchAthleteDetail = (athleteUuid: string, leaderboardAthletes?: LeaderboardAthlete[]) => {
    return useAsyncData<AthleteDetail | null>(
      `athlete-detail-${athleteUuid}`,
      async () => {
        // Skip if no UUID is provided
        if (!athleteUuid) {
          return null;
        }

        try {
          let baseAthleteData: LeaderboardAthlete | undefined;

          // First try to find the athlete in the provided leaderboard data
          if (leaderboardAthletes) {
            baseAthleteData = leaderboardAthletes.find(athlete => athlete.uuid === athleteUuid);
          }

          // If not found in provided data, fetch from API (fallback)
          if (!baseAthleteData) {
            console.warn(`Athlete ${athleteUuid} not found in leaderboard data, fetching from API`);
            const leaderboardResponse = await $api<BackendLeaderboardResponse>('/analytics/leaderboard');
            const backendAthleteData = leaderboardResponse.athletes?.find(athlete => athlete.uuid === athleteUuid);
            
            if (!backendAthleteData) {
              console.warn(`Athlete with UUID ${athleteUuid} not found in leaderboard`);
              return null;
            }

            baseAthleteData = transformBackendAthlete(backendAthleteData);
          }

          // Fetch skill progression data (this is the only API call we actually need)
          const skillProgression = await $api<AthleteSkillProgressionResponse>(
            `/athlete/${athleteUuid}/skill-progression`,
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
          console.error(`Failed to fetch details for athlete ${athleteUuid}:`, error);
          return null;
        }
      },
      {
        default: () => null,
        server: false, // Don't fetch on SSR since we need the athleteUuid selection
      },
    );
  };

  // More efficient method for fetching athlete details when you already have leaderboard data
  const fetchAthleteDetailOptimized = async (athleteUuid: string, leaderboardAthletes: LeaderboardAthlete[]) => {
    if (!athleteUuid) return null;

    try {
      // Find athlete in already-fetched leaderboard data (no API call needed)
      const baseAthleteData = leaderboardAthletes.find(athlete => athlete.uuid === athleteUuid);
      
      if (!baseAthleteData) {
        console.warn(`Athlete ${athleteUuid} not found in provided leaderboard data`);
        return null;
      }

      // Only fetch skill progression data (the only API call we need)
      const skillProgression = await $api<AthleteSkillProgressionResponse>(
        `/athlete/${athleteUuid}/skill-progression`,
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
      console.error(`Failed to fetch details for athlete ${athleteUuid}:`, error);
      return null;
    }
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
    fetchAthleteDetailOptimized,
    refreshLeaderboard,
    refreshAthleteDetail,
  };
}