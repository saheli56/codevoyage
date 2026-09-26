import * as Clipboard from 'expo-clipboard';
import { Alert, Platform } from 'react-native';
import { analyzeMessage } from '@/services/riskEngine';
import { saveAnalysisResult } from '@/services/storageService';
import { AnalysisResult } from '@/types/security';

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
      triggerThreatAlert(result, cleanText);
      return { result, text: cleanText };
    }
    return null;
  } catch {
    return null;
  }
}

export function triggerThreatAlert(result: AnalysisResult, rawText: string) {
  const title = result.overallRisk === 'DANGEROUS' 
    ? 'ScamShield Alert: High Threat Detected' 
    : 'ScamShield Notice: Suspicious Content';

  const body = result.signals.length > 0 
    ? `${result.signals[0].title}: ${result.signals[0].description}`
    : 'Copied message contains unverified or potentially deceptive patterns.';

  Alert.alert(
    title,
    body,
    [{ text: 'Inspect Evidence', style: 'default' }]
  );
}

export async function simulateIncomingNotificationScan(mockSender: string, messageBody: string): Promise<AnalysisResult> {
  const result = analyzeMessage(messageBody);
  await saveAnalysisResult(result);
  triggerThreatAlert(result, messageBody);
  return result;
}
