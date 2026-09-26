export type RiskLevel = 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';

export type AnalysisSource = 'MANUAL' | 'SHARE_INTENT' | 'OCR_SCREENSHOT' | 'BROWSER_LINK';

export type SignalCategory = 
  | 'URGENCY_COERCION'
  | 'IMPERSONATION'
  | 'MALICIOUS_URL'
  | 'TYPOSQUATTING'
  | 'PAYMENT_ANOMALY'
  | 'UNVERIFIED_BENEFICIARY'
  | 'OTP_REQUEST'
  | 'COMMUNITY_REPORTED';

export interface EvidenceSignal {
  id: string;
  category: SignalCategory;
  title: string;
  description: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  observedValue?: string;
  verified: boolean;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL';
  actionType: 'BLOCK' | 'REPORT' | 'VERIFY_OFFICIAL' | 'IGNORE';
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  overallRisk: RiskLevel;
  riskScore: number;
  confidence: number;
  summary: string;
  signals: EvidenceSignal[];
  actions: RecommendedAction[];
  inputPayload: {
    type: 'MESSAGE' | 'URL' | 'TRANSACTION' | 'COMPOSITE';
    rawContent: string;
    extractedUrls?: string[];
    transactionMeta?: {
      amount?: number;
      recipient?: string;
      vpa?: string;
      context?: string;
    };
  };
}

export interface CommunityReport {
  id: string;
  category: 'SMISHING' | 'UPI_FRAUD' | 'BANK_IMPERSONATION' | 'LOTTERY_SCAM' | 'JOB_SCAM';
  title: string;
  description: string;
  targetIdentifier: string;
  riskScore: number;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'DISMISSED';
  upvotes: number;
  reportedAt: string;
}

export interface PaymentRiskInput {
  amount: string;
  recipientVpa: string;
  isNewBeneficiary: boolean;
  contextNote: string;
  sourceContext?: string;
}

export interface ModelMetric {
  modelName: string;
  version: string;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
  latencyMs: number;
  datasetSize: number;
}
