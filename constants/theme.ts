/**
<<<<<<< HEAD
 * Uork Design System — token layer.
 *
 * Hex values live ONLY in this file. Components and screens must reference
 * tokens by name so that colour keeps carrying meaning:
 *  - blue  → brand + primary action
 *  - green → success / completed
 *  - amber → warning / rating signal
 *  - red   → error / destructive
 *  - violet→ special / promotional (sparingly)
=======
 * Design tokens for the app, matching /design.md (Uork Design System & Visual Identity).
 * The colors are defined in light and dark mode.
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
 */

import { Platform } from 'react-native';

/** Raw brand values — the single source of truth. */
const palette = {
  olive: '#40511E', // Prestador — verde-oliva da paleta Uork
  oliveTint: '#EDF0E6',
  oliveMuted: '#A5AF91',

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
<<<<<<< HEAD
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
=======
  // Primary
  primary: '#2563EB',
  ink: '#0F172A',
  white: '#FFFFFF',
  black: '#111111',

  // Supporting
  primaryLight: '#DBEAFE',
  background: '#F1F5F9',
  textSecondary: '#475569',
  border: '#E2E8F0',

  // Semantic
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#EF4444',
  accent: '#8B5CF6',

  // Legacy aliases kept for existing call sites
  text: '#0F172A',
  textLight: 'rgba(255,255,255,0.92)',
  gray: '#94A3B8',
  lightGray: '#F1F5F9',

  light: {
    text: '#0F172A',
    background: '#FFFFFF',
    tint: '#2563EB',
    icon: '#475569',
    tabIconDefault: '#475569',
    tabIconSelected: '#2563EB',
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439
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

<<<<<<< HEAD
/** Professional identity; status colours retain their semantic meaning. */
export const ProfessionalColors = {
  ...Colors,
  brandPrimary: palette.olive,
  brandPrimaryHover: palette.olive,
  brandPrimaryMuted: palette.oliveMuted,
  brandDark: palette.olive,
  brandTint: palette.oliveTint,
  gradientStart: palette.olive,
  gradientEnd: palette.oliveMuted,
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
=======
// 4px-based spacing scale (design.md §5)
export const Spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space8: 32,
  space10: 40,
  space12: 48,
  space16: 64,
  space20: 80,
};

// Radius scale (design.md §6)
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

// Typography scale (design.md §4)
export const Typography = {
  display: { fontWeight: '700' as const, fontSize: 40, lineHeight: 44 },
  h1: { fontWeight: '700' as const, fontSize: 34, lineHeight: 39 },
  h2: { fontWeight: '600' as const, fontSize: 26, lineHeight: 31 },
  h3: { fontWeight: '600' as const, fontSize: 20, lineHeight: 26 },
  body: { fontWeight: '400' as const, fontSize: 16, lineHeight: 24 },
  small: { fontWeight: '400' as const, fontSize: 13, lineHeight: 18 },
  button: { fontWeight: '600' as const, fontSize: 15, lineHeight: 18 },
  price: { fontWeight: '700' as const, fontSize: 24, lineHeight: 29 },
};

/**
 * Maps a request/proposal status label (pt-BR) to its semantic color pair.
 * Keeps status color consistent across customer and provider screens (design.md §12/§14).
 */
export function getStatusColor(status: string): { color: string; background: string } {
  const normalized = status.trim().toLowerCase();

  const successStates = ['concluído', 'concluida', 'concluída', 'confirmado', 'pagamento confirmado', 'aceita', 'aceito', 'agendado'];
  const warningStates = ['aguardando resposta', 'pendente', 'em negociação', 'em análise', 'perfil incompleto', 'informação pendente'];
  const errorStates = ['cancelado', 'cancelada', 'recusada', 'recusado', 'falha', 'expirado', 'expirada'];

  if (successStates.some((s) => normalized.includes(s))) {
    return { color: Colors.success, background: '#EAF7ED' };
  }
  if (errorStates.some((s) => normalized.includes(s))) {
    return { color: Colors.error, background: '#FDECEA' };
  }
  if (warningStates.some((s) => normalized.includes(s))) {
    return { color: Colors.warning, background: '#FFF7EA' };
  }

  return { color: Colors.textSecondary, background: Colors.background };
}
>>>>>>> 163fc32673a0d58d3e23b1cd92b2bce7f375d439

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
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
