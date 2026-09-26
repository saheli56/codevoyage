import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Moon, Sun } from 'phosphor-react-native';
import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useAppTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.btn, 
        { 
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          borderColor: colors.divider 
        }
      ]} 
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      {isDark ? (
        <Sun size={14} color={colors.textSecondary} weight="bold" />
      ) : (
        <Moon size={14} color={colors.textSecondary} weight="bold" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
