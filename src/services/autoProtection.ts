import * as Notifications from 'expo-notifications';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';
import { analyzeMessage } from '@/services/riskEngine';
import { saveAnalysisResult } from '@/services/storageService';
import { AnalysisResult } from '@/types/security';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function checkClipboardForThreats(lastProcessedText: string): Promise<{ result: AnalysisResult; text: string } | null> {
  try {
    const hasText = await Clipboard.hasStringAsync();
    if (!hasText) return null;
    
    const text = await Clipboard.getStringAsync();
    const cleanText = text.trim();
    
    if (!cleanText || cleanText === lastProcessedText || cleanText.length < 15) {
      return null;
    }

    const result = analyzeMessage(cleanText);
    if (result.overallRisk === 'DANGEROUS' || result.overallRisk === 'SUSPICIOUS') {
      await saveAnalysisResult(result);
      await triggerThreatNotification(result, cleanText);
      return { result, text: cleanText };
    }
    return null;
  } catch {
    return null;
  }
}

export async function triggerThreatNotification(result: AnalysisResult, rawText: string) {
  if (Platform.OS === 'web') return;
  
  const title = result.overallRisk === 'DANGEROUS' 
    ? 'ScamShield Alert: High Threat Detected' 
    : 'ScamShield Notice: Suspicious Content';

  const body = result.signals.length > 0 
    ? `${result.signals[0].title}: ${result.signals[0].description.slice(0, 80)}...`
    : 'Copied message contains unverified or potentially deceptive patterns.';

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { scanId: result.id, rawText },
      },
      trigger: null,
    });
  } catch {
    // Graceful fallback
  }
}

export async function simulateIncomingNotificationScan(mockSender: string, messageBody: string): Promise<AnalysisResult> {
  const result = analyzeMessage(messageBody);
  await saveAnalysisResult(result);
  await triggerThreatNotification(result, messageBody);
  return result;
}
