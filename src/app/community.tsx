import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UsersThree, Plus, ThumbsUp, ShieldCheck, Clock, Warning } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { CommunityReport } from '@/types/security';
import { getCommunityReports, upvoteReport } from '@/services/storageService';
import { ReportModal } from '@/components/ui/report-modal';

export default function CommunityFeedScreen() {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReports = async () => {
    setRefreshing(true);
    const data = await getCommunityReports();
    setReports(data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpvote = async (id: string) => {
    await upvoteReport(id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
  };

  const handleNewReport = (newReport: CommunityReport) => {
    setReports(prev => [newReport, ...prev]);
  };

  const renderItem = ({ item }: { item: CommunityReport }) => (
    <View style={styles.reportCard}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category.replace('_', ' ')}</Text>
        </View>
        <View style={styles.statusBadge}>
          {item.status === 'VERIFIED' ? (
            <View style={styles.statusVerified}>
              <ShieldCheck size={14} color={Palette.risk.safeDark} weight="bold" />
              <Text style={styles.statusVerifiedText}>VERIFIED THREAT</Text>
            </View>
          ) : (
            <View style={styles.statusPending}>
              <Clock size={14} color={Palette.risk.suspiciousDark} />
              <Text style={styles.statusPendingText}>UNDER REVIEW</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.reportTitle}>{item.title}</Text>
      
      {item.targetIdentifier && (
        <View style={styles.identifierBox}>
          <Warning size={14} color={Palette.risk.dangerous} weight="bold" />
          <Text style={styles.identifierText} numberOfLines={1}>{item.targetIdentifier}</Text>
        </View>
      )}

      {item.description ? (
        <Text style={styles.reportDesc}>{item.description}</Text>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.timestampText}>
          {new Date(item.reportedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>
        
        <TouchableOpacity style={styles.upvoteButton} onPress={() => handleUpvote(item.id)}>
          <ThumbsUp size={14} color={Palette.brand.primary} weight="bold" />
          <Text style={styles.upvoteText}>{item.upvotes} Confirmations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <View>
          <View style={styles.titleRow}>
            <UsersThree size={22} color={Palette.brand.primary} weight="bold" />
            <Text style={styles.heading}>Community Intel Feed</Text>
          </View>
          <Text style={styles.subheading}>Crowdsourced verified scam alerts & indicators</Text>
        </View>

        <TouchableOpacity style={styles.reportBtn} onPress={() => setIsModalOpen(true)}>
          <Plus size={16} color="#FFFFFF" weight="bold" />
          <Text style={styles.reportBtnText}>Report Scam</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchReports} />}
        showsVerticalScrollIndicator={false}
      />

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
    backgroundColor: Palette.neutral.slate50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Palette.neutral.slate200,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.neutral.slate900,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 11,
    color: Palette.neutral.slate500,
    marginTop: 2,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.brand.primary,
    paddingVertical: 8,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
  },
  reportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    padding: Spacing.four,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
    marginBottom: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  categoryBadge: {
    backgroundColor: Palette.neutral.slate100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.neutral.slate600,
    letterSpacing: 0.5,
  },
  statusBadge: {},
  statusVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.risk.safeLight,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
  },
  statusVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.risk.safeDark,
  },
  statusPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.risk.suspiciousLight,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
  },
  statusPendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.risk.suspiciousDark,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.neutral.slate900,
    marginBottom: Spacing.one,
  },
  identifierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.risk.dangerousLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    marginBottom: Spacing.two,
  },
  identifierText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: Palette.risk.dangerousDark,
    flex: 1,
  },
  reportDesc: {
    fontSize: 12,
    color: Palette.neutral.slate600,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Palette.neutral.slate100,
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
  timestampText: {
    fontSize: 11,
    color: Palette.neutral.slate400,
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.brand.primaryMuted,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
  },
  upvoteText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.brand.primaryDark,
  }
});
