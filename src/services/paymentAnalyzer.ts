import { PaymentRiskInput, AnalysisResult, EvidenceSignal, RecommendedAction, RiskLevel } from '@/types/security';

export function analyzePaymentRisk(input: PaymentRiskInput): AnalysisResult {
  const amountNum = parseFloat(input.amount.replace(/[^0-9.]/g, '')) || 0;
  const vpa = input.recipientVpa.trim().toLowerCase();
  const note = (input.contextNote || '').toLowerCase();
  const sourceContext = (input.sourceContext || '').toLowerCase();
  
  const signals: EvidenceSignal[] = [];
  const actions: RecommendedAction[] = [];
  let riskScore = 15;

  // 1. Beneficiary Status Check
  if (input.isNewBeneficiary) {
    riskScore += 20;
    signals.push({
      id: 'new-beneficiary',
      category: 'UNVERIFIED_BENEFICIARY',
      title: 'First-Time Recipient Beneficiary',
      description: 'You have no prior payment history or trusted relationship with this recipient address.',
      severity: 'LOW',
      verified: true,
      observedValue: vpa
    });
  }

  // 2. High Amount on Unverified Entity
  if (amountNum > 10000 && input.isNewBeneficiary) {
    riskScore += 25;
    signals.push({
      id: 'high-value-unverified',
      category: 'PAYMENT_ANOMALY',
      title: 'High-Value Transfer to New Entity',
      description: `Transfer amount (INR ${amountNum.toLocaleString()}) exceeds the standard threshold for first-time unverified transfers.`,
      severity: 'HIGH',
      verified: true,
      observedValue: `INR ${amountNum.toLocaleString()}`
    });
  }

  // 3. VPA Domain & Handle Heuristics
  const suspiciousHandles = ['lottery', 'winner', 'refund', 'support', 'customercare', 'kyc', 'reward'];
  const matchedHandle = suspiciousHandles.find(h => vpa.includes(h));
  if (matchedHandle) {
    riskScore += 35;
    signals.push({
      id: 'suspicious-vpa-handle',
      category: 'IMPERSONATION',
      title: 'Deceptive VPA Handle Keywords',
      description: `The recipient identifier contains words typically associated with social engineering scams ("${matchedHandle}").`,
      severity: 'CRITICAL',
      verified: true,
      observedValue: vpa
    });
  }

  // 4. Contextual & Social Engineering Notes
  const scamNotes = ['refund processing', 'electricity bill', 'job registration', 'processing fee', 'advance tax'];
  const matchedNote = scamNotes.find(n => note.includes(n) || sourceContext.includes(n));
  if (matchedNote) {
    riskScore += 25;
    signals.push({
      id: 'suspicious-context-note',
      category: 'PAYMENT_ANOMALY',
      title: 'High-Risk Payment Purpose Context',
      description: `Payment remarks or context ("${matchedNote}") match frequent advance-fee or fake refund scam patterns.`,
      severity: 'HIGH',
      verified: true,
      observedValue: note || sourceContext
    });
  }

  const finalScore = Math.min(100, Math.max(0, riskScore));
  let overallRisk: RiskLevel = 'SAFE';

  if (finalScore >= 65) {
    overallRisk = 'DANGEROUS';
    actions.push(
      {
        id: 'act-abort',
        title: 'Halt Payment Immediately',
        description: 'Verify the recipient through independent official contact before sending funds.',
        priority: 'CRITICAL',
        actionType: 'BLOCK'
      },
      {
        id: 'act-report-upi',
        title: 'Report Deceptive UPI ID',
        description: 'Log this address to the ScamShield threat database.',
        priority: 'RECOMMENDED',
        actionType: 'REPORT'
      }
    );
  } else if (finalScore >= 35) {
    overallRisk = 'SUSPICIOUS';
    actions.push(
      {
        id: 'act-test-transfer',
        title: 'Perform Small Test Transfer',
        description: 'Send Re 1 first to verify beneficiary name in your UPI application.',
        priority: 'RECOMMENDED',
        actionType: 'VERIFY_OFFICIAL'
      }
    );
  } else {
    overallRisk = 'SAFE';
    actions.push(
      {
        id: 'act-proceed',
        title: 'Proceed with Standard Caution',
        description: 'Verify the payee name on the final UPI confirmation screen.',
        priority: 'OPTIONAL',
        actionType: 'IGNORE'
      }
    );
  }

  return {
    id: `tx-scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    overallRisk,
    riskScore: finalScore,
    confidence: 0.91,
    summary: overallRisk === 'DANGEROUS'
      ? 'High risk of payment fraud or advance-fee scam. Do not proceed without direct verbal verification.'
      : overallRisk === 'SUSPICIOUS'
      ? 'Unverified recipient parameters detected. Exercise caution and verify name matches expected payee.'
      : 'Standard transaction parameters. Always review beneficiary name on confirmation.',
    signals,
    actions,
    inputPayload: {
      type: 'TRANSACTION',
      rawContent: `VPA: ${vpa} | Amount: ${amountNum}`,
      transactionMeta: {
        amount: amountNum,
        vpa,
        recipient: vpa,
        context: note
      }
    }
  };
}
