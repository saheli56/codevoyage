import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Shield,
  Sparkle,
  Trash,
  ClipboardText,
  Translate,
  BellRinging,
  Lightning,
  Camera,
  ImageSquare,
  X,
  ArrowDown,
} from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { analyzeMessage } from '@/services/riskEngine';
import { saveAnalysisResult } from '@/services/storageService';
import { checkClipboardForThreats, simulateIncomingNotificationScan } from '@/services/autoProtection';
import { pickImageForAnalysis, simulateOcrFromSample } from '@/services/ocrExtractor';
import { useAppMode } from '@/context/AppModeContext';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ModeBadge } from '@/components/ui/mode-badge';
import { AnalysisResult } from '@/types/security';
import { EvidenceCard } from '@/components/ui/evidence-card';

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
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAutoProtectionActive, setIsAutoProtectionActive] = useState(true);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const lastProcessedText = useRef('');

  // ── Animation shared values ──────────────────────────────────────────────
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  const bannerOpacity = useSharedValue(0);
  const bannerTranslateY = useSharedValue(12);

  const inputCardOpacity = useSharedValue(0);
  const inputCardTranslateY = useSharedValue(16);

  const resultTranslateY = useSharedValue(20);
  const resultOpacity = useSharedValue(0);

  const dotScale = useSharedValue(1);

  // ── Mount animations ─────────────────────────────────────────────────────
  useEffect(() => {
    // Header fade-in from top
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });

    // Banner with 150 ms delay
    bannerOpacity.value = withDelay(150, withTiming(1, { duration: 450 }));
    bannerTranslateY.value = withDelay(150, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));

    // Input card with 250 ms delay
    inputCardOpacity.value = withDelay(250, withTiming(1, { duration: 450 }));
    inputCardTranslateY.value = withDelay(250, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));

    // Pulsing dot
    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  // ── Animate result card when it appears ──────────────────────────────────
  useEffect(() => {
    if (analysisResult) {
      resultTranslateY.value = 20;
      resultOpacity.value = 0;
      resultTranslateY.value = withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) });
      resultOpacity.value = withTiming(1, { duration: 380 });
    }
  }, [analysisResult]);

  // ── Animated styles ──────────────────────────────────────────────────────
  const headerAnimStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const bannerAnimStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ translateY: bannerTranslateY.value }],
  }));

  const inputCardAnimStyle = useAnimatedStyle(() => ({
    opacity: inputCardOpacity.value,
    transform: [{ translateY: inputCardTranslateY.value }],
  }));

  const resultAnimStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ translateY: resultTranslateY.value }],
  }));

  const dotAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: isAutoProtectionActive ? 1 : 0.3,
  }));

  // ── Existing logic (untouched) ────────────────────────────────────────────
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

  const handleSimulateOcr = (idx: number = 0) => {
    const extracted = simulateOcrFromSample(idx);
    setOcrImage(extracted.imageUri);
    setInputText(extracted.extractedText);
    setAnalysisResult(extracted.analysis);
  };

  const handleSimulateIncomingSms = async () => {
    const simulatedText =
      'VM-SBINB: Dear customer, your PAN is not linked to account XXXX4910. Netbanking deactivated. Link at http://sbi-pan-kyc.buzz immediately.';
    setInputText(simulatedText);
    const res = await simulateIncomingNotificationScan('VM-SBINB', simulatedText);
    setAnalysisResult(res);
  };

  const handlePasteAndScan = async () => {
    const detected = await checkClipboardForThreats('');
    if (detected) {
      setInputText(detected.text);
      setAnalysisResult(detected.result);
    } else {
      Alert.alert('Clipboard Checked', 'No high-risk scam or threat patterns detected in your clipboard.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View style={[styles.header, headerAnimStyle]}>
          <View style={styles.topRow}>
            <View style={styles.titleGroup}>
              <Shield size={26} color={Palette.brand.primary} weight="fill" />
              <Text style={styles.appTitle}>ScamShield</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ThemeToggle />
              <ModeBadge />
            </View>
          </View>
          <Text style={styles.appSubtitle}>
            {isDemoMode
              ? 'Demo Mode Active: Interactive vectors, OCR picker & simulators enabled'
              : 'Production Mode Active: Live inputs only, dummy samples hidden'}
          </Text>
        </Animated.View>

        {/* ── Auto Protection Banner ── */}
        <Animated.View style={[styles.autoProtectBanner, bannerAnimStyle]}>
          <View style={styles.autoProtectInfo}>
            <View style={styles.autoProtectTitleRow}>
              {/* Pulsing dot */}
              <Animated.View
                style={[
                  styles.pulsingDot,
                  dotAnimStyle,
                  { backgroundColor: isAutoProtectionActive ? '#22C55E' : Palette.neutral.slate500 },
                ]}
              />
              <BellRinging
                size={15}
                color={isAutoProtectionActive ? '#22C55E' : Palette.neutral.slate500}
                weight="bold"
              />
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
            trackColor={{ false: colors.inputBorder, true: Palette.brand.primary }}
            thumbColor="#FFFFFF"
          />
        </Animated.View>

        {/* ── Input Card ── */}
        <Animated.View style={[styles.inputCard, inputCardAnimStyle]}>
          {/* Card header row */}
          <View style={styles.inputCardHeader}>
            <Text style={styles.inputLabel}>INSPECT SUSPICIOUS MESSAGE, LINK, OR SCREENSHOT</Text>
            <TouchableOpacity
              style={[styles.ocrButton, isProcessingOcr && styles.ocrButtonDisabled]}
              onPress={handlePickScreenshot}
              disabled={isProcessingOcr}
            >
              {isProcessingOcr ? (
                <ActivityIndicator size="small" color={Palette.brand.primary} />
              ) : (
                <>
                  <Camera size={13} color={Palette.brand.primary} weight="bold" />
                  <Text style={styles.ocrButtonText}>Upload Image</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* OCR preview strip */}
          {ocrImage && (
            <View style={styles.ocrPreviewWrap}>
              <ImageSquare size={14} color={Palette.brand.primary} weight="bold" />
              <Text style={styles.ocrPreviewText} numberOfLines={1}>
                Text recognized from screenshot
              </Text>
              <TouchableOpacity onPress={() => setOcrImage(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={13} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Text input */}
          <TextInput
            style={styles.textInput}
            placeholder="Paste SMS, WhatsApp text, Hinglish/Regional text, or tap 'Upload Image' above..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={inputText}
            onChangeText={setInputText}
          />

          {/* ── Analyze Signals — full width ── */}
          <TouchableOpacity
            style={[styles.analyzeButton, !inputText.trim() && styles.analyzeButtonDisabled]}
            onPress={() => handleAnalyze()}
            disabled={!inputText.trim()}
            activeOpacity={0.82}
          >
            <Sparkle size={18} color="#FFFFFF" weight="bold" />
            <Text style={styles.analyzeButtonText}>Analyze Signals</Text>
          </TouchableOpacity>

          {/* ── Secondary action row ── */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.clipboardScanBtn} onPress={handlePasteAndScan} activeOpacity={0.75}>
              <ClipboardText size={15} color={Palette.brand.primary} />
              <Text style={styles.clipboardScanBtnText}>Check Clipboard</Text>
            </TouchableOpacity>

            {inputText.length > 0 && (
              <TouchableOpacity style={styles.iconButton} onPress={handleClear} activeOpacity={0.75}>
                <Trash size={17} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* ── Demo Benchmark Section ── */}
        {isDemoMode && (
          <View style={styles.quickTestsContainer}>
            {/* Divider with centered label */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.testLabel}>BENCHMARK SCENARIOS</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Simulate Live SMS pill */}
            <View style={styles.testHeaderRow}>
              <TouchableOpacity style={styles.simulateIncomingBtn} onPress={handleSimulateIncomingSms} activeOpacity={0.75}>
                <Lightning size={12} color={Palette.brand.primary} weight="bold" />
                <Text style={styles.simulateIncomingText}>Simulate Live SMS</Text>
              </TouchableOpacity>
            </View>

            {/* Horizontal chip scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sampleButtonsRow}
            >
              <TouchableOpacity
                style={styles.sampleButton}
                onPress={() => loadSample(SAMPLE_SCAM_SMS)}
                activeOpacity={0.75}
              >
                <ClipboardText size={13} color={Palette.brand.primary} />
                <Text style={styles.sampleButtonText}>KYC Phish (EN)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sampleButton}
                onPress={() => handleSimulateOcr(0)}
                activeOpacity={0.75}
              >
                <Camera size={13} color={Palette.risk.dangerousDark} />
                <Text style={styles.sampleButtonText}>Simulate Screenshot OCR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sampleButton}
                onPress={() => loadSample(SAMPLE_REGIONAL_SMS)}
                activeOpacity={0.75}
              >
                <Translate size={13} color={Palette.risk.suspiciousDark} />
                <Text style={styles.sampleButtonText}>Electricity (Hinglish)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sampleButton}
                onPress={() => loadSample(SAMPLE_SAFE_SMS)}
                activeOpacity={0.75}
              >
                <ClipboardText size={13} color={Palette.risk.safeDark} />
                <Text style={styles.sampleButtonText}>Legit Alert</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* ── Evidence Card ── */}
        {analysisResult && (
          <Animated.View style={resultAnimStyle}>
            <EvidenceCard result={analysisResult} />
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },

  // Header
  header: {
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.8,
    textShadowColor: Palette.brand.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  appSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 17,
  },

  // Auto Protection Banner
  autoProtectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: Spacing.three,
  },
  autoProtectInfo: {
    flex: 1,
    marginRight: Spacing.two,
  },
  autoProtectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  autoProtectTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  autoProtectSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },

  // Input Card
  inputCard: {
    backgroundColor: colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: Spacing.three,
  },
  inputCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    flex: 1,
  },
  ocrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.5)',
    backgroundColor: 'rgba(59,130,246,0.08)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
  },
  ocrButtonDisabled: {
    borderColor: colors.inputBorder,
    backgroundColor: 'transparent',
  },
  ocrButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.brand.primary,
  },

  // OCR Preview
  ocrPreviewWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.inputBg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  ocrPreviewText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Text Input
  textInput: {
    minHeight: 100,
    backgroundColor: colors.inputBg,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    lineHeight: 22,
  },

  // Analyze Button — full width, tall
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: Radius.md,
    gap: 8,
    marginTop: Spacing.three,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  analyzeButtonDisabled: {
    backgroundColor: Palette.surface.elevated,
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // Secondary action row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.two,
  },
  clipboardScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
    backgroundColor: 'rgba(59,130,246,0.08)',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
  },
  clipboardScanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.brand.primary,
  },
  iconButton: {
    padding: 10,
    borderRadius: Radius.md,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },

  // Demo benchmark section
  quickTestsContainer: {
    marginBottom: Spacing.three,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.two,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  testLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  testHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.two,
  },
  simulateIncomingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
    backgroundColor: 'rgba(59,130,246,0.08)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
  },
  simulateIncomingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.brand.primary,
  },
  sampleButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sampleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
