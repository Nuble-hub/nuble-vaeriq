import { explainDeterministically, type ExplanationOutput } from "../ai/index.js";
import { createDecisionAuditEvents } from "../audit/index.js";
import { evaluateIntent } from "../decision/index.js";
import type { AuditEvent, DecisionResult, Evidence, PaymentContext, PaymentIntent, PolicySet } from "../domain/index.js";
export type EvaluationBundle = { result: DecisionResult; explanation: ExplanationOutput; auditEvents: AuditEvent[] };
export function evaluatePayment(args: { intent: PaymentIntent; policy: PolicySet; context: PaymentContext; actor?: string }): EvaluationBundle { const result = evaluateIntent(args.intent, args.policy, args.context); const evidence: Evidence[] = args.context.evidence; return { result, explanation: explainDeterministically({ intent: args.intent, policy: result.policy, risk: result.risk, evidence, decision: result.decision }), auditEvents: createDecisionAuditEvents({ intent: args.intent, decision: result, actor: args.actor ?? args.intent.requesterId }) }; }
