import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import {
  PhoneCall,
  Globe,
  LockKey,
  ShieldWarning,
  X,
  CheckSquare,
  Square,
  ArrowSquareOut,
  Info,
} from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

interface EmergencyKitModalProps {
  visible: boolean;
  onClose: () => void;
  detectedThreatContext?: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  subtitle: string;
  urgent: boolean;
}

const EMERGENCY_STEPS: ChecklistItem[] = [
  {
    id: 'step-1',
    title: 'Freeze Compromised NetBanking & UPI',
    subtitle: 'Open your official banking app or call your bank immediately to block netbanking credentials and freeze registered cards.',
    urgent: true,
  },
  {
    id: 'step-2',
    title: 'Dial 1930 (National Cyber Crime Helpline)',
    subtitle: 'Report within the golden hour so law enforcement can freeze fraudulent beneficiary bank accounts before cash is withdrawn.',
    urgent: true,
  },
  {
    id: 'step-3',
    title: 'Note Down Transaction UTR / Ref IDs',
    subtitle: 'Save screenshots of payment debits, SMS alerts, UPI transaction reference numbers, and scam URLs.',
    urgent: false,
  },
  {
    id: 'step-4',
    title: 'File an Official Complaint on CyberCrime.gov.in',
    subtitle: 'Register a formal FIR on the Ministry of Home Affairs national cybercrime reporting portal.',
    urgent: false,
  },
  {
    id: 'step-5',
    title: 'Block and Report the Sender',
    subtitle: 'Mark the WhatsApp / SMS sender as spam and report the malicious link to your telecom provider.',
    urgent: false,
  },
];

export function EmergencyKitModal({ visible, onClose, detectedThreatContext }: EmergencyKitModalProps) {
  const { colors, isDark } = useAppTheme();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCall1930 = () => {
    Linking.openURL('tel:1930').catch(() => {
      Alert.alert('Emergency Helpline', 'Please dial 1930 on your phone dialer to reach the National Cyber Crime Reporting Center.');
    });
  };

  const handleOpenPortal = () => {
    Linking.openURL('https://cybercrime.gov.in').catch(() => {
      Alert.alert('Official Portal', 'Visit https://cybercrime.gov.in in your browser.');
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.elevated, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.titleGroup}>
              <ShieldWarning size={20} color="#DC2626" weight="fill" />
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Emergency Scam Response Kit</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Immediate steps to protect funds and report fraud
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.inputBg }]} onPress={onClose}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Quick Action Emergency Direct Line */}
            <View style={[styles.helplineBanner, { backgroundColor: isDark ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.06)', borderColor: 'rgba(220, 38, 38, 0.25)' }]}>
              <View style={styles.helplineInfo}>
                <Text style={styles.helplineKicker}>NATIONAL CYBERCRIME HELPLINE (INDIA)</Text>
                <Text style={[styles.helplineNumber, { color: colors.textPrimary }]}>1930</Text>
                <Text style={[styles.helplineDesc, { color: colors.textSecondary }]}>
                  Available 24x7. Fast response can freeze stolen funds before fraudulent withdrawal.
                </Text>
              </View>
              <TouchableOpacity style={styles.callBtn} onPress={handleCall1930} activeOpacity={0.8}>
                <PhoneCall size={16} color="#FFFFFF" weight="bold" />
                <Text style={styles.callBtnText}>Call 1930</Text>
              </TouchableOpacity>
            </View>

            {/* Online Portal Link */}
            <TouchableOpacity
              style={[
                styles.portalLinkRow,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={handleOpenPortal}
              activeOpacity={0.7}
            >
              <View style={styles.portalLeft}>
                <Globe size={16} color={Palette.brand.primary} weight="bold" />
                <View>
                  <Text style={[styles.portalTitle, { color: colors.textPrimary }]}>Official CyberCrime Portal</Text>
                  <Text style={[styles.portalUrl, { color: colors.textMuted }]}>https://cybercrime.gov.in</Text>
                </View>
              </View>
              <ArrowSquareOut size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Checklist */}
            <View style={styles.checklistSection}>
              <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
                INCIDENT RESPONSE CHECKLIST ({completedSteps.length}/{EMERGENCY_STEPS.length} COMPLETED)
              </Text>

              <View style={styles.checklist}>
                {EMERGENCY_STEPS.map((step) => {
                  const isDone = completedSteps.includes(step.id);
                  return (
                    <TouchableOpacity
                      key={step.id}
                      style={[
                        styles.checklistItem,
                        {
                          backgroundColor: colors.inputBg,
                          borderColor: isDone ? 'rgba(5, 150, 105, 0.3)' : colors.cardBorder,
                        },
                      ]}
                      onPress={() => toggleStep(step.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.checkIconWrap}>
                        {isDone ? (
                          <CheckSquare size={18} color="#059669" weight="fill" />
                        ) : (
                          <Square size={18} color={colors.textMuted} />
                        )}
                      </View>
                      <View style={styles.checkTextWrap}>
                        <View style={styles.checkTitleRow}>
                          <Text
                            style={[
                              styles.stepTitle,
                              {
                                color: isDone ? colors.textMuted : colors.textPrimary,
                                textDecorationLine: isDone ? 'line-through' : 'none',
                              },
                            ]}
                          >
                            {step.title}
                          </Text>
                          {step.urgent && !isDone && (
                            <View style={styles.urgentBadge}>
                              <Text style={styles.urgentText}>PRIORITY 1</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{step.subtitle}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Legal Notice */}
            <View style={styles.infoNote}>
              <Info size={14} color={colors.textMuted} />
              <Text style={[styles.infoNoteText, { color: colors.textMuted }]}>
                ScamShield provides immediate incident response guidance. We do not store banking credentials or initiate fund recalls directly.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Close */}
          <View style={[styles.footerRow, { borderTopColor: colors.divider }]}>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: Palette.brand.primary }]} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close Response Kit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    padding: Spacing.four,
    maxHeight: '92%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: Radius.full,
  },
  contentScroll: {
    marginVertical: Spacing.three,
  },
  helplineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  helplineInfo: {
    flex: 1,
    gap: 2,
  },
  helplineKicker: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#DC2626',
  },
  helplineNumber: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  helplineDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    alignSelf: 'center',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  portalLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  portalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  portalTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  portalUrl: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  checklistSection: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  checklist: {
    gap: Spacing.two,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  checkIconWrap: {
    marginTop: 2,
  },
  checkTextWrap: {
    flex: 1,
    gap: 2,
  },
  checkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: Radius.sm,
  },
  urgentText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: Spacing.two,
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  infoNoteText: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  footerRow: {
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  doneBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
