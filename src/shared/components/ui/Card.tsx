import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { tokens, COLORS, createShadow } from '@shared/theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const cardStyles = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`padding_${padding}`],
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.m,
    backgroundColor: COLORS.surface,
  },

  // Variants
  variant_default: {
    ...createShadow('sm'),
  },

  variant_elevated: {
    ...createShadow('md'),
  },

  variant_outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
    ...createShadow('none'),
  },

  variant_filled: {
    backgroundColor: COLORS.backgroundSecondary,
    ...createShadow('none'),
  },

  // Padding
  padding_none: {
    padding: 0,
  },

  padding_sm: {
    padding: tokens.spacing.s,
  },

  padding_md: {
    padding: tokens.spacing.m,
  },

  padding_lg: {
    padding: tokens.spacing.l,
  },
});

export default Card;
