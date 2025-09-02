import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { tokens, COLORS, TYPOGRAPHY_TOKENS } from '@shared/theme';

export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  helperText,
  errorText,
  variant = 'outlined',
  size = 'md',
  state = 'default',
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const currentState = errorText ? 'error' : state;
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;

  const containerStyles = [
    styles.container,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    isFocused && styles.focused,
    styles[`state_${currentState}`],
  ];

  const inputStyles = [
    styles.input,
    styles[`input_${size}`],
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    inputStyle,
  ];

  return (
    <View style={containerStyles}>
      {label && (
        <Text style={[styles.label, styles[`label_${currentState}`]]}>
          {label}
        </Text>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={iconSize}
            color={isFocused ? COLORS.primary : COLORS.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={inputStyles}
          placeholderTextColor={COLORS.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
        
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={iconSize}
            color={isFocused ? COLORS.primary : COLORS.textSecondary}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>
      
      {(helperText || errorText) && (
        <Text style={[styles.helperText, errorText && styles.errorText]}>
          {errorText || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing.s,
  },
  
  label: {
    ...TYPOGRAPHY_TOKENS.label,
    color: COLORS.text,
    marginBottom: tokens.spacing.s,
  },
  
  label_error: {
    color: COLORS.error,
  },
  
  label_success: {
    color: COLORS.success,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radius.s,
  },
  
  // Variants
  variant_default: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  variant_filled: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  
  variant_outlined: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Sizes
  size_sm: {
    paddingHorizontal: tokens.spacing.s,
    paddingVertical: tokens.spacing.s,
    minHeight: 32,
  },
  
  size_md: {
    paddingHorizontal: tokens.spacing.m,
    paddingVertical: tokens.spacing.m,
    minHeight: 44,
  },
  
  size_lg: {
    paddingHorizontal: tokens.spacing.l,
    paddingVertical: tokens.spacing.l,
    minHeight: 52,
  },
  
  // States
  focused: {
    borderColor: COLORS.primary,
  },
  
  state_error: {
    borderColor: COLORS.error,
  },
  
  state_success: {
    borderColor: COLORS.success,
  },
  
  // Input
  input: {
    flex: 1,
    color: COLORS.text,
    ...TYPOGRAPHY_TOKENS.bodyDefault,
  },
  
  input_sm: {
    ...TYPOGRAPHY_TOKENS.bodySmall,
  },
  
  input_md: {
    ...TYPOGRAPHY_TOKENS.bodyDefault,
  },
  
  input_lg: {
    ...TYPOGRAPHY_TOKENS.bodyLarge,
  },
  
  inputWithLeftIcon: {
    marginLeft: tokens.spacing.s,
  },
  
  inputWithRightIcon: {
    marginRight: tokens.spacing.s,
  },
  
  // Icons
  leftIcon: {
    marginLeft: tokens.spacing.xs,
  },
  
  rightIcon: {
    marginRight: tokens.spacing.xs,
  },
  
  // Helper text
  helperText: {
    ...TYPOGRAPHY_TOKENS.metadata,
    color: COLORS.textSecondary,
    marginTop: tokens.spacing.xs,
  },
  
  errorText: {
    color: COLORS.error,
  },
});

export default Input;
