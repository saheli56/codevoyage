import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Globe, ArrowRight, Warning, Key, ArrowBendDownRight, ArrowsSplit } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { scanUrlWithVirusTotal, UrlScanResult } from '@/services/urlIntelligence';
import { saveAnalysisResult } from '@/services/storageService';
import { useAppMode } from '@/context/AppModeContext';
import { useAppTheme } from '@/context/ThemeContext';
import { ModeBadge } from '@/components/ui/mode-badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { RiskBadge } from '@/components/ui/risk-badge';

const DEMO_TARGETS = [
  { label: 'Cloaked Bit.ly Phish', url: 'https://tinyurl.com/sbi-verify-kyc' },
  { label: 'Direct Phishing Link', url: 'http://sbi-kyc-verify.top/login' },
  { label: 'Electricity Bill Threat', url: 'http://bijli-bill-update.xyz/pay' },
  { label: 'Official Banking Site', url: 'https://onlinesbi.sbi' },
];

export default function UrlScannerScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode, virusTotalApiKey, setVirusTotalApiKey } = useAppMode();
  const { colors, isDark } = useAppTheme();

  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempKey, setTempKey] = useState(virusTotalApiKey || '');

  useEffect(() => {
    setTempKey(virusTotalApiKey || '');
  }, [virusTotalApiKey]);

  const handleScan = async (overrideUrl?: string) => {
    const target = overrideUrl !== undefined ? overrideUrl : urlInput;
    if (!target.trim()) return;

    setLoading(true);
    try {
      const scanRes = await scanUrlWithVirusTotal(target.trim(), virusTotalApiKey);
      setResult(scanRes);
      
      // Save record in analysis history format
      await saveAnalysisResult({
        id: `url-${Date.now()}`,
        timestamp: new Date().toISOString(),
        overallRisk: scanRes.overallRisk,
        riskScore: scanRes.riskScore,
        confidence: 0.95,
        summary: `ScamShield analyzed ${scanRes.domain}${scanRes.hasRedirect ? ` (Redirects to ${scanRes.finalDomain})` : ''}: ${scanRes.maliciousCount} engines flagged malicious, ${scanRes.suspiciousCount} flagged suspicious.`,
        signals: scanRes.signals,
        actions: [
          {
            id: 'act-1',
            title: scanRes.overallRisk === 'DANGEROUS' ? 'Block & Avoid Access' : 'Proceed with caution',
            description: 'Domain flagged with potential security vulnerabilities or phishing associations.',
            priority: scanRes.overallRisk === 'DANGEROUS' ? 'CRITICAL' : 'RECOMMENDED',
            actionType: scanRes.overallRisk === 'DANGEROUS' ? 'BLOCK' : 'VERIFY_OFFICIAL',
          }
        ],
        inputPayload: {
          rawContent: target.trim(),
          type: 'URL'
        }
      });
    } catch {
      Alert.alert('Scan Failed', 'Could not complete reputation audit for this domain.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async () => {
    await setVirusTotalApiKey(tempKey);
    setShowKeyConfig(false);
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
              <Globe size={22} color={colors.textPrimary} weight="fill" />
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>URL Intelligence</Text>
            </View>
            <View style={styles.headerRight}>
              <ThemeToggle />
              <ModeBadge />
            </View>
          </View>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Multi-hop redirect unroller & domain reputation scanner
          </Text>
        </View>

        {/* Input Panel */}
        <View style={[styles.inputPanel, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.panelTop}>
            <Text style={[styles.panelLabel, { color: colors.textMuted }]}>TARGET URL / SHORTENER</Text>
            <TouchableOpacity
              style={[
                styles.configPill,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={() => setShowKeyConfig(!showKeyConfig)}
            >
              <Key size={12} color={colors.textSecondary} weight="bold" />
              <Text style={[styles.configPillText, { color: colors.textSecondary }]}>
                {virusTotalApiKey ? 'VT API Active' : 'Configure API'}
              </Text>
            </TouchableOpacity>
          </View>

          {showKeyConfig && (
            <View style={[styles.keyDrawer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.keyTitle, { color: colors.textPrimary }]}>VirusTotal API Key</Text>
              <TextInput
                style={[styles.keyInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.textPrimary }]}
                placeholder="Enter 64-char API key..."
                placeholderTextColor={colors.textMuted}
                value={tempKey}
                onChangeText={setTempKey}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveKey}>
                <Text style={styles.saveKeyText}>Save Key</Text>
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={[
              styles.urlInput,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.textPrimary,
              },
            ]}
            placeholder="e.g. tinyurl.com/xyz or http://sbi-kyc-verify.top"
            placeholderTextColor={colors.textMuted}
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
            keyboardType="url"
          />

          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: Palette.brand.primary }, !urlInput.trim() && styles.btnDisabled]}
            onPress={() => handleScan()}
            disabled={!urlInput.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.scanBtnText}>Unroll & Audit URL Reputation</Text>
                <ArrowRight size={14} color="#FFFFFF" weight="bold" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Targets */}
        {isDemoMode && (
          <View style={styles.sandboxSection}>
            <Text style={[styles.sandboxLabel, { color: colors.textMuted }]}>PRELOADED DOMAIN VECTORS</Text>
            <View style={styles.chipsRow}>
              {DEMO_TARGETS.map((t, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.targetChip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  onPress={() => {
                    setUrlInput(t.url);
                    handleScan(t.url);
                  }}
                >
                  <Text style={[styles.targetChipText, { color: colors.textSecondary }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Result Breakdown */}
        {result && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.resultHeader, { borderBottomColor: colors.divider }]}>
              <View style={styles.resultHeaderLeft}>
                <Text style={[styles.resultKicker, { color: colors.textMuted }]}>AUDIT VERDICT</Text>
                <Text style={[styles.targetUrlText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {result.domain}
                </Text>
              </View>
              <RiskBadge level={result.overallRisk} score={result.riskScore} size="md" />
            </View>

            {/* Unrolled Redirect Chain (If Detected) */}
            {result.hasRedirect && (
              <View style={[styles.redirectTraceBox, { backgroundColor: isDark ? 'rgba(220, 38, 38, 0.08)' : 'rgba(220, 38, 38, 0.04)', borderColor: 'rgba(220, 38, 38, 0.2)' }]}>
                <View style={styles.redirectHeader}>
                  <ArrowsSplit size={14} color="#DC2626" weight="bold" />
                  <Text style={styles.redirectTitle}>CLOAKED REDIRECT CHAIN UNROLLED</Text>
                </View>

                <View style={styles.hopsList}>
                  {result.hops.map((hop, idx) => {
                    const isFinal = idx === result.hops.length - 1;
                    return (
                      <View key={idx} style={styles.hopRow}>
                        <View style={styles.hopIndex}>
                          <Text style={styles.hopIndexText}>{idx + 1}</Text>
                        </View>
                        <View style={styles.hopInfo}>
                          <Text style={[styles.hopDomain, { color: isFinal ? '#DC2626' : colors.textPrimary }]}>
                            {hop.domain} {isFinal ? '(Final Landing Destination)' : '(HTTP 301/302 Redirect)'}
                          </Text>
                          <Text style={[styles.hopUrl, { color: colors.textMuted }]} numberOfLines={1}>
                            {hop.url}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Reputation Engines Breakdown */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricTile, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderColor: colors.cardBorder }]}>
                <Text style={[styles.metricVal, { color: '#DC2626' }]}>{result.maliciousCount}</Text>
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>Malicious</Text>
              </View>

              <View style={[styles.metricTile, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderColor: colors.cardBorder }]}>
                <Text style={[styles.metricVal, { color: '#D97706' }]}>{result.suspiciousCount}</Text>
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>Suspicious</Text>
              </View>

              <View style={[styles.metricTile, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', borderColor: colors.cardBorder }]}>
                <Text style={[styles.metricVal, { color: '#059669' }]}>{result.harmlessCount}</Text>
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>Clean</Text>
              </View>
            </View>

            {result.signals.length > 0 && (
              <View style={styles.signalsWrap}>
                <Text style={[styles.signalsHeader, { color: colors.textMuted }]}>DETECTED THREAT SIGNALS</Text>
                {result.signals.map((s, idx) => (
                  <View key={idx} style={styles.signalLine}>
                    <Warning size={13} color="#DC2626" weight="bold" />
                    <Text style={[styles.signalLineText, { color: colors.textSecondary }]}>
                      {s.title}: {s.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
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
  panelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  configPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  configPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  keyDrawer: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  keyTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  keyInput: {
    height: 38,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    fontSize: 12,
  },
  saveKeyBtn: {
    backgroundColor: Palette.brand.primary,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
  },
  saveKeyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  urlInput: {
    height: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  sandboxSection: {
    gap: Spacing.two,
  },
  sandboxLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  targetChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  targetChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  resultHeaderLeft: {
    flex: 1,
    marginRight: Spacing.three,
    gap: 2,
  },
  resultKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  targetUrlText: {
    fontSize: 13,
    fontWeight: '600',
  },
  redirectTraceBox: {
    margin: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  redirectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redirectTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#DC2626',
  },
  hopsList: {
    gap: Spacing.two,
    marginTop: 2,
  },
  hopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  hopIndex: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  hopIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  hopInfo: {
    flex: 1,
  },
  hopDomain: {
    fontSize: 12,
    fontWeight: '700',
  },
  hopUrl: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  metricTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 2,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  metricSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  signalsWrap: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  signalsHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  signalLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  signalLineText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
});
