import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';
import { StreakData, StreakType } from '../../services/StreakService';

interface StreakCardProps {
  streakData: StreakData;
  onLogActivity?: () => void;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streakData,
  onLogActivity,
}) => {
  const getStreakTitle = (type: StreakType): string => {
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

  const getStreakEmoji = (type: StreakType): string => {
    switch (type) {
      case StreakType.WALL_BALL:
        return '🥍';
      case StreakType.DRILLS:
        return '🎯';
      case StreakType.SKILLS_PRACTICE:
        return '⚡';
      default:
        return '🏃';
    }
  };

  const getStreakDescription = (current: number, longest: number): string => {
    if (current === 0) {
      if (longest === 0) {
        return 'Start your first streak!';
      }
      return `Best streak: ${longest} ${longest === 1 ? 'day' : 'days'}`;
    }
    return `Current: ${current} ${current === 1 ? 'day' : 'days'}`;
  };

  return (
    <View
      style={[styles.container, streakData.isActive && styles.activeContainer]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.emoji}>{getStreakEmoji(streakData.type)}</Text>
          <Text style={styles.title}>{getStreakTitle(streakData.type)}</Text>
        </View>

        {streakData.current > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.fireEmoji}>🔥</Text>
            <Text style={styles.streakNumber}>{streakData.current}</Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>
        {getStreakDescription(streakData.current, streakData.longest)}
      </Text>

      {streakData.longest > 0 && streakData.current !== streakData.longest && (
        <Text style={styles.longestStreak}>
          Personal best: {streakData.longest}{' '}
          {streakData.longest === 1 ? 'day' : 'days'}
        </Text>
      )}

      {onLogActivity && (
        <TouchableOpacity style={styles.logButton} onPress={onLogActivity}>
          <Text style={styles.logButtonText}>
            {streakData.current === 0 ? 'Start Streak' : 'Log Today'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeContainer: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF8F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fireEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  streakNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  longestStreak: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  logButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  logButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
