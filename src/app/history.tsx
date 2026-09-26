import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClockCounterClockwise, Trash, ShieldCheck, ArrowRight } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { AnalysisResult } from '@/types/security';
import { getAnalysisHistory, clearAnalysisHistory } from '@/services/storageService';
import { RiskBadge } from '@/components/ui/risk-badge';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
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
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: AnalysisResult }) => (
    <TouchableOpacity 
      style={styles.historyCard}
      onPress={() => setSelectedResult(item === selectedResult ? null : item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.inputPayload.type}</Text>
        </View>
        <RiskBadge level={item.overallRisk} score={item.riskScore} size="sm" />
      </View>

      <Text style={styles.rawContent} numberOfLines={2}>
        {item.inputPayload.rawContent}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {new Date(item.timestamp).toLocaleString(undefined, { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
          })}
        </Text>
        <Text style={styles.signalsCount}>
          {item.signals.length} Signal{item.signals.length !== 1 ? 's' : ''} Identified
        </Text>
      </View>

      {selectedResult?.id === item.id && (
        <View style={styles.expandedDetails}>
          <Text style={styles.summaryText}>{item.summary}</Text>
          {item.actions.map(act => (
            <View key={act.id} style={styles.actionRow}>
              <ArrowRight size={14} color={Palette.brand.primary} />
              <Text style={styles.actionText}>{act.title}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <ClockCounterClockwise size={22} color={Palette.brand.primary} weight="bold" />
          <Text style={styles.heading}>Analysis History</Text>
        </View>

        {history.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Trash size={16} color={Palette.neutral.slate600} />
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShieldCheck size={48} color={Palette.neutral.slate300} />
          <Text style={styles.emptyTitle}>No Previous Records</Text>
          <Text style={styles.emptySubtext}>
            Analyses performed on SMS, URLs, or transactions will appear here for reference.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.neutral.slate100,
    paddingVertical: 6,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.sm,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.neutral.slate700,
  },
  listContent: {
    padding: Spacing.four,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
    marginBottom: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  typeBadge: {
    backgroundColor: Palette.neutral.slate100,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.neutral.slate600,
  },
  rawContent: {
    fontSize: 13,
    color: Palette.neutral.slate800,
    fontWeight: '500',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Palette.neutral.slate100,
    paddingTop: Spacing.two,
    marginTop: Spacing.two,
  },
  dateText: {
    fontSize: 11,
    color: Palette.neutral.slate400,
  },
  signalsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.neutral.slate600,
  },
  expandedDetails: {
    backgroundColor: Palette.neutral.slate50,
    borderRadius: Radius.md,
    padding: Spacing.two,
    marginTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Palette.neutral.slate200,
  },
  summaryText: {
    fontSize: 12,
    color: Palette.neutral.slate700,
    marginBottom: Spacing.one,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  actionText: {
    fontSize: 11,
    color: Palette.brand.primaryDark,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.neutral.slate700,
    marginTop: Spacing.three,
  },
  emptySubtext: {
    fontSize: 13,
    color: Palette.neutral.slate400,
    textAlign: 'center',
    marginTop: Spacing.one,
    lineHeight: 18,
  }
});
