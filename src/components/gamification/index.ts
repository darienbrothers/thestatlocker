// Modern Progress-Based Gamification Components
export { ProgressBar } from '../../shared/components/progress/ProgressBar';
export { SeasonGoalsCard } from '../../shared/components/progress/SeasonGoalsCard';
export { BadgeCard } from '../../shared/components/badges/BadgeCard';
export { BadgesList } from '../../shared/components/badges/BadgesList';
export { StreakCard } from '../../shared/components/streaks/StreakCard';
export { StreaksContainer } from '../../shared/components/streaks/StreaksContainer';

// Services
export { progressService } from '../../shared/services/ProgressService';
export { badgeService } from '../../shared/services/BadgeService';
export { streakService } from '../../shared/services/StreakService';

// Types
export type {
  SeasonGoalProgress,
  ProgressSummary,
} from '../../shared/services/ProgressService';
export type {
  Badge,
  UserBadge,
  BadgeCategory,
} from '../../shared/services/BadgeService';
export type {
  StreakData,
  StreakType,
} from '../../shared/services/StreakService';

// Keep useful legacy components for transition
export { OnboardingStepper } from './OnboardingStepper';
export { default as ProfilePreview } from './ProfilePreview';
export { XPRewardAnimation } from './XPRewardAnimation';
