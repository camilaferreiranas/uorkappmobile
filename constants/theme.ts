/**
 * Design tokens for the app, matching /design.md (Uork Design System & Visual Identity).
 * The colors are defined in light and dark mode.
 */

import { Platform } from 'react-native';

export const Colors = {
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
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

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
