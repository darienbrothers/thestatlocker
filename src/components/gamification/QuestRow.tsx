import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@shared/theme';
import { ANIMATION_DURATIONS } from '../../utils/gamification';

interface QuestRowProps {
  title: string;
  description?: string;
  xpReward: number;
  isCompleted: boolean;
  showCompletionAnimation?: boolean;
  questNumber?: number;
  totalQuests?: number;
}

export default function QuestRow({
  title,
  description,
  xpReward,
  isCompleted,
  showCompletionAnimation = false,
  questNumber,
  totalQuests,
}: QuestRowProps) {
  const checkmarkScale = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const xpBadgeScale = useRef(new Animated.Value(isCompleted ? 1 : 0.8)).current;
  const rowOpacity = useRef(new Animated.Value(isCompleted ? 0.7 : 1)).current;

  useEffect(() => {
    if (showCompletionAnimation && isCompleted) {
      // Quest completion animation
      Animated.sequence([
        // Show checkmark with bounce
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        // Scale up XP badge
        Animated.timing(xpBadgeScale, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.MICRO_REWARD,
          useNativeDriver: true,
        }),
        // Fade row slightly
        Animated.timing(rowOpacity, {
          toValue: 0.7,
          duration: ANIMATION_DURATIONS.MICRO_REWARD,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showCompletionAnimation, isCompleted]);

  return (
    <Animated.View style={[styles.container, { opacity: rowOpacity }]}>
      <View style={styles.leftSection}>
        {/* Quest number or checkmark */}
        <View style={styles.iconContainer}>
          {isCompleted ? (
            <Animated.View
              style={[
                styles.checkmark,
                {
                  transform: [{ scale: checkmarkScale }],
                },
              ]}
            >
              <Text style={styles.checkmarkText}>✓</Text>
            </Animated.View>
          ) : (
            <View style={styles.questNumber}>
              <Text style={styles.questNumberText}>
                {questNumber || '•'}
              </Text>
            </View>
          )}
        </View>

        {/* Quest content */}
        <View style={styles.contentContainer}>
          <Text style={[styles.title, isCompleted && styles.completedTitle]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.description, isCompleted && styles.completedDescription]}>
              {description}
            </Text>
          )}
          {questNumber && totalQuests && (
            <Text style={styles.progressText}>
              Quest {questNumber}/{totalQuests}
            </Text>
          )}
        </View>
      </View>

      {/* XP Reward Badge */}
      <Animated.View
        style={[
          styles.xpBadge,
          {
            transform: [{ scale: xpBadgeScale }],
          },
        ]}
      >
        <Text style={styles.xpText}>+{xpReward}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
    shadowColor: colors.neutral900,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 24,
    height: 24,
    backgroundColor: colors.success,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.bold,
  },
  questNumber: {
    width: 24,
    height: 24,
    backgroundColor: colors.neutral200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questNumberText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.semiBold,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  completedDescription: {
    color: colors.textTertiary,
  },
  progressText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  xpBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    minWidth: 48,
  },
  xpText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.bold,
    color: colors.white,
  },
  xpLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.medium,
    color: colors.white,
    opacity: 0.9,
  },
});
