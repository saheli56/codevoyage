import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BellRinging, ShieldWarning, ShieldCheck, Lightning, ChatCircleDots, DeviceMobile, CreditCard, Trash } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { InterceptedNotification, getLiveNotificationFeed, pushInterceptedNotification, clearLiveFeed } from '@/services/liveNotificationFeed';
import { useAppMode } from '@/context/AppModeContext';
import { RiskBadge } from '@/components/ui/risk-badge';

export default function LiveFeedScreen() {
  const insets = useSafeAreaInsets();
  const { isDemoMode } = useAppMode();
  const [feed, setFeed] = useState<InterceptedNotification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'THREATS_ONLY' | 'SAFE_ONLY'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFeed = async () => {
    setRefreshing(true);
    const data = await getLiveNotificationFeed();
    setFeed(data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFeed();
  }, []);

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
    if (filter === 'THREATS_ONLY') return item.analysis.overallRisk === 'DANGEROUS' || item.analysis.overallRisk === 'SUSPICIOUS';
    if (filter === 'SAFE_ONLY') return item.analysis.overallRisk === 'SAFE';
    return true;
  });

  const getSourceIcon = (app: string) => {
    switch (app) {
      case 'WHATSAPP':
        return <ChatCircleDots size={16} color="#25D366" weight="fill" />;
      case 'GPAY':
      case 'PHONEPE':
      case 'PAYTM':
        return <CreditCard size={16} color={Palette.brand.primary} weight="bold" />;
      default:
        return <DeviceMobile size={16} color={Palette.neutral.slate600} weight="bold" />;
    }
  };

  const renderItem = ({ item }: { item: InterceptedNotification }) => {
    const isDangerous = item.analysis.overallRisk === 'DANGEROUS';
    const isSuspicious = item.analysis.overallRisk === 'SUSPICIOUS';
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity 
        style={[
          styles.feedCard,
          isDangerous && styles.cardDangerous,
          isSuspicious && styles.cardSuspicious
        ]}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.sourceGroup}>
            {getSourceIcon(item.sourceApp)}
            <Text style={styles.sourceAppName}>{item.sourceApp}</Text>
            <Text style={styles.senderText}>• {item.sender}</Text>
          </View>
          <RiskBadge level={item.analysis.overallRisk} score={item.analysis.riskScore} size="sm" />
        </View>

        <Text style={styles.rawMessageText} numberOfLines={isExpanded ? undefined : 2}>
          {item.rawBody}
        </Text>

        <View style={styles.cardBottomRow}>
          <Text style={styles.timeText}>
            {new Date(item.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          {isDangerous ? (
            <View style={styles.threatFlag}>
              <ShieldWarning size={13} color={Palette.risk.dangerous} weight="bold" />
              <Text style={styles.threatFlagText}>Flagged Threat</Text>
            </View>
          ) : (
            <View style={styles.safeFlag}>
              <ShieldCheck size={13} color={Palette.risk.safe} weight="bold" />
              <Text style={styles.safeFlagText}>Verified Safe</Text>
            </View>
          )}
        </View>

        {isExpanded && item.analysis.signals.length > 0 && (
          <View style={styles.expandedSignalsBox}>
            <Text style={styles.signalsHeading}>THREAT SIGNALS DETECTED:</Text>
            {item.analysis.signals.map(s => (
              <View key={s.id} style={styles.signalItem}>
                <Text style={styles.signalTitle}>• {s.title}</Text>
                <Text style={styles.signalDesc}>{s.description}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <View>
          <View style={styles.titleRow}>
            <BellRinging size={20} color={Palette.brand.primary} weight="bold" />
            <Text style={styles.heading}>Live Protection Inbox</Text>
          </View>
          <Text style={styles.subheading}>Real-time incoming SMS & app notifications stream</Text>
        </View>

        {feed.length > 0 && (
          <TouchableOpacity style={styles.clearIconBtn} onPress={handleClear}>
            <Trash size={16} color={Palette.neutral.slate500} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            All ({feed.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterPill, filter === 'THREATS_ONLY' && styles.filterPillActiveThreat]}
          onPress={() => setFilter('THREATS_ONLY')}
        >
          <Text style={[styles.filterText, filter === 'THREATS_ONLY' && styles.filterTextActiveThreat]}>
            Threats ({feed.filter(i => i.analysis.overallRisk !== 'SAFE').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterPill, filter === 'SAFE_ONLY' && styles.filterPillActiveSafe]}
          onPress={() => setFilter('SAFE_ONLY')}
        >
          <Text style={[styles.filterText, filter === 'SAFE_ONLY' && styles.filterTextActiveSafe]}>
            Safe ({feed.filter(i => i.analysis.overallRisk === 'SAFE').length})
          </Text>
        </TouchableOpacity>
      </View>

      {isDemoMode && (
        <View style={styles.simulationBar}>
          <Text style={styles.simLabel}>LIVE STREAM SIMULATION (DEMO MODE):</Text>
          <View style={styles.simButtonsRow}>
            <TouchableOpacity 
              style={styles.simThreatBtn}
              onPress={() => handleSimulateNewIncoming('DANGEROUS')}
            >
              <Lightning size={12} color={Palette.risk.dangerousDark} weight="bold" />
              <Text style={styles.simThreatText}>Simulate Fraud Alert</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.simSafeBtn}
              onPress={() => handleSimulateNewIncoming('SAFE')}
            >
              <Lightning size={12} color={Palette.risk.safeDark} weight="bold" />
              <Text style={styles.simSafeText}>Simulate Safe Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={filteredFeed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFeed} />}
        showsVerticalScrollIndicator={false}
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
  clearIconBtn: {
    padding: Spacing.one,
    backgroundColor: Palette.neutral.slate100,
    borderRadius: Radius.full,
  },
  filterBar: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Palette.neutral.slate100,
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    backgroundColor: Palette.neutral.slate100,
  },
  filterPillActive: {
    backgroundColor: Palette.brand.primary,
  },
  filterPillActiveThreat: {
    backgroundColor: Palette.risk.dangerousLight,
    borderWidth: 1,
    borderColor: Palette.risk.dangerousBorder,
  },
  filterPillActiveSafe: {
    backgroundColor: Palette.risk.safeLight,
    borderWidth: 1,
    borderColor: Palette.risk.safeBorder,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.neutral.slate600,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextActiveThreat: {
    color: Palette.risk.dangerousDark,
  },
  filterTextActiveSafe: {
    color: Palette.risk.safeDark,
  },
  simulationBar: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.neutral.slate100,
  },
  simLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.neutral.slate500,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  simThreatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.risk.dangerousLight,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Palette.risk.dangerousBorder,
  },
  simThreatText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.risk.dangerousDark,
  },
  simSafeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.risk.safeLight,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Palette.risk.safeBorder,
  },
  simSafeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.risk.safeDark,
  },
  listContent: {
    padding: Spacing.four,
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
    marginBottom: Spacing.two,
  },
  cardDangerous: {
    borderLeftWidth: 4,
    borderLeftColor: Palette.risk.dangerous,
    backgroundColor: '#FFFDFD',
  },
  cardSuspicious: {
    borderLeftWidth: 4,
    borderLeftColor: Palette.risk.suspicious,
    backgroundColor: '#FFFDF7',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  sourceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceAppName: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.neutral.slate700,
  },
  senderText: {
    fontSize: 11,
    color: Palette.neutral.slate500,
  },
  rawMessageText: {
    fontSize: 13,
    color: Palette.neutral.slate800,
    lineHeight: 18,
    fontWeight: '500',
    marginVertical: 4,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Palette.neutral.slate100,
  },
  timeText: {
    fontSize: 11,
    color: Palette.neutral.slate400,
  },
  threatFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  threatFlagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.risk.dangerous,
  },
  safeFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  safeFlagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.risk.safeDark,
  },
  expandedSignalsBox: {
    backgroundColor: Palette.neutral.slate50,
    borderRadius: Radius.md,
    padding: Spacing.two,
    marginTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Palette.neutral.slate200,
  },
  signalsHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.neutral.slate600,
    marginBottom: 4,
  },
  signalItem: {
    marginBottom: 4,
  },
  signalTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.risk.dangerousDark,
  },
  signalDesc: {
    fontSize: 10,
    color: Palette.neutral.slate600,
  }
});
