import { strict as assert } from "node:assert";
import {
  JsonExecutionAttemptStore,
  canStartExecution,
  createExecutionAttempt,
  isRetryableExecutionState,
  nextExecutionAttemptState
} from "../dist/packages/execution/index.js";
import { isUserRejectedWalletError } from "../dist/adapters/solana/index.js";

const storage = new Map();
const adapter = {
  getItem(key) { return storage.get(key) ?? null; },
  setItem(key, value) { storage.set(key, value); },
  removeItem(key) { storage.delete(key); }
};

const store = new JsonExecutionAttemptStore(adapter);
const intent = {
  id: "pi_recovery",
  organizationId: "org_test",
  requesterType: "agent",
  requesterId: "agent_001",
  recipient: "DemoVendor111111111111111111111111111111111",
  asset: "USDC",
  amountAtomic: "1200000000",
  purpose: "API infrastructure",
  counterpartyId: "vendor_a",
  invoiceRef: "INV-001",
  chain: "solana",
  status: "SUBMITTED",
  createdAt: "2026-09-21T00:00:00.000Z"
};

assert.equal(canStartExecution(null), true);

assert.equal(isUserRejectedWalletError(new Error("User rejected the request.")), true);
assert.equal(isUserRejectedWalletError({ code: 4001, message: "User rejected the request." }), true);
assert.equal(isUserRejectedWalletError({ code: 11, cause: { message: "User rejected the request." } }), true);
assert.equal(isUserRejectedWalletError(new Error("RPC request timed out")), false);

const started = createExecutionAttempt(intent, "2026-09-21T00:01:00.000Z");
assert.equal(started.intentId, intent.id);
assert.equal(started.idempotencyKey, "intent:pi_recovery");
store.append(started);

assert.equal(store.latest(intent.id)?.state, "STARTED");
assert.equal(canStartExecution(store.latest(intent.id)), false);

const failed = nextExecutionAttemptState(
  started,
  "FAILED_BEFORE_SUBMISSION",
  { now: "2026-09-21T00:02:00.000Z", error: "INSUFFICIENT_USDC_BALANCE" }
);
store.replace(failed);

assert.equal(store.latest(intent.id)?.state, "FAILED_BEFORE_SUBMISSION");
assert.equal(isRetryableExecutionState(failed.state), true);
assert.equal(canStartExecution(failed), true);
assert.equal(failed.error, "INSUFFICIENT_USDC_BALANCE");

const retry = createExecutionAttempt(intent, "2026-09-21T00:03:00.000Z");
store.append(retry);

assert.equal(store.list(intent.id).length, 2);
assert.equal(store.latest(intent.id)?.id, retry.id);
assert.equal(retry.idempotencyKey, started.idempotencyKey);

const unknown = nextExecutionAttemptState(
  retry,
  "UNKNOWN_AFTER_SUBMISSION",
  { now: "2026-09-21T00:04:00.000Z", error: "RPC_TIMEOUT_AFTER_SEND" }
);
store.replace(unknown);

assert.equal(canStartExecution(unknown), false);
assert.equal(isRetryableExecutionState(unknown.state), false);

const reloadedStore = new JsonExecutionAttemptStore(adapter);
assert.equal(reloadedStore.latest(intent.id)?.state, "UNKNOWN_AFTER_SUBMISSION");
assert.equal(reloadedStore.latest(intent.id)?.error, "RPC_TIMEOUT_AFTER_SEND");

assert.throws(() => store.append(retry), /EXECUTION_ATTEMPT_ALREADY_EXISTS/);

console.log("VAERIQ M02 recovery/idempotency tests: PASS");
