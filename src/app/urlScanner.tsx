import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Globe, ShieldCheck, Warning, WarningOctagon, Sparkle, Key, ShieldPlus } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { scanUrlWithVirusTotal, UrlScanResult } from '@/services/urlIntelligence';
import { useAppMode } from '@/context/AppModeContext';
import { RiskBadge } from '@/components/ui/risk-badge';

export default function UrlScannerScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode, virusTotalApiKey, setVirusTotalApiKey } = useAppMode();
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempKey, setTempKey] = useState(virusTotalApiKey);

  const handleScan = async (targetUrl?: string) => {
    const url = (targetUrl !== undefined ? targetUrl : urlInput).trim();
    if (!url) return;
    setLoading(true);
    const res = await scanUrlWithVirusTotal(url, virusTotalApiKey);
    setResult(res);
    setLoading(false);
  };

  const handleSaveKey = async () => {
    await setVirusTotalApiKey(tempKey);
    setShowKeyConfig(false);
  };

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
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Globe size={22} color={Palette.brand.primary} weight="bold" />
            <Text style={styles.screenTitle}>URL & Phishing Inspector</Text>
          </View>
          <Text style={styles.screenSubtitle}>
            VirusTotal multi-engine security scanning & typosquatting detection.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>TARGET URL / HOSTNAME</Text>
            <TouchableOpacity 
              style={styles.keyToggleBtn}
              onPress={() => setShowKeyConfig(!showKeyConfig)}
            >
              <Key size={13} color={virusTotalApiKey ? Palette.risk.safeDark : Palette.neutral.slate600} />
              <Text style={styles.keyToggleText}>
                {virusTotalApiKey ? 'VT API Configured' : 'Configure VT API'}
              </Text>
            </TouchableOpacity>
          </View>

          {showKeyConfig && (
            <View style={styles.apiKeyBox}>
              <Text style={styles.apiKeyHelp}>
                Optional: Enter a free VirusTotal API key to enable live cloud engine queries.
              </Text>
              <TextInput
                style={styles.keyInput}
                placeholder="Paste VirusTotal API key..."
                placeholderTextColor={Palette.neutral.slate400}
                value={tempKey}
                onChangeText={setTempKey}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveKey}>
                <Text style={styles.saveKeyBtnText}>Save Key</Text>
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="e.g. sbi-kyc-verify.top or https://example.com"
            placeholderTextColor={Palette.neutral.slate400}
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={[styles.primaryButton, (!urlInput.trim() || loading) && styles.disabledButton]}
            onPress={() => handleScan()}
            disabled={!urlInput.trim() || loading}
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
        </View>

        {isDemoMode && (
          <View style={styles.benchmarks}>
            <Text style={styles.benchLabel}>DEMO BENCHMARK TARGETS</Text>
            <View style={styles.benchRow}>
              <TouchableOpacity 
                style={styles.benchBtn}
                onPress={() => {
                  setUrlInput('http://sbi-kyc-verify.top/login');
                  handleScan('http://sbi-kyc-verify.top/login');
                }}
              >
                <WarningOctagon size={13} color={Palette.risk.dangerous} />
                <Text style={styles.benchBtnText}>Fake SBI Phish</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.benchBtn}
                onPress={() => {
                  setUrlInput('https://hdfcbank.com');
                  handleScan('https://hdfcbank.com');
                }}
              >
                <ShieldCheck size={13} color={Palette.risk.safe} />
                <Text style={styles.benchBtnText}>Official Bank Site</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.domainTitle}>{result.domain}</Text>
                <Text style={styles.sourceTag}>Engine: {result.source}</Text>
              </View>
              <RiskBadge level={result.overallRisk} score={result.riskScore} size="md" />
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statBox, styles.statBoxDanger]}>
                <Text style={styles.statNumberDanger}>{result.maliciousCount}</Text>
                <Text style={styles.statLabel}>Malicious</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxWarn]}>
                <Text style={styles.statNumberWarn}>{result.suspiciousCount}</Text>
                <Text style={styles.statLabel}>Suspicious</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxSafe]}>
                <Text style={styles.statNumberSafe}>{result.harmlessCount}</Text>
                <Text style={styles.statLabel}>Clean Engines</Text>
              </View>
            </View>

            {result.signals.length > 0 && (
              <View style={styles.signalsSection}>
                <Text style={styles.signalsHeading}>SECURITY SIGNALS</Text>
                {result.signals.map(s => (
                  <View key={s.id} style={styles.signalRow}>
                    <Warning size={16} color={Palette.risk.dangerous} weight="bold" />
                    <View style={styles.signalTextContainer}>
                      <Text style={styles.signalTitle}>{s.title}</Text>
                      <Text style={styles.signalDesc}>{s.description}</Text>
                    </View>
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
    backgroundColor: Palette.neutral.slate50,
  },
  scrollContent: {
    padding: Spacing.four,
  },
  header: {
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  titleRow: {
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
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.neutral.slate500,
    letterSpacing: 0.8,
  },
  keyToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.neutral.slate100,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  keyToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.neutral.slate700,
  },
  apiKeyBox: {
    backgroundColor: Palette.neutral.slate50,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
    marginBottom: Spacing.two,
  },
  apiKeyHelp: {
    fontSize: 10,
    color: Palette.neutral.slate500,
    marginBottom: 6,
  },
  keyInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    color: Palette.neutral.slate900,
  },
  saveKeyBtn: {
    backgroundColor: Palette.brand.primary,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    alignItems: 'center',
    marginTop: 6,
  },
  saveKeyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: Palette.neutral.slate50,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 14,
    color: Palette.neutral.slate900,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
    marginBottom: Spacing.three,
  },
  primaryButton: {
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
  benchmarks: {
    marginTop: Spacing.three,
  },
  benchLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.neutral.slate400,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  benchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  benchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
  },
  benchBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.neutral.slate700,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
    marginTop: Spacing.three,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  domainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.neutral.slate900,
  },
  sourceTag: {
    fontSize: 11,
    color: Palette.neutral.slate400,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  statBox: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  statBoxDanger: {
    backgroundColor: Palette.risk.dangerousLight,
  },
  statBoxWarn: {
    backgroundColor: Palette.risk.suspiciousLight,
  },
  statBoxSafe: {
    backgroundColor: Palette.risk.safeLight,
  },
  statNumberDanger: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.risk.dangerousDark,
  },
  statNumberWarn: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.risk.suspiciousDark,
  },
  statNumberSafe: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.risk.safeDark,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.neutral.slate600,
    marginTop: 2,
  },
  signalsSection: {
    borderTopWidth: 1,
    borderTopColor: Palette.neutral.slate100,
    paddingTop: Spacing.two,
  },
  signalsHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.neutral.slate500,
    marginBottom: Spacing.two,
  },
  signalRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  signalTextContainer: {
    flex: 1,
  },
  signalTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.neutral.slate900,
  },
  signalDesc: {
    fontSize: 11,
    color: Palette.neutral.slate600,
    marginTop: 1,
  }
});
