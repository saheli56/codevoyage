import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult, CommunityReport } from '@/types/security';

const STORAGE_KEYS = {
  HISTORY: '@scamshield_analysis_history',
  REPORTS: '@scamshield_community_reports',
} as const;

export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'rep-1',
    category: 'SMISHING',
    title: 'Fake SBI KYC Update Notice with APK link',
    description: 'SMS claiming netbanking suspended, asking to download "sbi_kyc_update.apk" from unauthorized domain.',
    targetIdentifier: 'http://sbi-kyc-verify.top',
    riskScore: 92,
    status: 'VERIFIED',
    upvotes: 142,
    reportedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'rep-2',
    category: 'UPI_FRAUD',
    title: 'Electricity Bill Disconnection Fraud',
    description: 'WhatsApp message stating power will be cut tonight at 9:30 PM unless bill paid to a personal UPI VPA.',
    targetIdentifier: 'power-bill-help@okaxis',
    riskScore: 88,
    status: 'VERIFIED',
    upvotes: 98,
    reportedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'rep-3',
    category: 'JOB_SCAM',
    title: 'Telegram Part-time Video Rating Job',
    description: 'Recruiter asking for Rs 1000 registration fee before assigning "work from home review tasks".',
    targetIdentifier: '+91 98765 43210',
    riskScore: 78,
    status: 'VERIFIED',
    upvotes: 64,
    reportedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];

export async function getAnalysisHistory(): Promise<AnalysisResult[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveAnalysisResult(result: AnalysisResult): Promise<void> {
  try {
    const existing = await getAnalysisHistory();
    const updated = [result, ...existing.filter(item => item.id !== result.id)].slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch {
    // Gracefully handle storage errors
  }
}

export async function clearAnalysisHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch {
    // Gracefully handle storage errors
  }
}

export async function getCommunityReports(isDemoMode: boolean = true): Promise<CommunityReport[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!data) {
      if (isDemoMode) {
        await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_COMMUNITY_REPORTS));
        return INITIAL_COMMUNITY_REPORTS;
      }
      return [];
    }
    const parsed: CommunityReport[] = JSON.parse(data);
    if (!isDemoMode) {
      // Filter out seed demo IDs in live production mode
      return parsed.filter(r => !r.id.startsWith('rep-1') && !r.id.startsWith('rep-2') && !r.id.startsWith('rep-3'));
    }
    return parsed;
  } catch {
    return isDemoMode ? INITIAL_COMMUNITY_REPORTS : [];
  }
}

export async function submitCommunityReport(report: Omit<CommunityReport, 'id' | 'reportedAt' | 'upvotes' | 'status'>): Promise<CommunityReport> {
  const newReport: CommunityReport = {
    ...report,
    id: `user-rep-${Date.now()}`,
    reportedAt: new Date().toISOString(),
    upvotes: 1,
    status: 'PENDING_REVIEW'
  };

  try {
    const current = await getCommunityReports(true);
    const updated = [newReport, ...current];
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  } catch {
    // Fallback in-memory
  }

  return newReport;
}

export async function upvoteReport(reportId: string): Promise<void> {
  try {
    const current = await getCommunityReports(true);
    const updated = current.map(item => item.id === reportId ? { ...item, upvotes: item.upvotes + 1 } : item);
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  } catch {
    // Gracefully handle storage errors
  }
}
