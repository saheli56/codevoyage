import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette, Radius } from '@/constants/theme';
import { RiskLevel } from '@/types/security';
import { ShieldCheck, ShieldWarning, Warning } from 'phosphor-react-native';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, score, size = 'md' }: RiskBadgeProps) {
  const isDangerous = level === 'DANGEROUS';
  const isSuspicious = level === 'SUSPICIOUS';

  const config = isDangerous
    ? {
        label: 'CRITICAL THREAT',
        textColor: '#DC2626',
        bgColor: 'rgba(220, 38, 38, 0.08)',
        borderColor: 'rgba(220, 38, 38, 0.2)',
        icon: <Warning size={size === 'sm' ? 12 : 14} color="#DC2626" weight="fill" />,
      }
    : isSuspicious
    ? {
        label: 'SUSPICIOUS',
        textColor: '#D97706',
        bgColor: 'rgba(217, 119, 6, 0.08)',
        borderColor: 'rgba(217, 119, 6, 0.2)',
        icon: <ShieldWarning size={size === 'sm' ? 12 : 14} color="#D97706" weight="fill" />,
      }
    : {
        label: 'VERIFIED SAFE',
        textColor: '#059669',
        bgColor: 'rgba(5, 150, 105, 0.08)',
        borderColor: 'rgba(5, 150, 105, 0.2)',
        icon: <ShieldCheck size={size === 'sm' ? 12 : 14} color="#059669" weight="fill" />,
      };

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 7 : 10,
        },
      ]}
    >
      {config.icon}
      <Text
        style={[
          styles.text,
          {
            color: config.textColor,
            fontSize: isSmall ? 10 : 11,
          },
        ]}
      >
        {config.label}
      </Text>
      {score !== undefined && (
        <Text style={[styles.score, { color: config.textColor, fontSize: isSmall ? 10 : 11 }]}>
          · {score}/100
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  score: {
    fontWeight: '800',
    fontFamily: 'monospace',
  },
});
