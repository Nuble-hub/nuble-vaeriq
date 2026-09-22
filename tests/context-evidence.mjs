import { strict as assert } from "node:assert";
import { createContextSnapshot, evaluateContextCompleteness, assertContextBoundToIntent } from "../dist/packages/context/index.js";
import { evaluatePayment } from "../dist/packages/evaluation/index.js";

const intent = {
  id: "pi_context_test",
  organizationId: "org_test",
  requesterType: "human",
  requesterId: "user_001",
  recipient: "Vendor111111111111111111111111111111111111",
  asset: "USDC",
  amountAtomic: "1200000000",
  amountDisplay: "1200",
  purpose: "Infrastructure invoice",
  counterpartyId: "vendor_a",
  invoiceRef: "INV-001",
  chain: "solana",
  status: "SUBMITTED",
  createdAt: "2026-09-21T00:00:00.000Z"
};

const context = {
  knownDestinations: [intent.recipient],
  knownCounterparties: ["vendor_a"],
  approvedAssets: ["USDC"],
  historicalMedianAtomic: "1000000000",
  recentIntents: [],
  invoiceRequiredAboveAtomic: "1000000000",
  evidence: [
    { id: "invoice:INV-001", type: "INVOICE", summary: "Invoice INV-001 attached." },
    { id: "vendor:vendor_a", type: "COUNTERPARTY", summary: "Known vendor record." }
  ]
};

const snapshot = createContextSnapshot(intent, context);
assert.equal(snapshot.id, "ctx:pi_context_test");
assert.equal(snapshot.intentId, intent.id);
assert.equal(snapshot.organizationId, intent.organizationId);
assert.equal(snapshot.destinationKnown, true);
assert.equal(snapshot.counterpartyKnown, true);
assert.equal(snapshot.assetApproved, true);
assert.equal(snapshot.invoiceRequired, true);
assert.deepEqual(snapshot.evidenceRefs, ["invoice:INV-001", "vendor:vendor_a"]);

const complete = evaluateContextCompleteness(snapshot);
assert.equal(complete.status, "COMPLETE");
assert.deepEqual(complete.missing, []);

const missingEvidence = evaluateContextCompleteness({ ...snapshot, evidenceRefs: ["vendor:vendor_a"] });
assert.equal(missingEvidence.status, "INCOMPLETE");
assert.deepEqual(missingEvidence.missing, ["EVIDENCE"]);

const missingInvoice = evaluateContextCompleteness({ ...snapshot, invoiceRef: undefined });
assert.equal(missingInvoice.status, "INCOMPLETE");
assert.ok(missingInvoice.missing.includes("INVOICE"));

assert.doesNotThrow(() => assertContextBoundToIntent(snapshot, intent));
assert.throws(
  () => assertContextBoundToIntent(snapshot, { ...intent, id: "pi_other" }),
  /CONTEXT_INTENT_MISMATCH/
);

const policy = {
  id: "policy_context_test",
  version: 1,
  active: true,
  defaultEffect: "ALLOW",
  rules: [
    { id: "destination", type: "DESTINATION", operator: "NOT_IN", value: [intent.recipient], effect: "BLOCK", message: "Destination blocked." }
  ]
};

const evaluation = evaluatePayment({ intent, policy, context });
assert.equal(evaluation.contextSnapshot.intentId, intent.id);
assert.equal(evaluation.contextCompleteness.status, "COMPLETE");
assert.equal(evaluation.auditEvents[0].type, "CONTEXT_ATTACHED");
assert.equal(evaluation.auditEvents[0].intentId, intent.id);
assert.match(evaluation.auditEvents[0].payloadRef, /^context:ctx:pi_context_test:status:COMPLETE:evidence:/);

const incompleteContext = {
  ...context,
  evidence: [],
  invoiceRequiredAboveAtomic: "1000000000"
};
const incompleteEvaluation = evaluatePayment({ intent, policy, context: incompleteContext });
assert.equal(incompleteEvaluation.contextCompleteness.status, "INCOMPLETE");
assert.equal(incompleteEvaluation.result.decision, "REVIEW");
assert.ok(incompleteEvaluation.result.reasons.some((reason) => reason.includes("Business context is incomplete")));
assert.equal(incompleteEvaluation.auditEvents[0].type, "CONTEXT_ATTACHED");


console.log("VAERIQ M03 context/evidence tests: PASS");
console.log(JSON.stringify({
  contextBinding: "PASS",
  completeness: evaluation.contextCompleteness.status,
  auditEvent: evaluation.auditEvents[0].type,
  incompleteContext: "REVIEW"
}, null, 2));
