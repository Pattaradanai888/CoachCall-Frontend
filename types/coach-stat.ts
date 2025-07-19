// types/coach-stat.ts

export interface MotivationalHighlight {
  type: 'NEW_ATHLETES' | 'SKILL_BOOST' | 'PERSONAL_BEST' | 'DEFAULT';
  message: string;
  icon: string;
}

export interface ActivityStats {
  sessionsConducted: number;
  coursesPlanned: number;
  weeklySessionTrend: {
    week: string; // e.g., "07/21"
    count: number;
  }[];
}

export interface EfficiencyStats {
  templateReuseRate: number; // e.g., 60 for 60%
  sessionsFromTemplate: number;
  totalSessions: number;
}

export interface EngagementStats {
  activeRosterCount: number;
  newThisMonth: number;
  teamAttendanceRate: number; // e.g., 92 for 92%
}

export interface TeamSkillStats {
  athletesImprovedPercent: number; // e.g., 82 for 82%
  topTrendingSkill: {
    name: string;
    changePercent: number; // e.g., 8.5 for +8.5%
  } | null;
  skillFocus: {
    skillName: string;
    weight: number;
  }[];
}

export interface PlayerInsight {
  uuid: string;
  name: string;
  profileImageUrl: string | null;
  reason: string; // e.g., "+0.8 Overall" or "Missed 2 sessions"
  changeValue: number; // e.g., 0.8 or -2
  changeType: 'positive' | 'negative' | 'neutral';
}

export interface CoachStatData {
  highlight: MotivationalHighlight;
  activity: ActivityStats;
  efficiency: EfficiencyStats;
  engagement: EngagementStats;
  skill: TeamSkillStats;
  topImprovers: PlayerInsight[];
  needsAttention: PlayerInsight[];
}
