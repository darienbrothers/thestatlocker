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
  OnboardingStart: undefined;
  OnboardingQuick: undefined;
  OnboardingExtended: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Locker: undefined;
  Stats: undefined;
  Goals: undefined;
  Recruiting: undefined;
  Profile: undefined;
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
