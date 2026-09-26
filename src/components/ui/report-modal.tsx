import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, Platform } from 'react-native';
import { Megaphone, X, CheckCircle, ShieldWarning } from 'phosphor-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { CommunityReport } from '@/types/security';
import { submitCommunityReport } from '@/services/storageService';

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
  initialCategory = 'SMISHING'
}: ReportModalProps) {
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Megaphone size={20} color={Palette.brand.primary} weight="bold" />
              <Text style={styles.headerTitle}>Report Suspicious Entity</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color={Palette.neutral.slate600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryWrap}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.categoryPill, category === c.value && styles.categoryPillActive]}
                  onPress={() => setCategory(c.value)}
                >
                  <Text style={[styles.categoryText, category === c.value && styles.categoryTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Threat Identifier (URL / Phone / UPI ID)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. sbi-kyc-verify.top or payment@upi"
              placeholderTextColor={Palette.neutral.slate400}
              value={targetIdentifier}
              onChangeText={setTargetIdentifier}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Summary Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Electricity disconnection extortion"
              placeholderTextColor={Palette.neutral.slate400}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Detailed Context (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what happened, any specific demands, or unusual instructions..."
              placeholderTextColor={Palette.neutral.slate400}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.privacyNote}>
              <ShieldWarning size={16} color={Palette.neutral.slate500} />
              <Text style={styles.privacyText}>
                Reports are crowdsourced and reviewed for community defense. Never submit personal banking passwords or OTPs.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <CheckCircle size={16} color="#FFFFFF" weight="bold" />
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.four,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.neutral.slate900,
  },
  closeBtn: {
    padding: Spacing.one,
    backgroundColor: Palette.neutral.slate100,
    borderRadius: Radius.full,
  },
  formScroll: {
    marginVertical: Spacing.two,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.neutral.slate700,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    backgroundColor: Palette.neutral.slate100,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
  },
  categoryPillActive: {
    backgroundColor: Palette.brand.primaryMuted,
    borderColor: Palette.brand.primary,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.neutral.slate600,
  },
  categoryTextActive: {
    color: Palette.brand.primaryDark,
  },
  input: {
    backgroundColor: Palette.neutral.slate50,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    fontSize: 13,
    color: Palette.neutral.slate900,
    borderWidth: 1,
    borderColor: Palette.neutral.slate200,
    marginBottom: Spacing.two,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Palette.neutral.slate100,
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.two,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    color: Palette.neutral.slate600,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Palette.neutral.slate100,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.neutral.slate700,
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: Palette.brand.primary,
  },
  submitBtnDisabled: {
    backgroundColor: Palette.neutral.slate400,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  }
});
