import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { theme } from '../../../constants/theme';
import { StreakCard } from './StreakCard';
import { streakService, type StreakData, StreakType } from '../../services/StreakService';

interface StreaksContainerProps {
  userId: string;
}

export const StreaksContainer: React.FC<StreaksContainerProps> = ({ userId }) => {
  const [streaks, setStreaks] = useState<Record<StreakType, StreakData>>({} as any);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreaks();
  }, [userId]);

  const loadStreaks = async () => {
    try {
      setLoading(true);
      const streaksData = await streakService.getAllStreaks(userId);
      setStreaks(streaksData);
    } catch (error) {
      console.error('Error loading streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async (type: StreakType) => {
    try {
      // Show simple confirmation for now - in production, you'd show a proper modal
      Alert.alert(
        'Log Activity',
        `Log ${getActivityName(type)} for today?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Activity',
            onPress: async () => {
              try {
                const updatedStreak = await streakService.logActivity(userId, type);
                setStreaks(prev => ({
                  ...prev,
                  [type]: updatedStreak,
                }));
                
                Alert.alert(
                  'Activity Logged!',
                  `${getActivityName(type)} logged successfully. ${updatedStreak.isActive ? `🔥 ${updatedStreak.current} day streak!` : 'Keep it up!'}`
                );
              } catch (error) {
                Alert.alert('Error', 'Failed to log activity. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const getActivityName = (type: StreakType): string => {
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
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Skills & Drills Streaks</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading streaks...</Text>
        </View>
      </View>
    );
  }

  const activeStreaks = Object.values(streaks).filter(streak => streak.isActive);
  const totalActiveStreaks = activeStreaks.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Skills & Drills Streaks</Text>
        {totalActiveStreaks > 0 && (
          <View style={styles.activeStreaksBadge}>
            <Text style={styles.activeStreaksText}>🔥 {totalActiveStreaks}</Text>
          </View>
        )}
      </View>

      <Text style={styles.subtitle}>
        Build consistency with daily practice
      </Text>

      <ScrollView style={styles.streaksContainer} showsVerticalScrollIndicator={false}>
        {Object.values(StreakType).map(type => {
          const streakData = streaks[type];
          if (!streakData) return null;

          return (
            <StreakCard
              key={type}
              streakData={streakData}
              onLogActivity={() => handleLogActivity(type)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  activeStreaksBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeStreaksText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  streaksContainer: {
    maxHeight: 300,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
