import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
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

      const progressGoals: SeasonGoalProgress[] = [];

      for (const goal of seasonGoals) {
        const current = await this.getCurrentStatValue(userId, goal.statType, userPosition);
        const percentage = goal.target > 0 ? Math.min((current / goal.target) * 100, 100) : 0;
        
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

      const overallProgress = progressGoals.length > 0 
        ? Math.round(progressGoals.reduce((sum, goal) => sum + goal.percentage, 0) / progressGoals.length)
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
   * Get current stat value for a user
   */
  private async getCurrentStatValue(userId: string, statType: string, position: string): Promise<number> {
    try {
      // Get user's games for current season
      const gamesQuery = query(
        collection(db, 'games'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50) // Get recent games for current season
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
  async checkGoalCompletion(userId: string, statType: string): Promise<boolean> {
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
