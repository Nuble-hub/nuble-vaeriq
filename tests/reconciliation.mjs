import { strict as assert } from "node:assert";
import { reconcilePaymentTransaction } from "../dist/packages/reconciliation/index.js";

const intent = {
  id: "pi_reconcile",
  organizationId: "org_test",
  requesterType: "human",
  requesterId: "Wallet111",
  recipient: "Vendor222",
  asset: "USDC",
  amountAtomic: "12000000",
  purpose: "test",
  chain: "solana",
  status: "APPROVED",
  createdAt: "2026-09-19T00:00:00.000Z"
};

const confirmed = {
  hash: "Sig333",
  chain: "solana",
  asset: "USDC",
  amountAtomic: "12000000",
  from: "Wallet111",
  to: "Vendor222",
  timestamp: "2026-09-19T00:00:01.000Z",
  status: "CONFIRMED"
};

const matched = reconcilePaymentTransaction(intent, confirmed);
assert.equal(matched.status, "MATCHED");
assert.deepEqual(matched.mismatches, []);

const mismatched = reconcilePaymentTransaction(intent, {
  ...confirmed,
  amountAtomic: "13000000"
});
assert.equal(mismatched.status, "MISMATCHED");
assert.ok(mismatched.mismatches.includes("AMOUNT_MISMATCH"));

const notFound = reconcilePaymentTransaction(intent, null);
assert.equal(notFound.status, "NOT_FOUND");
assert.deepEqual(notFound.mismatches, ["TRANSACTION_NOT_FOUND"]);

console.log("VAERIQ transaction reconciliation test: PASS");
