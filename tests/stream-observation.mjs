import { strict as assert } from "node:assert";
import {
  createObservationState,
  recordSlotObservation,
  summarizeObservation,
  summarizeDeltas
} from "../scripts/stream-observation-core.mjs";

const state = createObservationState();

recordSlotObservation(state, 100, 1);
recordSlotObservation(state, 101, 2);
recordSlotObservation(state, 104, 3);
recordSlotObservation(state, 104, 4);

assert.equal(state.notifications, 4);
assert.equal(state.slots.size, 3);
assert.equal(state.duplicates, 1);
assert.equal(state.gaps, 2);
assert.deepEqual(state.gapEvents, [
  { previousSlot: 101, currentSlot: 104, missedSlots: 2 }
]);

recordSlotObservation(state, 103, 5);
assert.equal(state.gaps, 2);
assert.equal(state.lastObservedSlot, 104);

state.reconnectAttempts = 2;
state.reconnectsSucceeded = 2;
state.reconnectErrors = 0;
state.forcedReconnects = 1;

const summary = summarizeObservation(state);
assert.equal(summary.observedGapSlots, 2);
assert.equal(summary.duplicateNotifications, 1);
assert.equal(summary.reconnectsSucceeded, 2);
assert.equal(summary.forcedReconnects, 1);
assert.equal(summary.errorCount, 0);

const deltas = summarizeDeltas([-5, 0, 3, 10]);
assert.equal(deltas.count, 4);
assert.equal(deltas.p50Ms, 0);
assert.equal(deltas.p95Ms, 10);
assert.equal(deltas.p99Ms, 10);
assert.equal(deltas.minMs, -5);
assert.equal(deltas.maxMs, 10);

console.log("VAERIQ M04 stream observation core tests: PASS");
console.log(JSON.stringify({
  duplicateDetection: "PASS",
  gapDetection: "PASS",
  reconnectAccounting: "PASS",
  deltaSummary: "PASS"
}, null, 2));
