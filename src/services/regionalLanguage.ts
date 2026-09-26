export interface LanguageProfile {
  code: string;
  label: string;
  urgencyTriggers: string[];
  coercionPhrases: string[];
}

export const REGIONAL_LANGUAGE_PROFILES: Record<string, LanguageProfile> = {
  hi: {
    code: 'hi',
    label: 'Hindi / Hinglish',
    urgencyTriggers: [
      'turant update kare',
      'khata band ho jayega',
      'bijli kat di jayegi',
      '24 ghante ke andar',
      'inam jeeta',
      'lottery lagi hai',
      'kyc expire ho gaya',
      'pan link kare',
      'aavedan radd',
      'paise bheje'
    ],
    coercionPhrases: [
      'police karyawahi',
      'kanuni notice',
      'jurmana lagega',
      'shikayat darj'
    ]
  },
  bn: {
    code: 'bn',
    label: 'Bengali',
    urgencyTriggers: [
      'ekhoni update korun',
      'account bondho hoye jabe',
      'biddut connection kata hobe',
      'lottery jitechen',
      'kyc sesh hoyeche'
    ],
    coercionPhrases: [
      'police case hobe',
      'fine lagbe'
    ]
  },
  te: {
    code: 'te',
    label: 'Telugu',
    urgencyTriggers: [
      'ventane update cheyandi',
      'khata block cheyabadunu',
      'current cut cheyabadunu',
      'lottery geluchukunnaru',
      'kyc purthi cheyandi'
    ],
    coercionPhrases: [
      'police case avuthundi',
      'fine paduthundi'
    ]
  }
};

export function detectRegionalLanguage(text: string): string {
  const lower = text.toLowerCase();
  for (const [langCode, profile] of Object.entries(REGIONAL_LANGUAGE_PROFILES)) {
    const hasTrigger = profile.urgencyTriggers.some(trigger => lower.includes(trigger));
    const hasCoercion = profile.coercionPhrases.some(phrase => lower.includes(phrase));
    if (hasTrigger || hasCoercion) {
      return langCode;
    }
  }
  return 'en';
}

export function extractRegionalSignals(text: string): { triggers: string[]; lang: string } {
  const lower = text.toLowerCase();
  const matchedTriggers: string[] = [];
  let detectedLang = 'en';

  for (const [langCode, profile] of Object.entries(REGIONAL_LANGUAGE_PROFILES)) {
    profile.urgencyTriggers.forEach(t => {
      if (lower.includes(t)) {
        matchedTriggers.push(t);
        detectedLang = langCode;
      }
    });
    profile.coercionPhrases.forEach(p => {
      if (lower.includes(p)) {
        matchedTriggers.push(p);
        detectedLang = langCode;
      }
    });
  }

  return { triggers: matchedTriggers, lang: detectedLang };
}
