import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@shared/theme';
import { calculateLevel, calculateLevelProgress, getXPToNextLevel, ANIMATION_DURATIONS } from '../../utils/gamification';

interface XPStripProps {
  currentXP: number;
  animateToXP?: number;
  showLabel?: boolean;
  compact?: boolean;
}

export default function XPStrip({ 
  currentXP, 
  animateToXP, 
  showLabel = true, 
  compact = false 
}: XPStripProps) {
  const progressAnim = useRef(new Animated.Value(calculateLevelProgress(currentXP))).current;
  const xpCountAnim = useRef(new Animated.Value(currentXP)).current;
  
  const currentLevel = calculateLevel(animateToXP || currentXP);
  const progress = calculateLevelProgress(animateToXP || currentXP);
  const xpToNext = getXPToNextLevel(animateToXP || currentXP);

  useEffect(() => {
    if (animateToXP && animateToXP !== currentXP) {
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: calculateLevelProgress(animateToXP),
        duration: ANIMATION_DURATIONS.XP_GAIN,
        useNativeDriver: false,
      }).start();

      // Animate XP counter
      Animated.timing(xpCountAnim, {
        toValue: animateToXP,
        duration: ANIMATION_DURATIONS.XP_GAIN,
        useNativeDriver: false,
      }).start();
    }
  }, [animateToXP, currentXP]);

  const stripHeight = compact ? 6 : 8;
  const containerPadding = compact ? spacing.sm : spacing.md;

  return (
    <View style={[styles.container, { paddingVertical: containerPadding }]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelIcon}>{currentLevel.icon}</Text>
            <Text style={styles.levelText}>{currentLevel.name}</Text>
          </View>
          <Text style={styles.xpText}>
            {currentXP} XP
          </Text>
        </View>
      )}
      
      <View style={[styles.progressTrack, { height: stripHeight }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              height: stripHeight,
            },
          ]}
        >
          <LinearGradient
            colors={[currentLevel.color, currentLevel.color + 'AA']}
            start={[0, 0]}
            end={[1, 0]}
            style={styles.gradient}
          />
        </Animated.View>
        
        {/* Progress glow effect */}
        <Animated.View
          style={[
            styles.progressGlow,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              height: stripHeight + 4,
            },
          ]}
        />
      </View>

      {showLabel && !compact && xpToNext > 0 && (
        <Text style={styles.nextLevelText}>
          {xpToNext} XP to {currentLevel.id !== 'captain' ? 'next level' : 'max level'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  levelIcon: {
    fontSize: fontSizes.sm,
    marginRight: spacing.xs,
  },
  levelText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
  },
  xpText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
  },
  progressTrack: {
    backgroundColor: colors.neutral200,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: borderRadius.sm,
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    left: 0,
    backgroundColor: colors.neutral300,
    borderRadius: borderRadius.sm,
    opacity: 0.5,
  },
  nextLevelText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
