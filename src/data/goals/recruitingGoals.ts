// Recruiting Goals Library - College preparation and visibility goals
// These goals are tracked through manual user actions and progress updates

export interface RecruitingGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'communication' | 'exposure' | 'academic' | 'profile';
  trackingType: 'manual_action';
  targetValue: number;
  unit: string;
}

export const RECRUITING_GOALS: RecruitingGoal[] = [
  // Communication & Outreach Goals
  {
    id: 'send_recruiting_emails_10',
    title: 'Send 10 recruiting emails to college coaches',
    description:
      'Reach out to coaches at target schools with personalized messages',
    icon: 'mail',
    category: 'communication',
    trackingType: 'manual_action',
    targetValue: 10,
    unit: 'emails',
  },
  {
    id: 'send_recruiting_emails_15',
    title: 'Send 15 recruiting emails to college coaches',
    description: 'Expand your reach with more personalized coach outreach',
    icon: 'mail',
    category: 'communication',
    trackingType: 'manual_action',
    targetValue: 15,
    unit: 'emails',
  },
  {
    id: 'complete_recruiting_questionnaires_5',
    title: 'Complete 5 college recruiting questionnaires',
    description: 'Fill out official recruiting forms for target schools',
    icon: 'document-text',
    category: 'communication',
    trackingType: 'manual_action',
    targetValue: 5,
    unit: 'questionnaires',
  },
  {
    id: 'complete_recruiting_questionnaires_8',
    title: 'Complete 8 college recruiting questionnaires',
    description: 'Cast a wider net with more recruiting questionnaires',
    icon: 'document-text',
    category: 'communication',
    trackingType: 'manual_action',
    targetValue: 8,
    unit: 'questionnaires',
  },
  {
    id: 'phone_calls_coaches_3',
    title: 'Make 3 phone calls to college coaches',
    description: 'Have direct conversations with coaches at target schools',
    icon: 'call',
    category: 'communication',
    trackingType: 'manual_action',
    targetValue: 3,
    unit: 'phone calls',
  },
  {
    id: 'send_highlight_reel_12',
    title: 'Send highlight reel to 12 colleges',
    description: 'Share your game footage with college coaching staffs',
    icon: 'videocam',
    category: 'communication',
    trackingType: 'manual_action',
    targetValue: 12,
    unit: 'colleges',
  },
  {
    id: 'send_highlight_reel_20',
    title: 'Send highlight reel to 20 colleges',
    description: 'Maximize exposure by sharing footage with more schools',
    icon: 'videocam',
    category: 'communication',
    trackingType: 'manual_action',
    targetValue: 20,
    unit: 'colleges',
  },
  {
    id: 'follow_up_emails_8',
    title: 'Send 8 follow-up emails to coaches',
    description: "Stay on coaches' radar with consistent follow-up",
    icon: 'refresh',
    category: 'communication',
    trackingType: 'manual_action',
    targetValue: 8,
    unit: 'follow-ups',
  },

  // Exposure & Events Goals
  {
    id: 'attend_prospect_camps_3',
    title: 'Attend 3 college prospect camps',
    description: 'Get evaluated by college coaches at their camps',
    icon: 'school',
    category: 'exposure',
    trackingType: 'manual_action',
    targetValue: 3,
    unit: 'camps',
  },
  {
    id: 'attend_prospect_camps_5',
    title: 'Attend 5 college prospect camps',
    description: 'Maximize exposure at multiple college camps',
    icon: 'school',
    category: 'exposure',
    trackingType: 'manual_action',
    targetValue: 5,
    unit: 'camps',
  },
  {
    id: 'participate_showcases_2',
    title: 'Participate in 2 showcase tournaments',
    description: 'Compete in front of college scouts and recruiters',
    icon: 'trophy',
    category: 'exposure',
    trackingType: 'manual_action',
    targetValue: 2,
    unit: 'showcases',
  },
  {
    id: 'participate_showcases_4',
    title: 'Participate in 4 showcase tournaments',
    description: 'Increase visibility with more showcase appearances',
    icon: 'trophy',
    category: 'exposure',
    trackingType: 'manual_action',
    targetValue: 4,
    unit: 'showcases',
  },
  {
    id: 'schedule_campus_visits_5',
    title: 'Schedule 5 college campus visits',
    description: 'Visit target schools to meet coaches and see facilities',
    icon: 'location',
    category: 'exposure',
    trackingType: 'manual_action',
    targetValue: 5,
    unit: 'visits',
  },
  {
    id: 'schedule_campus_visits_8',
    title: 'Schedule 8 college campus visits',
    description: 'Explore more options with additional campus visits',
    icon: 'location',
    category: 'exposure',
    trackingType: 'manual_action',
    targetValue: 8,
    unit: 'visits',
  },
  {
    id: 'attend_college_games_4',
    title: 'Attend 4 college games as a recruit',
    description: 'Show interest by attending games at target schools',
    icon: 'eye',
    category: 'exposure',
    trackingType: 'manual_action',
    targetValue: 4,
    unit: 'games',
  },
  {
    id: 'attend_college_games_6',
    title: 'Attend 6 college games as a recruit',
    description: 'Demonstrate serious interest with more game attendance',
    icon: 'eye',
    category: 'exposure',
    trackingType: 'manual_action',
    targetValue: 6,
    unit: 'games',
  },
  {
    id: 'register_recruiting_services_2',
    title: 'Register with 2 recruiting services',
    description: 'Get listed on recruiting platforms for visibility',
    icon: 'globe',
    category: 'exposure',
    trackingType: 'manual_action',
    targetValue: 2,
    unit: 'services',
  },

  // Academic Milestones Goals
  {
    id: 'take_sat_act_2_times',
    title: 'Take SAT/ACT exam 2 times',
    description: 'Improve your standardized test scores for college admission',
    icon: 'school',
    category: 'academic',
    trackingType: 'manual_action',
    targetValue: 2,
    unit: 'exams',
  },
  {
    id: 'take_sat_act_3_times',
    title: 'Take SAT/ACT exam 3 times',
    description: 'Maximize your test scores with additional attempts',
    icon: 'school',
    category: 'academic',
    trackingType: 'manual_action',
    targetValue: 3,
    unit: 'exams',
  },
  {
    id: 'meet_guidance_counselor_4',
    title: 'Meet with guidance counselor 4 times',
    description: 'Get academic and college planning guidance',
    icon: 'person',
    category: 'academic',
    trackingType: 'manual_action',
    targetValue: 4,
    unit: 'meetings',
  },
  {
    id: 'meet_guidance_counselor_6',
    title: 'Meet with guidance counselor 6 times',
    description: 'Stay on track with regular academic check-ins',
    icon: 'person',
    category: 'academic',
    trackingType: 'manual_action',
    targetValue: 6,
    unit: 'meetings',
  },
  {
    id: 'complete_college_applications_6',
    title: 'Complete 6 college applications',
    description: 'Apply to a solid range of target schools',
    icon: 'document',
    category: 'academic',
    trackingType: 'manual_action',
    targetValue: 6,
    unit: 'applications',
  },
  {
    id: 'complete_college_applications_10',
    title: 'Complete 10 college applications',
    description: 'Cast a wide net with more college applications',
    icon: 'document',
    category: 'academic',
    trackingType: 'manual_action',
    targetValue: 10,
    unit: 'applications',
  },
  {
    id: 'submit_scholarship_applications_3',
    title: 'Submit 3 scholarship applications',
    description: 'Apply for academic and athletic scholarships',
    icon: 'ribbon',
    category: 'academic',
    trackingType: 'manual_action',
    targetValue: 3,
    unit: 'scholarships',
  },
  {
    id: 'submit_scholarship_applications_5',
    title: 'Submit 5 scholarship applications',
    description: 'Increase funding opportunities with more applications',
    icon: 'ribbon',
    category: 'academic',
    trackingType: 'manual_action',
    targetValue: 5,
    unit: 'scholarships',
  },
  {
    id: 'research_target_colleges_15',
    title: 'Research 15 target colleges thoroughly',
    description: 'Build a comprehensive list of potential schools',
    icon: 'search',
    category: 'academic',
    trackingType: 'manual_action',
    targetValue: 15,
    unit: 'colleges',
  },
  {
    id: 'research_target_colleges_25',
    title: 'Research 25 target colleges thoroughly',
    description: 'Explore more options with extensive college research',
    icon: 'search',
    category: 'academic',
    trackingType: 'manual_action',
    targetValue: 25,
    unit: 'colleges',
  },

  // Profile Building Goals
  {
    id: 'update_recruiting_profile_monthly',
    title: 'Update recruiting profile monthly for 6 months',
    description: 'Keep your recruiting information current and relevant',
    icon: 'create',
    category: 'profile',
    trackingType: 'manual_action',
    targetValue: 6,
    unit: 'updates',
  },
  {
    id: 'get_coach_recommendations_3',
    title: 'Get 3 coach recommendation letters',
    description: 'Secure strong endorsements from your coaches',
    icon: 'ribbon',
    category: 'profile',
    trackingType: 'manual_action',
    targetValue: 3,
    unit: 'recommendations',
  },
  {
    id: 'create_highlight_reels_2',
    title: 'Create 2 different highlight reels',
    description: 'Make position-specific and general highlight videos',
    icon: 'videocam',
    category: 'profile',
    trackingType: 'manual_action',
    targetValue: 2,
    unit: 'reels',
  },
  {
    id: 'document_achievements_awards',
    title: 'Document 10 achievements and awards',
    description: 'Compile your athletic and academic accomplishments',
    icon: 'medal',
    category: 'profile',
    trackingType: 'manual_action',
    targetValue: 10,
    unit: 'achievements',
  },
  {
    id: 'create_athletic_resume',
    title: 'Create and refine athletic resume 3 times',
    description: 'Perfect your one-page athletic and academic summary',
    icon: 'document-text',
    category: 'profile',
    trackingType: 'manual_action',
    targetValue: 3,
    unit: 'revisions',
  },
  {
    id: 'social_media_recruiting_posts_12',
    title: 'Make 12 recruiting-focused social media posts',
    description: 'Build your recruiting presence on social platforms',
    icon: 'share-social',
    category: 'profile',
    trackingType: 'manual_action',
    targetValue: 12,
    unit: 'posts',
  },
];

// Helper function to get recruiting goals by category
export const getRecruitingGoalsByCategory = () => {
  return RECRUITING_GOALS.reduce(
    (acc, goal) => {
      if (!acc[goal.category]) {
        acc[goal.category] = [];
      }
      acc[goal.category]!.push(goal);
      return acc;
    },
    {} as Record<string, RecruitingGoal[]>,
  );
};

// Helper function to get category display info
export const getRecruitingCategoryInfo = (category: string) => {
  const categoryMap = {
    communication: {
      title: 'Communication & Outreach',
      icon: 'mail',
      color: '#3B82F6', // Blue
      description: 'Connect with college coaches and programs',
    },
    exposure: {
      title: 'Exposure & Events',
      icon: 'eye',
      color: '#10B981', // Green
      description: 'Get seen by college scouts and recruiters',
    },
    academic: {
      title: 'Academic Milestones',
      icon: 'school',
      color: '#8B5CF6', // Purple
      description: 'Meet college admission requirements',
    },
    profile: {
      title: 'Profile Building',
      icon: 'person',
      color: '#F59E0B', // Amber
      description: 'Build your recruiting presence and materials',
    },
  };

  const info = categoryMap[category as keyof typeof categoryMap];
  return (
    info || {
      title: category,
      icon: 'star',
      color: '#6B7280',
      description: 'Recruiting goal category',
    }
  );
};
