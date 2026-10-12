import type { PaymentContext, PaymentIntent, PolicySet } from "../domain/index.js";

// These are deliberately fixed, synthetic demo fixtures. They are not verified
// vendor records, production policies, or externally validated invoices.
export const DEMO_DESTINATION = "HQVxiMVDoV9jzG4tpoxmDZsNfWvaHXm8DGGv93Gka75v";
export const BLOCK_DESTINATION = "11111111111111111111111111111111";
export const DEMO_INVOICE_REF = "INV-001";

export function createDemoPolicy(): PolicySet {
  return {
    id: "policy_demo_m01",
    version: 1,
    active: true,
    defaultEffect: "ALLOW",
    rules: [
      { id: "asset-usdc-only", type: "ASSET", operator: "NOT_IN", value: ["USDC"], effect: "BLOCK", message: "Only USDC is supported by the demo treasury policy." },
      { id: "destination-allowlist", type: "DESTINATION", operator: "NOT_IN", value: [DEMO_DESTINATION], effect: "BLOCK", message: "Destination is outside the approved demo treasury allowlist." },
      { id: "large-agent-review", type: "AMOUNT", operator: "GT", value: "5000000000", effect: "REVIEW", message: "Payments above 5,000 USDC require treasury review." }
    ]
  };
}

export function createDemoContext(intent: PaymentIntent): PaymentContext {
  return {
    // A typed-in recipient must never add itself to a trusted destination list.
    knownDestinations: [DEMO_DESTINATION],
    knownCounterparties: ["vendor_demo"],
    approvedAssets: ["USDC"],
    historicalMedianAtomic: "2000000000",
    recentIntents: [],
    invoiceRequiredAboveAtomic: "1000000000",
    agentSinglePaymentLimitAtomic: "5000000000",
    agentDailyLimitAtomic: "20000000000",
    agentSpentTodayAtomic: "1000000000",
    // Typing an arbitrary invoice ID is not proof that evidence exists.
    // Only the known, synthetic sample invoice has corresponding fixture evidence.
    evidence: intent.invoiceRef === DEMO_INVOICE_REF
      ? [{
          id: `invoice:${DEMO_INVOICE_REF}`,
          type: "INVOICE",
          summary: "Synthetic demo invoice INV-001 (sample evidence only; not externally verified)."
        }]
      : []
  };
}
