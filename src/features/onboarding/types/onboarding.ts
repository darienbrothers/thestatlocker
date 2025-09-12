export interface OnboardingData {
  // Personal Info
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;

  // Sport Info
  sport?: string;
  gender?: 'boys' | 'girls';
  position?: string;
  graduationYear?: number;

  // High School Info
  schoolName?: string;
  city?: string;
  state?: string;
  level?: 'Varsity' | 'JV' | 'Freshman';
  jerseyNumber?: string;

  // Club Info
  clubEnabled?: boolean;
  clubOrgName?: string;
  clubTeamName?: string;
  clubCity?: string;
  clubState?: string;
  clubJerseyNumber?: string;

  // Goals
  goals?: string[];

  // Academic Info
  gpa?: string;
  hasHonorsAP?: boolean | null;
  satScore?: string;
  actScore?: string;
  academicInterest?: string;
  academicAwards?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  component: string;
  isComplete: boolean;
  isRequired: boolean;
}

export type OnboardingFlow = 'quick' | 'extended';
