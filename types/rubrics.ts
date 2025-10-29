// types/rubrics.ts - TypeScript definitions for indicator-based evaluation system

/**
 * Rating scale for indicators:
 * 1 = Needs Improvement (red)
 * 2 = Developing (yellow)
 * 3 = Proficient (green)
 */
export type IndicatorRating = 1 | 2 | 3

/**
 * Descriptions for each proficiency level of an indicator
 */
export interface IndicatorDescriptions {
  1: string  // Needs Improvement description
  2: string  // Developing description
  3: string  // Proficient description
}

/**
 * Single indicator definition within a skill rubric
 */
export interface Indicator {
  title: string
  descriptions: IndicatorDescriptions
}

/**
 * Complete rubric definition for a basketball skill
 * Returned by GET /api/rubrics/{skill_name}
 */
export interface RubricResponse {
  skill_name: string
  indicators: Indicator[]
}

/**
 * List of all available skills that have rubric definitions
 * Returned by GET /api/rubrics/skills
 */
export interface AvailableSkillsResponse {
  skills: string[]
}

/**
 * Frontend state: indicator ratings for a single skill
 * Example: { "Stance": 3, "Elbow Placement": 2, "Release": 3 }
 */
export interface IndicatorRatings {
  [indicatorName: string]: IndicatorRating
}

/**
 * Frontend state: all skill evaluations for a task
 * Example: { 1: { "Stance": 3, "Elbow": 2 }, 2: { "Control": 3 } }
 */
export interface SkillEvaluations {
  [skillId: number]: IndicatorRatings
}

/**
 * Single task completion payload (one athlete-task combination)
 * Sent to backend in POST /api/session/{id}/complete
 */
export interface TaskCompletionPayload {
  athlete_uuid: string
  task_id: number
  score: number  // Weighted task score (frontend calculates from skill weights)
  scores: SkillEvaluations  // Raw indicator ratings (backend will calculate skill percentages)
  notes?: string | null
  time: number  // seconds spent on this task
}

/**
 * Complete session completion payload
 * Sent to backend in POST /api/session/{id}/complete
 */
export interface SessionCompletionPayload {
  completions: TaskCompletionPayload[]
  totalSessionTime: number  // total seconds for entire session
}

/**
 * Skill with metadata for UI (combines skill ID with rubric info)
 */
export interface SkillWithRubric {
  skillId: number
  skillName: string
  weight: number  // 0.0-1.0 (displayed as percentage)
  rubric: RubricResponse | null
  loading: boolean
  error: string | null
}

/**
 * Validation result for indicator ratings
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  incompleteSkills: string[]  // List of skill names with incomplete ratings
}

/**
 * Helper type for level labels
 */
export const LEVEL_LABELS: Record<IndicatorRating, string> = {
  1: 'Needs Improvement',
  2: 'Developing',
  3: 'Proficient'
}

/**
 * Helper type for level colors (Tailwind classes)
 */
export const LEVEL_COLORS = {
  1: {
    bg: 'bg-red-500',
    bgHover: 'hover:bg-red-600',
    bgSelected: 'bg-red-600',
    bgLight: 'bg-red-100',
    text: 'text-red-700',
    textWhite: 'text-white',
    border: 'border-red-500',
    ring: 'ring-red-500'
  },
  2: {
    bg: 'bg-yellow-500',
    bgHover: 'hover:bg-yellow-600',
    bgSelected: 'bg-yellow-600',
    bgLight: 'bg-yellow-100',
    text: 'text-yellow-700',
    textWhite: 'text-white',
    border: 'border-yellow-500',
    ring: 'ring-yellow-500'
  },
  3: {
    bg: 'bg-green-500',
    bgHover: 'hover:bg-green-600',
    bgSelected: 'bg-green-600',
    bgLight: 'bg-green-100',
    text: 'text-green-700',
    textWhite: 'text-white',
    border: 'border-green-500',
    ring: 'ring-green-500'
  }
} as const
