import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../theme';

// Memoized Button Component
interface MemoizedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export const MemoizedButton = memo<MemoizedButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const buttonStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 24 : 16,
      paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.neutral400 : theme.colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.neutral200 : theme.colors.neutral100,
          borderWidth: 1,
          borderColor: theme.colors.neutral300,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.colors.neutral300 : theme.colors.primary,
        };
      default:
        return baseStyle;
    }
  }, [variant, size, disabled]);

  const textStyle = useMemo((): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      fontFamily: theme.fonts.jakarta.medium,
      marginLeft: icon ? 8 : 0,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: disabled ? theme.colors.neutral600 : theme.colors.white,
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: disabled ? theme.colors.neutral500 : theme.colors.textPrimary,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: disabled ? theme.colors.neutral500 : theme.colors.primary,
        };
      default:
        return baseStyle;
    }
  }, [variant, size, disabled, icon]);

  const iconColor = useMemo(() => {
    switch (variant) {
      case 'primary':
        return disabled ? theme.colors.neutral600 : theme.colors.white;
      case 'secondary':
        return disabled ? theme.colors.neutral500 : theme.colors.textPrimary;
      case 'outline':
        return disabled ? theme.colors.neutral500 : theme.colors.primary;
      default:
        return theme.colors.textPrimary;
    }
  }, [variant, disabled]);

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          color={iconColor}
        />
      )}
      <Text style={textStyle}>{loading ? 'Loading...' : title}</Text>
    </TouchableOpacity>
  );
});

// Memoized Card Component
interface MemoizedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  onPress?: () => void;
}

export const MemoizedCard = memo<MemoizedCardProps>(({
  children,
  variant = 'default',
  padding = 'md',
  style,
  onPress,
}) => {
  const cardStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
    };

    const paddingValue = {
      none: 0,
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg,
    }[padding];

    const variantStyle: ViewStyle = (() => {
      switch (variant) {
        case 'elevated':
          return {
            ...theme.shadows.md,
          };
        case 'outlined':
          return {
            borderWidth: 1,
            borderColor: theme.colors.neutral200,
          };
        default:
          return {};
      }
    })();

    return {
      ...baseStyle,
      ...variantStyle,
      padding: paddingValue,
    };
  }, [variant, padding]);

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[cardStyle, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </CardWrapper>
  );
});

// Memoized List Item Component
interface MemoizedListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
}

export const MemoizedListItem = memo<MemoizedListItemProps>(({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  style,
}) => {
  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral100,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={24}
          color={theme.colors.textSecondary}
          style={{ marginRight: theme.spacing.md }}
        />
      )}
      
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: theme.fonts.jakarta.medium,
            color: theme.colors.textPrimary,
            marginBottom: subtitle ? 4 : 0,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              fontFamily: theme.fonts.jakarta.regular,
              color: theme.colors.textSecondary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightIcon && (
        <Ionicons
          name={rightIcon}
          size={20}
          color={theme.colors.textSecondary}
          style={{ marginLeft: theme.spacing.sm }}
        />
      )}
    </TouchableOpacity>
  );
});

// Performance utilities
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

export function useStableMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
};
