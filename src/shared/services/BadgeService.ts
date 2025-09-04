import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: BadgeCategory;
  position: string; // 'all', 'goalie', 'defender', 'midfielder', 'attacker'
  requirements: BadgeRequirement[];
  isSecret?: boolean;
}

export interface BadgeRequirement {
  type: RequirementType;
  value: number;
  timeframe?: 'game' | 'season' | 'alltime';
  metadata?: Record<string, any>;
}

export enum BadgeCategory {
  MILESTONES = 'milestones',
  PERFORMANCE = 'performance',
  CONSISTENCY = 'consistency',
  SPECIAL = 'special',
}

export enum RequirementType {
  STAT_TOTAL = 'stat_total',
  STAT_SINGLE_GAME = 'stat_single_game',
  STAT_PERCENTAGE = 'stat_percentage',
  CONSECUTIVE_GAMES = 'consecutive_games',
  SEASON_GOALS_COMPLETED = 'season_goals_completed',
}

export interface UserBadge {
  badgeId: string;
  badge: Badge;
  unlockedAt: Date;
  gameId?: string; // If earned from a specific game
}

class BadgeService {
  private readonly BADGES: Badge[] = [
    // Goalie Badges
    {
      id: 'first_shutout',
      title: 'First Shutout',
      description: 'Record your first shutout',
      iconName: 'shield-check',
      category: BadgeCategory.MILESTONES,
      position: 'goalie',
      requirements: [
        { type: RequirementType.STAT_SINGLE_GAME, value: 0, metadata: { stat: 'goalsAllowed' } }
      ]
    },
    {
      id: 'century_saves',
      title: '100 Saves Club',
      description: 'Make 100 saves in a season',
      iconName: 'target',
      category: BadgeCategory.MILESTONES,
      position: 'goalie',
      requirements: [
        { type: RequirementType.STAT_TOTAL, value: 100, timeframe: 'season', metadata: { stat: 'saves' } }
      ]
    },
    {
      id: 'elite_save_percentage',
      title: '.700 Save % Club',
      description: 'Maintain a .700+ save percentage',
      iconName: 'award',
      category: BadgeCategory.PERFORMANCE,
      position: 'goalie',
      requirements: [
        { type: RequirementType.STAT_PERCENTAGE, value: 70, timeframe: 'season', metadata: { stat: 'savePercentage' } }
      ]
    },
    {
      id: 'wall_of_saves',
      title: 'Wall of Saves',
      description: 'Make 20+ saves in a single game',
      iconName: 'shield',
      category: BadgeCategory.PERFORMANCE,
      position: 'goalie',
      requirements: [
        { type: RequirementType.STAT_SINGLE_GAME, value: 20, metadata: { stat: 'saves' } }
      ]
    },

    // Field Player Badges
    {
      id: 'first_hat_trick',
      title: 'First Hat Trick',
      description: 'Score 3+ goals in a single game',
      iconName: 'flame',
      category: BadgeCategory.MILESTONES,
      position: 'all',
      requirements: [
        { type: RequirementType.STAT_SINGLE_GAME, value: 3, metadata: { stat: 'goals' } }
      ]
    },
    {
      id: 'ground_ball_machine',
      title: '50 Ground Balls',
      description: 'Collect 50 ground balls in a season',
      iconName: 'circle-dot',
      category: BadgeCategory.MILESTONES,
      position: 'all',
      requirements: [
        { type: RequirementType.STAT_TOTAL, value: 50, timeframe: 'season', metadata: { stat: 'groundBalls' } }
      ]
    },
    {
      id: 'playmaker',
      title: 'Playmaker',
      description: 'Record 25+ assists in a season',
      iconName: 'users',
      category: BadgeCategory.PERFORMANCE,
      position: 'all',
      requirements: [
        { type: RequirementType.STAT_TOTAL, value: 25, timeframe: 'season', metadata: { stat: 'assists' } }
      ]
    },
    {
      id: 'scorer',
      title: 'Scorer',
      description: 'Score 30+ goals in a season',
      iconName: 'zap',
      category: BadgeCategory.PERFORMANCE,
      position: 'all',
      requirements: [
        { type: RequirementType.STAT_TOTAL, value: 30, timeframe: 'season', metadata: { stat: 'goals' } }
      ]
    },
    {
      id: 'point_machine',
      title: 'Point Machine',
      description: 'Record 50+ points in a season',
      iconName: 'trending-up',
      category: BadgeCategory.PERFORMANCE,
      position: 'all',
      requirements: [
        { type: RequirementType.STAT_TOTAL, value: 50, timeframe: 'season', metadata: { stat: 'points' } }
      ]
    },

    // Consistency Badges
    {
      id: 'iron_man',
      title: 'Iron Man',
      description: 'Play in 15 consecutive games',
      iconName: 'calendar-check',
      category: BadgeCategory.CONSISTENCY,
      position: 'all',
      requirements: [
        { type: RequirementType.CONSECUTIVE_GAMES, value: 15 }
      ]
    },
    {
      id: 'goal_achiever',
      title: 'Goal Achiever',
      description: 'Complete all 3 season goals',
      iconName: 'check-circle',
      category: BadgeCategory.SPECIAL,
      position: 'all',
      requirements: [
        { type: RequirementType.SEASON_GOALS_COMPLETED, value: 3 }
      ]
    }
  ];

  /**
   * Check for newly earned badges after a game is logged
   */
  async checkBadgesAfterGame(userId: string, gameData: any): Promise<UserBadge[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];

      const userData = userDoc.data();
      const userPosition = userData.position || 'midfielder';
      const unlockedBadgeIds = userData.unlockedBadges || [];
      
      const newBadges: UserBadge[] = [];
      const eligibleBadges = this.getBadgesForPosition(userPosition);

      for (const badge of eligibleBadges) {
        if (unlockedBadgeIds.includes(badge.id)) continue;

        const isEarned = await this.checkBadgeRequirements(userId, badge, gameData);
        if (isEarned) {
          const userBadge: UserBadge = {
            badgeId: badge.id,
            badge,
            unlockedAt: new Date(),
            gameId: gameData.id,
          };
          newBadges.push(userBadge);

          // Update user's unlocked badges
          await updateDoc(doc(db, 'users', userId), {
            unlockedBadges: arrayUnion(badge.id),
            lastBadgeUnlocked: serverTimestamp(),
          });
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking badges after game:', error);
      return [];
    }
  }

  /**
   * Get badges available for a specific position
   */
  private getBadgesForPosition(position: string): Badge[] {
    return this.BADGES.filter(badge => 
      badge.position === 'all' || badge.position === position
    );
  }

  /**
   * Check if badge requirements are met
   */
  private async checkBadgeRequirements(userId: string, badge: Badge, gameData?: any): Promise<boolean> {
    try {
      for (const requirement of badge.requirements) {
        const isMet = await this.checkSingleRequirement(userId, requirement, gameData);
        if (!isMet) return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking badge requirements:', error);
      return false;
    }
  }

  /**
   * Check a single badge requirement
   */
  private async checkSingleRequirement(
    userId: string, 
    requirement: BadgeRequirement, 
    gameData?: any
  ): Promise<boolean> {
    try {
      switch (requirement.type) {
        case RequirementType.STAT_SINGLE_GAME:
          if (!gameData) return false;
          const statValue = this.getStatFromGame(gameData, requirement.metadata?.stat);
          return statValue >= requirement.value;

        case RequirementType.STAT_TOTAL:
          const totalValue = await this.getSeasonStatTotal(userId, requirement.metadata?.stat);
          return totalValue >= requirement.value;

        case RequirementType.STAT_PERCENTAGE:
          const percentage = await this.getSeasonStatPercentage(userId, requirement.metadata?.stat);
          return percentage >= requirement.value;

        case RequirementType.CONSECUTIVE_GAMES:
          const consecutiveGames = await this.getConsecutiveGamesCount(userId);
          return consecutiveGames >= requirement.value;

        case RequirementType.SEASON_GOALS_COMPLETED:
          const completedGoals = await this.getCompletedSeasonGoalsCount(userId);
          return completedGoals >= requirement.value;

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking single requirement:', error);
      return false;
    }
  }

  /**
   * Get stat value from game data
   */
  private getStatFromGame(gameData: any, statType: string): number {
    const stats = gameData.stats || {};
    
    switch (statType) {
      case 'goalsAllowed':
        return stats.goalsAllowed || 0;
      case 'saves':
        return stats.saves || 0;
      case 'goals':
        return stats.goals || 0;
      case 'assists':
        return stats.assists || 0;
      case 'groundBalls':
        return stats.groundBalls || 0;
      case 'points':
        return (stats.goals || 0) + (stats.assists || 0);
      default:
        return 0;
    }
  }

  /**
   * Get season total for a stat
   */
  private async getSeasonStatTotal(userId: string, statType: string): Promise<number> {
    try {
      const gamesQuery = query(
        collection(db, 'games'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(gamesQuery);
      let total = 0;

      snapshot.docs.forEach(doc => {
        const gameData = doc.data();
        total += this.getStatFromGame(gameData, statType);
      });

      return total;
    } catch (error) {
      console.error('Error getting season stat total:', error);
      return 0;
    }
  }

  /**
   * Get season percentage for a stat (like save percentage)
   */
  private async getSeasonStatPercentage(userId: string, statType: string): Promise<number> {
    try {
      if (statType !== 'savePercentage') return 0;

      const gamesQuery = query(
        collection(db, 'games'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(gamesQuery);
      let totalSaves = 0;
      let totalShots = 0;

      snapshot.docs.forEach(doc => {
        const gameData = doc.data();
        const stats = gameData.stats || {};
        totalSaves += stats.saves || 0;
        totalShots += stats.shotsAgainst || 0;
      });

      return totalShots > 0 ? (totalSaves / totalShots) * 100 : 0;
    } catch (error) {
      console.error('Error getting season stat percentage:', error);
      return 0;
    }
  }

  /**
   * Get consecutive games count
   */
  private async getConsecutiveGamesCount(userId: string): Promise<number> {
    try {
      const gamesQuery = query(
        collection(db, 'games'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(gamesQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting consecutive games count:', error);
      return 0;
    }
  }

  /**
   * Get completed season goals count
   */
  private async getCompletedSeasonGoalsCount(userId: string): Promise<number> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return 0;

      const userData = userDoc.data();
      const seasonGoals = userData.seasonGoals || [];
      let completedCount = 0;

      for (const goal of seasonGoals) {
        const currentValue = await this.getSeasonStatTotal(userId, goal.statType);
        if (currentValue >= goal.target) {
          completedCount++;
        }
      }

      return completedCount;
    } catch (error) {
      console.error('Error getting completed season goals count:', error);
      return 0;
    }
  }

  /**
   * Get user's unlocked badges
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];

      const userData = userDoc.data();
      const unlockedBadgeIds = userData.unlockedBadges || [];
      
      const userBadges: UserBadge[] = [];
      
      for (const badgeId of unlockedBadgeIds) {
        const badge = this.BADGES.find(b => b.id === badgeId);
        if (badge) {
          userBadges.push({
            badgeId,
            badge,
            unlockedAt: new Date(), // Would get from badge unlock log in production
          });
        }
      }

      return userBadges;
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  /**
   * Get all available badges for a position
   */
  getAvailableBadges(position: string, includeSecret = false): Badge[] {
    return this.getBadgesForPosition(position).filter(badge => 
      includeSecret || !badge.isSecret
    );
  }

  /**
   * Get badge by ID
   */
  getBadgeById(id: string): Badge | undefined {
    return this.BADGES.find(badge => badge.id === id);
  }
}

export const badgeService = new BadgeService();
