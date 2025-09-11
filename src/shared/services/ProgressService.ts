import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

export interface SeasonGoalProgress {
  goalId: string;
  title: string;
  current: number;
  target: number;
  percentage: number;
  statType: string;
  position: string;
  isCompleted: boolean;
}

export interface ProgressSummary {
  seasonGoals: SeasonGoalProgress[];
  overallProgress: number; // Average percentage across all goals
}

class ProgressService {
  /**
   * Get season goal progress for a user
   */
  async getSeasonGoalProgress(userId: string): Promise<ProgressSummary> {
    try {
      // Get user's season goals
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return { seasonGoals: [], overallProgress: 0 };
      }

      const userData = userDoc.data();
      const seasonGoals = userData.seasonGoals || [];
      const userPosition = userData.position || 'midfielder';
      
      // Also check for onboarding improvement areas
      const improvementAreas = userData.goals?.improvementAreas || [];

      const progressGoals: SeasonGoalProgress[] = [];

      // Process traditional season goals
      for (const goal of seasonGoals) {
        const current = await this.getCurrentStatValue(
          userId,
          goal.statType,
          userPosition,
        );
        const percentage =
          goal.target > 0 ? Math.min((current / goal.target) * 100, 100) : 0;

        progressGoals.push({
          goalId: goal.id,
          title: goal.title,
          current,
          target: goal.target,
          percentage: Math.round(percentage),
          statType: goal.statType,
          position: userPosition,
          isCompleted: current >= goal.target,
        });
      }

      // Process onboarding improvement areas as goals
      for (const goalId of improvementAreas) {
        const goalTitle = this.getOnboardingGoalTitle(goalId);
        
        // For onboarding goals, we'll show them as aspirational goals with 0% progress initially
        progressGoals.push({
          goalId: goalId,
          title: goalTitle,
          current: 0,
          target: 1, // Aspirational target
          percentage: 0, // Start at 0% for onboarding goals
          statType: 'improvement',
          position: userPosition,
          isCompleted: false,
        });
      }

      const overallProgress =
        progressGoals.length > 0
          ? Math.round(
              progressGoals.reduce((sum, goal) => sum + goal.percentage, 0) /
                progressGoals.length,
            )
          : 0;

      return {
        seasonGoals: progressGoals,
        overallProgress,
      };
    } catch (error) {
      console.error('Error getting season goal progress:', error);
      return { seasonGoals: [], overallProgress: 0 };
    }
  }

  /**
   * Get title for onboarding goal ID
   */
  private getOnboardingGoalTitle(goalId: string): string {
    const goalTitles: { [key: string]: string } = {
      // Attack Goals
      'score_15_goals_season': 'Score 15+ Goals This Season',
      'shooting_accuracy_65': 'Maintain 65%+ Shooting Accuracy',
      'assists_per_game_1_5': 'Average 1.5+ Assists Per Game',
      'ground_balls_3_per_game': 'Win 3+ Ground Balls Per Game',
      'limit_turnovers_1_5': 'Keep Turnovers Under 1.5 Per Game',
      
      // Midfield Goals
      'points_per_game_2': 'Average 2+ Points Per Game',
      'faceoff_wins_55_percent': 'Win 55%+ of Face-offs',
      'ground_balls_4_per_game': 'Secure 4+ Ground Balls Per Game',
      'clear_success_80_percent': 'Clear Ball Successfully 80%+ of Time',
      'caused_turnovers_1_per_game': 'Force 1+ Turnover Per Game',
      
      // Defense Goals
      'hold_opponent_under_2_goals': 'Hold Matchup to Under 2 Goals Per Game',
      'ground_balls_5_per_game': 'Win 5+ Ground Balls Per Game',
      'caused_turnovers_1_5_per_game': 'Force 1.5+ Turnovers Per Game',
      'clear_success_85_percent': 'Clear Successfully 85%+ of Time',
      'slides_communication_90': 'Communicate on 90%+ of Slides',
      
      // Goalie Goals
      'save_percentage_60_plus': 'Maintain 60%+ Save Percentage',
      'goals_against_under_8': 'Allow Under 8 Goals Per Game',
      'saves_10_plus_5_games': 'Record 10+ Saves in 5+ Games',
      'clear_assists_15_season': 'Record 15+ Clear Assists This Season',
      'ground_balls_2_per_game': 'Secure 2+ Ground Balls Per Game',
      
      // Recruiting Goals
      'create_highlight_video': 'Create Professional Highlight Video',
      'contact_20_college_coaches': 'Contact 20+ College Coaches',
      'attend_3_college_camps': 'Attend 3+ College Camps/Showcases',
      'maintain_3_5_gpa': 'Maintain 3.5+ GPA',
      'complete_sat_act_prep': 'Complete SAT/ACT Prep Course',
      
      // Personal Goals
      'leadership_captain_role': 'Earn Team Leadership Role',
      'mentor_younger_players': 'Mentor 2+ Younger Players',
      'perfect_attendance_practice': 'Perfect Practice Attendance',
      'community_service_20_hours': 'Complete 20+ Hours Community Service',
      'improve_fitness_benchmarks': 'Improve All Fitness Benchmarks by 10%',
    };

    return goalTitles[goalId] || goalId;
  }

  /**
   * Get current stat value for a user
   */
  private async getCurrentStatValue(
    userId: string,
    statType: string,
    position: string,
  ): Promise<number> {
    try {
      // Get user's games for current season
      const gamesQuery = query(
        collection(db, 'games'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50), // Get recent games for current season
      );

      const gamesSnapshot = await getDocs(gamesQuery);
      let totalValue = 0;

      gamesSnapshot.docs.forEach(doc => {
        const gameData = doc.data();
        const stats = gameData.stats || {};

        // Calculate based on stat type and position
        switch (statType) {
          case 'saves':
            if (position === 'goalie') {
              totalValue += stats.saves || 0;
            }
            break;
          case 'goals':
            totalValue += stats.goals || 0;
            break;
          case 'assists':
            totalValue += stats.assists || 0;
            break;
          case 'groundBalls':
            totalValue += stats.groundBalls || 0;
            break;
          case 'savePercentage':
            // For save percentage, we need to calculate differently
            if (position === 'goalie') {
              const saves = stats.saves || 0;
              const shotsAgainst = stats.shotsAgainst || 0;
              if (shotsAgainst > 0) {
                totalValue = (saves / shotsAgainst) * 100;
              }
            }
            break;
          case 'points':
            totalValue += (stats.goals || 0) + (stats.assists || 0);
            break;
        }
      });

      return totalValue;
    } catch (error) {
      console.error('Error getting current stat value:', error);
      return 0;
    }
  }

  /**
   * Check if a season goal is newly completed
   */
  async checkGoalCompletion(
    userId: string,
    statType: string,
  ): Promise<boolean> {
    try {
      const progress = await this.getSeasonGoalProgress(userId);
      const goal = progress.seasonGoals.find(g => g.statType === statType);
      return goal?.isCompleted || false;
    } catch (error) {
      console.error('Error checking goal completion:', error);
      return false;
    }
  }
}

export const progressService = new ProgressService();
