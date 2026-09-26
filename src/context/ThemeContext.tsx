import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LightColors = {
  base: '#F8FAFC',
  elevated: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: 'rgba(0,0,0,0.08)',
  cardBorderHover: 'rgba(59,130,246,0.3)',
  glassOverlay: 'rgba(255,255,255,0.7)',
  overlay: 'rgba(0,0,0,0.3)',
  inputBg: '#F1F5F9',
  inputBorder: 'rgba(0,0,0,0.1)',
  inputFocusBorder: 'rgba(59,130,246,0.6)',
  divider: 'rgba(0,0,0,0.08)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',
  tabBar: '#FFFFFF',
};

export const DarkColors = {
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
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  textInverse: '#050911',
  tabBar: '#0A0D14',
};

export type ThemeColors = typeof LightColors;

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: DarkColors,
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(true); // default to dark
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const stored = await AsyncStorage.getItem('@scamshield_theme');
        if (stored) {
          setIsDark(stored === 'dark');
        } else {
          setIsDark(systemColorScheme === 'dark');
        }
      } catch (e) {
        // Fallback
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('@scamshield_theme', newTheme ? 'dark' : 'light');
    } catch (e) {}
  };

  const colors = isDark ? DarkColors : LightColors;

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
