import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Globe,
  ShieldCheck,
  Warning,
  WarningOctagon,
  Sparkle,
  Key,
} from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { scanUrlWithVirusTotal, UrlScanResult } from '@/services/urlIntelligence';
import { useAppMode } from '@/context/AppModeContext';
import { ModeBadge } from '@/components/ui/mode-badge';
import { RiskBadge } from '@/components/ui/risk-badge';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// ---------------------------------------------------------------------------
// Animated stat number — fades in with a small delay
// ---------------------------------------------------------------------------
interface AnimatedStatProps {
  value: number;
  color: string;
}

function AnimatedStat({ value, color }: AnimatedStatProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
  }, [value, opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Text style={[styles.statNumber, { color }, animStyle]}>
      {value}
    </Animated.Text>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function UrlScannerScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode, virusTotalApiKey, setVirusTotalApiKey } = useAppMode();
  const { colors } = useAppTheme();

  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempKey, setTempKey] = useState(virusTotalApiKey);

  // Screen mount fade-in
  const screenOpacity = useSharedValue(0);
  useEffect(() => {
    screenOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
  }, [screenOpacity]);
  const screenAnimStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

  // Scan button pulse when loading
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    if (loading) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [loading, pulseScale]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  // Result card slide-up
  const resultTranslateY = useSharedValue(24);
  const resultOpacity = useSharedValue(0);
  useEffect(() => {
    if (result) {
      resultTranslateY.value = withSpring(0, { damping: 18, stiffness: 180 });
      resultOpacity.value = withTiming(1, { duration: 350 });
    } else {
      resultTranslateY.value = 24;
      resultOpacity.value = 0;
    }
  }, [result, resultTranslateY, resultOpacity]);
  const resultAnimStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ translateY: resultTranslateY.value }],
  }));

  // ----- Logic (unchanged) -----
  const handleScan = useCallback(async (targetUrl?: string) => {
    const url = (targetUrl !== undefined ? targetUrl : urlInput).trim();
    if (!url) return;
    setLoading(true);
    const res = await scanUrlWithVirusTotal(url, virusTotalApiKey);
    setResult(res);
    setLoading(false);
  }, [urlInput, virusTotalApiKey]);

  const handleSaveKey = async () => {
    await setVirusTotalApiKey(tempKey);
    setShowKeyConfig(false);
  };

  // ----- Derived risk colour for result top bar -----
  const riskBarColor =
    result?.overallRisk === 'DANGEROUS'
      ? Palette.risk.dangerous
      : result?.overallRisk === 'SUSPICIOUS'
      ? Palette.risk.suspicious
      : Palette.risk.safe;

  return (
    <Animated.View style={[styles.rootContainer, { backgroundColor: colors.base, paddingTop: insets.top }, screenAnimStyle]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ---- Header ---- */}
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View>
                <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>URL Inspector</Text>
                <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>VirusTotal multi-engine scan</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ThemeToggle />
                <ModeBadge />
              </View>
            </View>
          </View>

          {/* ---- Scan card ---- */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Top row: label + API config pill */}
            <View style={styles.inputHeader}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>TARGET URL</Text>
              <TouchableOpacity
                style={[
                  styles.keyToggleBtn,
                  { borderColor: colors.cardBorder },
                  virusTotalApiKey ? styles.keyToggleBtnActive : null,
                ]}
                onPress={() => setShowKeyConfig(!showKeyConfig)}
              >
                <Key
                  size={12}
                  color={virusTotalApiKey ? Palette.risk.safeDark : colors.textMuted}
                />
                <Text
                  style={[
                    styles.keyToggleText,
                    { color: colors.textMuted },
                    virusTotalApiKey ? styles.keyToggleTextActive : null,
                  ]}
                >
                  {virusTotalApiKey ? 'VT API Configured' : 'Configure VT API'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* API key config panel */}
            {showKeyConfig && (
              <View style={[styles.apiKeyBox, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                <Text style={[styles.apiKeyHelp, { color: colors.textMuted }]}>
                  Optional: Enter a free VirusTotal API key to enable live cloud engine queries.
                </Text>
                <TextInput
                  style={[styles.keyInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                  placeholder="Paste VirusTotal API key..."
                  placeholderTextColor={colors.textMuted}
                  value={tempKey}
                  onChangeText={setTempKey}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveKey}>
                  <Text style={styles.saveKeyBtnText}>Save Key</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* URL input */}
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
              placeholder="e.g. sbi-kyc-verify.top or https://example.com"
              placeholderTextColor={colors.textMuted}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
            />

            {/* Scan button with pulse wrap */}
            <Animated.View style={pulseStyle}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!urlInput.trim() || loading) && styles.disabledButton,
                ]}
                onPress={() => handleScan()}
                disabled={!urlInput.trim() || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Sparkle size={18} color="#FFFFFF" weight="bold" />
                    <Text style={styles.primaryButtonText}>Scan URL Reputation</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* ---- Demo benchmark chips ---- */}
          {isDemoMode && (
            <View style={styles.benchmarks}>
              <Text style={[styles.benchLabel, { color: colors.textMuted }]}>DEMO BENCHMARK TARGETS</Text>
              <View style={styles.benchRow}>
                <TouchableOpacity
                  style={[styles.benchBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  onPress={() => {
                    setUrlInput('http://sbi-kyc-verify.top/login');
                    handleScan('http://sbi-kyc-verify.top/login');
                  }}
                >
                  <WarningOctagon size={13} color={Palette.risk.dangerous} />
                  <Text style={[styles.benchBtnText, { color: colors.textSecondary }]}>Fake SBI Phish</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.benchBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  onPress={() => {
                    setUrlInput('https://hdfcbank.com');
                    handleScan('https://hdfcbank.com');
                  }}
                >
                  <ShieldCheck size={13} color={Palette.risk.safe} />
                  <Text style={[styles.benchBtnText, { color: colors.textSecondary }]}>Official Bank Site</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ---- Result card ---- */}
          {result && (
            <Animated.View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, resultAnimStyle]}>
              {/* Colored top bar */}
              <View style={[styles.resultTopBar, { backgroundColor: riskBarColor }]} />

              {/* Header row */}
              <View style={styles.resultHeader}>
                <View style={styles.resultHeaderLeft}>
                  <Text style={[styles.domainTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {result.domain}
                  </Text>
                  <Text style={[styles.sourceTag, { color: colors.textMuted }]}>Engine: {result.source}</Text>
                </View>
                <RiskBadge level={result.overallRisk} score={result.riskScore} size="md" />
              </View>

              {/* 3-column stats */}
              <View style={styles.statsGrid}>
                <View style={[styles.statBox, styles.statBoxDanger]}>
                  <AnimatedStat value={result.maliciousCount} color={Palette.risk.dangerous} />
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Malicious</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxWarn]}>
                  <AnimatedStat value={result.suspiciousCount} color={Palette.risk.suspicious} />
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Suspicious</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxSafe]}>
                  <AnimatedStat value={result.harmlessCount} color={Palette.risk.safe} />
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Clean</Text>
                </View>
              </View>

              {/* Security signals */}
              {result.signals.length > 0 && (
                <View style={[styles.signalsSection, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.signalsHeading, { color: colors.textMuted }]}>SECURITY SIGNALS</Text>
                  {result.signals.map((s) => (
                    <View key={s.id} style={styles.signalRow}>
                      <Warning size={16} color={Palette.risk.dangerous} weight="bold" />
                      <View style={styles.signalTextContainer}>
                        <Text style={[styles.signalTitle, { color: colors.textPrimary }]}>{s.title}</Text>
                        <Text style={[styles.signalDesc, { color: colors.textSecondary }]}>{s.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  rootContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
  },

  // --- Header ---
  header: {
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  screenSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },

  // --- Scan card ---
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  keyToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
  },
  keyToggleBtnActive: {
    borderColor: Palette.risk.safeBorder,
  },
  keyToggleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  keyToggleTextActive: {
    color: Palette.risk.safeDark,
  },

  // --- API key config panel ---
  apiKeyBox: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  apiKeyHelp: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 16,
  },
  keyInput: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    marginBottom: 8,
  },
  saveKeyBtn: {
    backgroundColor: Palette.brand.primaryDark,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  saveKeyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // --- URL input ---
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },

  // --- Primary / scan button ---
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.brand.primaryDark,
    paddingVertical: 14,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  disabledButton: {
    backgroundColor: Palette.neutral.slate700,
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // --- Demo benchmark chips ---
  benchmarks: {
    marginTop: Spacing.three,
  },
  benchLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: Spacing.two,
  },
  benchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  benchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  benchBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // --- Result card ---
  resultCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.three,
    overflow: 'hidden',
  },
  resultTopBar: {
    height: 4,
    width: '100%',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    paddingBottom: Spacing.three,
  },
  resultHeaderLeft: {
    flex: 1,
    marginRight: Spacing.two,
  },
  domainTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sourceTag: {
    fontSize: 11,
    marginTop: 2,
  },

  // --- Stats grid ---
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  statBox: {
    flex: 1,
    paddingVertical: Spacing.two + 4,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderLeftWidth: 3,
  },
  statBoxDanger: {
    backgroundColor: Palette.risk.dangerousLight,
    borderLeftColor: Palette.risk.dangerous,
  },
  statBoxWarn: {
    backgroundColor: Palette.risk.suspiciousLight,
    borderLeftColor: Palette.risk.suspicious,
  },
  statBoxSafe: {
    backgroundColor: Palette.risk.safeLight,
    borderLeftColor: Palette.risk.safe,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  // --- Signals section ---
  signalsSection: {
    borderTopWidth: 1,
    marginHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  signalsHeading: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.two,
  },
  signalRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
    alignItems: 'flex-start',
  },
  signalTextContainer: {
    flex: 1,
  },
  signalTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  signalDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
});
