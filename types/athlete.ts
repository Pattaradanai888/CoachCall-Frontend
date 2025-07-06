// types/athlete.ts
import { z } from 'zod';

// --- Reusable Zod Schemas ---
const optionalNumber = z.preprocess(
  val => (val === '' || val === null ? undefined : Number(val)),
  z.number().min(0).optional(),
);
const optionalString = z.string().optional().nullable();

// --- Interfaces from Backend Schemas ---

export interface Group {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
}

export interface ExperienceLevel {
  id: number;
  name: string;
}

export interface SkillScore {
  skillId: number;
  currentScore: number;
  skillName: string;
}

// --- Frontend Data Models ---

// Represents an athlete in the list view
export interface AthleteListEntry {
  uuid: string;
  name: string;
  age: number | null;
  preferredName?: string;
  position: string; // Combined string of positions
  profileImageUrl: string | null;
}

// Represents the detailed athlete object used in the UI
export interface AthleteDetail {
  uuid: string;
  userId: number;
  name: string;
  preferredName?: string;
  displayName: string; // Helper for UI: "Name (Preferred)"
  age: number | null;
  height?: number;
  weight?: number;
  dominantHand?: string;
  dateOfBirth: string | null; // YYYY-MM-DD
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  jerseyNumber?: number;
  profileImageUrl: string | null;

  // Relationships
  experienceLevel: ExperienceLevel | null;
  groups: Group[];
  positions: Position[];
  skillScores: SkillScore[];
}

// --- API Response Types ---
export interface AthleteListResponse {
  uuid: string;
  name: string;
  age: number | null;
  preferred_name?: string;
  position: string;
  profile_image_url: string | null;
}

export interface AthleteResponse {
  uuid: string;
  user_id: number;
  name: string;
  preferred_name?: string;
  age: number | null;
  height?: number;
  weight?: number;
  dominant_hand?: string;
  date_of_birth: string; // ISO Date string
  phone_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  jersey_number?: number;
  profile_image_url: string | null;
  experience_level: ExperienceLevel | null;
  groups: Group[];
  positions: Position[];
  skill_levels: Array<{
    skill_id: number;
    current_score: string; // Backend sends Decimal as string
    skill_name: string | null;
  }>;
}

export interface AthleteSelectionInfo {
  uuid: string;
  name: string;
  profile_image_url: string | null;
  positions: { id: number; name: string }[];
  age: number | null;
  groups: Group[];
}

// --- Dashboard & Stats Types ---

export interface TrendDataPoint {
  date: string;
  day_name: string;
  formatted_date: string;
  count: number;
}

export interface AthleteInsights {
  week_change_percent: number | null;
  peak_day: string | null;
  avg_daily: number;
  is_growing: boolean | null;
}

export interface AthleteCreationStatus {
  today: number;
  week: number;
  month: number;
  total: number;
  trend: number[];
  trend_detailed: TrendDataPoint[];
  insights: AthleteInsights;
}

// --- Form Validation Schema (Zod) ---
export const athleteSchema = z.object({
  name: z.string().min(1, 'Full name is required').max(100),
  preferredName: optionalString,
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  age: optionalNumber,
  profileImageFile: z
    .custom<File>(val => val instanceof File, 'Invalid file type')
    .optional()
    .nullable(),

  // Optional fields
  height: optionalNumber.optional(),
  weight: optionalNumber.optional(),
  dominantHand: optionalString,
  phoneNumber: optionalString,
  emergencyContactName: optionalString,
  emergencyContactPhone: optionalString,
  notes: z.string().max(1000).optional().nullable(),
  jerseyNumber: optionalNumber.optional(),

  // IDs from selects
  experienceLevelId: optionalString,
  groupIds: z.array(z.string()).optional(),
  positionIds: z.array(z.string()).optional(),
});

export type AthleteFormValues = z.infer<typeof athleteSchema>;

// --- Constants ---
export const DOMINANT_HANDS = [
  { value: '', label: 'Select...' },
  { value: 'Right', label: 'Right' },
  { value: 'Left', label: 'Left' },
  { value: 'Ambidextrous', label: 'Ambidextrous' },
];

export const EXPERIENCE_LEVELS = [
  { value: '', label: 'Select...' },
  { value: '1', label: 'Beginner' },
  { value: '2', label: 'Intermediate' },
  { value: '3', label: 'Advanced' },
  { value: '4', label: 'Expert' },
];

export interface SkillPoint {
  skillName: string;
  averageScore: number;
}

export interface AthleteSkillProgression {
  dayOne: SkillScore[];
  current: SkillScore[];
}

export interface SkillProgressionResponsePoint {
  skill_id: number;
  skill_name: string;
  average_score: string;
}

export interface AthleteSkillProgressionResponse {
  day_one: SkillProgressionResponsePoint[];
  current: SkillProgressionResponsePoint[];
}
