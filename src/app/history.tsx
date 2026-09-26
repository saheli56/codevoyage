import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ClockCounterClockwise,
  Trash,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Sparkle,
} from 'phosphor-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { AnalysisResult } from '@/types/security';
import { getAnalysisHistory, clearAnalysisHistory } from '@/services/storageService';
import { RiskBadge } from '@/components/ui/risk-badge';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function HistoryCardItem({
  item,
  index,
  isSelected,
  onToggle,
  colors,
  isDark,
}: {
  item: AnalysisResult;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
  colors: any;
  isDark: boolean;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(index * 60, withTiming(1, { duration: 400, easing: Easing.out(Easing.exp) }));
    translateY.value = withDelay(index * 60, withTiming(0, { duration: 400, easing: Easing.out(Easing.exp) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const riskBorderColor =
    item.overallRisk === 'DANGEROUS'
      ? Palette.risk.dangerous
      : item.overallRisk === 'SUSPICIOUS'
      ? Palette.risk.suspicious
      : Palette.risk.safe;

  return (
    <Animated.View style={[animStyle]}>
      <TouchableOpacity
        style={[
          styles.historyCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.leftRiskIndicator, { backgroundColor: riskBorderColor }]} />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.typeText, { color: colors.textSecondary }]}>
                  {item.inputPayload.type}
                </Text>
              </View>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {new Date(item.timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <RiskBadge level={item.overallRisk} score={item.riskScore} size="sm" />
          </View>

          <Text style={[styles.rawContent, { color: colors.textPrimary }]} numberOfLines={2}>
            {item.inputPayload.rawContent}
          </Text>

          <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
            <Text style={[styles.signalsCount, { color: colors.textSecondary }]}>
              {item.signals.length} Signal{item.signals.length !== 1 ? 's' : ''} Identified
            </Text>
            <View style={styles.expandPill}>
              <Text style={[styles.expandText, { color: Palette.brand.primary }]}>
                {isSelected ? 'Collapse' : 'Inspect'}
              </Text>
              <ArrowUpRight size={12} color={Palette.brand.primary} weight="bold" />
            </View>
          </View>

          {isSelected && (
            <View
              style={[
                styles.expandedDetails,
                {
                  backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)',
                  borderColor: colors.divider,
                },
              ]}
            >
              <Text style={[styles.summaryHeader, { color: colors.textMuted }]}>ASSESSMENT SUMMARY</Text>
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{item.summary}</Text>

              {item.actions.length > 0 && (
                <View style={styles.actionsList}>
                  <Text style={[styles.actionsHeader, { color: colors.textMuted }]}>RECOMMENDED STEPS</Text>
                  {item.actions.map((act) => (
                    <View key={act.id} style={styles.actionRow}>
                      <View style={[styles.actionBullet, { backgroundColor: Palette.brand.primary }]} />
                      <Text style={[styles.actionText, { color: colors.textPrimary }]}>{act.title}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  const fetchHistory = async () => {
    const data = await getAnalysisHistory();
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all local scan and risk assessment records?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearAnalysisHistory();
            setHistory([]);
            setSelectedResult(null);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.base }]}>
      {/* ── Top Navigation Bar ── */}
      <View style={[styles.topBar, { backgroundColor: colors.elevated, borderBottomColor: colors.divider }]}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            <ClockCounterClockwise size={22} color={Palette.brand.primary} weight="bold" />
            <Text style={[styles.heading, { color: colors.textPrimary }]}>Threat History</Text>
          </View>
          <View style={styles.topActions}>
            <ThemeToggle />
            {history.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.clearBtn,
                  {
                    backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)',
                    borderColor: isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)',
                  },
                ]}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Trash size={13} color={Palette.risk.dangerous} weight="bold" />
                <Text style={[styles.clearBtnText, { color: Palette.risk.dangerous }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={[styles.subheading, { color: colors.textSecondary }]}>
          Persistent cryptographic logs of audited messages, links, and transactions
        </Text>
      </View>

      {/* ── Content ── */}
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconWrap,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <ShieldCheck size={38} color={Palette.risk.safe} weight="duotone" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Audit Log Empty</Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            Analyses performed on SMS, URLs, QR codes, or UPI transactions are securely recorded here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <HistoryCardItem
              item={item}
              index={index}
              isSelected={selectedResult?.id === item.id}
              onToggle={() => setSelectedResult(selectedResult?.id === item.id ? null : item)}
              colors={colors}
              isDark={isDark}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subheading: {
    fontSize: 11,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.three,
  },
  historyCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.two,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  leftRiskIndicator: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
  },
  rawContent: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 2,
  },
  signalsCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  expandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  expandText: {
    fontSize: 11,
    fontWeight: '700',
  },
  expandedDetails: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  summaryHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionsList: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionsHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  actionBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
