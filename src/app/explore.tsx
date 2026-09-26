import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CurrencyInr, WarningCircle, ArrowCounterClockwise, ShieldCheck } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { analyzePaymentRisk } from '@/services/paymentAnalyzer';
import { saveAnalysisResult } from '@/services/storageService';
import { AnalysisResult } from '@/types/security';
import { EvidenceCard } from '@/components/ui/evidence-card';

const SAMPLE_SCAM_PAYMENT = {
  amount: '15000',
  recipientVpa: 'sbi-lottery-support@okaxis',
  isNewBeneficiary: true,
  contextNote: 'Refund processing registration fee'
};

export default function PaymentRiskScreen() {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [recipientVpa, setRecipientVpa] = useState('');
  const [contextNote, setContextNote] = useState('');
  const [isNewBeneficiary, setIsNewBeneficiary] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAssess = async (customParams?: typeof SAMPLE_SCAM_PAYMENT) => {
    const params = customParams || {
      amount,
      recipientVpa,
      isNewBeneficiary,
      contextNote
    };

    if (!params.recipientVpa.trim()) return;

    const res = analyzePaymentRisk(params);
    setResult(res);
    await saveAnalysisResult(res);
  };

  const handleReset = () => {
    setAmount('');
    setRecipientVpa('');
    setContextNote('');
    setIsNewBeneficiary(true);
    setResult(null);
  };

  const loadSimulatedScam = () => {
    setAmount(SAMPLE_SCAM_PAYMENT.amount);
    setRecipientVpa(SAMPLE_SCAM_PAYMENT.recipientVpa);
    setContextNote(SAMPLE_SCAM_PAYMENT.contextNote);
    setIsNewBeneficiary(SAMPLE_SCAM_PAYMENT.isNewBeneficiary);
    handleAssess(SAMPLE_SCAM_PAYMENT);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + 90 }
        ]} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <CurrencyInr size={22} color={Palette.brand.primary} weight="bold" />
            <Text style={styles.screenTitle}>Payment Risk Simulator</Text>
          </View>
          <Text style={styles.screenSubtitle}>
            Pre-flight transaction screening before authorizing UPI or NetBanking transfers.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formSectionLabel}>TRANSACTION PARAMETERS</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Transfer Amount (INR)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5000"
              placeholderTextColor={Palette.neutral.slate400}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Recipient UPI ID / VPA</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. merchant@okaxis or user@upi"
              placeholderTextColor={Palette.neutral.slate400}
              autoCapitalize="none"
              value={recipientVpa}
              onChangeText={setRecipientVpa}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Payment Purpose / Remarks</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. advance tax, refund fee, verification"
              placeholderTextColor={Palette.neutral.slate400}
              value={contextNote}
              onChangeText={setContextNote}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>First-Time Beneficiary</Text>
              <Text style={styles.switchSubtext}>No prior transaction history with this recipient</Text>
            </View>
            <Switch
              value={isNewBeneficiary}
              onValueChange={setIsNewBeneficiary}
              trackColor={{ false: Palette.neutral.slate200, true: Palette.brand.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.primaryButton, !recipientVpa.trim() && styles.disabledButton]}
              onPress={() => handleAssess()}
              disabled={!recipientVpa.trim()}
            >
              <ShieldCheck size={18} color="#FFFFFF" weight="bold" />
              <Text style={styles.primaryButtonText}>Assess Payment Risk</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleReset}>
              <ArrowCounterClockwise size={18} color={Palette.neutral.slate500} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickTestsContainer}>
          <Text style={styles.testLabel}>SIMULATE RISK SCENARIO</Text>
          <TouchableOpacity style={styles.simButton} onPress={loadSimulatedScam}>
            <WarningCircle size={16} color={Palette.risk.dangerous} weight="bold" />
            <Text style={styles.simButtonText}>Load High-Risk Advance-Fee Vector</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <EvidenceCard result={result} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.neutral.slate50,
  },
  scrollContent: {
    padding: Spacing.four,
  },
  header: {
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.neutral.slate900,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 12,
    color: Palette.neutral.slate500,
    marginTop: 2,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
  },
  formSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.neutral.slate500,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  fieldGroup: {
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.neutral.slate700,
    marginBottom: Spacing.one,
  },
  input: {
    backgroundColor: Palette.neutral.slate50,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    fontSize: 14,
    color: Palette.neutral.slate900,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Palette.neutral.slate100,
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: Spacing.two,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.neutral.slate900,
  },
  switchSubtext: {
    fontSize: 11,
    color: Palette.neutral.slate500,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.brand.primary,
    paddingVertical: 10,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  disabledButton: {
    backgroundColor: Palette.neutral.slate300,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  iconButton: {
    padding: 10,
    marginLeft: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: Palette.neutral.slate100,
  },
  quickTestsContainer: {
    marginTop: Spacing.three,
  },
  testLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.neutral.slate400,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Palette.risk.dangerousLight,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.risk.dangerousBorder,
  },
  simButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.risk.dangerousDark,
  }
});
