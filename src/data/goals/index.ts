// Goals Library Index - Export all goal types and utilities

export { SEASON_GOALS, type SeasonGoal } from './seasonGoals';
export {
  RECRUITING_GOALS,
  getRecruitingGoalsByCategory,
  getRecruitingCategoryInfo,
  type RecruitingGoal,
} from './recruitingGoals';
export {
  PERSONAL_GOALS,
  getPersonalGoalsByCategory,
  getPersonalCategoryInfo,
  type PersonalGoal,
} from './personalGoals';

// Import types for union
import type { SeasonGoal } from './seasonGoals';
import type { RecruitingGoal } from './recruitingGoals';
import type { PersonalGoal } from './personalGoals';

// Union type for all goal types
export type Goal = SeasonGoal | RecruitingGoal | PersonalGoal;

// Goal category types
export type GoalCategory = 'season' | 'recruiting' | 'personal';

// Unified goal interface for selected goals
export interface UserGoal {
  id: string;
  category: GoalCategory;
  title: string;
  description: string;
  icon: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  trackingType: 'game_stats' | 'manual_action' | 'training_log';
  isCompleted: boolean;
  dateSelected: string;
  dateCompleted?: string;
}

// Helper function to convert any goal type to UserGoal
export const convertToUserGoal = (
  goal: Goal,
  category: GoalCategory,
  currentValue: number = 0,
): UserGoal => {
  return {
    id: goal.id,
    category,
    title: goal.title,
    description: goal.description,
    icon: goal.icon,
    targetValue: goal.targetValue,
    currentValue,
    unit: goal.unit,
    trackingType: goal.trackingType,
    isCompleted: currentValue >= goal.targetValue,
    dateSelected: new Date().toISOString(),
  };
};

// Helper function to get category display info
export const getCategoryDisplayInfo = (category: GoalCategory) => {
  const categoryMap = {
    season: {
      title: 'Season Goals',
      icon: 'trophy',
      color: '#EF4444', // Red
      description: 'Performance goals tracked through game stats',
    },
    recruiting: {
      title: 'Recruiting Goals',
      icon: 'school',
      color: '#3B82F6', // Blue
      description: 'College preparation and visibility milestones',
    },
    personal: {
      title: 'Personal Development',
      icon: 'fitness',
      color: '#10B981', // Green
      description: 'Skills, training, and improvement goals',
    },
  };

  return categoryMap[category];
};
