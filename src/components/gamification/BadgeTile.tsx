import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@shared/theme';
import { Badge, ANIMATION_DURATIONS } from '../../utils/gamification';

interface BadgeTileProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showUnlockAnimation?: boolean;
  onPress?: () => void;
}

export default function BadgeTile({ 
  badge, 
  size = 'medium', 
  showUnlockAnimation = false,
  onPress 
}: BadgeTileProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(badge.isUnlocked ? 1 : 0.4)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showUnlockAnimation && badge.isUnlocked) {
      // Badge unlock animation sequence
      Animated.sequence([
        // Scale up
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: ANIMATION_DURATIONS.BADGE_UNLOCK / 3,
          useNativeDriver: true,
        }),
        // Scale back with opacity
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: ANIMATION_DURATIONS.BADGE_UNLOCK / 3,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: ANIMATION_DURATIONS.BADGE_UNLOCK / 2,
            useNativeDriver: true,
          }),
        ]),
        // Glow effect
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.BADGE_UNLOCK / 3,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset glow
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [showUnlockAnimation, badge.isUnlocked]);

  const sizeConfig = {
    small: { container: 48, icon: fontSizes.lg, text: fontSizes.xs },
    medium: { container: 64, icon: fontSizes.xl, text: fontSizes.sm },
    large: { container: 80, icon: fontSizes['2xl'], text: fontSizes.base },
  };

  const config = sizeConfig[size];

  const BadgeContent = () => (
    <Animated.View
      style={[
        styles.container,
        {
          width: config.container,
          height: config.container,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {badge.isUnlocked ? (
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.unlockedBackground}
        >
          <Text style={[styles.icon, { fontSize: config.icon }]}>
            {badge.icon}
          </Text>
        </LinearGradient>
      ) : (
        <View style={styles.lockedBackground}>
          <Text style={[styles.lockedIcon, { fontSize: config.icon }]}>
            🔒
          </Text>
        </View>
      )}
      
      {/* Glow effect for unlock animation */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: glowAnim,
            transform: [
              {
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.3],
                }),
              },
            ],
          },
        ]}
      />
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <BadgeContent />
        {size !== 'small' && (
          <Text style={[styles.badgeName, { fontSize: config.text }]}>
            {badge.name}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.touchable}>
      <BadgeContent />
      {size !== 'small' && (
        <Text style={[styles.badgeName, { fontSize: config.text }]}>
          {badge.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    alignItems: 'center',
  },
  container: {
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: colors.neutral900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unlockedBackground: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral300,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral400,
    borderStyle: 'dashed',
  },
  icon: {
    textAlign: 'center',
  },
  lockedIcon: {
    textAlign: 'center',
    opacity: 0.6,
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: '#FFD700',
    borderRadius: borderRadius.lg + 4,
    zIndex: -1,
  },
  badgeName: {
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 80,
  },
});
