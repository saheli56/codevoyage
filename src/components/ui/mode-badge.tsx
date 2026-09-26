import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Palette, Radius } from '@/constants/theme';
import { useAppMode } from '@/context/AppModeContext';
import { useAppTheme } from '@/context/ThemeContext';

export function ModeBadge() {
  const { isDemoMode, toggleDemoMode } = useAppMode();
  const { isDark } = useAppTheme();
  const pulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (!isDemoMode) {
      // Pulse the green dot for Live mode
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700 }),
          withTiming(0.3, { duration: 700 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
      glowOpacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [isDemoMode]);

  const dotAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: glowOpacity.value,
  }));

  const dotColor = isDemoMode ? Palette.brand.primaryLight : Palette.risk.safe;
  const bgColor = isDemoMode
    ? (isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)')
    : (isDark ? 'rgba(34,211,238,0.1)' : 'rgba(34,211,238,0.08)');
  const borderColor = isDemoMode
    ? (isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.5)')
    : (isDark ? 'rgba(34,211,238,0.3)' : 'rgba(34,211,238,0.5)');
  const textColor = isDemoMode
    ? (isDark ? Palette.brand.primaryLight : Palette.brand.primaryDark)
    : (isDark ? Palette.risk.safe : Palette.risk.safeDark);
  const label = isDemoMode ? 'DEMO' : 'LIVE';

  return (
    <TouchableOpacity
      style={[styles.badge, { backgroundColor: bgColor, borderColor }]}
      onPress={toggleDemoMode}
      activeOpacity={0.7}
    >
      <View style={[styles.dotWrap]}>
        <Animated.View style={[styles.dotGlow, { backgroundColor: dotColor }, dotAnimStyle]} />
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      </View>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  dotWrap: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
  },
  dotGlow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
