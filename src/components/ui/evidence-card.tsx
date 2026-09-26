import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Warning, ShieldCheck, ShieldWarning, ArrowRight } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { AnalysisResult } from '@/types/security';
import { RiskBadge } from '@/components/ui/risk-badge';

interface EvidenceCardProps {
  result: AnalysisResult;
}

export function EvidenceCard({ result }: EvidenceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerLabel}>ASSESSMENT RESULT</Text>
          <Text style={styles.timestamp}>
            {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <RiskBadge level={result.overallRisk} score={result.riskScore} size="md" />
      </View>

      <Text style={styles.summaryText}>{result.summary}</Text>

      {result.signals.length > 0 && (
        <View style={styles.signalsSection}>
          <Text style={styles.sectionHeading}>IDENTIFIED SIGNALS ({result.signals.length})</Text>
          {result.signals.map((signal) => (
            <View key={signal.id} style={styles.signalRow}>
              <View style={styles.signalIconWrapper}>
                {signal.severity === 'CRITICAL' || signal.severity === 'HIGH' ? (
                  <Warning size={18} color={Palette.risk.dangerous} weight="bold" />
                ) : signal.severity === 'MEDIUM' ? (
                  <ShieldWarning size={18} color={Palette.risk.suspicious} weight="bold" />
                ) : (
                  <ShieldCheck size={18} color={Palette.risk.safe} weight="bold" />
                )}
              </View>
              <View style={styles.signalContent}>
                <Text style={styles.signalTitle}>{signal.title}</Text>
                <Text style={styles.signalDesc}>{signal.description}</Text>
                {signal.observedValue && (
                  <View style={styles.valueTag}>
                    <Text style={styles.valueTagText}>Matched: {signal.observedValue}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {result.actions.length > 0 && (
        <View style={styles.actionsSection}>
          <Text style={styles.sectionHeading}>RECOMMENDED ACTIONS</Text>
          {result.actions.map((act) => (
            <View key={act.id} style={styles.actionItem}>
              <ArrowRight size={16} color={Palette.brand.primary} weight="bold" />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>{act.title}</Text>
                <Text style={styles.actionDesc}>{act.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
    marginTop: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  titleContainer: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.neutral.slate500,
    letterSpacing: 0.8,
  },
  timestamp: {
    fontSize: 12,
    color: Palette.neutral.slate400,
    marginTop: 2,
  },
  summaryText: {
    fontSize: 14,
    color: Palette.neutral.slate800,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: Spacing.three,
  },
  signalsSection: {
    borderTopWidth: 1,
    borderTopColor: Palette.neutral.slate100,
    paddingTop: Spacing.three,
    marginTop: Spacing.two,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.neutral.slate500,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  signalRow: {
    flexDirection: 'row',
    marginBottom: Spacing.three,
    alignItems: 'flex-start',
  },
  signalIconWrapper: {
    marginTop: 2,
    marginRight: Spacing.two,
  },
  signalContent: {
    flex: 1,
  },
  signalTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.neutral.slate900,
  },
  signalDesc: {
    fontSize: 12,
    color: Palette.neutral.slate600,
    marginTop: 2,
    lineHeight: 16,
  },
  valueTag: {
    backgroundColor: Palette.neutral.slate100,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  valueTagText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Palette.neutral.slate700,
  },
  actionsSection: {
    borderTopWidth: 1,
    borderTopColor: Palette.neutral.slate100,
    paddingTop: Spacing.three,
    marginTop: Spacing.two,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.brand.primaryDark,
  },
  actionDesc: {
    fontSize: 12,
    color: Palette.neutral.slate600,
    marginTop: 1,
  }
});
