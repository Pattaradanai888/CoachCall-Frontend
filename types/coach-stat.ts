// types/coach-stat.ts

export interface MotivationalHighlight {
  type: string;
  message: string;
  icon: string;
}

export interface ActivityStats {
  sessions_conducted_month: number;
  courses_created_month: number;
  avg_sessions_per_week: number;
}

export interface EfficiencyStats {
  template_reuse_rate: number;
  sessions_from_template_month: number;
  total_sessions_month: number;
}

export interface EngagementStats {
  active_roster_count: number;
  new_athletes_month: number;
  team_attendance_rate: number | null;
}

export interface TopSkill {
  name: string;
}

export interface SkillFocusItem {
  skill_name: string;
  weight: number;
}

export interface TeamSkillStats {
  athletes_improved_percent: number;
  top_trending_skill: TopSkill | null;
  skill_focus_distribution: SkillFocusItem[];
}

export interface PlayerInsight {
  uuid: string;
  name: string;
  profile_image_url: string | null;
  reason: string;
  change_value: number;
  change_type: 'positive' | 'negative' | 'neutral';
}

export interface CoachStatData {
  highlight: MotivationalHighlight;
  activity: ActivityStats;
  efficiency: EfficiencyStats;
  engagement: EngagementStats;
  skill: TeamSkillStats;
  top_improvers: PlayerInsight[];
  needs_attention: PlayerInsight[];
}
