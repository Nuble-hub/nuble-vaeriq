import type { ContextCompletenessResult, ContextSnapshot, PaymentContext, PaymentIntent } from "../domain/index.js";

function atomicToBigInt(value: string): bigint {
  if (!/^\d+$/.test(value)) throw new Error("INVALID_ATOMIC_AMOUNT");
  return BigInt(value);
}

export function createContextSnapshot(intent: PaymentIntent, context: PaymentContext): ContextSnapshot {
  const evidenceRefs = [...new Set(context.evidence.map((item) => item.id).filter(Boolean))].sort();
  const invoiceRequired = Boolean(
    context.invoiceRequiredAboveAtomic &&
    atomicToBigInt(intent.amountAtomic) > atomicToBigInt(context.invoiceRequiredAboveAtomic)
  );

  return {
    id: `ctx:${intent.id}`,
    intentId: intent.id,
    organizationId: intent.organizationId,
    purpose: intent.purpose.trim(),
    counterpartyId: intent.counterpartyId,
    invoiceRef: intent.invoiceRef,
    budgetRef: intent.budgetRef,
    projectRef: intent.projectRef,
    evidenceRefs,
    destinationKnown: context.knownDestinations.includes(intent.recipient),
    counterpartyKnown: Boolean(intent.counterpartyId && context.knownCounterparties.includes(intent.counterpartyId)),
    assetApproved: context.approvedAssets.includes(intent.asset),
    invoiceRequired,
    historicalMedianAtomic: context.historicalMedianAtomic,
    agentSinglePaymentLimitAtomic: context.agentSinglePaymentLimitAtomic,
    agentDailyLimitAtomic: context.agentDailyLimitAtomic,
    agentSpentTodayAtomic: context.agentSpentTodayAtomic
  };
}

export function evaluateContextCompleteness(snapshot: ContextSnapshot): ContextCompletenessResult {
  const missing: ContextCompletenessResult["missing"] = [];

  if (!snapshot.purpose) missing.push("PURPOSE");
  if (!snapshot.counterpartyId) missing.push("COUNTERPARTY");
  if (snapshot.invoiceRequired && !snapshot.invoiceRef) missing.push("INVOICE");
  if (snapshot.invoiceRef && !snapshot.evidenceRefs.some((ref) => ref === `invoice:${snapshot.invoiceRef}`)) {
    missing.push("EVIDENCE");
  }

  return {
    status: missing.length ? "INCOMPLETE" : "COMPLETE",
    missing,
    evidenceRefs: snapshot.evidenceRefs
  };
}

export function assertContextBoundToIntent(snapshot: ContextSnapshot, intent: PaymentIntent): void {
  if (snapshot.intentId !== intent.id) throw new Error("CONTEXT_INTENT_MISMATCH");
  if (snapshot.organizationId !== intent.organizationId) throw new Error("CONTEXT_ORGANIZATION_MISMATCH");
}
