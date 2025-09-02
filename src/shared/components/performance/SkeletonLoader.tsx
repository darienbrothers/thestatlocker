import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.sm,
  style,
  variant = 'rectangular',
}) => {
  const shimmerTranslate = useSharedValue(-1);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, [shimmerTranslate]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerTranslate.value,
      [-1, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'circular':
        return {
          width: height,
          height: height,
          borderRadius: height / 2,
        };
      case 'text':
        return {
          width: typeof width === 'number' ? width : parseInt(width as string) || 100,
          height: (typeof height === 'number' ? height : parseInt(height as string) || 20) * 0.7,
          borderRadius: theme.borderRadius.sm,
        };
      default:
        return {
          width: typeof width === 'number' ? width : parseInt(width as string) || 100,
          height: typeof height === 'number' ? height : parseInt(height as string) || 20,
          borderRadius,
        };
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.neutral100,
          overflow: 'hidden',
        },
        getVariantStyle(),
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            position: 'absolute',
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            theme.colors.neutral50,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: 200,
            height: '100%',
          }}
        />
      </Animated.View>
    </View>
  );
};

interface SkeletonGroupProps {
  children: React.ReactNode;
  loading: boolean;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  children,
  loading,
}) => {
  if (loading) {
    return <>{children}</>;
  }
  return null;
};

// Pre-built skeleton patterns
export const ProfileSkeleton: React.FC = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md }}>
    <SkeletonLoader variant="circular" height={48} style={{ marginRight: theme.spacing.md }} />
    <View style={{ flex: 1 }}>
      <SkeletonLoader height={16} width="60%" style={{ marginBottom: theme.spacing.xs }} />
      <SkeletonLoader height={12} width="40%" />
    </View>
  </View>
);

export const CardSkeleton: React.FC = () => (
  <View style={{ padding: theme.spacing.md, marginBottom: theme.spacing.md }}>
    <SkeletonLoader height={120} style={{ marginBottom: theme.spacing.md }} />
    <SkeletonLoader height={16} width="80%" style={{ marginBottom: theme.spacing.xs }} />
    <SkeletonLoader height={12} width="60%" />
  </View>
);

export const ListItemSkeleton: React.FC = () => (
  <View style={{ 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral100
  }}>
    <SkeletonLoader variant="circular" height={32} style={{ marginRight: theme.spacing.md }} />
    <View style={{ flex: 1 }}>
      <SkeletonLoader height={14} width="70%" style={{ marginBottom: theme.spacing.xs }} />
      <SkeletonLoader height={10} width="50%" />
    </View>
    <SkeletonLoader height={12} width={40} />
  </View>
);
