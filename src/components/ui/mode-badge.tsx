import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Palette, Radius } from '@/constants/theme';
import { useAppMode } from '@/context/AppModeContext';
import { useAppTheme } from '@/context/ThemeContext';

export function ModeBadge() {
  const { isDemoMode, toggleDemoMode } = useAppMode();
  const { isDark, colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.badge,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
          borderColor: colors.cardBorder,
        },
      ]}
      onPress={toggleDemoMode}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.indicatorDot,
          {
            backgroundColor: isDemoMode ? Palette.brand.primary : Palette.risk.safe,
          },
        ]}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {isDemoMode ? 'Sandbox' : 'Live'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
