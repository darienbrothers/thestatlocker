export const colors = {
  // Primary Brand Colors
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
  
  // Legacy aliases
  text: '#1F2937',
  border: '#E5E7EB',
};

export const fonts = {
  // Primary Font Family
  anton: 'Anton-Regular',
  
  // Secondary Font Family
  jakarta: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semiBold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-SemiBold', // Using semiBold as bold fallback
  },
  
  // Legacy aliases
  heading: 'Anton-Regular',
  body: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 16, // alias for base
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  
  // Legacy aliases
  s: 8,
  m: 16,
  l: 24,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
  
  // Legacy aliases
  s: 4,
  m: 8,
};

export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
};

// Typography system
export const typography = {
  h1: {
    size: 32,
    lineHeight: 40,
  },
  h2: {
    size: 24,
    lineHeight: 32,
  },
  h3: {
    size: 20,
    lineHeight: 28,
  },
  body: {
    size: 16,
    lineHeight: 24,
  },
};

// Legacy theme exports for compatibility
export const tokens = {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  typography,
  radius: borderRadius, // alias
};

// Default theme object
export const theme = {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  typography,
};
