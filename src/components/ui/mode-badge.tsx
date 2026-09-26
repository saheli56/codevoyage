import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Palette, Radius } from '@/constants/theme';
import { useAppMode } from '@/context/AppModeContext';

export function ModeBadge() {
  const { isDemoMode, toggleDemoMode } = useAppMode();

  return (
    <TouchableOpacity 
      style={[styles.badge, isDemoMode ? styles.badgeDemo : styles.badgeLive]} 
      onPress={toggleDemoMode}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isDemoMode ? styles.textDemo : styles.textLive]}>
        {isDemoMode ? 'DEMO MODE' : 'LIVE MODE'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeDemo: {
    backgroundColor: Palette.brand.primaryMuted,
    borderColor: Palette.brand.primary,
  },
  badgeLive: {
    backgroundColor: Palette.risk.safeLight,
    borderColor: Palette.risk.safe,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  textDemo: {
    color: Palette.brand.primaryDark,
  },
  textLive: {
    color: Palette.risk.safeDark,
  },
});
