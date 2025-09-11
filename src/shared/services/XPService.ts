import {
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

import { db } from '../../config/firebase';

export interface XPAction {
  type: XPActionType;
  amount: number;
  metadata?: Record<string, any>;
  timestamp: Date;
  userId: string;
  sessionId: string;
}

export enum XPActionType {
  GAME_LOGGED = 'game_logged',
  PROFILE_COMPLETED = 'profile_completed',
  STREAK_MILESTONE = 'streak_milestone',
  STAT_IMPROVEMENT = 'stat_improvement',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  DAILY_LOGIN = 'daily_login',
  SOCIAL_SHARE = 'social_share',
  TUTORIAL_COMPLETED = 'tutorial_completed',
  SEASON_GOAL_SET = 'season_goal_set',
  SEASON_GOAL_ACHIEVED = 'season_goal_achieved',
}

export interface XPReward {
  baseAmount: number;
  multiplier?: number;
  maxPerDay?: number;
  cooldownMinutes?: number;
  requiresVerification?: boolean;
}

export interface RateLimitConfig {
  maxActionsPerHour: number;
  maxActionsPerDay: number;
  suspiciousThreshold: number;
}

class XPService {
  private readonly XP_REWARDS: Record<XPActionType, XPReward> = {
    [XPActionType.GAME_LOGGED]: {
      baseAmount: 50,
      multiplier: 1.2, // Bonus for consecutive games
      maxPerDay: 500,
      cooldownMinutes: 30,
    },
    [XPActionType.PROFILE_COMPLETED]: {
      baseAmount: 100,
      maxPerDay: 100, // One-time reward
    },
    [XPActionType.STREAK_MILESTONE]: {
      baseAmount: 25,
      multiplier: 1.5, // Increases with streak length
      maxPerDay: 200,
    },
    [XPActionType.STAT_IMPROVEMENT]: {
      baseAmount: 30,
      multiplier: 1.1,
      maxPerDay: 300,
      cooldownMinutes: 60,
    },
    [XPActionType.ACHIEVEMENT_UNLOCKED]: {
      baseAmount: 75,
      multiplier: 2.0, // Rare achievements give more
      maxPerDay: 1000,
    },
    [XPActionType.DAILY_LOGIN]: {
      baseAmount: 20,
      maxPerDay: 20,
      cooldownMinutes: 1440, // 24 hours
    },
    [XPActionType.SOCIAL_SHARE]: {
      baseAmount: 15,
      maxPerDay: 60, // Max 4 shares per day
      cooldownMinutes: 360, // 6 hours between shares
    },
    [XPActionType.TUTORIAL_COMPLETED]: {
      baseAmount: 40,
      maxPerDay: 200, // Multiple tutorial sections
    },
    [XPActionType.SEASON_GOAL_SET]: {
      baseAmount: 25,
      maxPerDay: 100,
    },
    [XPActionType.SEASON_GOAL_ACHIEVED]: {
      baseAmount: 100,
      multiplier: 1.5,
      maxPerDay: 500,
    },
  };

  private readonly RATE_LIMITS: RateLimitConfig = {
    maxActionsPerHour: 50,
    maxActionsPerDay: 200,
    suspiciousThreshold: 100, // Actions per hour that trigger investigation
  };

  private sessionId: string;
  private actionCache: Map<string, Date> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Award XP for a specific action with anti-exploit protection
   */
  async awardXP(
    userId: string,
    actionType: XPActionType,
    metadata: Record<string, any> = {},
  ): Promise<{ success: boolean; xpAwarded: number; message?: string }> {
    try {
      // Rate limiting check
      const rateLimitCheck = await this.checkRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          xpAwarded: 0,
          message: rateLimitCheck.reason || 'Rate limit exceeded',
        };
      }

      // Cooldown check
      const cooldownCheck = await this.checkCooldown(userId, actionType);
      if (!cooldownCheck.allowed) {
        return {
          success: false,
          xpAwarded: 0,
          message: `Action on cooldown. Try again in ${cooldownCheck.remainingMinutes} minutes.`,
        };
      }

      // Daily limit check
      const dailyLimitCheck = await this.checkDailyLimit(userId, actionType);
      if (!dailyLimitCheck.allowed) {
        return {
          success: false,
          xpAwarded: 0,
          message: 'Daily XP limit reached for this action.',
        };
      }

      // Calculate XP amount
      const xpAmount = await this.calculateXPAmount(
        userId,
        actionType,
        metadata,
      );

      // Award XP and log action
      await this.executeXPAward(userId, actionType, xpAmount, metadata);

      return {
        success: true,
        xpAwarded: xpAmount,
        message: `Earned ${xpAmount} XP!`,
      };
    } catch (error) {
      console.error('Error awarding XP:', error);
      return {
        success: false,
        xpAwarded: 0,
        message: 'Failed to award XP. Please try again.',
      };
    }
  }

  /**
   * Check if user is within rate limits
   */
  private async checkRateLimit(
    userId: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      // Check hourly limit
      const hourlyQuery = query(
        collection(db, 'xp_actions'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(oneHourAgo)),
        orderBy('timestamp', 'desc'),
      );
      const hourlySnapshot = await getDocs(hourlyQuery);

      if (hourlySnapshot.size >= this.RATE_LIMITS.maxActionsPerHour) {
        return { allowed: false, reason: 'Hourly rate limit exceeded.' };
      }

      if (hourlySnapshot.size >= this.RATE_LIMITS.suspiciousThreshold) {
        // Log suspicious activity
        await this.logSuspiciousActivity(userId, 'high_frequency_actions', {
          actionsInLastHour: hourlySnapshot.size,
        });
      }

      // Check daily limit
      const dailyQuery = query(
        collection(db, 'xp_actions'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(oneDayAgo)),
        orderBy('timestamp', 'desc'),
      );
      const dailySnapshot = await getDocs(dailyQuery);

      if (dailySnapshot.size >= this.RATE_LIMITS.maxActionsPerDay) {
        return { allowed: false, reason: 'Daily rate limit exceeded.' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: true }; // Fail open to not block legitimate users
    }
  }

  /**
   * Check action-specific cooldown
   */
  private async checkCooldown(
    userId: string,
    actionType: XPActionType,
  ): Promise<{ allowed: boolean; remainingMinutes?: number }> {
    const reward = this.XP_REWARDS[actionType];
    if (!reward.cooldownMinutes) {
      return { allowed: true };
    }

    const cacheKey = `${userId}-${actionType}`;
    const lastAction = this.actionCache.get(cacheKey);

    if (lastAction) {
      const timeSinceLastAction = Date.now() - lastAction.getTime();
      const cooldownMs = reward.cooldownMinutes * 60 * 1000;

      if (timeSinceLastAction < cooldownMs) {
        const remainingMs = cooldownMs - timeSinceLastAction;
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        return { allowed: false, remainingMinutes };
      }
    }

    // Check database for more persistent cooldown tracking
    try {
      const cooldownTime = new Date(
        Date.now() - reward.cooldownMinutes * 60 * 1000,
      );
      const recentQuery = query(
        collection(db, 'xp_actions'),
        where('userId', '==', userId),
        where('type', '==', actionType),
        where('timestamp', '>=', Timestamp.fromDate(cooldownTime)),
        orderBy('timestamp', 'desc'),
        limit(1),
      );

      const recentSnapshot = await getDocs(recentQuery);
      if (!recentSnapshot.empty) {
        const lastActionTime = recentSnapshot.docs[0]?.data()?.timestamp?.toDate();
        if (!lastActionTime) return { allowed: true };
        const timeSinceLastAction = Date.now() - lastActionTime.getTime();
        const cooldownMs = reward.cooldownMinutes * 60 * 1000;

        if (timeSinceLastAction < cooldownMs) {
          const remainingMs = cooldownMs - timeSinceLastAction;
          const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
          return { allowed: false, remainingMinutes };
        }
      }
    } catch (error) {
      console.error('Cooldown check failed:', error);
    }

    return { allowed: true };
  }

  /**
   * Check daily XP limit for specific action
   */
  private async checkDailyLimit(
    userId: string,
    actionType: XPActionType,
  ): Promise<{ allowed: boolean }> {
    const reward = this.XP_REWARDS[actionType];
    if (!reward.maxPerDay) {
      return { allowed: true };
    }

    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const dailyQuery = query(
        collection(db, 'xp_actions'),
        where('userId', '==', userId),
        where('type', '==', actionType),
        where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
        orderBy('timestamp', 'desc'),
      );

      const dailySnapshot = await getDocs(dailyQuery);
      const dailyXP = dailySnapshot.docs.reduce((total, doc) => {
        return total + (doc.data().amount || 0);
      }, 0);

      return { allowed: dailyXP < reward.maxPerDay };
    } catch (error) {
      console.error('Daily limit check failed:', error);
      return { allowed: true }; // Fail open
    }
  }

  /**
   * Calculate XP amount with multipliers
   */
  private async calculateXPAmount(
    _userId: string,
    actionType: XPActionType,
    metadata: Record<string, any>,
  ): Promise<number> {
    const reward = this.XP_REWARDS[actionType];
    let amount = reward.baseAmount;

    // Apply multipliers based on action type and metadata
    if (reward.multiplier) {
      switch (actionType) {
        case XPActionType.GAME_LOGGED:
          // Bonus for consecutive games in session
          const gamesInSession = metadata.gamesInSession || 1;
          amount *= Math.min(reward.multiplier * gamesInSession, 3.0);
          break;

        case XPActionType.STREAK_MILESTONE:
          // Bonus based on streak length
          const streakLength = metadata.streakLength || 1;
          amount *= Math.min(
            reward.multiplier * Math.log10(streakLength + 1),
            5.0,
          );
          break;

        case XPActionType.ACHIEVEMENT_UNLOCKED:
          // Bonus for rare achievements
          const rarity = metadata.rarity || 'common';
          const rarityMultiplier = {
            common: 1,
            rare: 1.5,
            epic: 2,
            legendary: 3,
          };
          amount *=
            rarityMultiplier[rarity as keyof typeof rarityMultiplier] || 1;
          break;
      }
    }

    return Math.floor(amount);
  }

  /**
   * Execute XP award and log action
   */
  private async executeXPAward(
    userId: string,
    actionType: XPActionType,
    amount: number,
    metadata: Record<string, any>,
  ): Promise<void> {
    const batch = [
      // Update user's total XP
      updateDoc(doc(db, 'users', userId), {
        totalXP: increment(amount),
        lastXPUpdate: serverTimestamp(),
      }),

      // Log the XP action
      addDoc(collection(db, 'xp_actions'), {
        userId,
        type: actionType,
        amount,
        metadata,
        timestamp: serverTimestamp(),
        sessionId: this.sessionId,
      }),
    ];

    await Promise.all(batch);

    // Update local cache
    this.actionCache.set(`${userId}-${actionType}`, new Date());
  }

  /**
   * Log suspicious activity for monitoring
   */
  private async logSuspiciousActivity(
    userId: string,
    type: string,
    details: Record<string, any>,
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'suspicious_activity'), {
        userId,
        type,
        details,
        timestamp: serverTimestamp(),
        sessionId: this.sessionId,
      });
    } catch (error) {
      console.error('Failed to log suspicious activity:', error);
    }
  }

  /**
   * Get user's XP history
   */
  async getXPHistory(userId: string, limitCount = 50): Promise<XPAction[]> {
    try {
      const historyQuery = query(
        collection(db, 'xp_actions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount),
      );

      const snapshot = await getDocs(historyQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as XPAction[];
    } catch (error) {
      console.error('Failed to get XP history:', error);
      return [];
    }
  }

  /**
   * Get available XP rewards info
   */
  getXPRewards(): Record<XPActionType, XPReward> {
    return { ...this.XP_REWARDS };
  }
}

export const xpService = new XPService();
