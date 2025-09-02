import { doc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp, arrayUnion } from 'firebase/firestore';

import { db } from '@shared/config/firebase';
import { xpService, type XPActionType } from './XPService';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  iconName: string;
  requirements: AchievementRequirement[];
  isSecret?: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export enum AchievementCategory {
  GAMES = 'games',
  STATS = 'stats',
  STREAKS = 'streaks',
  SOCIAL = 'social',
  MILESTONES = 'milestones',
  SEASONAL = 'seasonal',
  SPECIAL = 'special',
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface AchievementRequirement {
  type: RequirementType;
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'alltime';
  metadata?: Record<string, any>;
}

export enum RequirementType {
  GAMES_LOGGED = 'games_logged',
  TOTAL_XP = 'total_xp',
  STREAK_DAYS = 'streak_days',
  STAT_VALUE = 'stat_value',
  STAT_IMPROVEMENT = 'stat_improvement',
  SOCIAL_SHARES = 'social_shares',
  PROFILE_COMPLETION = 'profile_completion',
  SEASON_GOALS_ACHIEVED = 'season_goals_achieved',
  CONSECUTIVE_GAMES = 'consecutive_games',
  PERFECT_GAMES = 'perfect_games',
}

export interface UserAchievement {
  achievementId: string;
  userId: string;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
}

class AchievementService {
  private readonly ACHIEVEMENTS: Achievement[] = [
    // Games Category
    {
      id: 'first_game',
      title: 'First Steps',
      description: 'Log your first game',
      category: AchievementCategory.GAMES,
      rarity: AchievementRarity.COMMON,
      xpReward: 50,
      iconName: 'trophy',
      requirements: [{ type: RequirementType.GAMES_LOGGED, target: 1 }],
    },
    {
      id: 'game_veteran',
      title: 'Game Veteran',
      description: 'Log 100 games',
      category: AchievementCategory.GAMES,
      rarity: AchievementRarity.RARE,
      xpReward: 200,
      iconName: 'medal',
      requirements: [{ type: RequirementType.GAMES_LOGGED, target: 100 }],
    },
    {
      id: 'game_master',
      title: 'Game Master',
      description: 'Log 500 games',
      category: AchievementCategory.GAMES,
      rarity: AchievementRarity.EPIC,
      xpReward: 500,
      iconName: 'crown',
      requirements: [{ type: RequirementType.GAMES_LOGGED, target: 500 }],
    },
    
    // Streaks Category
    {
      id: 'streak_starter',
      title: 'Streak Starter',
      description: 'Maintain a 7-day logging streak',
      category: AchievementCategory.STREAKS,
      rarity: AchievementRarity.COMMON,
      xpReward: 75,
      iconName: 'fire',
      requirements: [{ type: RequirementType.STREAK_DAYS, target: 7 }],
    },
    {
      id: 'streak_legend',
      title: 'Streak Legend',
      description: 'Maintain a 30-day logging streak',
      category: AchievementCategory.STREAKS,
      rarity: AchievementRarity.EPIC,
      xpReward: 300,
      iconName: 'flame',
      requirements: [{ type: RequirementType.STREAK_DAYS, target: 30 }],
    },
    {
      id: 'streak_immortal',
      title: 'Streak Immortal',
      description: 'Maintain a 100-day logging streak',
      category: AchievementCategory.STREAKS,
      rarity: AchievementRarity.LEGENDARY,
      xpReward: 1000,
      iconName: 'star',
      requirements: [{ type: RequirementType.STREAK_DAYS, target: 100 }],
    },

    // Stats Category
    {
      id: 'sharpshooter',
      title: 'Sharpshooter',
      description: 'Achieve 90% field goal percentage in a game',
      category: AchievementCategory.STATS,
      rarity: AchievementRarity.RARE,
      xpReward: 150,
      iconName: 'target',
      requirements: [{ 
        type: RequirementType.STAT_VALUE, 
        target: 90,
        metadata: { stat: 'fieldGoalPercentage', comparison: 'gte' }
      }],
    },
    {
      id: 'triple_double',
      title: 'Triple Double',
      description: 'Record a triple-double in any game',
      category: AchievementCategory.STATS,
      rarity: AchievementRarity.EPIC,
      xpReward: 250,
      iconName: 'diamond',
      requirements: [{ 
        type: RequirementType.STAT_VALUE, 
        target: 1,
        metadata: { stat: 'tripleDoubles', comparison: 'gte' }
      }],
    },

    // XP/Milestones Category
    {
      id: 'xp_collector',
      title: 'XP Collector',
      description: 'Earn 1,000 total XP',
      category: AchievementCategory.MILESTONES,
      rarity: AchievementRarity.COMMON,
      xpReward: 100,
      iconName: 'gem',
      requirements: [{ type: RequirementType.TOTAL_XP, target: 1000 }],
    },
    {
      id: 'xp_master',
      title: 'XP Master',
      description: 'Earn 10,000 total XP',
      category: AchievementCategory.MILESTONES,
      rarity: AchievementRarity.RARE,
      xpReward: 500,
      iconName: 'trophy-star',
      requirements: [{ type: RequirementType.TOTAL_XP, target: 10000 }],
    },

    // Social Category
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Share 10 achievements or stats',
      category: AchievementCategory.SOCIAL,
      rarity: AchievementRarity.COMMON,
      xpReward: 75,
      iconName: 'share',
      requirements: [{ type: RequirementType.SOCIAL_SHARES, target: 10 }],
    },

    // Special/Secret Achievements
    {
      id: 'perfect_month',
      title: 'Perfect Month',
      description: 'Log at least one game every day for a month',
      category: AchievementCategory.SPECIAL,
      rarity: AchievementRarity.LEGENDARY,
      xpReward: 750,
      iconName: 'calendar-star',
      isSecret: true,
      requirements: [{ 
        type: RequirementType.CONSECUTIVE_GAMES, 
        target: 30,
        timeframe: 'monthly'
      }],
    },
  ];

  /**
   * Check and unlock achievements for a user
   */
  async checkAchievements(userId: string, triggerData?: Record<string, any>): Promise<Achievement[]> {
    try {
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedAchievementIds = new Set(
        userAchievements.filter(ua => ua.isCompleted).map(ua => ua.achievementId)
      );

      const newlyUnlocked: Achievement[] = [];

      for (const achievement of this.ACHIEVEMENTS) {
        if (unlockedAchievementIds.has(achievement.id)) {
          continue; // Already unlocked
        }

        const progress = await this.calculateAchievementProgress(userId, achievement, triggerData);
        const isCompleted = progress.current >= progress.max;

        // Update or create user achievement record
        await this.updateUserAchievementProgress(userId, achievement.id, progress.current, progress.max, isCompleted);

        if (isCompleted) {
          // Unlock achievement
          await this.unlockAchievement(userId, achievement);
          newlyUnlocked.push(achievement);
        }
      }

      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Calculate progress for a specific achievement
   */
  private async calculateAchievementProgress(
    userId: string,
    achievement: Achievement,
    triggerData?: Record<string, any>
  ): Promise<{ current: number; max: number }> {
    let maxProgress = 0;
    let currentProgress = 0;

    for (const requirement of achievement.requirements) {
      maxProgress = Math.max(maxProgress, requirement.target);
      
      const reqProgress = await this.calculateRequirementProgress(userId, requirement, triggerData);
      currentProgress = Math.max(currentProgress, reqProgress);
    }

    return { current: Math.min(currentProgress, maxProgress), max: maxProgress };
  }

  /**
   * Calculate progress for a specific requirement
   */
  private async calculateRequirementProgress(
    userId: string,
    requirement: AchievementRequirement,
    triggerData?: Record<string, any>
  ): Promise<number> {
    try {
      switch (requirement.type) {
        case RequirementType.GAMES_LOGGED:
          return await this.getGamesLoggedCount(userId, requirement.timeframe);
        
        case RequirementType.TOTAL_XP:
          return await this.getTotalXP(userId);
        
        case RequirementType.STREAK_DAYS:
          return await this.getCurrentStreak(userId);
        
        case RequirementType.STAT_VALUE:
          return await this.getStatValue(userId, requirement.metadata);
        
        case RequirementType.SOCIAL_SHARES:
          return await this.getSocialSharesCount(userId, requirement.timeframe);
        
        case RequirementType.CONSECUTIVE_GAMES:
          return await this.getConsecutiveGamesCount(userId, requirement.timeframe);
        
        default:
          return 0;
      }
    } catch (error) {
      console.error(`Error calculating requirement progress for ${requirement.type}:`, error);
      return 0;
    }
  }

  /**
   * Get games logged count for timeframe
   */
  private async getGamesLoggedCount(userId: string, timeframe?: string): Promise<number> {
    try {
      let startDate = new Date(0); // Beginning of time
      
      if (timeframe) {
        const now = new Date();
        switch (timeframe) {
          case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'weekly':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        }
      }

      const gamesQuery = query(
        collection(db, 'games'),
        where('userId', '==', userId),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(gamesQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting games logged count:', error);
      return 0;
    }
  }

  /**
   * Get total XP for user
   */
  private async getTotalXP(userId: string): Promise<number> {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('__name__', '==', userId),
        limit(1)
      );
      
      const snapshot = await getDocs(userQuery);
      if (!snapshot.empty) {
        return snapshot.docs[0].data().totalXP || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting total XP:', error);
      return 0;
    }
  }

  /**
   * Get current streak for user
   */
  private async getCurrentStreak(userId: string): Promise<number> {
    // This would integrate with your existing streak tracking logic
    // For now, return a placeholder
    return 0;
  }

  /**
   * Get stat value based on metadata
   */
  private async getStatValue(userId: string, metadata?: Record<string, any>): Promise<number> {
    if (!metadata?.stat) return 0;
    
    try {
      // Get the user's best performance for the specified stat
      const gamesQuery = query(
        collection(db, 'games'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(100) // Check recent games
      );

      const snapshot = await getDocs(gamesQuery);
      let bestValue = 0;

      snapshot.docs.forEach(doc => {
        const gameData = doc.data();
        const statValue = gameData[metadata.stat];
        
        if (typeof statValue === 'number') {
          if (metadata.comparison === 'gte' && statValue >= bestValue) {
            bestValue = statValue;
          } else if (metadata.comparison === 'lte' && (bestValue === 0 || statValue <= bestValue)) {
            bestValue = statValue;
          }
        }
      });

      return bestValue;
    } catch (error) {
      console.error('Error getting stat value:', error);
      return 0;
    }
  }

  /**
   * Get social shares count
   */
  private async getSocialSharesCount(userId: string, timeframe?: string): Promise<number> {
    // Placeholder - would integrate with actual social sharing tracking
    return 0;
  }

  /**
   * Get consecutive games count
   */
  private async getConsecutiveGamesCount(userId: string, timeframe?: string): Promise<number> {
    // Placeholder - would implement consecutive games logic
    return 0;
  }

  /**
   * Unlock achievement for user
   */
  private async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
      // Award XP for achievement
      await xpService.awardXP(userId, 'achievement_unlocked' as XPActionType, {
        achievementId: achievement.id,
        rarity: achievement.rarity,
      });

      // Add to user's unlocked achievements
      await updateDoc(doc(db, 'users', userId), {
        unlockedAchievements: arrayUnion(achievement.id),
        lastAchievementUnlocked: serverTimestamp(),
      });

      // Log achievement unlock
      await addDoc(collection(db, 'achievement_unlocks'), {
        userId,
        achievementId: achievement.id,
        unlockedAt: serverTimestamp(),
        xpAwarded: achievement.xpReward,
      });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }

  /**
   * Update user achievement progress
   */
  private async updateUserAchievementProgress(
    userId: string,
    achievementId: string,
    current: number,
    max: number,
    isCompleted: boolean
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'user_achievement_progress'), {
        userId,
        achievementId,
        progress: current,
        maxProgress: max,
        isCompleted,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating achievement progress:', error);
    }
  }

  /**
   * Get user's achievements with progress
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const progressQuery = query(
        collection(db, 'user_achievement_progress'),
        where('userId', '==', userId),
        orderBy('lastUpdated', 'desc')
      );

      const snapshot = await getDocs(progressQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        unlockedAt: doc.data().lastUpdated?.toDate(),
      })) as UserAchievement[];
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Get all available achievements
   */
  getAvailableAchievements(includeSecret = false): Achievement[] {
    return this.ACHIEVEMENTS.filter(achievement => 
      includeSecret || !achievement.isSecret
    );
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.ACHIEVEMENTS.filter(achievement => achievement.category === category);
  }

  /**
   * Get achievement by ID
   */
  getAchievementById(id: string): Achievement | undefined {
    return this.ACHIEVEMENTS.find(achievement => achievement.id === id);
  }
}

export const achievementService = new AchievementService();
