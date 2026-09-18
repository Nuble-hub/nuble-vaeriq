import { strict as assert } from "node:assert";
import { JsonAuditEventStore } from "../dist/packages/audit/store.js";
import { createExecutionFailureAuditEvent } from "../dist/packages/audit/index.js";

const data = new Map();
const storage = {
  getItem(key) { return data.has(key) ? data.get(key) : null; },
  setItem(key, value) { data.set(key, value); },
  removeItem(key) { data.delete(key); }
};

const events = [
  {
    id: "pi_test:decision",
    type: "DECISION_MADE",
    actor: "agent_001",
    intentId: "pi_test",
    organizationId: "org_test",
    timestamp: "2026-09-19T00:00:00.000Z",
    payloadRef: "decision:APPROVE"
  },
  {
    id: "pi_test:confirmed",
    type: "TRANSACTION_CONFIRMED",
    actor: "agent_001",
    intentId: "pi_test",
    organizationId: "org_test",
    timestamp: "2026-09-19T00:00:01.000Z",
    payloadRef: "tx:devnet-signature"
  }
];

const first = new JsonAuditEventStore(storage, "test:audit");
first.append(events);

const reloaded = new JsonAuditEventStore(storage, "test:audit");
assert.deepEqual(reloaded.list(), events);
assert.deepEqual(reloaded.list(1), events.slice(-1));

reloaded.clear();
assert.deepEqual(reloaded.list(), []);

console.log("VAERIQ audit persistence test: PASS");


const failure = createExecutionFailureAuditEvent({
  intent: {
    id: "pi_failure",
    organizationId: "org_test",
    requesterType: "agent",
    requesterId: "agent_001",
    recipient: "recipient",
    asset: "USDC",
    amountAtomic: "1000000",
    purpose: "test",
    chain: "solana",
    status: "APPROVED",
    createdAt: "2026-09-19T00:00:00.000Z"
  },
  actor: "agent_001",
  error: "INSUFFICIENT_USDC_BALANCE",
  now: "2026-09-19T00:00:02.000Z"
});

assert.equal(failure.type, "EXECUTION_FAILED");
assert.match(failure.payloadRef, /INSUFFICIENT_USDC_BALANCE/);
