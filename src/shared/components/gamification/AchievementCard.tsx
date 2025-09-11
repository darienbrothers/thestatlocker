import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@shared/theme';
import type {
  Achievement,
  AchievementRarity,
} from '@shared/services/AchievementService';

interface AchievementCardProps {
  achievement: Achievement;
  progress?: number;
  maxProgress?: number;
  isUnlocked?: boolean;
  showUnlockAnimation?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  progress = 0,
  maxProgress = 1,
  isUnlocked = false,
  showUnlockAnimation = false,
  onPress,
  size = 'medium',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progressPercentage = Math.min((progress / maxProgress) * 100, 100);
  const styles = getStyles(size);

  useEffect(() => {
    if (showUnlockAnimation) {
      // Unlock animation sequence
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
        ]),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous glow for unlocked achievements
      if (isUnlocked) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 0.7,
              duration: 1500,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.3,
              duration: 1500,
              useNativeDriver: false,
            }),
          ]),
        ).start();
      }
    }

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: progressPercentage / 100,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [showUnlockAnimation, isUnlocked, progressPercentage]);

  const getRarityConfig = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'common':
        return {
          colors: [theme.colors.neutral[400], theme.colors.neutral[300]],
          borderColor: theme.colors.neutral[400],
          textColor: theme.colors.neutral[600],
        };
      case 'rare':
        return {
          colors: [theme.colors.info.main, theme.colors.info.light],
          borderColor: theme.colors.info.main,
          textColor: theme.colors.info.dark,
        };
      case 'epic':
        return {
          colors: [theme.colors.warning.main, theme.colors.warning.light],
          borderColor: theme.colors.warning.main,
          textColor: theme.colors.warning.dark,
        };
      case 'legendary':
        return {
          colors: [theme.colors.error.main, theme.colors.error.light],
          borderColor: theme.colors.error.main,
          textColor: theme.colors.error.dark,
        };
      default:
        return {
          colors: [theme.colors.neutral[400], theme.colors.neutral[300]],
          borderColor: theme.colors.neutral[400],
          textColor: theme.colors.neutral[600],
        };
    }
  };

  const rarityConfig = getRarityConfig(achievement.rarity);

  const getIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      trophy: 'trophy',
      medal: 'medal',
      crown: 'crown',
      fire: 'flame',
      flame: 'flame',
      star: 'star',
      target: 'radio-button-on',
      diamond: 'diamond',
      gem: 'diamond-outline',
      'trophy-star': 'trophy',
      share: 'share-social',
      'calendar-star': 'calendar',
    };
    return iconMap[iconName] || 'trophy';
  };

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            borderColor: isUnlocked
              ? rarityConfig.borderColor
              : theme.colors.neutral[300],
            shadowColor: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [
                theme.colors.neutral[400],
                rarityConfig.borderColor,
              ],
            }),
            shadowOpacity: glowAnim,
            elevation: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 8],
            }),
          },
          !isUnlocked && styles.lockedContainer,
        ]}
      >
        {/* Rarity Border Gradient */}
        {isUnlocked && (
          <LinearGradient
            colors={rarityConfig.colors}
            style={styles.rarityBorder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View
            style={[styles.iconContainer, !isUnlocked && styles.lockedIcon]}
          >
            <Ionicons
              name={getIconName(achievement.iconName)}
              size={styles.iconSize}
              color={
                isUnlocked
                  ? rarityConfig.borderColor
                  : theme.colors.neutral[400]
              }
            />
          </View>

          {/* Achievement Info */}
          <View style={styles.info}>
            <View style={styles.header}>
              <Text
                style={[styles.title, !isUnlocked && styles.lockedText]}
                numberOfLines={1}
              >
                {achievement.isSecret && !isUnlocked
                  ? '???'
                  : achievement.title}
              </Text>
              <View
                style={[
                  styles.rarityBadge,
                  { backgroundColor: rarityConfig.borderColor },
                ]}
              >
                <Text style={styles.rarityText}>
                  {achievement.rarity.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text
              style={[styles.description, !isUnlocked && styles.lockedText]}
              numberOfLines={2}
            >
              {achievement.isSecret && !isUnlocked
                ? 'Complete hidden requirements to unlock'
                : achievement.description}
            </Text>

            {/* Progress Bar */}
            {!isUnlocked && maxProgress > 1 && (
              <View style={styles.progressSection}>
                <View style={styles.progressBackground}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: rarityConfig.borderColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {progress}/{maxProgress}
                </Text>
              </View>
            )}

            {/* XP Reward */}
            <View style={styles.footer}>
              <View style={styles.xpReward}>
                <Ionicons
                  name="diamond-outline"
                  size={12}
                  color={theme.colors.primary.main}
                />
                <Text style={styles.xpText}>+{achievement.xpReward} XP</Text>
              </View>
              {isUnlocked && achievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Unlock Overlay */}
        {isUnlocked && (
          <View style={styles.unlockedOverlay}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={theme.colors.success.main}
            />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const getStyles = (size: 'small' | 'medium' | 'large') => {
  const sizeConfig = {
    small: {
      containerHeight: 80,
      iconSize: 24,
      titleSize: theme.typography.body2.fontSize,
      descriptionSize: theme.typography.caption.fontSize,
      padding: theme.spacing.xs,
      spacing: theme.spacing.xs,
    },
    medium: {
      containerHeight: 120,
      iconSize: 32,
      titleSize: theme.typography.body1.fontSize,
      descriptionSize: theme.typography.body2.fontSize,
      padding: theme.spacing.sm,
      spacing: theme.spacing.sm,
    },
    large: {
      containerHeight: 160,
      iconSize: 40,
      titleSize: theme.typography.h6.fontSize,
      descriptionSize: theme.typography.body1.fontSize,
      padding: theme.spacing.md,
      spacing: theme.spacing.md,
    },
  };

  const config = sizeConfig[size];

  return StyleSheet.create({
    container: {
      height: config.containerHeight,
      backgroundColor: theme.colors.surface.main,
      borderRadius: theme.radius.lg,
      borderWidth: 2,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    lockedContainer: {
      opacity: 0.7,
    },
    rarityBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      padding: config.padding,
      paddingTop: config.padding + 4, // Account for rarity border
    },
    iconContainer: {
      width: config.iconSize + config.spacing * 2,
      height: config.iconSize + config.spacing * 2,
      borderRadius: (config.iconSize + config.spacing * 2) / 2,
      backgroundColor: theme.colors.neutral[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: config.spacing,
    },
    lockedIcon: {
      backgroundColor: theme.colors.neutral[200],
    },
    iconSize: config.iconSize,
    info: {
      flex: 1,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    title: {
      flex: 1,
      fontSize: config.titleSize,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.primary,
      marginRight: config.spacing,
    },
    rarityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
    },
    rarityText: {
      fontSize: 10,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.surface.main,
    },
    description: {
      fontSize: config.descriptionSize,
      color: theme.colors.text.secondary,
      lineHeight: config.descriptionSize * 1.4,
      marginBottom: 8,
    },
    lockedText: {
      color: theme.colors.text.disabled,
    },
    progressSection: {
      marginBottom: 8,
    },
    progressBackground: {
      height: 4,
      backgroundColor: theme.colors.neutral[200],
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: 4,
    },
    progressBar: {
      height: '100%',
      borderRadius: 2,
    },
    progressText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'right',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    xpReward: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    xpText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.primary.main,
      marginLeft: 4,
    },
    unlockedDate: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
    },
    unlockedOverlay: {
      position: 'absolute',
      top: config.padding,
      right: config.padding,
      backgroundColor: theme.colors.surface.main,
      borderRadius: 12,
      padding: 2,
      ...theme.shadows.sm,
    },
  });
};
