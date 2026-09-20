import { evaluateIntent } from "../../packages/decision/index.js";
import type { PaymentContext, PaymentIntent, PolicySet } from "../../packages/domain/index.js";
export { authorizeExecution } from "../../packages/decision/execution-guard.js";
export function evaluateForWorker(intent: PaymentIntent, policy: PolicySet, context: PaymentContext) { return evaluateIntent(intent, policy, context); }
