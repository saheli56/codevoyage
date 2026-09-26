import '@/global.css';
import { Platform } from 'react-native';

export const Palette = {
  brand: {
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    primaryDark: '#1D4ED8',
    primaryMuted: '#EFF6FF',
    primaryMutedDark: '#1E293B',
  },
  risk: {
    safe: '#10B981',
    safeLight: '#ECFDF5',
    safeDark: '#064E3B',
    safeBorder: '#A7F3D0',
    
    suspicious: '#F59E0B',
    suspiciousLight: '#FFFBEB',
    suspiciousDark: '#78350F',
    suspiciousBorder: '#FDE68A',
    
    dangerous: '#EF4444',
    dangerousLight: '#FEF2F2',
    dangerousDark: '#7F1D1D',
    dangerousBorder: '#FECACA',
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
  }
} as const;

export const Colors = {
  light: {
    text: Palette.neutral.slate900,
    textSecondary: Palette.neutral.slate500,
    textMuted: Palette.neutral.slate400,
    background: Palette.neutral.slate50,
    backgroundCard: '#FFFFFF',
    backgroundElement: Palette.neutral.slate100,
    backgroundSelected: Palette.neutral.slate200,
    border: Palette.neutral.slate200,
    borderMuted: Palette.neutral.slate100,
    primary: Palette.brand.primary,
    primarySurface: Palette.brand.primaryMuted,
    tint: Palette.brand.primary,
    icon: Palette.neutral.slate600,
    tabIconDefault: Palette.neutral.slate400,
    tabIconSelected: Palette.brand.primary,
  },
  dark: {
    text: Palette.neutral.slate50,
    textSecondary: Palette.neutral.slate400,
    textMuted: Palette.neutral.slate500,
    background: Palette.neutral.slate950,
    backgroundCard: '#0F172A',
    backgroundElement: Palette.neutral.slate900,
    backgroundSelected: Palette.neutral.slate800,
    border: Palette.neutral.slate800,
    borderMuted: Palette.neutral.slate900,
    primary: Palette.brand.primaryLight,
    primarySurface: Palette.brand.primaryMutedDark,
    tint: Palette.brand.primaryLight,
    icon: Palette.neutral.slate300,
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
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
