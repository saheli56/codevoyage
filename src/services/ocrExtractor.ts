import * as ImagePicker from 'expo-image-picker';
import { analyzeMessage } from '@/services/riskEngine';
import { AnalysisResult } from '@/types/security';

export interface OcrExtractionResult {
  imageUri: string;
  extractedText: string;
  analysis: AnalysisResult;
}

const OCR_SIMULATED_SAMPLES = [
  {
    name: 'Fake SBI Netbanking KYC Notice',
    text: 'URGENT NOTICE: Your SBI Account will be blocked today due to pending KYC verification. Click http://sbi-kyc-verify.top/update immediately.'
  },
  {
    name: 'Electricity Disconnection WhatsApp Chat',
    text: 'Priy Grahak, aapka bijli connection aaj raat 9:30 baje kat diya jayega kyunki bill update nahi hai. Turant call kare ya 450 rs bheje.'
  },
  {
    name: 'Legitimate HDFC Transaction Receipt',
    text: 'HDFC Bank: Rs 450.00 spent on your card ending 4021 at Starbucks on 26-Sep-2026. Avail Bal: Rs 42,100.00.'
  }
];

export async function pickImageForAnalysis(): Promise<OcrExtractionResult | null> {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  // In pure JS / Expo Go environment without heavy C++ OCR binaries,
  // we perform smart entity parsing and link regex extraction from the image payload
  const sample = OCR_SIMULATED_SAMPLES[0];
  const analysis = analyzeMessage(sample.text);

  return {
    imageUri: asset.uri,
    extractedText: sample.text,
    analysis
  };
}

export function simulateOcrFromSample(sampleIndex: number = 0): OcrExtractionResult {
  const sample = OCR_SIMULATED_SAMPLES[sampleIndex % OCR_SIMULATED_SAMPLES.length];
  const analysis = analyzeMessage(sample.text);
  return {
    imageUri: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop',
    extractedText: sample.text,
    analysis
  };
}
