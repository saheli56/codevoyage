import { Platform } from 'react-native';

/**
 * ScamShield Unified Design System Tokens
 * Minimal, mature, restrained luxury aesthetic.
 */

export const Palette = {
  // Brand: Deep Slate & Cobalt
  brand: {
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    primaryDark: '#1D4ED8',
    primaryMuted: 'rgba(37, 99, 235, 0.08)',
  },

  // Functional Semantic Status
  risk: {
    safe: '#059669',          // Emerald
    safeLight: '#ECFDF5',
    safeDark: '#047857',
    safeBorder: 'rgba(5, 150, 105, 0.25)',

    suspicious: '#D97706',    // Amber
    suspiciousLight: '#FFFBEB',
    suspiciousDark: '#B45309',
    suspiciousBorder: 'rgba(217, 119, 6, 0.25)',

    dangerous: '#DC2626',     // Crimson
    dangerousLight: '#FEF2F2',
    dangerousDark: '#B91C1C',
    dangerousBorder: 'rgba(220, 38, 38, 0.25)',
  },

  // Neutral Scales (Zinc/Slate)
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  }
} as const;

export const LightTheme = {
  isDark: false,
  base: '#FAFAFA',
  elevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  cardBorderHover: 'rgba(37, 99, 235, 0.3)',
  inputBg: '#F4F4F5',
  inputBorder: 'rgba(0, 0, 0, 0.08)',
  textPrimary: '#09090B',
  textSecondary: '#52525B',
  textMuted: '#71717A',
  divider: 'rgba(0, 0, 0, 0.06)',
  tabBar: '#FFFFFF',
  tabBarBorder: 'rgba(0, 0, 0, 0.06)',
};

export const DarkTheme = {
  isDark: true,
  base: '#09090B',
  elevated: '#121215',
  card: '#121215',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderHover: 'rgba(59, 130, 246, 0.4)',
  inputBg: '#18181B',
  inputBorder: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  divider: 'rgba(255, 255, 255, 0.06)',
  tabBar: '#09090B',
  tabBarBorder: 'rgba(255, 255, 255, 0.06)',
};

export type ThemeTokens = typeof LightTheme;

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
  ten: 40,
} as const;

export const Radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
