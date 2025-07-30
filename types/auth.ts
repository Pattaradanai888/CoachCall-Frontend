// types/auth.ts
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  display_name: string;
  profile_image_url?: string | null;
  has_completed_onboarding: boolean;
}

export interface User {
  id: number;
  email: string;
  fullname: string; // This still exists because of our .transform()!
  profile?: UserProfile | null; // Optional profile object
  profile_image_url?: string | null; // Backward compatibility
  [key: string]: unknown;
}

// Helper type for profile updates - makes display_name optional for partial updates
export interface UserProfileUpdate {
  display_name?: string;
  profile_image_url?: string | null;
  has_completed_onboarding?: boolean;
}

// Helper type for user updates
export interface UserUpdate extends Partial<Omit<User, 'profile'>> {
  profile?: UserProfileUpdate;
}

// Type guard to check if a user has a complete profile
export function hasCompleteProfile(user: User): user is User & { profile: UserProfile } {
  return !!(user.profile && user.profile.display_name);
}

// Helper function to ensure a user has the required profile fields
export function normalizeUserProfile(user: Partial<User>): User {
  const profile: UserProfile = {
    display_name: user.profile?.display_name || user.fullname || 'N/A',
    profile_image_url: user.profile?.profile_image_url || user.profile_image_url || null,
    has_completed_onboarding: user.profile?.has_completed_onboarding ?? false,
  };

  return {
    id: user.id || 0,
    email: user.email || '',
    fullname: user.fullname || profile.display_name,
    profile,
    profile_image_url: profile.profile_image_url,
    ...user,
  };
}
