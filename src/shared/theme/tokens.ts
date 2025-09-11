export const tokens = {
  spacing: {
    xs: 4, // 0.25rem
    s: 8, // 0.5rem
    m: 16, // 1rem
    l: 24, // 1.5rem
    xl: 32, // 2rem
    xxl: 48, // 3rem
  },
  radius: {
    xs: 4, // Small chips
    s: 8, // Buttons
    m: 12, // Cards
    l: 16, // Modals
  },
  typography: {
    display: { size: 32, weight: '700' as const, lineHeight: 40 },
    h1: { size: 24, weight: '600' as const, lineHeight: 32 },
    h2: { size: 20, weight: '600' as const, lineHeight: 28 },
    title: { size: 18, weight: '600' as const, lineHeight: 24 },
    body: { size: 16, weight: '400' as const, lineHeight: 24 },
    caption: { size: 14, weight: '400' as const, lineHeight: 20 },
  },
  colors: {
    // Extend existing COLORS with semantic tokens
    surface: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#F1F3F4',
    },
    interactive: {
      primary: '#007AFF',
      secondary: '#5856D6',
      success: '#34C759',
      warning: '#FF9500',
      danger: '#FF3B30',
    },
    text: {
      primary: '#000000',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
  },
} as const;

export type Tokens = typeof tokens;
export type SpacingToken = keyof typeof tokens.spacing;
export type RadiusToken = keyof typeof tokens.radius;
export type TypographyToken = keyof typeof tokens.typography;
