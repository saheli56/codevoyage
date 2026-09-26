import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UsersThree, Plus, ThumbsUp, ShieldCheck, Clock, Warning } from 'phosphor-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { CommunityReport } from '@/types/security';
import { getCommunityReports, upvoteReport } from '@/services/storageService';
import { useAppMode } from '@/context/AppModeContext';
import { ModeBadge } from '@/components/ui/mode-badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAppTheme } from '@/context/ThemeContext';
import { ReportModal } from '@/components/ui/report-modal';

function ReportCard({ item, index, onUpvote, colors, isDark }: { item: CommunityReport; index: number; onUpvote: (id: string) => void; colors: any; isDark: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(index * 70, withTiming(1, { duration: 400, easing: Easing.out(Easing.exp) }));
    translateY.value = withDelay(index * 70, withTiming(0, { duration: 400, easing: Easing.out(Easing.exp) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const isVerified = item.status === 'VERIFIED';

  return (
    <Animated.View style={[styles.reportCard, animStyle, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
          <Text style={[styles.categoryBadgeText, { color: colors.textSecondary }]}>{item.category.replace('_', ' ')}</Text>
        </View>
        {isVerified ? (
          <View style={styles.statusVerified}>
            <ShieldCheck size={12} color={Palette.risk.safe} weight="bold" />
            <Text style={styles.statusVerifiedText}>VERIFIED</Text>
          </View>
        ) : (
          <View style={styles.statusPending}>
            <Clock size={12} color={Palette.risk.suspicious} />
            <Text style={styles.statusPendingText}>REVIEW</Text>
          </View>
        )}
      </View>

      <Text style={[styles.reportTitle, { color: colors.textPrimary }]}>{item.title}</Text>

      {item.targetIdentifier && (
        <View style={styles.identifierBox}>
          <Warning size={13} color={Palette.risk.dangerous} weight="bold" />
          <Text style={styles.identifierText} numberOfLines={1}>{item.targetIdentifier}</Text>
        </View>
      )}

      {item.description ? (
        <Text style={[styles.reportDesc, { color: colors.textSecondary }]}>{item.description}</Text>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={[styles.timestampText, { color: colors.textMuted }]}>
          {new Date(item.reportedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>

        <TouchableOpacity style={styles.upvoteButton} onPress={() => onUpvote(item.id)}>
          <ThumbsUp size={13} color={Palette.brand.primaryLight} weight="bold" />
          <Text style={styles.upvoteText}>{item.upvotes}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function CommunityFeedScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { isDemoMode } = useAppMode();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReports = async () => {
    setRefreshing(true);
    const data = await getCommunityReports(isDemoMode);
    setReports(data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReports();
  }, [isDemoMode]);

  const handleUpvote = async (id: string) => {
    await upvoteReport(id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
  };

  const handleNewReport = (newReport: CommunityReport) => {
    setReports(prev => [newReport, ...prev]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.base }]}>
      <View style={[styles.topBar, { backgroundColor: colors.elevated, borderBottomColor: colors.divider }]}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            <UsersThree size={20} color={Palette.brand.primaryLight} weight="bold" />
            <Text style={[styles.heading, { color: colors.textPrimary }]}>Community Intel</Text>
          </View>
          <View style={styles.topRowRight}>
            <ModeBadge />
            <ThemeToggle />
            <TouchableOpacity style={styles.reportBtn} onPress={() => setIsModalOpen(true)}>
              <Plus size={14} color="#FFFFFF" weight="bold" />
              <Text style={styles.reportBtnText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.subheading, { color: colors.textSecondary }]}>
          {isDemoMode
            ? 'Crowdsourced verified scam alerts & seed threats'
            : 'Live decentralized community threat feed'}
        </Text>
      </View>

      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderColor: colors.cardBorder }]}>
            <UsersThree size={36} color={Palette.text.muted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No Reports Yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            {isDemoMode
              ? 'No demo threats loaded. Reports will appear here.'
              : 'Live mode: all pre-seeded dummy reports are hidden. Be the first to flag an active threat.'}
          </Text>
          <TouchableOpacity style={styles.emptyReportBtn} onPress={() => setIsModalOpen(true)}>
            <Plus size={15} color="#FFFFFF" weight="bold" />
            <Text style={styles.emptyReportBtnText}>Submit First Report</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ReportCard item={item} index={index} onUpvote={handleUpvote} colors={colors} isDark={isDark} />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchReports} tintColor={Palette.brand.primaryLight} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ReportModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReportSubmitted={handleNewReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surface.base,
  },
  topBar: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    backgroundColor: Palette.surface.elevated,
    borderBottomWidth: 1,
    borderBottomColor: Palette.surface.divider,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.text.primary,
    letterSpacing: -0.4,
  },
  subheading: {
    fontSize: 11,
    color: Palette.text.secondary,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.brand.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  reportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  reportCard: {
    backgroundColor: Palette.surface.card,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.surface.cardBorder,
    marginBottom: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.text.secondary,
    letterSpacing: 0.6,
  },
  statusVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,211,238,0.1)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.25)',
  },
  statusVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.risk.safe,
    letterSpacing: 0.5,
  },
  statusPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251,191,36,0.1)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
  },
  statusPendingText: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.risk.suspicious,
    letterSpacing: 0.5,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.text.primary,
    marginBottom: Spacing.two,
    lineHeight: 20,
  },
  identifierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(248,113,113,0.08)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
  },
  identifierText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: Palette.risk.dangerous,
    flex: 1,
  },
  reportDesc: {
    fontSize: 12,
    color: Palette.text.secondary,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Palette.surface.divider,
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
  timestampText: {
    fontSize: 11,
    color: Palette.text.muted,
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(59,130,246,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
  },
  upvoteText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.brand.primaryLight,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.surface.cardBorder,
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text.secondary,
    marginBottom: Spacing.two,
  },
  emptySubtext: {
    fontSize: 12,
    color: Palette.text.muted,
    textAlign: 'center',
    marginBottom: Spacing.four,
    lineHeight: 18,
  },
  emptyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: Palette.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
  },
  emptyReportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
