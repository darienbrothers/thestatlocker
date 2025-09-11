import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

// Animated Pressable with scale and haptic feedback
interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
  scaleValue?: number;
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
}

export const AnimatedPressable = memo<AnimatedPressableProps>(
  ({
    children,
    onPress,
    style,
    disabled = false,
    hapticFeedback = true,
    scaleValue = 0.95,
    springConfig = { damping: 15, stiffness: 300 },
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const gestureHandler =
      useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
        onStart: () => {
          if (!disabled) {
            scale.value = withSpring(scaleValue, springConfig);
            if (hapticFeedback) {
              runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        },
        onEnd: () => {
          scale.value = withSpring(1, springConfig);
          if (!disabled) {
            runOnJS(onPress)();
          }
        },
        onFail: () => {
          scale.value = withSpring(1, springConfig);
        },
      });

    React.useEffect(() => {
      opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 200 });
    }, [disabled, opacity]);

    return (
      <TapGestureHandler onGestureEvent={gestureHandler} enabled={!disabled}>
        <Animated.View style={StyleSheet.flatten([style, animatedStyle])}>
          {children}
        </Animated.View>
      </TapGestureHandler>
    );
  },
);

// Animated Floating Action Button
interface AnimatedFABProps {
  onPress: () => void;
  icon: React.ReactNode;
  style?: ViewStyle;
  size?: number;
  backgroundColor?: string;
}

export const AnimatedFAB = memo<AnimatedFABProps>(
  ({
    onPress,
    icon,
    style,
    size = 56,
    backgroundColor = theme.colors.primary,
  }) => {
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    }));

    const handlePress = () => {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 300 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      });

      rotate.value = withSpring(rotate.value + 180, {
        damping: 20,
        stiffness: 200,
      });

      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    };

    return (
      <AnimatedPressable
        onPress={handlePress}
        style={StyleSheet.flatten([
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.lg,
          },
          style,
        ])}
        scaleValue={0.9}
      >
        <Animated.View style={animatedStyle}>{icon}</Animated.View>
      </AnimatedPressable>
    );
  },
);

// Animated Progress Bar
interface AnimatedProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const AnimatedProgressBar = memo<AnimatedProgressBarProps>(
  ({
    progress,
    height = 8,
    backgroundColor = theme.colors.neutral200,
    progressColor = theme.colors.primary,
    borderRadius = height / 2,
    style,
    animated = true,
  }) => {
    const animatedProgress = useSharedValue(0);

    React.useEffect(() => {
      if (animated) {
        animatedProgress.value = withSpring(progress, {
          damping: 15,
          stiffness: 100,
        });
      } else {
        animatedProgress.value = progress;
      }
    }, [progress, animated, animatedProgress]);

    const progressStyle = useAnimatedStyle(() => ({
      width: `${Math.max(0, Math.min(100, animatedProgress.value * 100))}%`,
    }));

    return (
      <Animated.View
        style={StyleSheet.flatten([
          {
            height,
            backgroundColor,
            borderRadius,
            overflow: 'hidden',
          },
          style,
        ])}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: progressColor,
              borderRadius,
            },
            progressStyle,
          ]}
        />
      </Animated.View>
    );
  },
);

// Animated Badge with bounce effect
interface AnimatedBadgeProps {
  count: number;
  maxCount?: number;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

export const AnimatedBadge = memo<AnimatedBadgeProps>(
  ({
    count,
    maxCount = 99,
    size = 20,
    backgroundColor = theme.colors.error,
    textColor = theme.colors.white,
    style,
  }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
      if (count > 0) {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        opacity.value = withTiming(1, { duration: 200 });
      } else {
        scale.value = withSpring(0, { damping: 15, stiffness: 300 });
        opacity.value = withTiming(0, { duration: 200 });
      }
    }, [count, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

    if (count <= 0) {
      return null;
    }

    return (
      <Animated.View
        style={StyleSheet.flatten([
          {
            minWidth: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
          },
          style,
          animatedStyle,
        ])}
      >
        <Animated.Text
          style={{
            color: textColor,
            fontSize: size * 0.6,
            fontFamily: theme.fonts.jakarta.medium,
            textAlign: 'center',
          }}
        >
          {displayCount}
        </Animated.Text>
      </Animated.View>
    );
  },
);

// Animated Card with entrance animation
interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export const AnimatedCard = memo<AnimatedCardProps>(
  ({ children, delay = 0, style, onPress }) => {
    const translateY = useSharedValue(50);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        opacity.value = withTiming(1, { duration: 400 });
      }, delay);

      return () => clearTimeout(timer);
    }, [delay, translateY, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }));

    const CardWrapper = onPress ? AnimatedPressable : Animated.View;

    return (
      <CardWrapper
        style={StyleSheet.flatten([
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            ...theme.shadows.sm,
          },
          animatedStyle,
          style,
        ])}
        onPress={onPress || (() => {})}
      >
        {children}
      </CardWrapper>
    );
  },
);

// Animated Loading Dots
interface AnimatedLoadingDotsProps {
  size?: number;
  color?: string;
  count?: number;
}

export const AnimatedLoadingDots = memo<AnimatedLoadingDotsProps>(
  ({ size = 8, color = theme.colors.primary, count = 3 }) => {
    const dots = Array.from({ length: count }, (_, index) => {
      const scale = useSharedValue(1);

      React.useEffect(() => {
        const animate = () => {
          scale.value = withTiming(1.5, { duration: 400 }, () => {
            scale.value = withTiming(1, { duration: 400 }, () => {
              setTimeout(animate, index * 200);
            });
          });
        };

        setTimeout(animate, index * 200);
      }, [scale, index]);

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
      }));

      return (
        <Animated.View
          key={index}
          style={StyleSheet.flatten([
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              marginHorizontal: 2,
            },
            animatedStyle,
          ])}
        />
      );
    });

    return (
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {dots}
      </Animated.View>
    );
  },
);
