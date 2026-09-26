import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Warning, WarningOctagon, Info } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { RiskLevel } from '@/types/security';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, score, size = 'md' }: RiskBadgeProps) {
  const getTheme = () => {
    switch (level) {
      case 'SAFE':
        return {
          bg: Palette.risk.safeLight,
          border: Palette.risk.safeBorder,
          text: Palette.risk.safeDark,
          color: Palette.risk.safe,
          Icon: ShieldCheck,
          label: 'SAFE'
        };
      case 'SUSPICIOUS':
        return {
          bg: Palette.risk.suspiciousLight,
          border: Palette.risk.suspiciousBorder,
          text: Palette.risk.suspiciousDark,
          color: Palette.risk.suspicious,
          Icon: Warning,
          label: 'SUSPICIOUS'
        };
      case 'DANGEROUS':
        return {
          bg: Palette.risk.dangerousLight,
          border: Palette.risk.dangerousBorder,
          text: Palette.risk.dangerousDark,
          color: Palette.risk.dangerous,
          Icon: WarningOctagon,
          label: 'DANGEROUS'
        };
      default:
        return {
          bg: Palette.neutral.slate100,
          border: Palette.neutral.slate300,
          text: Palette.neutral.slate700,
          color: Palette.neutral.slate600,
          Icon: Info,
          label: 'UNKNOWN'
        };
    }
  };

  const theme = getTheme();
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 14 : 12;
  const paddingVertical = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
  const paddingHorizontal = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.bg, 
        borderColor: theme.border, 
        paddingVertical, 
        paddingHorizontal 
      }
    ]}>
      <theme.Icon size={iconSize} color={theme.color} weight="fill" />
      <Text style={[styles.text, { color: theme.text, fontSize }]}>
        {theme.label} {score !== undefined ? `• ${score}/100` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
    gap: Spacing.one,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});
