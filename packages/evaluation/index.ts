import { explainDeterministically, type ExplanationOutput } from "../ai/index.js";
import { createContextAttachedAuditEvent, createDecisionAuditEvents } from "../audit/index.js";
import { assertContextBoundToIntent, createContextSnapshot, evaluateContextCompleteness } from "../context/index.js";
import { evaluateIntent } from "../decision/index.js";
import type { AuditEvent, ContextCompletenessResult, ContextSnapshot, DecisionResult, Evidence, PaymentContext, PaymentIntent, PolicySet } from "../domain/index.js";

export type EvaluationBundle = {
  result: DecisionResult;
  explanation: ExplanationOutput;
  contextSnapshot: ContextSnapshot;
  contextCompleteness: ContextCompletenessResult;
  auditEvents: AuditEvent[];
};

export function evaluatePayment(args: { intent: PaymentIntent; policy: PolicySet; context: PaymentContext; actor?: string }): EvaluationBundle {
  const actor = args.actor ?? args.intent.requesterId;
  const contextSnapshot = createContextSnapshot(args.intent, args.context);
  assertContextBoundToIntent(contextSnapshot, args.intent);
  const contextCompleteness = evaluateContextCompleteness(contextSnapshot);
  const result = evaluateIntent(args.intent, args.policy, args.context);
  const evidence: Evidence[] = args.context.evidence;

  return {
    result,
    explanation: explainDeterministically({
      intent: args.intent,
      policy: result.policy,
      risk: result.risk,
      evidence,
      decision: result.decision
    }),
    contextSnapshot,
    contextCompleteness,
    auditEvents: [
      createContextAttachedAuditEvent({
        intent: args.intent,
        snapshot: contextSnapshot,
        completeness: contextCompleteness,
        actor
      }),
      ...createDecisionAuditEvents({ intent: args.intent, decision: result, actor })
    ]
  };
}
