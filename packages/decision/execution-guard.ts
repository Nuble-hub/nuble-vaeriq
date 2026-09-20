import type { ApprovedIntent, DecisionResult, PaymentIntent } from "../domain/index.js";

export function authorizeExecution(intent: PaymentIntent, decision: DecisionResult): ApprovedIntent {
  if (decision.intentId !== intent.id) {
    throw new Error("EXECUTION_NOT_AUTHORIZED:INTENT_MISMATCH");
  }
  if (decision.decision !== "APPROVE") {
    throw new Error(`EXECUTION_NOT_AUTHORIZED:${decision.decision}`);
  }
  if (intent.status !== "SUBMITTED") {
    throw new Error(`EXECUTION_NOT_AUTHORIZED:INVALID_INTENT_STATUS:${intent.status}`);
  }
  if (
    decision.policy.result !== "PASS" ||
    decision.policy.hasBlock ||
    decision.policy.requiresReview
  ) {
    throw new Error("EXECUTION_NOT_AUTHORIZED:POLICY_NOT_PASS");
  }
  if (decision.risk.severitySummary === "HIGH") {
    throw new Error("EXECUTION_NOT_AUTHORIZED:HIGH_RISK");
  }
  return { ...intent, status: "APPROVED" };
}
