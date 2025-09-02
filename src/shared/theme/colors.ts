// Base color palette
export const BASE_COLORS = {
  // Primary brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Neutral grays
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Info colors
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main info
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

// Semantic color tokens
export const COLOR_TOKENS = {
  // Primary brand
  primary: BASE_COLORS.primary[500],
  primaryLight: BASE_COLORS.primary[100],
  primaryDark: BASE_COLORS.primary[700],
  
  // Background colors
  background: BASE_COLORS.neutral[0],
  backgroundSecondary: BASE_COLORS.neutral[50],
  backgroundTertiary: BASE_COLORS.neutral[100],
  
  // Surface colors
  surface: BASE_COLORS.neutral[0],
  surfaceElevated: BASE_COLORS.neutral[50],
  surfacePressed: BASE_COLORS.neutral[100],
  
  // Text colors
  text: BASE_COLORS.neutral[900],
  textSecondary: BASE_COLORS.neutral[600],
  textTertiary: BASE_COLORS.neutral[400],
  textInverse: BASE_COLORS.neutral[0],
  textOnPrimary: BASE_COLORS.neutral[0],
  
  // Border colors
  border: BASE_COLORS.neutral[200],
  borderSecondary: BASE_COLORS.neutral[100],
  borderFocus: BASE_COLORS.primary[500],
  
  // State colors
  success: BASE_COLORS.success[500],
  successLight: BASE_COLORS.success[100],
  successDark: BASE_COLORS.success[700],
  
  warning: BASE_COLORS.warning[500],
  warningLight: BASE_COLORS.warning[100],
  warningDark: BASE_COLORS.warning[700],
  
  error: BASE_COLORS.error[500],
  errorLight: BASE_COLORS.error[100],
  errorDark: BASE_COLORS.error[700],
  
  info: BASE_COLORS.info[500],
  infoLight: BASE_COLORS.info[100],
  infoDark: BASE_COLORS.info[700],
  
  // Interactive states
  interactive: BASE_COLORS.primary[500],
  interactiveHover: BASE_COLORS.primary[600],
  interactivePressed: BASE_COLORS.primary[700],
  interactiveDisabled: BASE_COLORS.neutral[300],
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
  overlayHeavy: 'rgba(0, 0, 0, 0.75)',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowHeavy: 'rgba(0, 0, 0, 0.25)',
} as const;

// Dark theme colors (for future use)
export const DARK_COLOR_TOKENS = {
  // Primary brand (same as light)
  primary: BASE_COLORS.primary[400],
  primaryLight: BASE_COLORS.primary[300],
  primaryDark: BASE_COLORS.primary[600],
  
  // Background colors
  background: BASE_COLORS.neutral[950],
  backgroundSecondary: BASE_COLORS.neutral[900],
  backgroundTertiary: BASE_COLORS.neutral[800],
  
  // Surface colors
  surface: BASE_COLORS.neutral[900],
  surfaceElevated: BASE_COLORS.neutral[800],
  surfacePressed: BASE_COLORS.neutral[700],
  
  // Text colors
  text: BASE_COLORS.neutral[50],
  textSecondary: BASE_COLORS.neutral[300],
  textTertiary: BASE_COLORS.neutral[500],
  textInverse: BASE_COLORS.neutral[900],
  textOnPrimary: BASE_COLORS.neutral[900],
  
  // Border colors
  border: BASE_COLORS.neutral[700],
  borderSecondary: BASE_COLORS.neutral[800],
  borderFocus: BASE_COLORS.primary[400],
  
  // State colors (adjusted for dark theme)
  success: BASE_COLORS.success[400],
  successLight: BASE_COLORS.success[900],
  successDark: BASE_COLORS.success[300],
  
  warning: BASE_COLORS.warning[400],
  warningLight: BASE_COLORS.warning[900],
  warningDark: BASE_COLORS.warning[300],
  
  error: BASE_COLORS.error[400],
  errorLight: BASE_COLORS.error[900],
  errorDark: BASE_COLORS.error[300],
  
  info: BASE_COLORS.info[400],
  infoLight: BASE_COLORS.info[900],
  infoDark: BASE_COLORS.info[300],
  
  // Interactive states
  interactive: BASE_COLORS.primary[400],
  interactiveHover: BASE_COLORS.primary[300],
  interactivePressed: BASE_COLORS.primary[500],
  interactiveDisabled: BASE_COLORS.neutral[600],
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayHeavy: 'rgba(0, 0, 0, 0.9)',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowHeavy: 'rgba(0, 0, 0, 0.6)',
} as const;
