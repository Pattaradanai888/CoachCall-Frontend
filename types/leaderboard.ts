// types/leaderboard.ts

export interface SkillProgressionDetail {
  skillName: string;
  dayOneScore: number;
  currentScore: number;
}

export interface LeaderboardAthlete {
  uuid: string;
  name: string;
  position: string;
  profileImageUrl: string | null;
  rank: number;
  currentScore: number; // The latest overall EMA score
  improvementSinceDayOne: number; // The magnitude
  improvementSlope: number; // The momentum/consistency
}

export interface AthleteDetail extends LeaderboardAthlete {
    skillProgression: SkillProgressionDetail[];
}