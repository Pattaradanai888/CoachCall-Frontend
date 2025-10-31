// types/course.ts
import type { SessionSkillComparison } from './analytics';

export interface Skill {
  id: number;
  name: string;
  description: string | null;
  user_id: number;
}

export interface SkillCreate {
  name: string;
  description?: string | null;
}

export interface TaskSkillWeightPayload {
  skill_id: number;
  weight: number;
}

export interface TaskCreatePayload {
  id?: number;
  name: string;
  description?: string | null;
  duration_minutes: number;
  sequence?: number;
  skill_weights: TaskSkillWeightPayload[];
}

export interface SessionCreatePayload {
  id?: number;
  name: string;
  description?: string | null;
  scheduled_date: string;
  is_template?: boolean;
  sequence?: number;
  tasks: TaskCreatePayload[];
}

export interface CourseCreatePayload {
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  start_date: string;
  end_date: string;
  sessions: SessionCreatePayload[];
  attendee_ids?: string[];
}

export interface CourseListEntry {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  attendee_count: number;
  is_archived: boolean;
  cover_image_url: string | null;
}

export interface Attendee {
  uuid: string;
  name: string;
  profile_image_url: string | null;
  positions: Array<{
    id: number;
    name: string;
  }>;
}

export interface CourseDetail {
  id: number;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_archived: boolean;
  start_date: string;
  end_date: string;
  sessions: Session[];
  attendees: Attendee[];
}

export interface Session {
  date: string | null;
  id: number;
  name: string;
  description: string | null;
  scheduled_date: string;
  completed_at: string | null;
  is_template: boolean;
  status: 'To Do' | 'Complete' | 'In Progress';
  tasks: SessionTask[];
  task_count: number;
  total_duration_minutes: number;

  completions?: TaskCompletion[];
  evaluationData?: Record<string, FinalEvaluationData>;
  totalSessionTime?: number;
}

export interface TaskCompletion {
  id: number;
  athlete_uuid: string;
  task_id: number;
  final_score: number;
  notes: string | null;
  time: number;
  completed_at: string;
  scores_breakdown: Record<string, unknown>;
}

export interface SessionTemplate {
  tasks: SessionTask[];
  id: number;
  name: string;
  description: string | null;
  total_duration_minutes: number;
  task_count: number;
  scheduled_date: string;
}

export interface Task {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  skill_weights: Array<{
    skill_id: number;
    weight: string;
    skill_name: string;
  }>;
}

export interface SessionTask {
  sequence: number;
  task: Task;
}

export interface TaskFull {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  selectedSkillIds: number[];
  skillWeights: Record<number, number>;
}

export interface DroppedItem extends SessionTemplate {
  timelineId: string;
  date: Date | null;
  tasks_full?: TaskFull[];
}

export interface CourseListEntryWithProgress extends CourseListEntry {
  progressValue: number;
}

export interface TaskCompletionPayload {
  athlete_uuid: string;
  task_id: number;
  score: number;  // Not used in new system - backend calculates from indicator ratings
  scores: Record<number, number> | Record<number, Record<string, number>>;  // OLD: skill_id → score | NEW: skill_id → { indicator: rating }
  notes: string;
  time: number;
}
export interface SessionCompletionPayload {
  completions: TaskCompletionPayload[];
  totalSessionTime: number;
}

export interface FinalEvaluationData {
  scores: Record<string, number>;
  notes: string;
  time: number;
}

export interface SessionInsights {
  summary: string;
  athleteNotes: Record<string, string>; // athleteUUID → note
  teamPattern: string | null;
  actionItems: string[];
}

export interface SessionReportData {
  course: CourseDetail | null;
  session: Session;
  participatingAthletes: Attendee[];
  skillComparisonData: Record<string, SessionSkillComparison>;
  evaluations: Record<string, FinalEvaluationData>;
  totalSessionTime: number;
  insights: SessionInsights;
}

export interface EventItem {
  id: number;
  title: string;
  date: string;
  type: 'course' | 'quick_session';
  is_complete: boolean;
  course_id: number | null;
  course_name: string | null;
}
