import type { ApprovedIntent, DecisionResult, PaymentIntent } from "../domain/index.js";
export function authorizeExecution(intent: PaymentIntent, decision: DecisionResult): ApprovedIntent { if (decision.decision !== "APPROVE") throw new Error(`EXECUTION_NOT_AUTHORIZED:${decision.decision}`); return { ...intent, status: "APPROVED" }; }
