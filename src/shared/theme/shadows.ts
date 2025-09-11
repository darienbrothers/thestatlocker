import { Platform } from 'react-native';
import { COLOR_TOKENS } from './colors';

// Shadow elevation levels
export const SHADOW_LEVELS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  xs: {
    shadowColor: COLOR_TOKENS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },

  sm: {
    shadowColor: COLOR_TOKENS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  md: {
    shadowColor: COLOR_TOKENS.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  lg: {
    shadowColor: COLOR_TOKENS.shadowMedium,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },

  xl: {
    shadowColor: COLOR_TOKENS.shadowHeavy,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },

  '2xl': {
    shadowColor: COLOR_TOKENS.shadowHeavy,
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 16,
  },
} as const;

// Semantic shadow tokens
export const SHADOW_TOKENS = {
  // Component shadows
  card: SHADOW_LEVELS.sm,
  cardElevated: SHADOW_LEVELS.md,
  cardFloating: SHADOW_LEVELS.lg,

  // Interactive shadows
  button: SHADOW_LEVELS.xs,
  buttonPressed: SHADOW_LEVELS.none,
  buttonFloating: SHADOW_LEVELS.md,

  // Modal and overlay shadows
  modal: SHADOW_LEVELS.xl,
  popover: SHADOW_LEVELS.lg,
  tooltip: SHADOW_LEVELS.md,

  // Navigation shadows
  header: SHADOW_LEVELS.xs,
  tabBar: SHADOW_LEVELS.sm,

  // Input shadows
  input: SHADOW_LEVELS.none,
  inputFocused: SHADOW_LEVELS.xs,

  // Special effects
  glow: {
    shadowColor: COLOR_TOKENS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 0,
  },
} as const;

// Platform-specific shadow utilities
export const createShadow = (level: keyof typeof SHADOW_LEVELS) => {
  const shadow = SHADOW_LEVELS[level];

  if (Platform.OS === 'android') {
    return {
      elevation: shadow.elevation,
    };
  }

  return {
    shadowColor: shadow.shadowColor,
    shadowOffset: shadow.shadowOffset,
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
  };
};
