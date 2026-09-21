import type { AuditEvent, AuditEventType, ContextCompletenessResult, ContextSnapshot, DecisionResult, PaymentIntent } from "../domain/index.js";

export function createAuditEvent(args: { id: string; type: AuditEventType; actor: string; intentId: string; organizationId: string; payloadRef?: string; now?: string }): AuditEvent {
  return { id: args.id, type: args.type, actor: args.actor, intentId: args.intentId, organizationId: args.organizationId, timestamp: args.now ?? new Date().toISOString(), payloadRef: args.payloadRef };
}

export function createContextAttachedAuditEvent(args: { intent: PaymentIntent; snapshot: ContextSnapshot; completeness: ContextCompletenessResult; actor: string; now?: string }): AuditEvent {
  const evidence = args.snapshot.evidenceRefs.length ? args.snapshot.evidenceRefs.join(",") : "none";
  return createAuditEvent({
    id: `${args.intent.id}:context`,
    type: "CONTEXT_ATTACHED",
    actor: args.actor,
    intentId: args.intent.id,
    organizationId: args.intent.organizationId,
    now: args.now,
    payloadRef: `context:${args.snapshot.id}:status:${args.completeness.status}:evidence:${evidence}`
  });
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

export function createExecutionAuditEvents(args: { intent: PaymentIntent; actor: string; txHash: string; executionAttemptId?: string; now?: string }): AuditEvent[] {
  const now = args.now ?? new Date().toISOString();
  const suffix = args.executionAttemptId ? `:${args.executionAttemptId}` : "";
  const base = { actor: args.actor, intentId: args.intent.id, organizationId: args.intent.organizationId, now, payloadRef: `tx:${args.txHash}` };
  return [
    createAuditEvent({ ...base, id: `${args.intent.id}:execution-started${suffix}`, type: "EXECUTION_STARTED" }),
    createAuditEvent({ ...base, id: `${args.intent.id}:submitted${suffix}`, type: "TRANSACTION_SUBMITTED" }),
    createAuditEvent({ ...base, id: `${args.intent.id}:confirmed${suffix}`, type: "TRANSACTION_CONFIRMED" })
  ];
}

export function createExecutionFailureAuditEvent(args: { intent: PaymentIntent; actor: string; error: string; executionAttemptId?: string; now?: string }): AuditEvent {
  const now = args.now ?? new Date().toISOString();
  const suffix = args.executionAttemptId ? `:${args.executionAttemptId}` : "";
  return createAuditEvent({
    id: `${args.intent.id}:execution-failed:${now}${suffix}`,
    type: "EXECUTION_FAILED",
    actor: args.actor,
    intentId: args.intent.id,
    organizationId: args.intent.organizationId,
    now,
    payloadRef: `error:${args.error.slice(0, 160)}`
  });
}

export function createExecutionUnknownAuditEvent(args: { intent: PaymentIntent; actor: string; error: string; executionAttemptId?: string; now?: string }): AuditEvent {
  const now = args.now ?? new Date().toISOString();
  const suffix = args.executionAttemptId ? `:${args.executionAttemptId}` : "";
  return createAuditEvent({
    id: `${args.intent.id}:execution-unknown:${now}${suffix}`,
    type: "EXECUTION_UNKNOWN",
    actor: args.actor,
    intentId: args.intent.id,
    organizationId: args.intent.organizationId,
    now,
    payloadRef: `error:${args.error.slice(0, 160)}`
  });
}

export function createTransactionReconciliationAuditEvent(args: {
  intent: PaymentIntent;
  actor: string;
  txHash: string;
  status: "MATCHED" | "MISMATCHED" | "NOT_FOUND";
  executionAttemptId?: string;
  now?: string;
}): AuditEvent {
  const suffix = args.executionAttemptId ? `:${args.executionAttemptId}` : "";
  return createAuditEvent({
    id: `${args.intent.id}:transaction-reconciled:${args.now ?? new Date().toISOString()}${suffix}`,
    type: "TRANSACTION_RECONCILED",
    actor: args.actor,
    intentId: args.intent.id,
    organizationId: args.intent.organizationId,
    now: args.now,
    payloadRef: `reconciliation:${args.status}:tx:${args.txHash}`
  });
}
