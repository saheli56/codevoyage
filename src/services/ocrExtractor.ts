import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { createWorker } from 'tesseract.js';
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

export async function extractTextFromImageUri(uri: string): Promise<string> {
  let recognizedText = '';

  // 1. Client-side Web / Canvas OCR via dedicated Tesseract worker
  if (Platform.OS === 'web') {
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(uri);
      await worker.terminate();
      if (ret.data && ret.data.text && ret.data.text.trim().length > 0) {
        recognizedText = ret.data.text.trim();
      }
    } catch (err) {
      console.warn('Tesseract worker error, attempting direct file upload:', err);
    }
  }

  // 2. Upload to Backend FastAPI OCR Endpoint (supports both Web & Native Android/iOS)
  if (!recognizedText) {
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const fetchRes = await fetch(uri);
        const blob = await fetchRes.blob();
        formData.append('file', blob, 'screenshot.png');
      } else {
        formData.append('file', {
          uri,
          name: 'screenshot.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const apiRes = await fetch('http://localhost:8000/api/v1/analyze/ocr', {
        method: 'POST',
        body: formData,
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.extracted_text && data.extracted_text.trim().length > 0) {
          recognizedText = data.extracted_text.trim();
        }
      }
    } catch (err) {
      // Backend not running locally
    }
  }

  return recognizedText;
}

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
      quality: 1.0,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    let recognizedText = await extractTextFromImageUri(asset.uri);

    // Clean up whitespace & linebreaks
    recognizedText = recognizedText.replace(/\r\n/g, '\n').trim();

    if (!recognizedText) {
      recognizedText = 'No text detected in this image. Please ensure the screenshot has clear, visible text.';
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
