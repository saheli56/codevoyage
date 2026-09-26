import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CurrencyInr, ArrowRight, ShieldWarning } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { analyzePaymentRisk } from '@/services/paymentAnalyzer';
import { saveAnalysisResult } from '@/services/storageService';
import { useAppMode } from '@/context/AppModeContext';
import { useAppTheme } from '@/context/ThemeContext';
import { ModeBadge } from '@/components/ui/mode-badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AnalysisResult } from '@/types/security';
import { EvidenceCard } from '@/components/ui/evidence-card';

const SAMPLE_SCAM_PAYMENT = {
  amount: '45000',
  recipientVpa: 'sbi-kyc-refund@okaxis',
  contextNote: 'Electricity bill security refund deposit',
  isNewBeneficiary: true,
};

export default function PaymentRiskScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode } = useAppMode();
  const { colors } = useAppTheme();

  const [amount, setAmount] = useState('');
  const [recipientVpa, setRecipientVpa] = useState('');
  const [contextNote, setContextNote] = useState('');
  const [isNewBeneficiary, setIsNewBeneficiary] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAssess = async () => {
    if (!amount.trim() || !recipientVpa.trim()) return;

    const analysis = analyzePaymentRisk({
      amount: amount.trim(),
      recipientVpa: recipientVpa.trim(),
      isNewBeneficiary,
      contextNote: contextNote.trim(),
    });
    setResult(analysis);
    await saveAnalysisResult(analysis);
  };

  const loadSimulatedScam = () => {
    setAmount(SAMPLE_SCAM_PAYMENT.amount);
    setRecipientVpa(SAMPLE_SCAM_PAYMENT.recipientVpa);
    setContextNote(SAMPLE_SCAM_PAYMENT.contextNote);
    setIsNewBeneficiary(SAMPLE_SCAM_PAYMENT.isNewBeneficiary);

    const analysis = analyzePaymentRisk(SAMPLE_SCAM_PAYMENT);
    setResult(analysis);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.base }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <View style={styles.topRow}>
            <View style={styles.brandGroup}>
              <CurrencyInr size={22} color={colors.textPrimary} weight="fill" />
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>Payment Risk</Text>
            </View>
            <View style={styles.headerRight}>
              <ThemeToggle />
              <ModeBadge />
            </View>
          </View>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Pre-flight UPI VPA and transfer anomaly evaluation
          </Text>
        </View>

        {/* Input Panel */}
        <View style={[styles.inputPanel, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.panelLabel, { color: colors.textMuted }]}>TRANSACTION PARAMETERS</Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Transfer Amount (INR)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
              placeholder="e.g. 15000"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Recipient UPI VPA / Handle</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
              placeholder="e.g. power-bill-help@okaxis"
              placeholderTextColor={colors.textMuted}
              value={recipientVpa}
              onChangeText={setRecipientVpa}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Payment Context / Remark</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
              placeholder="e.g. Electricity bill clearance"
              placeholderTextColor={colors.textMuted}
              value={contextNote}
              onChangeText={setContextNote}
            />
          </View>

          <View style={[styles.switchRow, { borderTopColor: colors.divider }]}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>First-Time Beneficiary</Text>
              <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>No prior transaction record</Text>
            </View>
            <Switch
              value={isNewBeneficiary}
              onValueChange={setIsNewBeneficiary}
              trackColor={{ false: colors.inputBorder, true: Palette.brand.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.assessBtn,
              { backgroundColor: Palette.brand.primary },
              (!amount.trim() || !recipientVpa.trim()) && styles.btnDisabled,
            ]}
            onPress={handleAssess}
            disabled={!amount.trim() || !recipientVpa.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.assessBtnText}>Evaluate Risk Profile</Text>
            <ArrowRight size={14} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Sandbox Scenario */}
        {isDemoMode && (
          <View style={[styles.sandboxCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.sandboxHeader}>
              <ShieldWarning size={14} color="#D97706" weight="bold" />
              <Text style={[styles.sandboxTitle, { color: colors.textSecondary }]}>SIMULATED FRAUD SCENARIOS</Text>
            </View>
            <TouchableOpacity style={styles.simulateBtn} onPress={loadSimulatedScam}>
              <Text style={styles.simulateBtnText}>Load Fake Electricity VPA Vector</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Evidence Card */}
        {result && <EvidenceCard result={result} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagline: {
    fontSize: 12,
  },
  inputPanel: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.three,
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  fieldGroup: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    marginTop: Spacing.one,
  },
  switchInfo: {
    gap: 2,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontSize: 11,
  },
  assessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: Spacing.two,
  },
  assessBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  sandboxCard: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.two,
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sandboxTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  simulateBtn: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    borderColor: 'rgba(217, 119, 6, 0.25)',
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  simulateBtnText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
  },
});
