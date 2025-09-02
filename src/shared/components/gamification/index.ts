// Gamification Components
export { XPDisplay } from './XPDisplay';
export { AchievementCard } from './AchievementCard';

// Services
export { xpService, XPActionType } from '../services/XPService';
export { achievementService, AchievementCategory, AchievementRarity } from '../services/AchievementService';

// Types
export type { XPAction, XPReward } from '../services/XPService';
export type { Achievement, AchievementRequirement, UserAchievement } from '../services/AchievementService';
