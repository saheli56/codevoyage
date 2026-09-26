import { Platform } from 'react-native';

export const Palette = {
  brand: {
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#1D4ED8',
    primaryMuted: '#1E3A5F',
    primaryMutedDark: '#0D1E3A',
    primaryGlow: 'rgba(59,130,246,0.25)',
    primaryGlowStrong: 'rgba(59,130,246,0.45)',
  },
  risk: {
    safe: '#22D3EE',
    safeLight: '#083344',
    safeDark: '#06B6D4',
    safeBorder: '#0E7490',
    safeGlow: 'rgba(34,211,238,0.2)',

    suspicious: '#FBBF24',
    suspiciousLight: '#3D2A04',
    suspiciousDark: '#F59E0B',
    suspiciousBorder: '#92400E',
    suspiciousGlow: 'rgba(251,191,36,0.2)',

    dangerous: '#F87171',
    dangerousLight: '#3D0A0A',
    dangerousDark: '#EF4444',
    dangerousBorder: '#991B1B',
    dangerousGlow: 'rgba(248,113,113,0.25)',
  },
  neutral: {
    slate50: '#F8FAFC',
    slate100: '#F1F5F9',
    slate200: '#E2E8F0',
    slate300: '#CBD5E1',
    slate400: '#94A3B8',
    slate500: '#64748B',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1E293B',
    slate900: '#0F172A',
    slate950: '#020617',
  },
  // Premium dark surface palette
  surface: {
    base: '#050911',
    elevated: '#0D1117',
    card: '#111827',
    cardBorder: 'rgba(255,255,255,0.07)',
    cardBorderHover: 'rgba(59,130,246,0.35)',
    glassOverlay: 'rgba(255,255,255,0.03)',
    overlay: 'rgba(0,0,0,0.6)',
    inputBg: '#0A0F1A',
    inputBorder: 'rgba(255,255,255,0.1)',
    inputFocusBorder: 'rgba(59,130,246,0.6)',
    divider: 'rgba(255,255,255,0.06)',
  },
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    muted: '#475569',
    accent: '#60A5FA',
    inverse: '#050911',
  },
} as const;

export const Colors = {
  light: {
    text: Palette.text.primary,
    textSecondary: Palette.text.secondary,
    textMuted: Palette.text.muted,
    background: Palette.surface.base,
    backgroundCard: Palette.surface.card,
    backgroundElement: Palette.surface.elevated,
    backgroundSelected: Palette.surface.glassOverlay,
    border: Palette.surface.cardBorder,
    borderMuted: Palette.surface.divider,
    primary: Palette.brand.primary,
    primarySurface: Palette.brand.primaryMuted,
    tint: Palette.brand.primary,
    icon: Palette.text.secondary,
    tabIconDefault: Palette.neutral.slate600,
    tabIconSelected: Palette.brand.primary,
  },
  dark: {
    text: Palette.text.primary,
    textSecondary: Palette.text.secondary,
    textMuted: Palette.text.muted,
    background: Palette.surface.base,
    backgroundCard: Palette.surface.card,
    backgroundElement: Palette.surface.elevated,
    backgroundSelected: Palette.surface.glassOverlay,
    border: Palette.surface.cardBorder,
    borderMuted: Palette.surface.divider,
    primary: Palette.brand.primaryLight,
    primarySurface: Palette.brand.primaryMutedDark,
    tint: Palette.brand.primaryLight,
    icon: Palette.text.secondary,
    tabIconDefault: Palette.neutral.slate600,
    tabIconSelected: Palette.brand.primaryLight,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
