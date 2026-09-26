import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ShieldCheck, Warning, WarningOctagon, Info } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { RiskLevel } from '@/types/security';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function RiskBadge({ level, score, size = 'md', animate = true }: RiskBadgeProps) {
  const glowAnim = useSharedValue(0.5);

  const getTheme = () => {
    switch (level) {
      case 'SAFE':
        return {
          bg: 'rgba(34,211,238,0.1)',
          border: 'rgba(34,211,238,0.3)',
          text: Palette.risk.safe,
          color: Palette.risk.safe,
          glow: Palette.risk.safeGlow,
          Icon: ShieldCheck,
          label: 'SAFE',
        };
      case 'SUSPICIOUS':
        return {
          bg: 'rgba(251,191,36,0.1)',
          border: 'rgba(251,191,36,0.3)',
          text: Palette.risk.suspicious,
          color: Palette.risk.suspicious,
          glow: Palette.risk.suspiciousGlow,
          Icon: Warning,
          label: 'SUSPICIOUS',
        };
      case 'DANGEROUS':
        return {
          bg: 'rgba(248,113,113,0.12)',
          border: 'rgba(248,113,113,0.4)',
          text: Palette.risk.dangerous,
          color: Palette.risk.dangerous,
          glow: Palette.risk.dangerousGlow,
          Icon: WarningOctagon,
          label: 'DANGER',
        };
      default:
        return {
          bg: 'rgba(100,116,139,0.1)',
          border: 'rgba(100,116,139,0.2)',
          text: Palette.neutral.slate400,
          color: Palette.neutral.slate500,
          glow: 'transparent',
          Icon: Info,
          label: 'UNKNOWN',
        };
    }
  };

  const theme = getTheme();

  useEffect(() => {
    if (animate && (level === 'DANGEROUS' || level === 'SUSPICIOUS')) {
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      glowAnim.value = withTiming(0.6, { duration: 300 });
    }
  }, [level, animate]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnim.value,
  }));

  const iconSize = size === 'sm' ? 13 : size === 'lg' ? 20 : 15;
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 13 : 11;
  const paddingV = size === 'sm' ? 4 : size === 'lg' ? 8 : 5;
  const paddingH = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.bg,
        borderColor: theme.border,
        paddingVertical: paddingV,
        paddingHorizontal: paddingH,
      }
    ]}>
      <Animated.View style={glowStyle}>
        <theme.Icon size={iconSize} color={theme.color} weight="fill" />
      </Animated.View>
      <Text style={[styles.text, { color: theme.text, fontSize }]}>
        {theme.label}{score !== undefined ? `  ${score}` : ''}
      </Text>
      {score !== undefined && (
        <Text style={[styles.scoreUnit, { color: theme.text, fontSize: fontSize - 1 }]}>/100</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
    gap: 5,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scoreUnit: {
    fontWeight: '500',
    opacity: 0.7,
    marginLeft: -3,
  },
});
