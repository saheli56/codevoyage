import React, { useState, useEffect, useRef } from 'react';
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
  AppState,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  Camera,
  ClipboardText,
  ArrowRight,
  Sparkle,
  X,
  PhoneCall,
} from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { analyzeMessage } from '@/services/riskEngine';
import { saveAnalysisResult } from '@/services/storageService';
import { checkClipboardForThreats, simulateIncomingNotificationScan } from '@/services/autoProtection';
import { pickImageForAnalysis, simulateOcrFromSample } from '@/services/ocrExtractor';
import { useAppMode } from '@/context/AppModeContext';
import { useAppTheme } from '@/context/ThemeContext';
import { ModeBadge } from '@/components/ui/mode-badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AnalysisResult } from '@/types/security';
import { EvidenceCard } from '@/components/ui/evidence-card';
import { EmergencyKitModal } from '@/components/ui/emergency-kit-modal';

const SAMPLE_SCAM_SMS =
  'URGENT: Your SBI netbanking account is suspended due to expired KYC. Update immediately at http://sbi-kyc-verify.top or access will be blocked within 24 hours.';
const SAMPLE_REGIONAL_SMS =
  'Priy Grahak, aapka bijli connection aaj raat 9:30 baje kat diya jayega kyunki bill update nahi hai. Turant 9876543210 par call kare ya link khole.';
const SAMPLE_SAFE_SMS =
  'Your HDFC Bank account credit card ending in 4021 was charged INR 450.00 at Starbucks on 26-Sep-2026. If this was not you, call 1800202612.';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode } = useAppMode();
  const { colors, isDark } = useAppTheme();

  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAutoProtectionActive, setIsAutoProtectionActive] = useState(true);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [showEmergencyKit, setShowEmergencyKit] = useState(false);
  const lastProcessedText = useRef('');

  useEffect(() => {
    const scanClipboard = async () => {
      if (!isAutoProtectionActive) return;
      const detected = await checkClipboardForThreats(lastProcessedText.current);
      if (detected) {
        lastProcessedText.current = detected.text;
        setInputText(detected.text);
        setAnalysisResult(detected.result);
      }
    };

    scanClipboard();
    const interval = setInterval(scanClipboard, 2500);
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') scanClipboard();
    });
    return () => {
      clearInterval(interval);
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
    setOcrImage(null);
  };

  const loadSample = (sample: string) => {
    setInputText(sample);
    setOcrImage(null);
    handleAnalyze(sample);
  };

  const handlePickScreenshot = async () => {
    setIsProcessingOcr(true);
    const extracted = await pickImageForAnalysis();
    setIsProcessingOcr(false);
    if (extracted) {
      setOcrImage(extracted.imageUri);
      setInputText(extracted.extractedText);
      setAnalysisResult(extracted.analysis);
      await saveAnalysisResult(extracted.analysis);
    }
  };

  const handlePasteAndScan = async () => {
    const detected = await checkClipboardForThreats('');
    if (detected) {
      setInputText(detected.text);
      setAnalysisResult(detected.result);
    } else {
      Alert.alert('Clipboard Clear', 'No active threat patterns detected in your clipboard.');
    }
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
              <ShieldCheck size={24} color={colors.textPrimary} weight="fill" />
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>ScamShield</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[
                  styles.sosBtn,
                  {
                    backgroundColor: isDark ? 'rgba(220, 38, 38, 0.12)' : 'rgba(220, 38, 38, 0.08)',
                    borderColor: 'rgba(220, 38, 38, 0.25)',
                  },
                ]}
                onPress={() => setShowEmergencyKit(true)}
                activeOpacity={0.7}
              >
                <PhoneCall size={12} color="#DC2626" weight="fill" />
                <Text style={styles.sosBtnText}>1930 SOS</Text>
              </TouchableOpacity>
              <ThemeToggle />
              <ModeBadge />
            </View>
          </View>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Real-time heuristic fraud defense & message verification
          </Text>
        </View>

        {/* Protection Toggle Bar */}
        <View
          style={[
            styles.protectionBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.protectionInfo}>
            <Text style={[styles.protectionTitle, { color: colors.textPrimary }]}>
              Autonomous Background Protection
            </Text>
            <Text style={[styles.protectionDesc, { color: colors.textMuted }]}>
              {isAutoProtectionActive ? 'Monitoring clipboard and message feeds' : 'Protection paused'}
            </Text>
          </View>
          <Switch
            value={isAutoProtectionActive}
            onValueChange={setIsAutoProtectionActive}
            trackColor={{ false: colors.inputBorder, true: Palette.brand.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Primary Analysis Input */}
        <View
          style={[
            styles.inputPanel,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.inputHeader}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>AUDIT SUSPICIOUS CONTENT</Text>
            <TouchableOpacity
              style={[
                styles.ocrButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={handlePickScreenshot}
              disabled={isProcessingOcr}
            >
              {isProcessingOcr ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <>
                  <Camera size={13} color={colors.textSecondary} weight="bold" />
                  <Text style={[styles.ocrButtonText, { color: colors.textSecondary }]}>Screenshot</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.textPrimary,
              },
            ]}
            multiline
            numberOfLines={4}
            placeholder="Paste raw SMS text, WhatsApp message, payment note, or link to inspect..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.analyzeBtn,
                { backgroundColor: Palette.brand.primary },
                !inputText.trim() && styles.btnDisabled,
              ]}
              onPress={() => handleAnalyze()}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.analyzeBtnText}>Inspect Content</Text>
              <ArrowRight size={14} color="#FFFFFF" weight="bold" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.clipboardBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={handlePasteAndScan}
              activeOpacity={0.7}
            >
              <ClipboardText size={14} color={colors.textSecondary} weight="bold" />
              <Text style={[styles.clipboardBtnText, { color: colors.textSecondary }]}>Clipboard</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Benchmarks in Sandbox Mode */}
        {isDemoMode && (
          <View style={styles.sandboxSection}>
            <Text style={[styles.sandboxLabel, { color: colors.textMuted }]}>PRELOADED SCAM VECTORS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              <TouchableOpacity
                style={[styles.sampleChip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => loadSample(SAMPLE_SCAM_SMS)}
              >
                <Text style={[styles.sampleChipText, { color: colors.textSecondary }]}>Fake SBI KYC</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sampleChip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => loadSample(SAMPLE_REGIONAL_SMS)}
              >
                <Text style={[styles.sampleChipText, { color: colors.textSecondary }]}>Electricity Threat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sampleChip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => loadSample(SAMPLE_SAFE_SMS)}
              >
                <Text style={[styles.sampleChipText, { color: colors.textSecondary }]}>Legitimate Bank</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Evidence Card Result */}
        {analysisResult && <EvidenceCard result={analysisResult} />}
      </ScrollView>

      <EmergencyKitModal
        visible={showEmergencyKit}
        onClose={() => setShowEmergencyKit(false)}
      />
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
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  sosBtnText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 12,
  },
  protectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  protectionInfo: {
    flex: 1,
    marginRight: Spacing.three,
    gap: 2,
  },
  protectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  protectionDesc: {
    fontSize: 11,
  },
  inputPanel: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.three,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  ocrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  ocrButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textInput: {
    minHeight: 90,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.three,
    fontSize: 13,
    lineHeight: 19,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  analyzeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  clipboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  clipboardBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sandboxSection: {
    gap: Spacing.two,
  },
  sandboxLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  chipsScroll: {
    gap: Spacing.two,
  },
  sampleChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  sampleChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
