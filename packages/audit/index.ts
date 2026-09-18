import type { AuditEvent, AuditEventType, DecisionResult, PaymentIntent } from "../domain/index.js";

export function createAuditEvent(args: { id: string; type: AuditEventType; actor: string; intentId: string; organizationId: string; payloadRef?: string; now?: string }): AuditEvent {
  return { id: args.id, type: args.type, actor: args.actor, intentId: args.intentId, organizationId: args.organizationId, timestamp: args.now ?? new Date().toISOString(), payloadRef: args.payloadRef };
}

export function createDecisionAuditEvents(args: { intent: PaymentIntent; decision: DecisionResult; actor: string; now?: string }): AuditEvent[] {
  const now = args.now ?? new Date().toISOString();
  const base = { actor: args.actor, intentId: args.intent.id, organizationId: args.intent.organizationId, now };
  return [
    createAuditEvent({ ...base, id: `${args.intent.id}:policy`, type: "POLICY_EVALUATED", payloadRef: `policy:${args.decision.policy.policyId}:v${args.decision.policy.policyVersion}` }),
    createAuditEvent({ ...base, id: `${args.intent.id}:risk`, type: "RISK_EVALUATED", payloadRef: `risk:${args.decision.risk.signals.length}` }),
    createAuditEvent({ ...base, id: `${args.intent.id}:decision`, type: "DECISION_MADE", payloadRef: `decision:${args.decision.decision}` })
  ];
}

export function createExecutionAuditEvents(args: { intent: PaymentIntent; actor: string; txHash: string; now?: string }): AuditEvent[] {
  const now = args.now ?? new Date().toISOString();
  const base = { actor: args.actor, intentId: args.intent.id, organizationId: args.intent.organizationId, now, payloadRef: `tx:${args.txHash}` };
  return [
    createAuditEvent({ ...base, id: `${args.intent.id}:execution-started`, type: "EXECUTION_STARTED" }),
    createAuditEvent({ ...base, id: `${args.intent.id}:submitted`, type: "TRANSACTION_SUBMITTED" }),
    createAuditEvent({ ...base, id: `${args.intent.id}:confirmed`, type: "TRANSACTION_CONFIRMED" })
  ];
}


export function createExecutionFailureAuditEvent(args: { intent: PaymentIntent; actor: string; error: string; now?: string }): AuditEvent {
  const now = args.now ?? new Date().toISOString();
  return createAuditEvent({
    id: `${args.intent.id}:execution-failed:${now}`,
    type: "EXECUTION_FAILED",
    actor: args.actor,
    intentId: args.intent.id,
    organizationId: args.intent.organizationId,
    now,
    payloadRef: `error:${args.error.slice(0, 160)}`
  });
}
