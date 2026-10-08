import { strict as assert } from "node:assert";
import { createDemoPolicy, createDemoContext, DEMO_DESTINATION, BLOCK_DESTINATION, DEMO_INVOICE_REF } from "../dist/packages/demo-fixtures/index.js";
import { evaluatePayment } from "../dist/packages/evaluation/index.js";
import { authorizeExecution } from "../dist/packages/decision/execution-guard.js";

const baseIntent = {
  id: "pi_demo_fixture_test",
  organizationId: "demo_org",
  requesterType: "human",
  requesterId: "demo_sender",
  recipient: DEMO_DESTINATION,
  asset: "USDC",
  amountAtomic: "12000000",
  purpose: "Hackathon milestone payment",
  counterpartyId: "vendor_demo",
  invoiceRef: DEMO_INVOICE_REF,
  chain: "solana",
  status: "SUBMITTED",
  createdAt: new Date().toISOString()
};
const evaluate = (intent) => evaluatePayment({ intent, policy: createDemoPolicy(), context: createDemoContext(intent) });

const approved = evaluate(baseIntent);
assert.equal(approved.result.decision, "APPROVE");
assert.equal(approved.contextCompleteness.status, "COMPLETE");
assert.equal(createDemoContext(baseIntent).knownDestinations[0], DEMO_DESTINATION);
assert.match(createDemoContext(baseIntent).evidence[0].summary, /Synthetic demo invoice/);
assert.equal(authorizeExecution(baseIntent, approved.result).status, "APPROVED");

const changedRecipient = { ...baseIntent, id: "pi_unlisted", recipient: BLOCK_DESTINATION };
const blocked = evaluate(changedRecipient);
assert.equal(blocked.result.decision, "BLOCK");
assert.equal(blocked.contextSnapshot.destinationKnown, false);
assert.throws(() => authorizeExecution(changedRecipient, blocked.result), /EXECUTION_NOT_AUTHORIZED:BLOCK/);

const arbitraryInvoice = { ...baseIntent, id: "pi_arbitrary_invoice", invoiceRef: "INV-FAKE" };
const reviewed = evaluate(arbitraryInvoice);
assert.equal(createDemoContext(arbitraryInvoice).evidence.length, 0);
assert.equal(reviewed.contextCompleteness.status, "INCOMPLETE");
assert.ok(reviewed.contextCompleteness.missing.includes("EVIDENCE"));
assert.equal(reviewed.result.decision, "REVIEW");
assert.throws(() => authorizeExecution(arbitraryInvoice, reviewed.result), /EXECUTION_NOT_AUTHORIZED:REVIEW/);

const unsupportedAsset = { ...baseIntent, id: "pi_other_asset", asset: "XYZ" };
const blockedAsset = evaluate(unsupportedAsset);
assert.equal(blockedAsset.result.decision, "BLOCK");

const adversarial = { ...changedRecipient, id: "pi_adversarial", amountAtomic: "8500000000", invoiceRef: undefined };
const blockedAdversarial = evaluate(adversarial);
assert.equal(blockedAdversarial.result.decision, "BLOCK");
assert.equal(blockedAdversarial.contextCompleteness.status, "INCOMPLETE");

console.log("VAERIQ fixed demo-policy fixtures and negative controls: PASS");
