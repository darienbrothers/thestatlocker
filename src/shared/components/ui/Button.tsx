import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { tokens, COLORS, TYPOGRAPHY_TOKENS, SHADOW_TOKENS, createShadow } from '@shared/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;

  const renderContent = () => (
    <>
      {leftIcon && !loading && (
        <Ionicons 
          name={leftIcon} 
          size={iconSize} 
          color={textStyles.reduce((acc, style) => style?.color || acc, COLORS.text)} 
          style={styles.leftIcon}
        />
      )}
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={textStyles.reduce((acc, style) => style?.color || acc, COLORS.text)}
          style={styles.leftIcon}
        />
      )}
      <Text style={textStyles}>{children}</Text>
      {rightIcon && !loading && (
        <Ionicons 
          name={rightIcon} 
          size={iconSize} 
          color={textStyles.reduce((acc, style) => style?.color || acc, COLORS.text)}
          style={styles.rightIcon}
        />
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[styles.base, styles[`size_${size}`], fullWidth && styles.fullWidth, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? [COLORS.interactiveDisabled, COLORS.interactiveDisabled] : [COLORS.primary, COLORS.primaryDark]}
          style={[styles.gradient, styles[`size_${size}`]]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...createShadow('xs'),
  },
  
  fullWidth: {
    width: '100%',
  },
  
  disabled: {
    opacity: 0.6,
  },
  
  // Sizes
  size_sm: {
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.s,
    minHeight: 32,
  },
  
  size_md: {
    paddingHorizontal: tokens.spacing.l,
    paddingVertical: tokens.spacing.m,
    minHeight: 44,
  },
  
  size_lg: {
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.l,
    minHeight: 52,
  },
  
  // Variants
  variant_primary: {
    // Handled by LinearGradient
  },
  
  variant_secondary: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  
  variant_danger: {
    backgroundColor: COLORS.error,
  },
  
  // Text styles
  text: {
    textAlign: 'center',
    fontWeight: '500',
  },
  
  text_sm: {
    ...TYPOGRAPHY_TOKENS.buttonSmall,
  },
  
  text_md: {
    ...TYPOGRAPHY_TOKENS.buttonDefault,
  },
  
  text_lg: {
    ...TYPOGRAPHY_TOKENS.buttonLarge,
  },
  
  text_primary: {
    color: COLORS.textOnPrimary,
  },
  
  text_secondary: {
    color: COLORS.text,
  },
  
  text_outline: {
    color: COLORS.primary,
  },
  
  text_ghost: {
    color: COLORS.primary,
  },
  
  text_danger: {
    color: COLORS.textOnPrimary,
  },
  
  textDisabled: {
    color: COLORS.textTertiary,
  },
  
  // Gradient for primary button
  gradient: {
    borderRadius: tokens.radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  
  // Icon spacing
  leftIcon: {
    marginRight: tokens.spacing.s,
  },
  
  rightIcon: {
    marginLeft: tokens.spacing.s,
  },
});

export default Button;
