import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme, ThemeTokens } from '@/constants/theme';

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeTokens;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: DarkTheme,
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const stored = await AsyncStorage.getItem('@scamshield_theme_v2');
        if (stored) {
          setIsDark(stored === 'dark');
        } else {
          setIsDark(systemColorScheme === 'dark');
        }
      } catch {
        // Fallback to dark
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
      await AsyncStorage.setItem('@scamshield_theme_v2', newTheme ? 'dark' : 'light');
    } catch {}
  };

  const colors = isDark ? DarkTheme : LightTheme;

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
