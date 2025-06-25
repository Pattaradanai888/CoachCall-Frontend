// types/course.ts

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
  is_template: boolean;
  status: 'To Do' | 'Complete' | 'In Progress';
  tasks: Task[];
}

export interface SessionTemplate {
  id: number;
  name: string;
  description: string | null;
  total_duration_minutes: number;
  task_count: number;
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

export interface CourseListEntryWithProgress extends CourseListEntry {
  progressValue: number;
}
