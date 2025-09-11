import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@shared/theme';

interface XPDisplayProps {
  currentXP: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  showAnimation?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const XPDisplay: React.FC<XPDisplayProps> = ({
  currentXP,
  level,
  xpForCurrentLevel,
  xpForNextLevel,
  showAnimation = false,
  size = 'medium',
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const progress = Math.min(
    (currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel),
    1,
  );

  const styles = getStyles(size);

  useEffect(() => {
    if (showAnimation) {
      // Scale animation for level up
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: showAnimation ? 1000 : 0,
      useNativeDriver: false,
    }).start();
  }, [progress, showAnimation]);

  const getLevelColor = (level: number): string => {
    if (level < 10) {
      return theme.colors.primary.main;
    }
    if (level < 25) {
      return theme.colors.success.main;
    }
    if (level < 50) {
      return theme.colors.warning.main;
    }
    if (level < 100) {
      return theme.colors.error.main;
    }
    return theme.colors.info.main;
  };

  const getLevelTitle = (level: number): string => {
    if (level < 5) {
      return 'Rookie';
    }
    if (level < 15) {
      return 'Player';
    }
    if (level < 30) {
      return 'Veteran';
    }
    if (level < 50) {
      return 'All-Star';
    }
    if (level < 75) {
      return 'Superstar';
    }
    if (level < 100) {
      return 'Legend';
    }
    return 'Hall of Fame';
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      {/* Level Badge */}
      <View
        style={[styles.levelBadge, { backgroundColor: getLevelColor(level) }]}
      >
        <Text style={styles.levelText}>{level}</Text>
      </View>

      {/* XP Info */}
      <View style={styles.xpInfo}>
        <Text style={styles.levelTitle}>{getLevelTitle(level)}</Text>
        <Text style={styles.xpText}>{currentXP.toLocaleString()} XP</Text>
        <Text style={styles.xpSubText}>
          {(xpForNextLevel - currentXP).toLocaleString()} XP to next level
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={[getLevelColor(level), theme.colors.primary.light]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>
    </Animated.View>
  );
};

const getStyles = (size: 'small' | 'medium' | 'large') => {
  const sizeConfig = {
    small: {
      levelBadgeSize: 32,
      levelTextSize: theme.typography.body2.fontSize,
      titleSize: theme.typography.body2.fontSize,
      xpTextSize: theme.typography.body1.fontSize,
      subTextSize: theme.typography.caption.fontSize,
      progressHeight: 6,
      spacing: theme.spacing.xs,
    },
    medium: {
      levelBadgeSize: 48,
      levelTextSize: theme.typography.h6.fontSize,
      titleSize: theme.typography.body1.fontSize,
      xpTextSize: theme.typography.h6.fontSize,
      subTextSize: theme.typography.body2.fontSize,
      progressHeight: 8,
      spacing: theme.spacing.sm,
    },
    large: {
      levelBadgeSize: 64,
      levelTextSize: theme.typography.h5.fontSize,
      titleSize: theme.typography.h6.fontSize,
      xpTextSize: theme.typography.h5.fontSize,
      subTextSize: theme.typography.body1.fontSize,
      progressHeight: 12,
      spacing: theme.spacing.md,
    },
  };

  const config = sizeConfig[size];

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: config.spacing,
      backgroundColor: theme.colors.surface.main,
      borderRadius: theme.radius.md,
      ...theme.shadows.sm,
    },
    levelBadge: {
      width: config.levelBadgeSize,
      height: config.levelBadgeSize,
      borderRadius: config.levelBadgeSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: config.spacing,
    },
    levelText: {
      fontSize: config.levelTextSize,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.surface.main,
    },
    xpInfo: {
      flex: 1,
      marginRight: config.spacing,
    },
    levelTitle: {
      fontSize: config.titleSize,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    xpText: {
      fontSize: config.xpTextSize,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.primary.main,
      marginBottom: 2,
    },
    xpSubText: {
      fontSize: config.subTextSize,
      color: theme.colors.text.secondary,
    },
    progressContainer: {
      minWidth: 80,
      alignItems: 'flex-end',
    },
    progressBackground: {
      width: '100%',
      height: config.progressHeight,
      backgroundColor: theme.colors.neutral[200],
      borderRadius: config.progressHeight / 2,
      overflow: 'hidden',
      marginBottom: 4,
    },
    progressBar: {
      height: '100%',
      borderRadius: config.progressHeight / 2,
    },
    progressText: {
      fontSize: config.subTextSize,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text.secondary,
    },
  });
};
