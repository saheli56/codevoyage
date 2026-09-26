import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  UsersThree,
  Plus,
  ThumbsUp,
  ShieldCheck,
  Warning,
  Clock,
} from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { CommunityReport } from '@/types/security';
import { getCommunityReports, upvoteReport } from '@/services/storageService';
import { useAppMode } from '@/context/AppModeContext';
import { useAppTheme } from '@/context/ThemeContext';
import { ModeBadge } from '@/components/ui/mode-badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ReportModal } from '@/components/ui/report-modal';

export default function CommunityFeedScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode } = useAppMode();
  const { colors, isDark } = useAppTheme();

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
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  const handleNewReport = (newReport: CommunityReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.base }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <View style={styles.topRow}>
          <View style={styles.brandGroup}>
            <UsersThree size={22} color={colors.textPrimary} weight="fill" />
            <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>Community Intel</Text>
          </View>
          <View style={styles.headerRight}>
            <ThemeToggle />
            <ModeBadge />
            <TouchableOpacity style={styles.reportBtn} onPress={() => setIsModalOpen(true)}>
              <Plus size={13} color="#FFFFFF" weight="bold" />
              <Text style={styles.reportBtnText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>
          Crowdsourced scam intelligence and decentralized threat verifications
        </Text>
      </View>

      {/* Reports Feed */}
      {reports.length === 0 ? (
        <View style={styles.emptyWrap}>
          <UsersThree size={36} color={colors.textMuted} weight="duotone" />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Community Reports</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            {isDemoMode
              ? 'No seed reports loaded. Click Report to submit a threat vector.'
              : 'Live mode active. Pre-seeded threats hidden. Be the first to flag an active threat.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchReports} />}
          renderItem={({ item }) => {
            const isVerified = item.status === 'VERIFIED';
            return (
              <View
                style={[
                  styles.reportCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                      {item.category.replace('_', ' ')}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isVerified ? 'rgba(5, 150, 105, 0.08)' : 'rgba(217, 119, 6, 0.08)',
                        borderColor: isVerified ? 'rgba(5, 150, 105, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                      },
                    ]}
                  >
                    {isVerified ? (
                      <ShieldCheck size={11} color="#059669" weight="fill" />
                    ) : (
                      <Clock size={11} color="#D97706" weight="fill" />
                    )}
                    <Text
                      style={[
                        styles.statusText,
                        { color: isVerified ? '#059669' : '#D97706' },
                      ]}
                    >
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.reportTitle, { color: colors.textPrimary }]}>{item.title}</Text>

                {item.targetIdentifier && (
                  <View
                    style={[
                      styles.targetBox,
                      {
                        backgroundColor: isDark ? 'rgba(220, 38, 38, 0.08)' : 'rgba(220, 38, 38, 0.04)',
                        borderColor: 'rgba(220, 38, 38, 0.2)',
                      },
                    ]}
                  >
                    <Warning size={12} color="#DC2626" weight="fill" />
                    <Text style={[styles.targetText, { color: '#DC2626' }]} numberOfLines={1}>
                      {item.targetIdentifier}
                    </Text>
                  </View>
                )}

                {item.description ? (
                  <Text style={[styles.reportDesc, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                ) : null}

                <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    {new Date(item.reportedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.upvoteBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    onPress={() => handleUpvote(item.id)}
                    activeOpacity={0.7}
                  >
                    <ThumbsUp size={12} color={colors.textSecondary} weight="bold" />
                    <Text style={[styles.upvoteCount, { color: colors.textSecondary }]}>
                      {item.upvotes} Confirmations
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
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
  },
  header: {
    paddingHorizontal: Spacing.four,
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
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.brand.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 12,
  },
  listContent: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  reportCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  targetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  targetText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  reportDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  upvoteCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});
