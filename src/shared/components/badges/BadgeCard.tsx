import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../constants/theme';
import { Badge } from '../../services/BadgeService';

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  isUnlocked,
  unlockedAt,
  progress = 0,
  maxProgress = 1,
}) => {
  const progressPercentage =
    maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  return (
    <View style={[styles.container, isUnlocked && styles.unlockedContainer]}>
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, isUnlocked && styles.unlockedIcon]}>
          {getBadgeIcon(badge.iconName)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, isUnlocked && styles.unlockedTitle]}>
          {badge.title}
        </Text>
        <Text style={styles.description}>{badge.description}</Text>

        {!isUnlocked && maxProgress > 1 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progressPercentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress} / {maxProgress}
            </Text>
          </View>
        )}

        {isUnlocked && unlockedAt && (
          <Text style={styles.unlockedDate}>
            Earned {formatDate(unlockedAt)}
          </Text>
        )}
      </View>

      {isUnlocked && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </View>
  );
};

const getBadgeIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    'shield-check': '🛡️',
    target: '🎯',
    award: '🏆',
    shield: '🔒',
    flame: '🔥',
    'circle-dot': '⚪',
    users: '👥',
    zap: '⚡',
    'trending-up': '📈',
    'calendar-check': '📅',
    'check-circle': '✅',
  };

  return iconMap[iconName] || '🏅';
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  unlockedContainer: {
    opacity: 1,
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  unlockedIcon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  unlockedTitle: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  unlockedDate: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '500',
    marginTop: 4,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});
