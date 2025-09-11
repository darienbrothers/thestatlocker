// Unified theme system - consolidates legacy and new design tokens
import { tokens } from './tokens';
import {
  TYPOGRAPHY_SCALE,
  TYPOGRAPHY_TOKENS,
  FONT_FAMILIES,
  FONT_WEIGHTS,
  LETTER_SPACING,
} from './typography';
import { COLOR_TOKENS, BASE_COLORS, DARK_COLOR_TOKENS } from './colors';
import { SHADOW_LEVELS, SHADOW_TOKENS, createShadow } from './shadows';
import {
  LEGACY_COLORS,
  LEGACY_FONTS,
  LEGACY_FONT_SIZES,
  LEGACY_SPACING,
  LEGACY_BORDER_RADIUS,
  LEGACY_SHADOWS,
  LEGACY_COLOR_ALIASES,
  LEGACY_FONT_ALIASES,
  legacyTheme,
} from './legacy';

// Primary exports - use legacy values to prevent visual regressions
export const colors = LEGACY_COLORS;
export const fonts = LEGACY_FONTS;
export const fontSizes = LEGACY_FONT_SIZES;
export const spacing = LEGACY_SPACING;
export const borderRadius = LEGACY_BORDER_RADIUS;
export const shadows = LEGACY_SHADOWS;

// Aliases for backward compatibility
export const COLORS = LEGACY_COLOR_ALIASES;
export const FONTS = LEGACY_FONT_ALIASES;

// New design system exports (for future migration)
export {
  // Core tokens
  tokens,

  // Typography system
  TYPOGRAPHY_SCALE,
  TYPOGRAPHY_TOKENS,
  FONT_FAMILIES,
  FONT_WEIGHTS,
  LETTER_SPACING,

  // Color system
  COLOR_TOKENS,
  BASE_COLORS,
  DARK_COLOR_TOKENS,

  // Shadow system
  SHADOW_LEVELS,
  SHADOW_TOKENS,
  createShadow,
};

// Legacy theme object (exact match to constants/theme.ts)
export const theme = {
  colors: LEGACY_COLORS,
  fonts: LEGACY_FONTS,
  fontSizes: LEGACY_FONT_SIZES,
  spacing: LEGACY_SPACING,
  borderRadius: LEGACY_BORDER_RADIUS,
  radius: LEGACY_BORDER_RADIUS,
  shadows: LEGACY_SHADOWS,
  typography: {
    caption: { fontSize: 12 },
    weights: { medium: '500', bold: '700' }
  },
  COLORS: LEGACY_COLOR_ALIASES,
  FONTS: LEGACY_FONT_ALIASES,
};

// Export legacy theme for explicit usage
export { legacyTheme };
