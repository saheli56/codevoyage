import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Warning, ShieldCheck, ShieldWarning, ArrowRight } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { AnalysisResult } from '@/types/security';
import { RiskBadge } from '@/components/ui/risk-badge';
import { useAppTheme } from '@/context/ThemeContext';

interface EvidenceCardProps {
  result: AnalysisResult;
}

function SignalRow({ signal, index, colors, isDark }: { signal: AnalysisResult['signals'][0]; index: number; colors: any; isDark: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(index * 80, withTiming(1, { duration: 400, easing: Easing.out(Easing.exp) }));
    translateY.value = withDelay(index * 80, withTiming(0, { duration: 400, easing: Easing.out(Easing.exp) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const isCritical = signal.severity === 'CRITICAL' || signal.severity === 'HIGH';
  const isMedium = signal.severity === 'MEDIUM';

  const iconColor = isCritical
    ? Palette.risk.dangerous
    : isMedium
    ? Palette.risk.suspicious
    : Palette.risk.safe;

  const Icon = isCritical ? Warning : isMedium ? ShieldWarning : ShieldCheck;

  return (
    <Animated.View style={[styles.signalRow, animStyle]}>
      <View style={[styles.signalIconWrapper, {
        backgroundColor: isCritical
          ? 'rgba(248,113,113,0.1)'
          : isMedium
          ? 'rgba(251,191,36,0.1)'
          : 'rgba(34,211,238,0.1)',
        borderColor: isCritical
          ? 'rgba(248,113,113,0.2)'
          : isMedium
          ? 'rgba(251,191,36,0.2)'
          : 'rgba(34,211,238,0.2)',
      }]}>
        <Icon size={15} color={iconColor} weight="bold" />
      </View>
      <View style={styles.signalContent}>
        <Text style={[styles.signalTitle, { color: colors.textPrimary }]}>{signal.title}</Text>
        <Text style={[styles.signalDesc, { color: colors.textSecondary }]}>{signal.description}</Text>
        {signal.observedValue && (
          <View style={[styles.valueTag, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
            <Text style={[styles.valueTagText, { color: isDark ? Palette.brand.primaryLight : Palette.brand.primaryDark }]}>{signal.observedValue}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function ActionRow({ act, index, colors, isDark }: { act: AnalysisResult['actions'][0]; index: number; colors: any; isDark: boolean }) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-10);

  useEffect(() => {
    opacity.value = withDelay(index * 60, withTiming(1, { duration: 350 }));
    translateX.value = withDelay(index * 60, withTiming(0, { duration: 350, easing: Easing.out(Easing.ease) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.actionItem, animStyle]}>
      <View style={[styles.actionIconWrap, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.15)' }]}>
        <ArrowRight size={14} color={isDark ? Palette.brand.primaryLight : Palette.brand.primaryDark} weight="bold" />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={[styles.actionTitle, { color: isDark ? Palette.brand.primaryLight : Palette.brand.primaryDark }]}>{act.title}</Text>
        <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>{act.description}</Text>
      </View>
    </Animated.View>
  );
}

export function EvidenceCard({ result }: EvidenceCardProps) {
  const { colors, isDark } = useAppTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.exp) });
    scale.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.exp) });
  }, [result.id]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const riskColors = {
    DANGEROUS: {
      border: isDark ? 'rgba(248,113,113,0.3)' : 'rgba(248,113,113,0.5)',
      headerBg: isDark ? 'rgba(248,113,113,0.05)' : 'rgba(248,113,113,0.1)',
      glowBar: Palette.risk.dangerous,
    },
    SUSPICIOUS: {
      border: isDark ? 'rgba(251,191,36,0.25)' : 'rgba(251,191,36,0.5)',
      headerBg: isDark ? 'rgba(251,191,36,0.05)' : 'rgba(251,191,36,0.1)',
      glowBar: Palette.risk.suspicious,
    },
    SAFE: {
      border: isDark ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.4)',
      headerBg: isDark ? 'rgba(34,211,238,0.05)' : 'rgba(34,211,238,0.1)',
      glowBar: Palette.risk.safe,
    },
  };

  const riskColor = riskColors[result.overallRisk] ?? riskColors.SAFE;

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: riskColor.border }, cardStyle]}>
      {/* Top glow bar */}
      <View style={[styles.topBar, { backgroundColor: riskColor.glowBar }]} />

      <View style={[styles.headerSection, { backgroundColor: riskColor.headerBg, borderBottomColor: colors.divider }]}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerLabel, { color: colors.textMuted }]}>ASSESSMENT RESULT</Text>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <RiskBadge level={result.overallRisk} score={result.riskScore} size="md" />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.summaryText, { color: colors.textPrimary }]}>{result.summary}</Text>

        {result.signals.length > 0 && (
          <View style={styles.signalsSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionLine, { backgroundColor: colors.divider }]} />
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>SIGNALS ({result.signals.length})</Text>
              <View style={[styles.sectionLine, { backgroundColor: colors.divider }]} />
            </View>
            {result.signals.map((signal, i) => (
              <SignalRow key={signal.id} signal={signal} index={i} colors={colors} isDark={isDark} />
            ))}
          </View>
        )}

        {result.actions.length > 0 && (
          <View style={styles.actionsSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionLine, { backgroundColor: colors.divider }]} />
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>ACTIONS</Text>
              <View style={[styles.sectionLine, { backgroundColor: colors.divider }]} />
            </View>
            {result.actions.map((act, i) => (
              <ActionRow key={act.id} act={act} index={i} colors={colors} isDark={isDark} />
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginTop: Spacing.three,
    overflow: 'hidden',
  },
  topBar: {
    height: 2,
    width: '100%',
    opacity: 0.8,
  },
  headerSection: {
    padding: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: Palette.surface.divider,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.two,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.text.muted,
    letterSpacing: 1.2,
  },
  timestamp: {
    fontSize: 12,
    color: Palette.text.secondary,
    marginTop: 3,
    fontWeight: '500',
  },
  body: {
    padding: Spacing.four,
  },
  summaryText: {
    fontSize: 14,
    color: Palette.text.primary,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: Spacing.three,
  },
  signalsSection: {
    marginTop: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.surface.divider,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.text.muted,
    letterSpacing: 1.2,
  },
  signalRow: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  signalIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  signalContent: {
    flex: 1,
  },
  signalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.text.primary,
  },
  signalDesc: {
    fontSize: 12,
    color: Palette.text.secondary,
    marginTop: 2,
    lineHeight: 17,
  },
  valueTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  valueTagText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Palette.brand.primaryLight,
  },
  actionsSection: {
    marginTop: Spacing.two,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  actionIconWrap: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(59,130,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.brand.primaryLight,
  },
  actionDesc: {
    fontSize: 12,
    color: Palette.text.secondary,
    marginTop: 1,
    lineHeight: 17,
  },
});
