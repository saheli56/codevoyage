import { AnalysisResult, EvidenceSignal, RecommendedAction, RiskLevel } from '@/types/security';
import { extractRegionalSignals } from '@/services/regionalLanguage';

const KNOWN_SUSPICIOUS_TLDS = ['.xyz', '.top', '.buzz', '.work', '.click', '.club', '.online', '.site', '.ru', '.cn'];
const BANK_NAMES = ['sbi', 'hdfc', 'icici', 'axis', 'paytm', 'phonepe', 'gpay', 'kotak', 'pnb', 'bob'];
const URGENCY_TRIGGERS = [
  'blocked immediately', 'account suspended', 'pan not updated', 'kyc expired', 
  'unauthorized transaction', 'electricity will be disconnected', 'lottery winner',
  'claim reward', 'within 24 hours', 'verify details now', 'apk download'
];

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(?:xyz|top|buzz|click|club|site|online|link|info|com|in|org|net)\b[^\s]*)/gi;
  const matches = text.match(urlRegex) || [];
  return matches.map(u => u.trim());
}

export function analyzeMessage(rawText: string): AnalysisResult {
  const cleanText = rawText.trim();
  const lowerText = cleanText.toLowerCase();
  const extractedUrls = extractUrls(cleanText);
  const signals: EvidenceSignal[] = [];
  const actions: RecommendedAction[] = [];
  
  let riskScore = 10;
  
  // 1. English Urgency & Coercion Check
  const detectedTriggers = URGENCY_TRIGGERS.filter(trigger => lowerText.includes(trigger));
  if (detectedTriggers.length > 0) {
    riskScore += 35;
    signals.push({
      id: 'urgency-coercion',
      category: 'URGENCY_COERCION',
      title: 'High Urgency or Coercion Tactics',
      description: `Detected high-pressure phrases designed to force immediate action: "${detectedTriggers.slice(0, 2).join('", "')}".`,
      severity: 'HIGH',
      verified: true,
      observedValue: detectedTriggers.join(', ')
    });
  }

  // 1b. Regional Language & Hinglish Urgency Check
  const regionalMatch = extractRegionalSignals(cleanText);
  if (regionalMatch.triggers.length > 0) {
    riskScore += 35;
    signals.push({
      id: 'regional-urgency',
      category: 'URGENCY_COERCION',
      title: 'Regional / Hinglish Coercion Signal',
      description: `Detected high-pressure localized phrases: "${regionalMatch.triggers.slice(0, 2).join('", "')}" [Language detected: ${regionalMatch.lang.toUpperCase()}].`,
      severity: 'HIGH',
      verified: true,
      observedValue: regionalMatch.triggers.join(', ')
    });
  }

  // 2. Impersonation Check
  const detectedBanks = BANK_NAMES.filter(bank => lowerText.includes(bank));
  if (detectedBanks.length > 0) {
    const hasSuspiciousUrl = extractedUrls.some(url => {
      const u = url.toLowerCase();
      return !BANK_NAMES.some(b => u.includes(`${b}.co`) || u.includes(`${b}.bank`) || u.includes(`${b}bank.com`));
    });

    if (hasSuspiciousUrl || detectedTriggers.length > 0 || regionalMatch.triggers.length > 0) {
      riskScore += 30;
      signals.push({
        id: 'impersonation-risk',
        category: 'IMPERSONATION',
        title: 'Organization Impersonation Indicator',
        description: `Message references "${detectedBanks.join(', ').toUpperCase()}" alongside unofficial links or urgent requests.`,
        severity: 'HIGH',
        verified: true,
        observedValue: detectedBanks.join(', ')
      });
    }
  }

  // 3. URL Lexical & TLD Analysis
  if (extractedUrls.length > 0) {
    extractedUrls.forEach((url, idx) => {
      const u = url.toLowerCase();
      const hasSuspiciousTld = KNOWN_SUSPICIOUS_TLDS.some(tld => u.includes(tld));
      const isIpAddress = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/.test(u);
      const isLookalike = BANK_NAMES.some(bank => u.includes(bank) && !u.endsWith(`${bank}.com`));

      if (hasSuspiciousTld || isIpAddress || isLookalike) {
        riskScore += 40;
        signals.push({
          id: `url-threat-${idx}`,
          category: 'MALICIOUS_URL',
          title: 'Suspicious Domain or Lookalike URL',
          description: `Extracted link "${url}" uses a suspicious top-level domain, raw IP address, or mimics known banking hostnames.`,
          severity: 'CRITICAL',
          verified: true,
          observedValue: url
        });
      } else {
        signals.push({
          id: `url-info-${idx}`,
          category: 'MALICIOUS_URL',
          title: 'Embedded External Link Found',
          description: `Extracted link "${url}". Domain not listed on high-risk registries.`,
          severity: 'LOW',
          verified: false,
          observedValue: url
        });
      }
    });
  }

  // 4. OTP / Credentials Solicitation
  if (lowerText.includes('otp') || lowerText.includes('password') || lowerText.includes('pin') || lowerText.includes('cvv')) {
    riskScore += 45;
    signals.push({
      id: 'otp-solicitation',
      category: 'OTP_REQUEST',
      title: 'Confidential Credential / OTP Request',
      description: 'The communication directly or indirectly requests confidential verification codes or security PINs.',
      severity: 'CRITICAL',
      verified: true
    });
  }

  // Clamp Score
  const finalScore = Math.min(100, Math.max(0, riskScore));
  let overallRisk: RiskLevel = 'SAFE';
  
  if (finalScore >= 70) {
    overallRisk = 'DANGEROUS';
    actions.push(
      {
        id: 'act-block',
        title: 'Do Not Click Links or Share Info',
        description: 'Never input credentials, install APKs, or reply to this message.',
        priority: 'CRITICAL',
        actionType: 'BLOCK'
      },
      {
        id: 'act-report',
        title: 'Submit Community Threat Report',
        description: 'Share this anonymous signature to protect other ScamShield users.',
        priority: 'RECOMMENDED',
        actionType: 'REPORT'
      }
    );
  } else if (finalScore >= 35) {
    overallRisk = 'SUSPICIOUS';
    actions.push(
      {
        id: 'act-verify',
        title: 'Verify via Official Channels',
        description: 'Contact the organization directly through their official mobile app or website.',
        priority: 'RECOMMENDED',
        actionType: 'VERIFY_OFFICIAL'
      }
    );
  } else {
    overallRisk = 'SAFE';
    actions.push(
      {
        id: 'act-safe',
        title: 'No Immediate Threat Detected',
        description: 'Standard indicators appear normal. Remain vigilant with sensitive information.',
        priority: 'OPTIONAL',
        actionType: 'IGNORE'
      }
    );
  }

  return {
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    overallRisk,
    riskScore: finalScore,
    confidence: 0.94,
    summary: overallRisk === 'DANGEROUS' 
      ? 'High probability of smishing, credential harvesting, or financial impersonation.'
      : overallRisk === 'SUSPICIOUS'
      ? 'Unverified elements detected. Exercise caution and verify via official applications.'
      : 'Standard communication patterns detected. No malicious signatures identified.',
    signals,
    actions,
    inputPayload: {
      type: 'MESSAGE',
      rawContent: cleanText,
      extractedUrls
    }
  };
}
