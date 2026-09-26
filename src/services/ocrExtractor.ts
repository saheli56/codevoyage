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

function performBrowserOCR(imageSource: string | HTMLImageElement | HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    // Check for native browser Shape Detection / TextDetector API (supported in Chrome/Edge)
    if (typeof window !== 'undefined' && 'TextDetector' in window) {
      try {
        const TextDetectorClass = (window as any).TextDetector;
        const detector = new TextDetectorClass();
        const img = new (window as any).Image();
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
          try {
            const detected = await detector.detect(img);
            if (detected && detected.length > 0) {
              const text = detected.map((d: any) => d.rawValue).join('\n').trim();
              if (text) {
                resolve(text);
                return;
              }
            }
          } catch {
            // fallback
          }
          resolve('');
        };
        img.onerror = () => resolve('');
        img.src = typeof imageSource === 'string' ? imageSource : (imageSource as any).src;
        return;
      } catch {
        // fallback
      }
    }
    resolve('');
  });
}

export async function extractTextFromImageUri(uri: string): Promise<string> {
  let recognizedText = '';

  // 1. Browser Native High-Speed TextDetector API
  if (Platform.OS === 'web') {
    recognizedText = await performBrowserOCR(uri);
  }

  // 2. Tesseract.js Worker with CORS-compliant unpkg paths
  if (!recognizedText && Platform.OS === 'web') {
    try {
      const Tesseract = await import('tesseract.js');
      const res = await Tesseract.recognize(uri, 'eng');
      if (res && res.data && res.data.text && res.data.text.trim().length > 0) {
        recognizedText = res.data.text.trim();
      }
    } catch (err) {
      console.warn('Tesseract recognition fallback:', err);
    }
  }

  // 3. Fallback: Upload image to Backend FastAPI OCR Endpoint
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
      // Backend not running
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
    recognizedText = recognizedText.replace(/\r\n/g, '\n').trim();

    if (!recognizedText) {
      recognizedText = 'Scanned Image: Text could not be extracted from this file format. Please ensure image has high contrast or paste text directly.';
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
