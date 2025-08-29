// Gamification System Utilities
// Based on "Duolingo-meets-sports" spec

export interface XPReward {
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: string;
  xpRequired?: number;
  isUnlocked: boolean;
}

export interface Level {
  id: string;
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
}

// XP Values from spec
export const XP_VALUES = {
  ROOKIE_PATH: 50,
  PRO_PATH: 150,
  QUICK_QUEST: 10,
  EXTENDED_STEP: 20,
} as const;

// Level System
export const LEVELS: Level[] = [
  {
    id: 'rookie',
    name: 'Rookie',
    minXP: 0,
    maxXP: 100,
    color: '#10B981', // Green
    icon: '⚡',
  },
  {
    id: 'varsity',
    name: 'Varsity',
    minXP: 101,
    maxXP: 300,
    color: '#3B82F6', // Blue
    icon: '🏃',
  },
  {
    id: 'allstar',
    name: 'All-Star',
    minXP: 301,
    maxXP: 600,
    color: '#8B5CF6', // Purple
    icon: '⭐',
  },
  {
    id: 'captain',
    name: 'Captain',
    minXP: 601,
    maxXP: Infinity,
    color: '#F59E0B', // Gold
    icon: '👑',
  },
];

// Badge Definitions
export const BADGES: Badge[] = [
  {
    id: 'rookie_badge',
    name: 'Rookie Badge',
    description: 'Complete Quick Start onboarding',
    icon: '🏅',
    unlockCondition: 'Complete OnboardingQuick',
    isUnlocked: false,
  },
  {
    id: 'captain_badge',
    name: 'Captain Badge',
    description: 'Complete Extended onboarding',
    icon: '🏆',
    unlockCondition: 'Complete OnboardingExtended',
    isUnlocked: false,
  },
];

// Utility Functions
export const calculateLevel = (totalXP: number): Level => {
  return LEVELS.find(level => totalXP >= level.minXP && totalXP <= level.maxXP) || LEVELS[0];
};

export const calculateLevelProgress = (totalXP: number): number => {
  const currentLevel = calculateLevel(totalXP);
  if (currentLevel.maxXP === Infinity) return 1; // Captain level is maxed
  
  const progressInLevel = totalXP - currentLevel.minXP;
  const levelRange = currentLevel.maxXP - currentLevel.minXP;
  return Math.min(progressInLevel / levelRange, 1);
};

export const getNextLevel = (totalXP: number): Level | null => {
  const currentLevel = calculateLevel(totalXP);
  const currentIndex = LEVELS.findIndex(level => level.id === currentLevel.id);
  return currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
};

export const getXPToNextLevel = (totalXP: number): number => {
  const nextLevel = getNextLevel(totalXP);
  return nextLevel ? Math.max(0, nextLevel.minXP - totalXP) : 0;
};

export const awardXP = (currentXP: number, reward: number, reason: string): XPReward => {
  return {
    amount: reward,
    reason,
    timestamp: new Date(),
  };
};

export const checkBadgeUnlock = (badges: Badge[], condition: string): Badge[] => {
  return badges.map(badge => ({
    ...badge,
    isUnlocked: badge.unlockCondition === condition || badge.isUnlocked,
  }));
};

// Animation timing constants
export const ANIMATION_DURATIONS = {
  XP_GAIN: 800,
  LEVEL_UP: 1200,
  BADGE_UNLOCK: 1000,
  MICRO_REWARD: 300,
} as const;
