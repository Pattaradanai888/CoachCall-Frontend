// types/coach-stat.ts

export interface MotivationalHighlight {
  type: string;
  message: string;
  icon: string;
}

export interface ComparativeStat {
  current: number;
  previous: number | null;
  change_percent: number | null;
}

export interface ActivityStats {
  sessions_conducted_month: ComparativeStat;
  courses_created_month: ComparativeStat;
  avg_sessions_per_week: number;
}

export interface EfficiencyStats {
  template_reuse_rate: number;
  sessions_from_template_month: number;
  total_sessions_month: number;
}

export interface GrowthInsight {
  trend_type: string;
  narrative: string;
}

export interface EngagementStats {
  active_roster_count: number;
  new_athletes_month: ComparativeStat;
  team_attendance_rate: number | null;
  growth_insight: GrowthInsight;
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
