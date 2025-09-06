// User Profile Types
export interface UserProfile {
  id: string;
  sport: 'lacrosse';
  gender: 'boys' | 'girls';
  grad_year: number;
  position: Position;
  high_school: HighSchool;
  club?: Club;
  purpose?: Purpose;
  focus_30d?: Focus;
  strengths: string[];
  growth: string[];
  training_days_per_week: number;
  nudge: NudgeSettings;
  motto: string;
  analytics_consent: boolean;
  goals: Goal[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type Position = 'Goalie' | 'Attack' | 'Midfield' | 'Defense' | 'FOGO' | 'LSM' | 'SSDM';

export interface HighSchool {
  name: string;
  city: string;
  state: string;
  level: 'Varsity' | 'JV' | 'Freshman';
}

export interface Club {
  enabled: boolean;
  org_name: string;
  team_name: string;
  city: string;
  state: string;
}

export type Purpose = 'improve' | 'consistent' | 'track' | 'profile' | 'accountable' | 'other';
export type Focus = 'skill' | 'game' | 'conditioning' | 'confidence' | 'leadership';

export interface NudgeSettings {
  time: string;
  days: string[];
  after_games_only: boolean;
}

export interface Goal {
  key: string;
  target: number;
}

// Game/Practice Log Types
export interface GameLog {
  id: string;
  user_id: string;
  type: 'game' | 'practice';
  date: string;
  opponent?: string;
  level: string;
  position: Position;
  stats: PositionStats;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PositionStats {
  // Goalie Stats
  shots?: number;
  saves?: number;
  goals_allowed?: number;
  clears?: number;
  clear_attempts?: number;
  caused_turnovers?: number;
  
  // Attack Stats
  goals?: number;
  assists?: number;
  shots_taken?: number;
  turnovers?: number;
  ride_success?: number;
  ride_attempts?: number;
  
  // Midfield Stats
  ground_balls?: number;
  successful_dodges?: number;
  dodge_attempts?: number;
  clearing_success?: number;
  clearing_attempts?: number;
  
  // Defense Stats
  matchup_goals_allowed?: number;
  penalties?: number;
  slide_success?: number;
  slide_attempts?: number;
  shot_blocks?: number;
  
  // FOGO Stats
  faceoff_wins?: number;
  faceoff_attempts?: number;
  post_win_turnovers?: number;
  exit_speed?: number;
  transition_assists?: number;
  
  // LSM/SSDM Stats
  defensive_stops?: number;
  defensive_attempts?: number;
}

// Game and Stats Types
export interface GameStats {
  goals: number;
  assists: number;
  shots: number;
  shotsOnGoal: number;
  turnovers: number;
  groundBalls: number;
  causedTurnovers: number;
  fouls: number;
  penalties: number;
  // Goalie specific
  saves?: number;
  goalsAgainst?: number;
  // Faceoff specific
  faceoffWins?: number;
  faceoffLosses?: number;
}

export interface Game {
  id: string;
  userId: string;
  date: Date;
  opponent: string;
  venue?: string;
  seasonType: 'School Season' | 'Club Season' | 'Summer League' | 'Tournament';
  gameType: 'Regular Season' | 'Playoff' | 'Championship' | 'Scrimmage';
  isHome: boolean;
  teamScore?: number;
  opponentScore?: number;
  stats: GameStats;
  position: string;
  weather?: string;
  fieldConditions?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingChecklist {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xpReward: number;
  icon: string;
  action: 'LOG_GAME' | 'ADD_COLLEGES' | 'COMPLETE_PROFILE' | 'UPLOAD_PHOTO';
}

export interface TargetCollege {
  id: string;
  name: string;
  division: 'D1' | 'D2' | 'D3' | 'NAIA' | 'JUCO';
  conference?: string;
  location: string;
  priority: 'Dream' | 'Target' | 'Safety';
  notes?: string;
  contactInfo?: {
    coachName?: string;
    coachEmail?: string;
    recruitingCoordinator?: string;
  };
}

// Analytics Types
export interface AnalyticsEvent {
  event_name: string;
  user_id: string;
  timestamp: string;
  properties: Record<string, any>;
}

// Navigation Types
export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  NameEntry: undefined;
  ProfileImage: { firstName: string; lastName: string };
  BasicInfo: { firstName?: string; lastName?: string; profileImage?: string | null | undefined };
  HighSchool: { firstName?: string; lastName?: string; profileImage?: string | null | undefined; gender?: 'boys' | 'girls'; position?: string; graduationYear?: number };
  ClubTeam: { 
    firstName?: string; 
    lastName?: string; 
    profileImage?: string | null | undefined;
    gender?: 'boys' | 'girls'; 
    position?: string; 
    graduationYear?: number;
    schoolName?: string;
    city?: string;
    state?: string;
    level?: 'Varsity' | 'JV' | 'Freshman';
  };
  Academic: { 
    firstName: string; 
    lastName: string; 
    profileImage?: string | null | undefined;
    sport: string;
    gender: 'boys' | 'girls'; 
    position: string; 
    graduationYear: number;
    height: string;
    schoolName: string;
    city: string;
    state: string;
    level: 'Varsity' | 'JV' | 'Freshman';
    jerseyNumber?: string;
    clubEnabled: boolean;
    clubOrgName: string;
    clubTeamName: string;
    clubCity: string;
    clubState: string;
    clubJerseyNumber: string;
  };
  Goals: { 
    firstName: string; 
    lastName: string; 
    profileImage?: string | null | undefined;
    sport: string;
    gender: 'boys' | 'girls'; 
    position: string; 
    graduationYear: number;
    height: string;
    schoolName: string;
    city: string;
    state: string;
    level: 'Varsity' | 'JV' | 'Freshman';
    jerseyNumber?: string;
    clubEnabled: boolean;
    clubOrgName: string;
    clubTeamName: string;
    clubCity: string;
    clubState: string;
    clubJerseyNumber: string;
    // Academic data
    gpa: string;
    hasHonorsAP: boolean | null;
    satScore: string;
    actScore: string;
    academicInterest: string;
    academicAwards: string;
  };
  Review: { 
    firstName?: string; 
    lastName?: string; 
    profileImage?: string | null | undefined;
    gender?: 'boys' | 'girls'; 
    position?: string; 
    graduationYear?: number;
    schoolName?: string;
    city?: string;
    state?: string;
    level?: 'Varsity' | 'JV' | 'Freshman';
    clubEnabled?: boolean;
    clubOrgName?: string;
    clubTeamName?: string;
    clubCity?: string;
    clubState?: string;
    goals?: any;
    strengths?: string[];
    growthAreas?: string[];
  };
  Paywall: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Stats: undefined;
  AddStat: undefined;
  Recruiting: undefined;
  Goals: undefined;
};

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
}

// Store Types (Zustand)
export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export interface GameLogState {
  logs: GameLog[];
  isLoading: boolean;
  addLog: (log: Omit<GameLog, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  getLogs: (userId: string) => Promise<void>;
  updateLog: (id: string, updates: Partial<GameLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}
