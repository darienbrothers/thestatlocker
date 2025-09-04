import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

export interface StreakData {
  type: StreakType;
  current: number;
  longest: number;
  lastActivityDate: Date | null;
  isActive: boolean;
}

export enum StreakType {
  WALL_BALL = 'wall_ball',
  DRILLS = 'drills',
  SKILLS_PRACTICE = 'skills_practice',
}

export interface StreakActivity {
  userId: string;
  type: StreakType;
  date: Date;
  duration?: number; // minutes
  notes?: string;
}

class StreakService {
  /**
   * Log a skills/drills activity and update streaks
   */
  async logActivity(userId: string, type: StreakType, duration?: number, notes?: string): Promise<StreakData> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if already logged today
      const todayQuery = query(
        collection(db, 'streak_activities'),
        where('userId', '==', userId),
        where('type', '==', type),
        where('date', '>=', today),
        limit(1)
      );

      const todaySnapshot = await getDocs(todayQuery);
      if (!todaySnapshot.empty) {
        // Already logged today, just return current streak
        return await this.getStreak(userId, type);
      }

      // Log the activity
      await addDoc(collection(db, 'streak_activities'), {
        userId,
        type,
        date: serverTimestamp(),
        duration: duration || 0,
        notes: notes || '',
        createdAt: serverTimestamp(),
      });

      // Update streak
      const streakData = await this.calculateStreak(userId, type);
      await this.updateUserStreak(userId, type, streakData);

      return streakData;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  /**
   * Get current streak for a user and activity type
   */
  async getStreak(userId: string, type: StreakType): Promise<StreakData> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return this.getDefaultStreak(type);
      }

      const userData = userDoc.data();
      const streaks = userData.streaks || {};
      const streakData = streaks[type];

      if (!streakData) {
        return this.getDefaultStreak(type);
      }

      // Check if streak is still active (last activity was yesterday or today)
      const lastActivityDate = streakData.lastActivityDate?.toDate();
      const isActive = this.isStreakActive(lastActivityDate);

      return {
        type,
        current: isActive ? streakData.current || 0 : 0,
        longest: streakData.longest || 0,
        lastActivityDate,
        isActive,
      };
    } catch (error) {
      console.error('Error getting streak:', error);
      return this.getDefaultStreak(type);
    }
  }

  /**
   * Get all streaks for a user
   */
  async getAllStreaks(userId: string): Promise<Record<StreakType, StreakData>> {
    try {
      const streaks: Record<StreakType, StreakData> = {} as any;
      
      for (const type of Object.values(StreakType)) {
        streaks[type] = await this.getStreak(userId, type);
      }

      return streaks;
    } catch (error) {
      console.error('Error getting all streaks:', error);
      return {} as Record<StreakType, StreakData>;
    }
  }

  /**
   * Calculate streak based on activity history
   */
  private async calculateStreak(userId: string, type: StreakType): Promise<StreakData> {
    try {
      const activitiesQuery = query(
        collection(db, 'streak_activities'),
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('date', 'desc'),
        limit(365) // Check up to a year of activities
      );

      const snapshot = await getDocs(activitiesQuery);
      const activities = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          date: data.date?.toDate() || new Date(),
          ...data
        };
      });

      if (activities.length === 0) {
        return this.getDefaultStreak(type);
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;

      // Sort activities by date (most recent first)
      activities.sort((a, b) => b.date.getTime() - a.date.getTime());

      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        if (!activity?.date) continue;
        const activityDate = new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0);

        if (i === 0) {
          // First activity (most recent)
          tempStreak = 1;
          lastDate = activityDate;
          
          // Check if this is today or yesterday to determine if streak is current
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          if (activityDate.getTime() === today.getTime() || 
              activityDate.getTime() === yesterday.getTime()) {
            currentStreak = 1;
          }
        } else {
          // Check if this activity is consecutive with the previous one
          const expectedDate = new Date(lastDate!);
          expectedDate.setDate(expectedDate.getDate() - 1);

          if (activityDate.getTime() === expectedDate.getTime()) {
            tempStreak++;
            if (currentStreak > 0) {
              currentStreak++;
            }
          } else {
            // Streak broken, update longest if needed
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
            currentStreak = 0; // Current streak is broken
          }
          
          lastDate = activityDate;
        }
      }

      // Update longest streak with final temp streak
      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        type,
        current: currentStreak,
        longest: longestStreak,
        lastActivityDate: activities[0]?.date || null,
        isActive: currentStreak > 0,
      };
    } catch (error) {
      console.error('Error calculating streak:', error);
      return this.getDefaultStreak(type);
    }
  }

  /**
   * Update user's streak data in Firestore
   */
  private async updateUserStreak(userId: string, type: StreakType, streakData: StreakData): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        [`streaks.${type}`]: {
          current: streakData.current,
          longest: streakData.longest,
          lastActivityDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      };

      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error updating user streak:', error);
      throw error;
    }
  }

  /**
   * Check if a streak is still active based on last activity date
   */
  private isStreakActive(lastActivityDate: Date | null): boolean {
    if (!lastActivityDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastActivity = new Date(lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    // Streak is active if last activity was today or yesterday
    return lastActivity.getTime() === today.getTime() || 
           lastActivity.getTime() === yesterday.getTime();
  }

  /**
   * Get default streak data
   */
  private getDefaultStreak(type: StreakType): StreakData {
    return {
      type,
      current: 0,
      longest: 0,
      lastActivityDate: null,
      isActive: false,
    };
  }

  /**
   * Get streak display text
   */
  getStreakDisplayText(streakData: StreakData): string {
    if (streakData.current === 0) {
      return 'Start your streak!';
    }
    
    const days = streakData.current === 1 ? 'day' : 'days';
    return `🔥 ${streakData.current} ${days}`;
  }

  /**
   * Get activity history for a user and type
   */
  async getActivityHistory(userId: string, type: StreakType, limitCount = 30): Promise<StreakActivity[]> {
    try {
      const activitiesQuery = query(
        collection(db, 'streak_activities'),
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(activitiesQuery);
      return snapshot.docs.map(doc => ({
        userId,
        type,
        date: doc.data().date.toDate(),
        duration: doc.data().duration,
        notes: doc.data().notes,
      }));
    } catch (error) {
      console.error('Error getting activity history:', error);
      return [];
    }
  }
}

export const streakService = new StreakService();
