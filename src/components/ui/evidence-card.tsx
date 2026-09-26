import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Radius, Spacing, Palette } from '@/constants/theme';
import { AnalysisResult } from '@/types/security';
import { RiskBadge } from '@/components/ui/risk-badge';
import { useAppTheme } from '@/context/ThemeContext';
import { Warning, CheckCircle, ArrowRight, PhoneCall, ShieldWarning } from 'phosphor-react-native';
import { EmergencyKitModal } from '@/components/ui/emergency-kit-modal';

interface EvidenceCardProps {
  result: AnalysisResult;
}

export function EvidenceCard({ result }: EvidenceCardProps) {
  const { colors, isDark } = useAppTheme();
  const [showEmergencyKit, setShowEmergencyKit] = useState(false);

  const isHighThreat = result.overallRisk === 'DANGEROUS' || result.riskScore >= 70;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: isHighThreat ? 'rgba(220, 38, 38, 0.3)' : colors.cardBorder,
        },
      ]}
    >
      {/* Header / Primary Classification */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.kicker, { color: colors.textMuted }]}>ASSESSMENT VERDICT</Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            Audited at {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <RiskBadge level={result.overallRisk} score={result.riskScore} size="md" />
      </View>

      {/* Summary Narrative */}
      <View style={styles.body}>
        <Text style={[styles.summary, { color: colors.textPrimary }]}>{result.summary}</Text>

        {/* Emergency SOS Banner for Critical Threats */}
        {isHighThreat && (
          <TouchableOpacity
            style={[
              styles.emergencyBanner,
              {
                backgroundColor: isDark ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.06)',
                borderColor: 'rgba(220, 38, 38, 0.25)',
              },
            ]}
            onPress={() => setShowEmergencyKit(true)}
            activeOpacity={0.7}
          >
            <View style={styles.emergencyLeft}>
              <PhoneCall size={16} color="#DC2626" weight="fill" />
              <View>
                <Text style={styles.emergencyTitle}>Accidentally Clicked or Shared Credentials?</Text>
                <Text style={[styles.emergencySubtitle, { color: colors.textSecondary }]}>
                  Open 1930 Cyber Helpline & Fund Freeze Kit
                </Text>
              </View>
            </View>
            <ArrowRight size={14} color="#DC2626" weight="bold" />
          </TouchableOpacity>
        )}

        {/* Signals List */}
        {result.signals.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              EVIDENCE & DETECTION SIGNALS ({result.signals.length})
            </Text>
            <View style={styles.signalsList}>
              {result.signals.map((sig) => {
                const isCrit = sig.severity === 'CRITICAL' || sig.severity === 'HIGH';
                return (
                  <View
                    key={sig.id}
                    style={[
                      styles.signalRow,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.signalIconWrap}>
                      {isCrit ? (
                        <Warning size={14} color="#DC2626" weight="fill" />
                      ) : (
                        <CheckCircle size={14} color="#059669" weight="fill" />
                      )}
                    </View>
                    <View style={styles.signalContent}>
                      <Text style={[styles.signalTitle, { color: colors.textPrimary }]}>{sig.title}</Text>
                      <Text style={[styles.signalDesc, { color: colors.textSecondary }]}>{sig.description}</Text>
                      {sig.observedValue && (
                        <View
                          style={[
                            styles.valueTag,
                            {
                              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                            },
                          ]}
                        >
                          <Text style={[styles.valueTagText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {sig.observedValue}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recommended Actions */}
        {result.actions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>RECOMMENDED MITIGATION</Text>
            <View style={styles.actionsList}>
              {result.actions.map((act) => (
                <View key={act.id} style={styles.actionItem}>
                  <ArrowRight size={13} color={colors.textMuted} weight="bold" />
                  <View style={styles.actionTextWrap}>
                    <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>{act.title}</Text>
                    {act.description ? (
                      <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>{act.description}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Emergency Kit Modal */}
      <EmergencyKitModal
        visible={showEmergencyKit}
        onClose={() => setShowEmergencyKit(false)}
        detectedThreatContext={result.summary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.four,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  headerLeft: {
    gap: 2,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timestamp: {
    fontSize: 11,
  },
  body: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  summary: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  emergencySubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  signalsList: {
    gap: Spacing.two,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  signalIconWrap: {
    marginTop: 2,
  },
  signalContent: {
    flex: 1,
    gap: 3,
  },
  signalTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  signalDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  valueTag: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  valueTagText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  actionsList: {
    gap: Spacing.two,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  actionTextWrap: {
    flex: 1,
    gap: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionDesc: {
    fontSize: 12,
  },
});
