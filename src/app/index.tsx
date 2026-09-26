import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Switch, AppState, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, Sparkle, Trash, ClipboardText, Translate, BellRinging, Lightning } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { analyzeMessage } from '@/services/riskEngine';
import { saveAnalysisResult } from '@/services/storageService';
import { checkClipboardForThreats, requestNotificationPermissions, simulateIncomingNotificationScan } from '@/services/autoProtection';
import { AnalysisResult } from '@/types/security';
import { EvidenceCard } from '@/components/ui/evidence-card';

const SAMPLE_SCAM_SMS = 'URGENT: Your SBI netbanking account is suspended due to expired KYC. Update immediately at http://sbi-kyc-verify.top or access will be blocked within 24 hours.';
const SAMPLE_REGIONAL_SMS = 'Priy Grahak, aapka bijli connection aaj raat 9:30 baje kat diya jayega kyunki bill update nahi hai. Turant 9876543210 par call kare ya link khole.';
const SAMPLE_SAFE_SMS = 'Your HDFC Bank account credit card ending in 4021 was charged INR 450.00 at Starbucks on 26-Sep-2026. If this was not you, call 1800202612.';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAutoProtectionActive, setIsAutoProtectionActive] = useState(true);
  const lastProcessedText = useRef('');

  useEffect(() => {
    requestNotificationPermissions();

    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && isAutoProtectionActive) {
        const detected = await checkClipboardForThreats(lastProcessedText.current);
        if (detected) {
          lastProcessedText.current = detected.text;
          setInputText(detected.text);
          setAnalysisResult(detected.result);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAutoProtectionActive]);

  const handleAnalyze = async (textToAnalyze?: string) => {
    const target = textToAnalyze !== undefined ? textToAnalyze : inputText;
    if (!target.trim()) return;
    const res = analyzeMessage(target);
    setAnalysisResult(res);
    await saveAnalysisResult(res);
  };

  const handleClear = () => {
    setInputText('');
    setAnalysisResult(null);
  };

  const loadSample = (sample: string) => {
    setInputText(sample);
    handleAnalyze(sample);
  };

  const handleSimulateIncomingSms = async () => {
    const simulatedText = 'VM-SBINB: Dear customer, your PAN is not linked to account XXXX4910. Netbanking deactivated. Link at http://sbi-pan-kyc.buzz immediately.';
    setInputText(simulatedText);
    const res = await simulateIncomingNotificationScan('VM-SBINB', simulatedText);
    setAnalysisResult(res);
    Alert.alert(
      'Automated Threat Detected',
      'An incoming smishing pattern from "VM-SBINB" was intercepted and categorized as DANGEROUS.',
      [{ text: 'Inspect Evidence', style: 'default' }]
    );
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
          <View style={styles.logoRow}>
            <Shield size={24} color={Palette.brand.primary} weight="fill" />
            <Text style={styles.appTitle}>ScamShield</Text>
          </View>
          <Text style={styles.appSubtitle}>Automated Financial Threat & Scam Intelligence</Text>
        </View>

        <View style={styles.autoProtectBanner}>
          <View style={styles.autoProtectInfo}>
            <View style={styles.autoProtectTitleRow}>
              <BellRinging size={16} color={isAutoProtectionActive ? Palette.risk.safe : Palette.neutral.slate400} weight="bold" />
              <Text style={styles.autoProtectTitle}>Active Protection Shield</Text>
            </View>
            <Text style={styles.autoProtectSubtitle}>
              {isAutoProtectionActive 
                ? 'Actively scanning incoming notifications & clipboard for fraud patterns' 
                : 'Automated background scanning paused'}
            </Text>
          </View>
          <Switch
            value={isAutoProtectionActive}
            onValueChange={setIsAutoProtectionActive}
            trackColor={{ false: Palette.neutral.slate200, true: Palette.brand.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>INSPECT SUSPICIOUS MESSAGE OR LINK</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Paste SMS, WhatsApp, Hinglish/Regional text, or phishing link..."
            placeholderTextColor={Palette.neutral.slate400}
            multiline
            numberOfLines={4}
            value={inputText}
            onChangeText={setInputText}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.primaryButton, !inputText.trim() && styles.disabledButton]} 
              onPress={() => handleAnalyze()}
              disabled={!inputText.trim()}
            >
              <Sparkle size={18} color="#FFFFFF" weight="bold" />
              <Text style={styles.primaryButtonText}>Analyze Signals</Text>
            </TouchableOpacity>

            {inputText.length > 0 && (
              <TouchableOpacity style={styles.iconButton} onPress={handleClear}>
                <Trash size={18} color={Palette.neutral.slate500} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.quickTestsContainer}>
          <View style={styles.testHeaderRow}>
            <Text style={styles.testLabel}>BENCHMARK SCENARIOS</Text>
            <TouchableOpacity style={styles.simulateIncomingBtn} onPress={handleSimulateIncomingSms}>
              <Lightning size={12} color={Palette.brand.primaryDark} weight="bold" />
              <Text style={styles.simulateIncomingText}>Simulate Live SMS</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sampleButtonsRow}>
            <TouchableOpacity 
              style={styles.sampleButton}
              onPress={() => loadSample(SAMPLE_SCAM_SMS)}
            >
              <ClipboardText size={14} color={Palette.brand.primary} />
              <Text style={styles.sampleButtonText}>KYC Phish (EN)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.sampleButton}
              onPress={() => loadSample(SAMPLE_REGIONAL_SMS)}
            >
              <Translate size={14} color={Palette.risk.suspiciousDark} />
              <Text style={styles.sampleButtonText}>Electricity Bill (Hinglish)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.sampleButton}
              onPress={() => loadSample(SAMPLE_SAFE_SMS)}
            >
              <ClipboardText size={14} color={Palette.risk.safeDark} />
              <Text style={styles.sampleButtonText}>Legit Alert</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {analysisResult && (
          <EvidenceCard result={analysisResult} />
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.neutral.slate900,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    color: Palette.neutral.slate500,
    marginTop: 2,
  },
  autoProtectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
    marginBottom: Spacing.three,
  },
  autoProtectInfo: {
    flex: 1,
    marginRight: Spacing.two,
  },
  autoProtectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autoProtectTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.neutral.slate900,
  },
  autoProtectSubtitle: {
    fontSize: 11,
    color: Palette.neutral.slate500,
    marginTop: 2,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.neutral.slate500,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  textInput: {
    minHeight: 90,
    backgroundColor: Palette.neutral.slate50,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontSize: 14,
    color: Palette.neutral.slate900,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.brand.primary,
    paddingVertical: 10,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    gap: Spacing.two,
    flex: 1,
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
  testHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  testLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.neutral.slate400,
    letterSpacing: 0.8,
  },
  simulateIncomingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.brand.primaryMuted,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
  },
  simulateIncomingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.brand.primaryDark,
  },
  sampleButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: 2,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
  },
  sampleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.neutral.slate700,
  }
});
