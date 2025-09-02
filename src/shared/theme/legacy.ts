// Legacy theme consolidation - preserves all existing values from both systems
// This file ensures no visual regressions during migration

// Colors from legacy constants/theme.ts (Indigo-based)
export const LEGACY_COLORS = {
  // Primary Brand Colors (from constants/theme.ts)
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#E0E7FF',
  
  // Base Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Neutral Palette
  neutral50: '#F9FAFB',
  neutral100: '#F3F4F6',
  neutral200: '#E5E7EB',
  neutral300: '#D1D5DB',
  neutral400: '#9CA3AF',
  neutral500: '#6B7280',
  neutral600: '#4B5563',
  neutral700: '#374151',
  neutral800: '#1F2937',
  neutral900: '#111827',
  
  // Background Colors
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
};

// Fonts from legacy constants/theme.ts
export const LEGACY_FONTS = {
  // Primary Font Family
  anton: 'Anton-Regular',
  
  // Secondary Font Family
  jakarta: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semiBold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-SemiBold', // Using semiBold as bold fallback
  },
};

// Font sizes from legacy constants/theme.ts
export const LEGACY_FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};

// Spacing from legacy constants/theme.ts (8pt system)
export const LEGACY_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border radius from legacy constants/theme.ts
export const LEGACY_BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows from legacy constants/theme.ts
export const LEGACY_SHADOWS = {
  sm: {
    shadowColor: LEGACY_COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: LEGACY_COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: LEGACY_COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
};

// Legacy aliases (from constants/theme.ts)
export const LEGACY_COLOR_ALIASES = {
  primary: LEGACY_COLORS.primary,
  primaryDark: LEGACY_COLORS.primaryDark,
  primaryLight: LEGACY_COLORS.primaryLight,
  secondary: LEGACY_COLORS.warning,
  success: LEGACY_COLORS.success,
  error: LEGACY_COLORS.error,
  warning: LEGACY_COLORS.warning,
  background: LEGACY_COLORS.background,
  backgroundMuted: LEGACY_COLORS.backgroundSecondary,
  text: LEGACY_COLORS.textPrimary,
  textSecondary: LEGACY_COLORS.textSecondary,
  border: LEGACY_COLORS.neutral200,
};

export const LEGACY_FONT_ALIASES = {
  heading: LEGACY_FONTS.anton,
  body: LEGACY_FONTS.jakarta.regular,
  medium: LEGACY_FONTS.jakarta.medium,
};

// Complete legacy theme object (exact match to constants/theme.ts)
export const legacyTheme = {
  colors: LEGACY_COLORS,
  fonts: LEGACY_FONTS,
  fontSizes: LEGACY_FONT_SIZES,
  spacing: LEGACY_SPACING,
  borderRadius: LEGACY_BORDER_RADIUS,
  shadows: LEGACY_SHADOWS,
  COLORS: LEGACY_COLOR_ALIASES,
  FONTS: LEGACY_FONT_ALIASES,
};
