// Personal Development Goals Library - Skills, training, and improvement goals
// These goals are tracked through training logs and manual progress updates

export interface PersonalGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  category:
    | 'daily_training'
    | 'weekly_training'
    | 'skill_mastery'
    | 'physical_development';
  trackingType: 'training_log' | 'manual_action';
  targetValue: number;
  unit: string;
}

export const PERSONAL_GOALS: PersonalGoal[] = [
  // Daily Training Goals
  {
    id: 'wall_ball_sessions_100',
    title: 'Complete 100 wall ball sessions',
    description: 'Build stick skills with consistent wall ball practice',
    icon: 'fitness',
    category: 'daily_training',
    trackingType: 'training_log',
    targetValue: 100,
    unit: 'sessions',
  },
  {
    id: 'wall_ball_sessions_150',
    title: 'Complete 150 wall ball sessions',
    description: 'Master stick fundamentals with extended wall ball training',
    icon: 'fitness',
    category: 'daily_training',
    trackingType: 'training_log',
    targetValue: 150,
    unit: 'sessions',
  },
  {
    id: 'stick_skill_workouts_50',
    title: 'Finish 50 stick skill workouts',
    description: 'Develop advanced stick handling and ball control',
    icon: 'barbell',
    category: 'daily_training',
    trackingType: 'training_log',
    targetValue: 50,
    unit: 'workouts',
  },
  {
    id: 'stick_skill_workouts_75',
    title: 'Finish 75 stick skill workouts',
    description: 'Achieve elite-level stick skills through dedicated practice',
    icon: 'barbell',
    category: 'daily_training',
    trackingType: 'training_log',
    targetValue: 75,
    unit: 'workouts',
  },
  {
    id: 'conditioning_sessions_30',
    title: 'Log 30 conditioning sessions',
    description: 'Build endurance and game-ready fitness',
    icon: 'speedometer',
    category: 'daily_training',
    trackingType: 'training_log',
    targetValue: 30,
    unit: 'sessions',
  },
  {
    id: 'conditioning_sessions_50',
    title: 'Log 50 conditioning sessions',
    description: 'Reach peak physical conditioning for competition',
    icon: 'speedometer',
    category: 'daily_training',
    trackingType: 'training_log',
    targetValue: 50,
    unit: 'sessions',
  },
  {
    id: 'shooting_practice_25',
    title: 'Practice shooting for 25 sessions',
    description: 'Improve accuracy and shot power through repetition',
    icon: 'target',
    category: 'daily_training',
    trackingType: 'training_log',
    targetValue: 25,
    unit: 'sessions',
  },
  {
    id: 'shooting_practice_40',
    title: 'Practice shooting for 40 sessions',
    description: 'Develop elite shooting skills with consistent practice',
    icon: 'target',
    category: 'daily_training',
    trackingType: 'training_log',
    targetValue: 40,
    unit: 'sessions',
  },

  // Weekly Training Goals
  {
    id: 'strength_training_20_weeks',
    title: 'Complete 20 weeks of strength training',
    description: 'Build power and prevent injuries with consistent lifting',
    icon: 'barbell',
    category: 'weekly_training',
    trackingType: 'training_log',
    targetValue: 20,
    unit: 'weeks',
  },
  {
    id: 'strength_training_30_weeks',
    title: 'Complete 30 weeks of strength training',
    description: 'Achieve peak strength through extended training program',
    icon: 'barbell',
    category: 'weekly_training',
    trackingType: 'training_log',
    targetValue: 30,
    unit: 'weeks',
  },
  {
    id: 'speed_training_15_weeks',
    title: 'Finish 15 weeks of speed training',
    description: 'Improve acceleration and top-end speed',
    icon: 'flash',
    category: 'weekly_training',
    trackingType: 'training_log',
    targetValue: 15,
    unit: 'weeks',
  },
  {
    id: 'speed_training_25_weeks',
    title: 'Finish 25 weeks of speed training',
    description: 'Maximize your speed potential with extended training',
    icon: 'flash',
    category: 'weekly_training',
    trackingType: 'training_log',
    targetValue: 25,
    unit: 'weeks',
  },
  {
    id: 'agility_work_12_weeks',
    title: 'Log 12 weeks of agility work',
    description: 'Enhance change of direction and footwork',
    icon: 'shuffle',
    category: 'weekly_training',
    trackingType: 'training_log',
    targetValue: 12,
    unit: 'weeks',
  },
  {
    id: 'agility_work_20_weeks',
    title: 'Log 20 weeks of agility work',
    description: 'Master agility and movement patterns for competition',
    icon: 'shuffle',
    category: 'weekly_training',
    trackingType: 'training_log',
    targetValue: 20,
    unit: 'weeks',
  },
  {
    id: 'mental_training_10_weeks',
    title: 'Complete 10 weeks of mental training',
    description: 'Develop focus, confidence, and mental toughness',
    icon: 'brain',
    category: 'weekly_training',
    trackingType: 'training_log',
    targetValue: 10,
    unit: 'weeks',
  },
  {
    id: 'mental_training_16_weeks',
    title: 'Complete 16 weeks of mental training',
    description: 'Build elite mental performance skills',
    icon: 'brain',
    category: 'weekly_training',
    trackingType: 'training_log',
    targetValue: 16,
    unit: 'weeks',
  },

  // Skill Mastery Goals
  {
    id: 'master_dodging_techniques_5',
    title: 'Master 5 new dodging techniques',
    description: 'Expand your offensive arsenal with new moves',
    icon: 'trending-up',
    category: 'skill_mastery',
    trackingType: 'manual_action',
    targetValue: 5,
    unit: 'techniques',
  },
  {
    id: 'master_dodging_techniques_8',
    title: 'Master 8 new dodging techniques',
    description: 'Become unpredictable with a diverse dodge repertoire',
    icon: 'trending-up',
    category: 'skill_mastery',
    trackingType: 'manual_action',
    targetValue: 8,
    unit: 'techniques',
  },
  {
    id: 'learn_shooting_techniques_3',
    title: 'Learn 3 new shooting techniques',
    description: 'Add variety and deception to your shooting',
    icon: 'target',
    category: 'skill_mastery',
    trackingType: 'manual_action',
    targetValue: 3,
    unit: 'techniques',
  },
  {
    id: 'learn_shooting_techniques_5',
    title: 'Learn 5 new shooting techniques',
    description: 'Develop a complete shooting skillset',
    icon: 'target',
    category: 'skill_mastery',
    trackingType: 'manual_action',
    targetValue: 5,
    unit: 'techniques',
  },
  {
    id: 'perfect_defensive_moves_4',
    title: 'Perfect 4 defensive moves',
    description: 'Master fundamental defensive techniques',
    icon: 'shield',
    category: 'skill_mastery',
    trackingType: 'manual_action',
    targetValue: 4,
    unit: 'moves',
  },
  {
    id: 'perfect_defensive_moves_6',
    title: 'Perfect 6 defensive moves',
    description: 'Become a complete defender with advanced techniques',
    icon: 'shield',
    category: 'skill_mastery',
    trackingType: 'manual_action',
    targetValue: 6,
    unit: 'moves',
  },
  {
    id: 'complete_position_drills_8',
    title: 'Complete 8 position-specific drills',
    description: 'Master the fundamentals of your position',
    icon: 'checkmark-circle',
    category: 'skill_mastery',
    trackingType: 'manual_action',
    targetValue: 8,
    unit: 'drills',
  },
  {
    id: 'complete_position_drills_12',
    title: 'Complete 12 position-specific drills',
    description: 'Achieve mastery in all aspects of your position',
    icon: 'checkmark-circle',
    category: 'skill_mastery',
    trackingType: 'manual_action',
    targetValue: 12,
    unit: 'drills',
  },
  {
    id: 'weak_hand_development_30',
    title: 'Complete 30 weak-hand development sessions',
    description: 'Become ambidextrous with dedicated weak-hand training',
    icon: 'hand-left',
    category: 'skill_mastery',
    trackingType: 'training_log',
    targetValue: 30,
    unit: 'sessions',
  },
  {
    id: 'weak_hand_development_50',
    title: 'Complete 50 weak-hand development sessions',
    description: 'Master both hands for complete stick skills',
    icon: 'hand-left',
    category: 'skill_mastery',
    trackingType: 'training_log',
    targetValue: 50,
    unit: 'sessions',
  },

  // Physical Development Goals
  {
    id: 'improve_sprint_speed',
    title: 'Improve 40-yard sprint time by 0.2 seconds',
    description: 'Get faster with focused speed development',
    icon: 'speedometer',
    category: 'physical_development',
    trackingType: 'manual_action',
    targetValue: 1,
    unit: 'improvement',
  },
  {
    id: 'increase_flexibility_program',
    title: 'Complete daily stretching for 100 days',
    description: 'Improve mobility and prevent injuries',
    icon: 'body',
    category: 'physical_development',
    trackingType: 'training_log',
    targetValue: 100,
    unit: 'days',
  },
  {
    id: 'increase_flexibility_program_150',
    title: 'Complete daily stretching for 150 days',
    description: 'Achieve elite flexibility and injury prevention',
    icon: 'body',
    category: 'physical_development',
    trackingType: 'training_log',
    targetValue: 150,
    unit: 'days',
  },
  {
    id: 'complete_conditioning_program',
    title: 'Complete full off-season conditioning program',
    description: 'Build a strong fitness foundation for the season',
    icon: 'fitness',
    category: 'physical_development',
    trackingType: 'manual_action',
    targetValue: 1,
    unit: 'program',
  },
  {
    id: 'increase_vertical_jump',
    title: 'Increase vertical jump by 3 inches',
    description: 'Improve explosiveness and athleticism',
    icon: 'trending-up',
    category: 'physical_development',
    trackingType: 'manual_action',
    targetValue: 3,
    unit: 'inches',
  },
  {
    id: 'body_weight_goals',
    title: 'Reach target playing weight and maintain for 8 weeks',
    description: 'Optimize body composition for peak performance',
    icon: 'scale',
    category: 'physical_development',
    trackingType: 'manual_action',
    targetValue: 8,
    unit: 'weeks',
  },
  {
    id: 'injury_prevention_program',
    title: 'Complete injury prevention program for 20 weeks',
    description: 'Stay healthy with dedicated prehab work',
    icon: 'medical',
    category: 'physical_development',
    trackingType: 'training_log',
    targetValue: 20,
    unit: 'weeks',
  },
  {
    id: 'nutrition_tracking_12_weeks',
    title: 'Track nutrition consistently for 12 weeks',
    description: 'Fuel your body properly for optimal performance',
    icon: 'nutrition',
    category: 'physical_development',
    trackingType: 'training_log',
    targetValue: 12,
    unit: 'weeks',
  },
];

// Helper function to get personal goals by category
export const getPersonalGoalsByCategory = () => {
  return PERSONAL_GOALS.reduce(
    (acc, goal) => {
      if (!acc[goal.category]) {
        acc[goal.category] = [];
      }
      acc[goal.category].push(goal);
      return acc;
    },
    {} as Record<string, PersonalGoal[]>,
  );
};

// Helper function to get category display info
export const getPersonalCategoryInfo = (category: string) => {
  const categoryMap = {
    daily_training: {
      title: 'Daily Training',
      icon: 'fitness',
      color: '#EF4444', // Red
      description: 'Build skills through daily practice sessions',
    },
    weekly_training: {
      title: 'Weekly Programs',
      icon: 'calendar',
      color: '#3B82F6', // Blue
      description: 'Structured weekly training programs',
    },
    skill_mastery: {
      title: 'Skill Mastery',
      icon: 'star',
      color: '#10B981', // Green
      description: 'Master new techniques and fundamentals',
    },
    physical_development: {
      title: 'Physical Development',
      icon: 'barbell',
      color: '#8B5CF6', // Purple
      description: 'Improve strength, speed, and athleticism',
    },
  };

  const info = categoryMap[category as keyof typeof categoryMap];
  return (
    info || {
      title: category,
      icon: 'star',
      color: '#6B7280',
      description: 'Personal development goal category',
    }
  );
};
