import { AnalysisResult, RiskLevel } from '@/types/security';
import { analyzeMessage } from '@/services/riskEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InterceptedNotification {
  id: string;
  sourceApp: 'SMS' | 'WHATSAPP' | 'GPAY' | 'PHONEPE' | 'PAYTM' | 'TELEGRAM' | 'BANK_SMS';
  sender: string;
  rawBody: string;
  receivedAt: string;
  analysis: AnalysisResult;
}

const STORAGE_KEY_FEED = '@scamshield_incoming_live_feed';

export const INITIAL_LIVE_NOTIFICATIONS: InterceptedNotification[] = [
  {
    id: 'demo-notif-1',
    sourceApp: 'SMS',
    sender: 'VM-SBINB',
    rawBody: 'URGENT: Your SBI netbanking account is suspended due to expired KYC. Update immediately at http://sbi-kyc-verify.top or access blocked in 24 hrs.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    analysis: analyzeMessage('URGENT: Your SBI netbanking account is suspended due to expired KYC. Update immediately at http://sbi-kyc-verify.top or access blocked in 24 hrs.')
  },
  {
    id: 'demo-notif-2',
    sourceApp: 'WHATSAPP',
    sender: '+91 98765 43210',
    rawBody: 'Priy Grahak, aapka bijli connection aaj raat 9:30 baje kat diya jayega kyunki bill update nahi hai. Turant call kare.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    analysis: analyzeMessage('Priy Grahak, aapka bijli connection aaj raat 9:30 baje kat diya jayega kyunki bill update nahi hai. Turant call kare.')
  },
  {
    id: 'demo-notif-3',
    sourceApp: 'BANK_SMS',
    sender: 'HDFCBK',
    rawBody: 'Your HDFC Bank account credit card ending in 4021 was charged INR 450.00 at Starbucks on 26-Sep-2026.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    analysis: analyzeMessage('Your HDFC Bank account credit card ending in 4021 was charged INR 450.00 at Starbucks on 26-Sep-2026.')
  },
  {
    id: 'demo-notif-4',
    sourceApp: 'GPAY',
    sender: 'UPI AutoPay',
    rawBody: 'Mandate approval request for INR 15,000 to sbi-lottery-support@okaxis. Enter UPI PIN to authorize.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    analysis: analyzeMessage('Mandate approval request for INR 15,000 to sbi-lottery-support@okaxis. Enter UPI PIN to authorize.')
  }
];

export async function getLiveNotificationFeed(isDemoMode: boolean = true): Promise<InterceptedNotification[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY_FEED);
    if (!data) {
      if (isDemoMode) {
        await AsyncStorage.setItem(STORAGE_KEY_FEED, JSON.stringify(INITIAL_LIVE_NOTIFICATIONS));
        return INITIAL_LIVE_NOTIFICATIONS;
      }
      return [];
    }
    const parsed: InterceptedNotification[] = JSON.parse(data);
    if (!isDemoMode) {
      // In live production mode, hide all pre-seeded demo notifications
      return parsed.filter(item => !item.id.startsWith('demo-notif-'));
    }
    return parsed;
  } catch {
    return isDemoMode ? INITIAL_LIVE_NOTIFICATIONS : [];
  }
}

export async function pushInterceptedNotification(
  sourceApp: InterceptedNotification['sourceApp'],
  sender: string,
  rawBody: string
): Promise<InterceptedNotification> {
  const analysis = analyzeMessage(rawBody);
  const newNotif: InterceptedNotification = {
    id: `live-notif-${Date.now()}`,
    sourceApp,
    sender,
    rawBody,
    receivedAt: new Date().toISOString(),
    analysis
  };

  try {
    const current = await getLiveNotificationFeed(true);
    const updated = [newNotif, ...current].slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEY_FEED, JSON.stringify(updated));
  } catch {
    // In-memory fallback
  }

  return newNotif;
}

export async function clearLiveFeed(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_FEED);
  } catch {
    // Gracefully handle storage errors
  }
}
