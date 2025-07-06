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
  name: string;
  description?: string | null;
  duration_minutes: number;
  skill_weights: TaskSkillWeightPayload[];
}

export interface SessionCreatePayload {
  name: string;
  description?: string | null;
  scheduled_date: string;
  is_template?: boolean;
  tasks: TaskCreatePayload[];
}

export interface CourseCreatePayload {
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  start_date: string;
  end_date: string;
  sessions: any[];
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
  date: any;
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

  completions?: any[];
  evaluationData?: Record<string, FinalEvaluationData>;
  totalSessionTime?: number;
}

export interface SessionTemplate {
  tasks: any;
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

export interface DroppedItem extends SessionTemplate {
  timelineId: string;
  date: Date | null;
  tasks_full?: any[];
}

export interface CourseListEntryWithProgress extends CourseListEntry {
  progressValue: number;
}

export interface TaskCompletionPayload {
  athlete_uuid: string;
  task_id: number;
  score: number;
  scores: Record<number, number>;
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

export interface SessionReportData {
  course: CourseDetail | null;
  session: Session;
  participatingAthletes: Attendee[];
  skillComparisonData: Record<string, SessionSkillComparison>;
  evaluations: Record<string, FinalEvaluationData>;
  totalSessionTime: number;
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
