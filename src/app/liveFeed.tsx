import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BellRinging,
  ShieldCheck,
  ChatCircleText,
  DeviceMobile,
  Trash,
  Sparkle,
} from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import {
  getLiveNotificationFeed,
  pushInterceptedNotification,
  clearLiveFeed,
  InterceptedNotification,
} from '@/services/liveNotificationFeed';
import {
  getStoredPermissions,
  requestAllSecurityPermissions,
  PermissionStatusState,
} from '@/services/permissionsManager';
import { useAppMode } from '@/context/AppModeContext';
import { useAppTheme } from '@/context/ThemeContext';
import { ModeBadge } from '@/components/ui/mode-badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { RiskBadge } from '@/components/ui/risk-badge';

export default function LiveFeedScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode } = useAppMode();
  const { colors, isDark } = useAppTheme();

  const [feed, setFeed] = useState<InterceptedNotification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'THREATS_ONLY' | 'SAFE_ONLY'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionStatusState | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFeed = async () => {
    setRefreshing(true);
    const data = await getLiveNotificationFeed(isDemoMode);
    setFeed(data);
    const perm = await getStoredPermissions();
    setPermissionState(perm);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(async () => {
      const data = await getLiveNotificationFeed(isDemoMode);
      setFeed(data);
    }, 4000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const handleGrantPermissions = async () => {
    const perm = await requestAllSecurityPermissions();
    setPermissionState(perm);
  };

  const handleClearFeed = async () => {
    await clearLiveFeed();
    setFeed([]);
  };

  const handleSimulateNewIncoming = async (type: 'WHATSAPP_PHISH' | 'SMS_BILL_SCAM' | 'SAFE_BANK') => {
    if (type === 'WHATSAPP_PHISH') {
      await pushInterceptedNotification(
        'WHATSAPP',
        'SBI Alerts Helpdesk',
        'Dear Customer, your NetBanking is deactivated due to PAN unlinked. Update at http://sbi-pan-kyc.buzz.'
      );
    } else if (type === 'SMS_BILL_SCAM') {
      await pushInterceptedNotification(
        'SMS',
        'VK-DISCOM',
        'Urgent: Power disconnection scheduled tonight at 9:30 PM. Pay Rs 450 to 9876543210@okaxis immediately.'
      );
    } else {
      await pushInterceptedNotification(
        'BANK_SMS',
        'AD-HDFCBK',
        'Rs 450.00 debited from HDFC Bank A/C ending 4021 on 26-Sep-2026. Avail Bal: Rs 42,100.00.'
      );
    }
    const updated = await getLiveNotificationFeed(isDemoMode);
    setFeed(updated);
  };

  const filteredFeed = feed.filter((item) => {
    if (filter === 'THREATS_ONLY') return item.analysis.overallRisk !== 'SAFE';
    if (filter === 'SAFE_ONLY') return item.analysis.overallRisk === 'SAFE';
    return true;
  });

  const isPermGranted = permissionState?.notificationListener === 'GRANTED';

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.base }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <View style={styles.topRow}>
          <View style={styles.brandGroup}>
            <BellRinging size={22} color={colors.textPrimary} weight="fill" />
            <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>Live Stream</Text>
          </View>
          <View style={styles.headerRight}>
            <ThemeToggle />
            <ModeBadge />
            {feed.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.clearBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: colors.cardBorder,
                  },
                ]}
                onPress={handleClearFeed}
              >
                <Trash size={13} color={colors.textSecondary} weight="bold" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>
          Real-time notification audit stream and intercepted scam alerts
        </Text>
      </View>

      {/* Permission Bar (if not granted) */}
      {!isPermGranted && (
        <View style={[styles.permCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.permTextWrap}>
            <Text style={[styles.permTitle, { color: colors.textPrimary }]}>Notification Interception Service</Text>
            <Text style={[styles.permDesc, { color: colors.textMuted }]}>
              Grant listener permission to intercept SMS and messaging notifications in real-time.
            </Text>
          </View>
          <TouchableOpacity style={styles.permBtn} onPress={handleGrantPermissions}>
            <Text style={styles.permBtnText}>Grant Access</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={[styles.filterBar, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'ALL' && [styles.filterTabActive, { borderBottomColor: Palette.brand.primary }]]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, { color: filter === 'ALL' ? colors.textPrimary : colors.textMuted }]}>
            All Events ({feed.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'THREATS_ONLY' && [styles.filterTabActive, { borderBottomColor: '#DC2626' }]]}
          onPress={() => setFilter('THREATS_ONLY')}
        >
          <Text style={[styles.filterText, { color: filter === 'THREATS_ONLY' ? '#DC2626' : colors.textMuted }]}>
            Threats Only
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'SAFE_ONLY' && [styles.filterTabActive, { borderBottomColor: '#059669' }]]}
          onPress={() => setFilter('SAFE_ONLY')}
        >
          <Text style={[styles.filterText, { color: filter === 'SAFE_ONLY' ? '#059669' : colors.textMuted }]}>
            Verified Safe
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feed List */}
      {filteredFeed.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ShieldCheck size={36} color={colors.textMuted} weight="duotone" />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Intercepted Notifications</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            {isDemoMode
              ? 'Use the simulation actions below to test real-time interception.'
              : 'Incoming messages and notifications will be logged and audited here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFeed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.feedList, { paddingBottom: insets.bottom + 120 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFeed} />}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.feedCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.7}
              >
                {/* Clean 2-column header */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.headerSenderGroup}>
                    <View
                      style={[
                        styles.sourceIconWrap,
                        {
                          backgroundColor:
                            item.sourceApp === 'WHATSAPP'
                              ? 'rgba(5, 150, 105, 0.1)'
                              : 'rgba(37, 99, 235, 0.1)',
                        },
                      ]}
                    >
                      {item.sourceApp === 'WHATSAPP' ? (
                        <ChatCircleText size={13} color="#059669" weight="fill" />
                      ) : (
                        <DeviceMobile size={13} color={Palette.brand.primary} weight="fill" />
                      )}
                    </View>
                    <View style={styles.senderInfo}>
                      <Text style={[styles.senderText, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.sender}
                      </Text>
                      <Text style={[styles.timeText, { color: colors.textMuted }]}>
                        {new Date(item.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>

                  <RiskBadge level={item.analysis.overallRisk} score={item.analysis.riskScore} size="sm" />
                </View>

                {/* Message Body */}
                <Text
                  style={[styles.msgText, { color: colors.textSecondary }]}
                  numberOfLines={isExpanded ? undefined : 2}
                >
                  {item.rawBody}
                </Text>

                {/* Expandable Evidence Breakdown */}
                {isExpanded && (
                  <View
                    style={[
                      styles.expandedBox,
                      {
                        backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.02)',
                        borderColor: colors.divider,
                      },
                    ]}
                  >
                    <Text style={[styles.summaryTitle, { color: colors.textMuted }]}>ANALYSIS SUMMARY</Text>
                    <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
                      {item.analysis.summary}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Sandbox Simulation Bar */}
      {isDemoMode && (
        <View style={[styles.simBar, { backgroundColor: colors.elevated, borderTopColor: colors.divider }]}>
          <Text style={[styles.simLabel, { color: colors.textMuted }]}>SIMULATE INCOMING</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.simScroll}>
            <TouchableOpacity style={styles.simBtn} onPress={() => handleSimulateNewIncoming('WHATSAPP_PHISH')}>
              <Text style={styles.simBtnText}>WhatsApp Phish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.simBtn} onPress={() => handleSimulateNewIncoming('SMS_BILL_SCAM')}>
              <Text style={styles.simBtnText}>Electricity SMS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.simBtn} onPress={() => handleSimulateNewIncoming('SAFE_BANK')}>
              <Text style={styles.simBtnText}>Legit Bank Debit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
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
  clearBtn: {
    padding: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tagline: {
    fontSize: 12,
  },
  permCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  permTextWrap: {
    flex: 1,
    marginRight: Spacing.three,
    gap: 2,
  },
  permTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  permDesc: {
    fontSize: 11,
  },
  permBtn: {
    backgroundColor: Palette.brand.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
  },
  permBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
  },
  filterTab: {
    paddingVertical: Spacing.three,
    marginRight: Spacing.four,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {},
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  feedList: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  feedCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  headerSenderGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderInfo: {
    flex: 1,
  },
  senderText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 10,
    marginTop: 1,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  expandedBox: {
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: 4,
    gap: 3,
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 16,
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
  simBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    gap: 4,
  },
  simLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  simScroll: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  simBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: 'rgba(37, 99, 235, 0.25)',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
  },
  simBtnText: {
    color: Palette.brand.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
