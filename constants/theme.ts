/**
 * Uork Design System — token layer.
 *
 * Hex values live ONLY in this file. Components and screens must reference
 * tokens by name so that colour keeps carrying meaning:
 *  - blue  → brand + primary action
 *  - green → success / completed
 *  - amber → warning / rating signal
 *  - red   → error / destructive
 *  - violet→ special / promotional (sparingly)
 */

import { Platform } from 'react-native';

/** Raw brand values — the single source of truth. */
const palette = {
  blue600: '#2563EB', // brand.primary — Azul Uork
  blue500: '#3B82F6',
  blue300: '#93C5FD', // muted brand (disabled primary)
  blue100: '#DBEAFE', // brand.tint — Azul Claro
  cyan500: '#06B6D4', // gradient end only

  ink: '#0F172A', // brand.dark — Azul Escuro / primary text
  slate600: '#475569', // text.secondary — Cinza Escuro
  slate400: '#94A3B8', // placeholder / disabled text
  slate200: '#E2E8F0', // borders / dividers
  slate100: '#F1F5F9', // surface.neutral — Cinza
  white: '#FFFFFF', // surface.white — Branco

  green600: '#16A34A', // status.success
  green700: '#15803D', // success text on tint
  green100: '#DCFCE7', // success surface

  amber500: '#F59E0B', // status.warning + rating
  amber700: '#B45309', // warning text on tint
  amber100: '#FEF3C7', // warning surface

  red500: '#EF4444', // status.error
  red700: '#B91C1C', // error text on tint
  red100: '#FEE2E2', // error surface

  violet500: '#8B5CF6', // accent.highlight — Destaque
  violet100: '#EDE9FE',
};

export const Colors = {
  // ---- Brand ----
  brandPrimary: palette.blue600,
  brandPrimaryHover: palette.blue500,
  brandPrimaryMuted: palette.blue300,
  brandDark: palette.ink,
  brandTint: palette.blue100,
  gradientStart: palette.blue600,
  gradientEnd: palette.cyan500,

  // ---- Surfaces ----
  surfaceWhite: palette.white,
  surfaceNeutral: palette.slate100,
  border: palette.slate200,
  /** Translucent white for controls layered on top of a brand-coloured area. */
  overlayOnBrand: 'rgba(255, 255, 255, 0.2)',

  // ---- Text ----
  textPrimary: palette.ink,
  textSecondary: palette.slate600,
  textMuted: palette.slate400,
  textOnBrand: palette.white,
  textOnBrandMuted: 'rgba(255, 255, 255, 0.75)',

  // ---- Status (never decorative) ----
  success: palette.green600,
  successText: palette.green700,
  successSurface: palette.green100,
  warning: palette.amber500,
  warningText: palette.amber700,
  warningSurface: palette.amber100,
  error: palette.red500,
  errorText: palette.red700,
  errorSurface: palette.red100,

  // ---- Accent (special / promo, sparingly) ----
  accent: palette.violet500,
  accentSurface: palette.violet100,

  // ---- Rating signal (amber star — always paired with icon + number) ----
  rating: palette.amber500,
  ratingSurface: palette.amber100,

  // ---- Navigation chrome (Expo Router / react-navigation ThemeProvider) ----
  light: {
    text: palette.ink,
    background: palette.slate100,
    tint: palette.blue600,
    icon: palette.slate600,
    tabIconDefault: palette.slate400,
    tabIconSelected: palette.blue600,
  },
  dark: {
    text: palette.white,
    background: palette.ink,
    tint: palette.white,
    icon: palette.slate400,
    tabIconDefault: palette.slate400,
    tabIconSelected: palette.white,
  },
};

/** Spacing rhythm — 16px gutters, 24–32px between sections, 12–16px within. */
export const Spacing = {
  gutter: 16,
  section: 28,
  sectionTight: 24,
  element: 12,
  elementLoose: 16,
};

/** Corner radii. */
export const Radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

/** Soft elevation used sparingly — cards that must lift, the floating tab bar. */
export const Shadow = {
  card: {
    boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.06)',
    elevation: 3,
  },
  floating: {
    boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.12)',
    elevation: 10,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
