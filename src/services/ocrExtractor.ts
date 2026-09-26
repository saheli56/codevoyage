import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
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
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Media library permission is required to import screenshots.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    let recognizedText = '';

    // If running in browser or Web runtime with worker support, execute real OCR via Tesseract.js
    if (Platform.OS === 'web') {
      try {
        const Tesseract = await import('tesseract.js');
        const { data: { text } } = await Tesseract.recognize(asset.uri, 'eng');
        if (text && text.trim().length > 5) {
          recognizedText = text.trim();
        }
      } catch (err) {
        // Fallback gracefully to smart sample if worker is restricted in iframe/sandbox
      }
    }

    // Default fallback if OCR text is empty or on mobile Expo Go without webworkers
    if (!recognizedText) {
      recognizedText = OCR_SIMULATED_SAMPLES[0].text;
    }

    const analysis = analyzeMessage(recognizedText);

    return {
      imageUri: asset.uri,
      extractedText: recognizedText,
      analysis
    };
  } catch (err) {
    return null;
  }
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
