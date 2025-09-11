import { badgeService } from './BadgeService';
import { progressService } from './ProgressService';
import { streakService, StreakType } from './StreakService';

/**
 * Integration service to handle gamification events across the app
 */
class GamificationIntegrationService {
  /**
   * Handle when a game is logged - check for badges and update progress
   */
  async onGameLogged(
    userId: string,
    gameData: any,
  ): Promise<{
    newBadges: any[];
    progressUpdates: any;
    notifications: string[];
  }> {
    try {
      const notifications: string[] = [];

      // Check for newly earned badges
      const newBadges = await badgeService.checkBadgesAfterGame(
        userId,
        gameData,
      );

      // Get updated progress
      const progressUpdates =
        await progressService.getSeasonGoalProgress(userId);

      // Add notifications for new achievements
      if (newBadges.length > 0) {
        newBadges.forEach(badge => {
          notifications.push(`🏆 New badge earned: ${badge.badge.title}!`);
        });
      }

      // Check for completed season goals
      progressUpdates.seasonGoals.forEach(goal => {
        if (goal.isCompleted && goal.percentage === 100) {
          notifications.push(`🎯 Season goal completed: ${goal.title}!`);
        }
      });

      return {
        newBadges,
        progressUpdates,
        notifications,
      };
    } catch (error) {
      console.error('Error in onGameLogged:', error);
      return {
        newBadges: [],
        progressUpdates: null,
        notifications: [],
      };
    }
  }

  /**
   * Handle when a skills/drills activity is logged
   */
  async onSkillsActivityLogged(
    userId: string,
    activityType: StreakType,
    duration?: number,
  ): Promise<{
    streakData: any;
    notifications: string[];
  }> {
    try {
      const notifications: string[] = [];

      // Update streak
      const streakData = await streakService.logActivity(
        userId,
        activityType,
        duration,
      );

      // Add streak notifications
      if (streakData.current === 1) {
        notifications.push(
          `🔥 Started a new ${this.getActivityName(activityType)} streak!`,
        );
      } else if (streakData.current > 1) {
        notifications.push(
          `🔥 ${streakData.current} day ${this.getActivityName(activityType)} streak!`,
        );

        // Special milestone notifications
        if (streakData.current === 7) {
          notifications.push('🎉 One week streak! Keep it up!');
        } else if (streakData.current === 30) {
          notifications.push("🏆 30-day streak! You're on fire!");
        }
      }

      return {
        streakData,
        notifications,
      };
    } catch (error) {
      console.error('Error in onSkillsActivityLogged:', error);
      return {
        streakData: null,
        notifications: [],
      };
    }
  }

  /**
   * Get dashboard summary for a user
   */
  async getDashboardSummary(userId: string): Promise<{
    progress: any;
    activeStreaks: number;
    totalBadges: number;
    recentAchievements: any[];
  }> {
    try {
      const [progress, streaks, badges] = await Promise.all([
        progressService.getSeasonGoalProgress(userId),
        streakService.getAllStreaks(userId),
        badgeService.getUserBadges(userId),
      ]);

      const activeStreaks = Object.values(streaks).filter(
        (streak: any) => streak.isActive,
      ).length;

      // Get recent badges (last 7 days)
      const recentAchievements = badges.filter(badge => {
        if (!badge.unlockedAt) {
          return false;
        }
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return badge.unlockedAt > weekAgo;
      });

      return {
        progress,
        activeStreaks,
        totalBadges: badges.length,
        recentAchievements,
      };
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      return {
        progress: null,
        activeStreaks: 0,
        totalBadges: 0,
        recentAchievements: [],
      };
    }
  }

  private getActivityName(type: StreakType): string {
    switch (type) {
      case StreakType.WALL_BALL:
        return 'Wall Ball';
      case StreakType.DRILLS:
        return 'Drills';
      case StreakType.SKILLS_PRACTICE:
        return 'Skills Practice';
      default:
        return 'Activity';
    }
  }
}

export const gamificationIntegrationService =
  new GamificationIntegrationService();
