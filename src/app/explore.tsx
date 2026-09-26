import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CurrencyInr,
  WarningCircle,
  ArrowCounterClockwise,
  ShieldCheck,
} from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { analyzePaymentRisk } from '@/services/paymentAnalyzer';
import { saveAnalysisResult } from '@/services/storageService';
import { useAppMode } from '@/context/AppModeContext';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ModeBadge } from '@/components/ui/mode-badge';
import { AnalysisResult } from '@/types/security';
import { EvidenceCard } from '@/components/ui/evidence-card';

const SAMPLE_SCAM_PAYMENT = {
  amount: '15000',
  recipientVpa: 'sbi-lottery-support@okaxis',
  isNewBeneficiary: true,
  contextNote: 'Refund processing registration fee',
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function PaymentRiskScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode } = useAppMode();
  const { colors, isDark } = useAppTheme();
  const [amount, setAmount] = useState('');
  const [recipientVpa, setRecipientVpa] = useState('');
  const [contextNote, setContextNote] = useState('');
  const [isNewBeneficiary, setIsNewBeneficiary] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Form card entrance animation
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);

  // Evidence card entrance animation
  const evidenceOpacity = useSharedValue(0);
  const evidenceScale = useSharedValue(0.95);

  // Primary button press scale
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    cardOpacity.value = withTiming(1, {
      duration: 450,
      easing: Easing.out(Easing.quad),
    });
    cardTranslateY.value = withTiming(0, {
      duration: 450,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  useEffect(() => {
    if (result) {
      evidenceOpacity.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) });
      evidenceScale.value = withSpring(1, { damping: 18, stiffness: 200 });
    } else {
      evidenceOpacity.value = 0;
      evidenceScale.value = 0.95;
    }
  }, [result]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const evidenceAnimStyle = useAnimatedStyle(() => ({
    opacity: evidenceOpacity.value,
    transform: [{ scale: evidenceScale.value }],
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const handleAssess = async (customParams?: typeof SAMPLE_SCAM_PAYMENT) => {
    const params = customParams || {
      amount,
      recipientVpa,
      isNewBeneficiary,
      contextNote,
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
      style={[styles.container, { backgroundColor: colors.base, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.titleGroup}>
              <CurrencyInr size={20} color={Palette.brand.primary} weight="bold" />
              <View style={styles.titleTextGroup}>
                <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Payment Risk</Text>
                <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>
                  Pre-flight screening before authorizing UPI or NetBanking transfers.
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
              <ModeBadge />
              <ThemeToggle />
            </View>
          </View>
        </View>

        {/* Form card */}
        <Animated.View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, cardAnimStyle]}>
          <Text style={[styles.formSectionLabel, { color: colors.textMuted }]}>TRANSACTION PARAMETERS</Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Transfer Amount (INR)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
              placeholder="e.g. 5000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Recipient UPI ID / VPA</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
              placeholder="e.g. merchant@okaxis or user@upi"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              value={recipientVpa}
              onChangeText={setRecipientVpa}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Purpose / Remarks</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
              placeholder="e.g. advance tax, refund fee, verification"
              placeholderTextColor={colors.textMuted}
              value={contextNote}
              onChangeText={setContextNote}
            />
          </View>

          <View style={[styles.switchRow, { borderTopColor: colors.divider }]}>
            <View style={styles.switchTextContainer}>
              <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>First-Time Beneficiary</Text>
              <Text style={[styles.switchSubtext, { color: colors.textMuted }]}>
                No prior transaction history with this recipient
              </Text>
            </View>
            <Switch
              value={isNewBeneficiary}
              onValueChange={setIsNewBeneficiary}
              trackColor={{
                false: colors.divider,
                true: '#2563EB',
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.actionRow}>
            <Animated.View style={[styles.primaryButtonWrapper, buttonAnimStyle]}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !recipientVpa.trim() && [styles.disabledButton, { backgroundColor: isDark ? Palette.neutral.slate700 : Palette.neutral.slate300 }],
                ]}
                onPress={() => handleAssess()}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={!recipientVpa.trim()}
                activeOpacity={1}
              >
                <ShieldCheck size={18} color="#FFFFFF" weight="bold" />
                <Text style={styles.primaryButtonText}>Assess Payment Risk</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={handleReset}>
              <ArrowCounterClockwise size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Demo mode simulation card */}
        {isDemoMode && (
          <View style={styles.quickTestsContainer}>
            <Text style={styles.testLabel}>SIMULATE RISK SCENARIO (DEMO MODE)</Text>
            <TouchableOpacity style={styles.simButton} onPress={loadSimulatedScam}>
              <WarningCircle size={16} color={Palette.risk.dangerous} weight="bold" />
              <Text style={styles.simButtonText}>Load High-Risk Advance-Fee Vector</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Evidence card result */}
        {result && (
          <Animated.View style={evidenceAnimStyle}>
            <EvidenceCard result={result} />
          </Animated.View>
        )}
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
  },
  header: {
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    flex: 1,
    marginRight: Spacing.two,
  },
  titleTextGroup: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 18,
  },
  formCard: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
  },
  formSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.three,
    textTransform: 'uppercase',
  },
  fieldGroup: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: Spacing.two,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonWrapper: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  disabledButton: {},
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  iconButton: {
    padding: 12,
    marginLeft: Spacing.two,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  quickTestsContainer: {
    marginTop: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.risk.suspiciousBorder,
    backgroundColor: Palette.risk.suspiciousLight,
    padding: Spacing.three,
  },
  testLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.neutral.slate400,
    letterSpacing: 1.2,
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
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
    color: Palette.risk.dangerous,
  },
});
