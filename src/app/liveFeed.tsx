import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BellRinging,
  ShieldWarning,
  ShieldCheck,
  Lightning,
  ChatCircleDots,
  DeviceMobile,
  CreditCard,
  Trash,
  Keyboard,
  CheckCircle,
  Shield,
} from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import {
  InterceptedNotification,
  getLiveNotificationFeed,
  pushInterceptedNotification,
  clearLiveFeed,
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

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bgBase: '#050911',
  bgCard: '#111827',
  cardBorder: 'rgba(255,255,255,0.07)',
  primary: '#3B82F6',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  dangerous: '#F87171',
  suspicious: '#FBBF24',
  safe: '#22D3EE',
  dangerousBg: 'rgba(248,113,113,0.08)',
  suspiciousBg: 'rgba(251,191,36,0.08)',
  safeBg: 'rgba(34,211,238,0.08)',
  amberBorder: 'rgba(251,191,36,0.35)',
  amberBg: 'rgba(251,191,36,0.06)',
  redPillBg: 'rgba(248,113,113,0.14)',
  greenPillBg: 'rgba(34,211,238,0.12)',
  bluePillBg: 'rgba(59,130,246,0.90)',
} as const;

// ─── FeedCard (animated) ──────────────────────────────────────────────────────
interface FeedCardProps {
  item: InterceptedNotification;
  index: number;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  getSourceIcon: (app: string) => React.ReactElement;
  colors: any;
  isDark: boolean;
}

function FeedCard({
  item,
  index,
  expandedId,
  setExpandedId,
  getSourceIcon,
  colors,
  isDark,
}: FeedCardProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  useEffect(() => {
    const delay = index * 60;
    opacity.value = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 350, easing: Easing.out(Easing.quad) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const isDangerous = item.analysis.overallRisk === 'DANGEROUS';
  const isSuspicious = item.analysis.overallRisk === 'SUSPICIOUS';
  const isExpanded = expandedId === item.id;

  const accentColor = isDangerous ? C.dangerous : isSuspicious ? C.suspicious : 'transparent';
  const cardBg = isDangerous ? (isDark ? C.dangerousBg : 'rgba(248,113,113,0.12)') : isSuspicious ? (isDark ? C.suspiciousBg : 'rgba(251,191,36,0.12)') : colors.card;

  return (
    <Animated.View style={[animatedStyle, styles.cardAnimWrapper]}>
      <TouchableOpacity
        style={[
          styles.feedCard,
          { backgroundColor: cardBg, borderColor: colors.cardBorder },
          (isDangerous || isSuspicious) && {
            borderLeftWidth: 4,
            borderLeftColor: accentColor,
          },
        ]}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.78}
      >
        {/* Top row */}
        <View style={styles.cardTopRow}>
          <View style={styles.sourceGroup}>
            <View style={[
              styles.sourceIconChip,
              { backgroundColor: isDangerous ? 'rgba(248,113,113,0.15)' : isSuspicious ? 'rgba(251,191,36,0.15)' : 'rgba(59,130,246,0.13)' },
            ]}>
              {getSourceIcon(item.sourceApp)}
            </View>
            <Text style={[styles.sourceAppName, { color: colors.textPrimary }]}>{item.sourceApp}</Text>
            <Text style={[styles.senderText, { color: colors.textSecondary }]}>• {item.sender}</Text>
          </View>
          <RiskBadge level={item.analysis.overallRisk} score={item.analysis.riskScore} size="sm" />
        </View>

        {/* Message body */}
        <Text style={[styles.rawMessageText, { color: isDark ? 'rgba(241,245,249,0.82)' : 'rgba(15,23,42,0.82)' }]} numberOfLines={isExpanded ? undefined : 2}>
          {item.rawBody}
        </Text>

        {/* Bottom row */}
        <View style={[styles.cardBottomRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {new Date(item.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          {isDangerous ? (
            <View style={styles.threatFlag}>
              <ShieldWarning size={13} color={C.dangerous} weight="bold" />
              <Text style={styles.threatFlagText}>Flagged Threat</Text>
            </View>
          ) : (
            <View style={styles.safeFlag}>
              <ShieldCheck size={13} color={C.safe} weight="bold" />
              <Text style={styles.safeFlagText}>Verified Safe</Text>
            </View>
          )}
        </View>

        {/* Expanded signals */}
        {isExpanded && item.analysis.signals.length > 0 && (
          <View style={styles.expandedSignalsBox}>
            <Text style={styles.signalsHeading}>THREAT SIGNALS DETECTED:</Text>
            {item.analysis.signals.map((s) => (
              <View key={s.id} style={styles.signalItem}>
                <Text style={styles.signalTitle}>• {s.title}</Text>
                <Text style={styles.signalDesc}>{s.description}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── FilterPill (animated press) ─────────────────────────────────────────────
interface FilterPillProps {
  label: string;
  active: boolean;
  onPress: () => void;
  activeStyle: object;
  activeTextStyle: object;
}

function FilterPill({ label, active, onPress, activeStyle, activeTextStyle }: FilterPillProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.filterPill, active && activeStyle, animStyle]}>
        <Text style={[styles.filterText, active && activeTextStyle]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── PermissionBanner (pulsing left border) ───────────────────────────────────
function PermissionBanner({ onGrant }: { onGrant: () => void }) {
  const borderOpacity = useSharedValue(0.35);

  useEffect(() => {
    borderOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    borderLeftColor: `rgba(251,191,36,${borderOpacity.value})`,
  }));

  return (
    <Animated.View style={[styles.permissionBanner, pulseStyle]}>
      <View style={styles.permissionInfo}>
        <View style={styles.permHeaderRow}>
          <Keyboard size={14} color={C.suspicious} weight="bold" />
          <Text style={styles.permissionTitle}>SMS, Notification & Keyboard Guard</Text>
        </View>
        <Text style={styles.permissionSub}>
          Enable Android Notification Listener & Keyboard Input Guard to detect smishing and phishing keystrokes in real-time.
        </Text>
      </View>
      <TouchableOpacity style={styles.grantBtn} onPress={onGrant}>
        <Text style={styles.grantBtnText}>Grant Access</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LiveFeedScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode } = useAppMode();
  const { colors, isDark } = useAppTheme();
  const [feed, setFeed] = useState<InterceptedNotification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'THREATS_ONLY' | 'SAFE_ONLY'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionStatusState>({
    smsPermission: 'PROMPT',
    notificationListener: 'PROMPT',
    keyboardProtection: 'PROMPT',
    overlayPermission: 'PROMPT',
  });

  const fetchFeed = async () => {
    setRefreshing(true);
    const data = await getLiveNotificationFeed(isDemoMode);
    setFeed(data);
    const perms = await getStoredPermissions();
    setPermissionState(perms);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFeed();
  }, [isDemoMode]);

  const handleGrantPermissions = async () => {
    const updated = await requestAllSecurityPermissions();
    setPermissionState(updated);
  };

  const handleSimulateNewIncoming = async (type: 'DANGEROUS' | 'SAFE') => {
    if (type === 'DANGEROUS') {
      const created = await pushInterceptedNotification(
        'WHATSAPP',
        'Electricity Authority Helpdesk',
        'ALERT: Electricity bill pending for consumer #884920. Power disconnection order issued for tonight. Pay INR 450 to avoid cutoff.'
      );
      setFeed(prev => [created, ...prev]);
    } else {
      const created = await pushInterceptedNotification(
        'GPAY',
        'Zomato Order',
        'You paid INR 320 to Zomato for your dinner order. Transaction ID: UPI/59201948.'
      );
      setFeed(prev => [created, ...prev]);
    }
  };

  const handleClear = async () => {
    await clearLiveFeed();
    setFeed([]);
  };

  const filteredFeed = feed.filter(item => {
    if (filter === 'THREATS_ONLY')
      return item.analysis.overallRisk === 'DANGEROUS' || item.analysis.overallRisk === 'SUSPICIOUS';
    if (filter === 'SAFE_ONLY') return item.analysis.overallRisk === 'SAFE';
    return true;
  });

  const getSourceIcon = (app: string): React.ReactElement => {
    switch (app) {
      case 'WHATSAPP':
        return <ChatCircleDots size={16} color="#25D366" weight="fill" />;
      case 'GPAY':
      case 'PHONEPE':
      case 'PAYTM':
        return <CreditCard size={16} color={C.primary} weight="bold" />;
      default:
        return <DeviceMobile size={16} color={C.textSecondary} weight="bold" />;
    }
  };

  const renderItem = ({ item, index }: { item: InterceptedNotification; index: number }) => (
    <FeedCard
      item={item}
      index={index}
      expandedId={expandedId}
      setExpandedId={setExpandedId}
      getSourceIcon={getSourceIcon}
      colors={colors}
      isDark={isDark}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.base }]}>
      {/* ── Header ── */}
      <View style={[styles.topBar, { backgroundColor: colors.elevated, borderBottomColor: colors.divider }]}>
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <BellRinging size={20} color={colors.textMuted} weight="bold" />
            <Text style={[styles.heading, { color: colors.textPrimary }]}>Live Inbox</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ModeBadge />
            <ThemeToggle />
          </View>
        </View>
        <Text style={[styles.subheading, { color: colors.textSecondary }]}>
          {isDemoMode
            ? 'Demonstration stream with simulated carriers'
            : 'Live background stream from real device notifications'}
        </Text>
      </View>

      {/* ── Permission Banner ── */}
      {permissionState.notificationListener !== 'GRANTED' && (
        <PermissionBanner onGrant={handleGrantPermissions} />
      )}

      {/* ── Filter Pills ── */}
      <View style={[styles.filterBar, { backgroundColor: colors.base, borderBottomColor: colors.divider }]}>
        <FilterPill
          label={`All (${feed.length})`}
          active={filter === 'ALL'}
          onPress={() => setFilter('ALL')}
          activeStyle={styles.filterPillActive}
          activeTextStyle={styles.filterTextActive}
        />
        <FilterPill
          label={`Threats (${feed.filter(i => i.analysis.overallRisk !== 'SAFE').length})`}
          active={filter === 'THREATS_ONLY'}
          onPress={() => setFilter('THREATS_ONLY')}
          activeStyle={styles.filterPillActiveThreat}
          activeTextStyle={styles.filterTextActiveThreat}
        />
        <FilterPill
          label={`Safe (${feed.filter(i => i.analysis.overallRisk === 'SAFE').length})`}
          active={filter === 'SAFE_ONLY'}
          onPress={() => setFilter('SAFE_ONLY')}
          activeStyle={styles.filterPillActiveSafe}
          activeTextStyle={styles.filterTextActiveSafe}
        />
      </View>

      {/* ── Demo Simulation Bar ── */}
      {isDemoMode && (
        <View style={[styles.simulationBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)', borderBottomColor: colors.divider }]}>
          <Text style={[styles.simLabel, { color: colors.textSecondary }]}>LIVE STREAM SIMULATION (DEMO MODE):</Text>
          <View style={styles.simButtonsRow}>
            <TouchableOpacity
              style={styles.simThreatBtn}
              onPress={() => handleSimulateNewIncoming('DANGEROUS')}
            >
              <Lightning size={12} color={C.dangerous} weight="bold" />
              <Text style={styles.simThreatText}>Simulate Fraud Alert</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simSafeBtn}
              onPress={() => handleSimulateNewIncoming('SAFE')}
            >
              <Lightning size={12} color={C.safe} weight="bold" />
              <Text style={styles.simSafeText}>Simulate Safe Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Feed / Empty State ── */}
      {filteredFeed.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.base }]}>
          <View style={styles.emptyIconWrap}>
            <Shield size={52} color={colors.textMuted} weight="thin" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Live Protection Inbox Clear</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {isDemoMode
              ? 'No notifications in stream. Use the simulator above to inject test alerts.'
              : 'Zero unverified or suspicious notifications intercepted. Active Protection Shield is running.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFeed}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchFeed}
              tintColor={C.primary}
              colors={[C.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bgBase,
  },
  topBar: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: C.bgBase,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 3,
  },

  // Permission Banner
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.amberBg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: C.amberBorder,
    borderLeftWidth: 3,
    borderLeftColor: C.suspicious,
  },
  permissionInfo: {
    flex: 1,
    marginRight: Spacing.two,
  },
  permHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  permissionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.suspicious,
  },
  permissionSub: {
    fontSize: 10,
    color: C.textSecondary,
    lineHeight: 15,
  },
  grantBtn: {
    backgroundColor: C.primary,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: Radius.sm,
  },
  grantBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Filter Bar
  filterBar: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    backgroundColor: C.bgBase,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterPillActive: {
    backgroundColor: C.bluePillBg,
    borderColor: C.primary,
  },
  filterPillActiveThreat: {
    backgroundColor: C.redPillBg,
    borderColor: 'rgba(248,113,113,0.40)',
  },
  filterPillActiveSafe: {
    backgroundColor: C.greenPillBg,
    borderColor: 'rgba(34,211,238,0.35)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextActiveThreat: {
    color: C.dangerous,
  },
  filterTextActiveSafe: {
    color: C.safe,
  },

  // Simulation Bar
  simulationBar: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  simLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textSecondary,
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  simThreatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.35)',
    backgroundColor: 'rgba(248,113,113,0.08)',
  },
  simThreatText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.dangerous,
  },
  simSafeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.30)',
    backgroundColor: 'rgba(34,211,238,0.07)',
  },
  simSafeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.safe,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  cardAnimWrapper: {
    marginBottom: Spacing.two,
  },
  feedCard: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: 'hidden',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sourceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  sourceIconChip: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceAppName: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textPrimary,
  },
  senderText: {
    fontSize: 11,
    color: C.textSecondary,
    flexShrink: 1,
  },
  rawMessageText: {
    fontSize: 13,
    color: 'rgba(241,245,249,0.82)',
    lineHeight: 19,
    fontWeight: '400',
    marginVertical: 5,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  timeText: {
    fontSize: 11,
    color: C.textSecondary,
    opacity: 0.7,
  },
  threatFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  threatFlagText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.dangerous,
  },
  safeFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  safeFlagText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.safe,
  },

  // Expanded signals
  expandedSignalsBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: Radius.md,
    padding: Spacing.two,
    marginTop: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.15)',
  },
  signalsHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: C.dangerous,
    letterSpacing: 0.5,
    marginBottom: 5,
    opacity: 0.8,
  },
  signalItem: {
    marginBottom: 5,
  },
  signalTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: C.dangerous,
  },
  signalDesc: {
    fontSize: 10,
    color: C.textSecondary,
    lineHeight: 14,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.six,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(59,130,246,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
