import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Megaphone, X, CheckCircle, ShieldWarning } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { CommunityReport } from '@/types/security';
import { submitCommunityReport } from '@/services/storageService';
import { useAppTheme } from '@/context/ThemeContext';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onReportSubmitted: (newReport: CommunityReport) => void;
  initialIdentifier?: string;
  initialCategory?: CommunityReport['category'];
}

export function ReportModal({
  visible,
  onClose,
  onReportSubmitted,
  initialIdentifier = '',
  initialCategory = 'SMISHING',
}: ReportModalProps) {
  const { colors, isDark } = useAppTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetIdentifier, setTargetIdentifier] = useState(initialIdentifier);
  const [category, setCategory] = useState<CommunityReport['category']>(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: { label: string; value: CommunityReport['category'] }[] = [
    { label: 'SMS / Smishing', value: 'SMISHING' },
    { label: 'UPI / VPA Fraud', value: 'UPI_FRAUD' },
    { label: 'Bank Impersonation', value: 'BANK_IMPERSONATION' },
    { label: 'Job / Task Scam', value: 'JOB_SCAM' },
    { label: 'Lottery / Reward', value: 'LOTTERY_SCAM' },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !targetIdentifier.trim()) {
      Alert.alert('Missing Fields', 'Please provide a title and target identifier (URL, Phone, or UPI ID).');
      return;
    }

    setIsSubmitting(true);
    const created = await submitCommunityReport({
      title: title.trim(),
      description: description.trim(),
      targetIdentifier: targetIdentifier.trim(),
      category,
      riskScore: 85,
    });

    setIsSubmitting(false);
    onReportSubmitted(created);
    onClose();
    setTitle('');
    setDescription('');
    setTargetIdentifier('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.45)' }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.elevated, borderColor: colors.cardBorder }]}>
          <View style={[styles.headerRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.headerTitleGroup}>
              <Megaphone size={18} color={colors.textPrimary} weight="bold" />
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Flag Threat Vector</Text>
            </View>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.inputBg }]} onPress={onClose}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: colors.textMuted }]}>CATEGORY</Text>
            <View style={styles.categoryWrap}>
              {categories.map((c) => {
                const isActive = category === c.value;
                return (
                  <TouchableOpacity
                    key={c.value}
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: isActive ? Palette.brand.primary : colors.inputBg,
                        borderColor: isActive ? Palette.brand.primary : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setCategory(c.value)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { color: colors.textMuted }]}>THREAT IDENTIFIER</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. sbi-kyc-verify.top or payment@upi"
              placeholderTextColor={colors.textMuted}
              value={targetIdentifier}
              onChangeText={setTargetIdentifier}
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>SUMMARY TITLE</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Electricity disconnection extortion"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>DETAILED CONTEXT</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Describe what happened, any specific demands, or unusual instructions..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            <View style={[styles.privacyNote, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
              <ShieldWarning size={15} color={colors.textMuted} />
              <Text style={[styles.privacyText, { color: colors.textMuted }]}>
                Never submit personal banking passwords or OTPs. All submissions are checked before broadcast.
              </Text>
            </View>
          </ScrollView>

          <View style={[styles.footerRow, { borderTopColor: colors.divider }]}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.cardBorder }]} onPress={onClose}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: Palette.brand.primary },
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>{isSubmitting ? 'Submitting...' : 'Submit Report'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    padding: Spacing.four,
    maxHeight: '88%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: Radius.full,
  },
  formScroll: {
    marginVertical: Spacing.three,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  categoryPill: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 13,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
