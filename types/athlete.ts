import { z } from 'zod';

// Zod schema for athlete form validation
export const athleteSchema = z.object({
  name: z.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters'),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  age: z.number().min(0).max(100),
  phoneNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  weight: z.number().min(0).optional().nullable(),
  height: z.number().min(0).optional().nullable(),
  position: z.string().optional(),
  dominantHand: z.string().optional(),
  experienceLevel: z.string().optional(),
  group: z.string().optional(),
  jerseyNumber: z.number().min(0).max(99).optional().nullable(),
  notes: z.string().optional(),
  profileImageFile: z.instanceof(File).optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
});

// TypeScript type inferred from Zod schema
export type NewAthleteForm = z.infer<typeof athleteSchema>;

// Athlete interface for the complete athlete object
export interface Athlete {
  id: number;
  name: string;
  preferredName?: string;
  displayName: string;
  position: string;
  age: number;
  height?: number | null;
  weight?: number | null;
  dominantHand: string;
  experienceLevel: string;
  dateOfBirth: string;
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profileImageUrl?: string | null;
  group: string;
  jerseyNumber?: number | null;
  notes?: string;
  totalPowerRate: number;
  developmentRate: number;
  lastAssessmentDate: string | null;
  skillScores: SkillScore[];
  createdAt: string;
}

export interface SkillScore {
  name: string;
  value: number;
}

// Position options
export const POSITIONS = [
  { value: '', label: 'Not specified' },
  { value: 'Point Guard', label: 'Point Guard (PG)' },
  { value: 'Shooting Guard', label: 'Shooting Guard (SG)' },
  { value: 'Small Forward', label: 'Small Forward (SF)' },
  { value: 'Power Forward', label: 'Power Forward (PF)' },
  { value: 'Center', label: 'Center (C)' },
  { value: 'Versatile', label: 'Versatile/Multiple Positions' },
] as const;

// Dominant hand options
export const DOMINANT_HANDS = [
  { value: '', label: 'Not specified' },
  { value: 'Right', label: 'Right' },
  { value: 'Left', label: 'Left' },
  { value: 'Ambidextrous', label: 'Ambidextrous' },
] as const;

// Experience level options
export const EXPERIENCE_LEVELS = [
  { value: '', label: 'Select level' },
  { value: 'Beginner', label: 'Beginner (New to basketball)' },
  { value: 'Novice', label: 'Novice (Some experience)' },
  { value: 'Intermediate', label: 'Intermediate (Regular player)' },
  { value: 'Advanced', label: 'Advanced (Competitive player)' },
  { value: 'Elite', label: 'Elite (High-level competitive)' },
] as const;

// Group/Team options
export const GROUPS = [
  { value: '', label: 'Not assigned yet' },
  { value: 'Varsity Team', label: 'Varsity Team' },
  { value: 'Junior Varsity', label: 'Junior Varsity' },
  { value: 'Under-18', label: 'Under-18' },
  { value: 'Under-16', label: 'Under-16' },
  { value: 'Under-14', label: 'Under-14' },
  { value: 'Beginners Group', label: 'Beginners Group' },
  { value: 'Development Squad', label: 'Development Squad' },
] as const;
