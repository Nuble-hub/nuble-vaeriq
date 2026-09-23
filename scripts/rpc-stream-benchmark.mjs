#!/usr/bin/env node

import process from "node:process";
import { performance } from "node:perf_hooks";

const DEFAULT_BASELINE_WS = "wss://api.mainnet.solana.com";
const DEFAULT_TARGET_MATCHED_SLOTS = 30;
const DEFAULT_TIMEOUT_MS = 45_000;

const baselineUrl = process.env.SOLANA_BASELINE_WS_URL || DEFAULT_BASELINE_WS;
const candidateUrl = process.env.RPC_FAST_WS_URL || "";
const targetMatchedSlots = positiveInt(
  process.env.STREAM_TARGET_MATCHED_SLOTS,
  DEFAULT_TARGET_MATCHED_SLOTS
);
const timeoutMs = positiveInt(
  process.env.STREAM_TIMEOUT_MS,
  DEFAULT_TIMEOUT_MS
);

if (!candidateUrl) {
  console.error("RPC_FAST_WS_URL is not set.");
  console.error(
    "Copy the RPC Fast Focus WebSocket endpoint from the dashboard and set RPC_FAST_WS_URL."
  );
  process.exit(2);
}

if (typeof WebSocket === "undefined") {
  console.error("WebSocket is not available in this Node.js runtime.");
  console.error("Use a Node.js version with the built-in WebSocket client (Node 22+ recommended).");
  process.exit(2);
}

const startedAt = new Date().toISOString();

console.log("VAERIQ M04 streaming observation probe");
console.log(
  JSON.stringify(
    {
      startedAt,
      baselineLabel: "Solana public Mainnet WebSocket",
      candidateLabel: "RPC Fast Focus",
      method: "slotSubscribe",
      targetMatchedSlots,
      timeoutMs,
      note:
        "Measures end-to-end notification arrival from the same machine. It does not measure validator-side processing time and does not establish execution truth."
    },
    null,
    2
  )
);

const [baseline, candidate] = await Promise.all([
  openSubscription("baseline", baselineUrl),
  openSubscription("rpc-fast-focus", candidateUrl)
]);

const streams = { baseline, candidate };
const startedMeasurementAt = performance.now();
const observations = {
  baseline: createObservationState(),
  candidate: createObservationState()
};
const matchedSlots = new Map();
let timer;
let finished = false;

const timeoutPromise = new Promise((resolve) => {
  timer = setTimeout(() => resolve({ reason: "timeout" }), timeoutMs);
});

const matchedPromise = new Promise((resolve) => {
  for (const stream of Object.values(streams)) {
    stream.onSlot = (slot) => {
      recordSlot(stream.label, slot);

      const left = observations.baseline.slots.get(slot);
      const right = observations.candidate.slots.get(slot);

      if (left !== undefined && right !== undefined && !matchedSlots.has(slot)) {
        const candidateMinusBaselineMs = right - left;
        matchedSlots.set(slot, candidateMinusBaselineMs);

        if (matchedSlots.size >= targetMatchedSlots && !finished) {
          finished = true;
          resolve({ reason: "target_reached" });
        }
      }
    };
  }
});

await Promise.race([matchedPromise, timeoutPromise]);

clearTimeout(timer);
finished = true;

for (const stream of Object.values(streams)) {
  try {
    stream.ws.close();
  } catch {
    // Ignore close errors during probe shutdown.
  }
}

const deltas = [...matchedSlots.values()];
const candidateFirstCount = deltas.filter((value) => value < 0).length;
const baselineFirstCount = deltas.filter((value) => value > 0).length;
const tiedCount = deltas.filter((value) => value === 0).length;

const result = {
  startedAt,
  completedAt: new Date().toISOString(),
  durationMs: round(performance.now() - startedMeasurementAt, 2),
  outcome:
    matchedSlots.size >= targetMatchedSlots ? "TARGET_REACHED" : "TIMEOUT",
  targetMatchedSlots,
  matchedSlots: matchedSlots.size,
  baseline: summarizeObservation(observations.baseline),
  rpcFastFocus: summarizeObservation(observations.candidate),
  slotComparison: {
    candidateMinusBaselineMs: summarizeDeltas(deltas),
    candidateFirstPct: pct(candidateFirstCount, matchedSlots.size),
    baselineFirstPct: pct(baselineFirstCount, matchedSlots.size),
    tiedPct: pct(tiedCount, matchedSlots.size),
    candidateFirstCount,
    baselineFirstCount,
    tiedCount
  },
  notes: [
    "Negative candidateMinusBaselineMs means RPC Fast notification arrived earlier for that matched slot.",
    "Positive candidateMinusBaselineMs means the public baseline notification arrived earlier.",
    "Only the first notification timestamp per slot is used; duplicate notifications are counted separately.",
    "A slot gap is an observation where the slot was seen by one stream during the probe window but not by both.",
    "This probe tests observation timing only. It does not replace confirmation, transaction lookup, or reconciliation."
  ]
};

console.log(JSON.stringify(result, null, 2));

async function openSubscription(label, url) {
  const ws = new WebSocket(url);
  const state = {
    label,
    ws,
    subscriptionId: null,
    onSlot: null,
    openedAt: performance.now(),
    errors: [],
    duplicates: 0,
    notifications: 0,
    slots: new Map()
  };

  return new Promise((resolve, reject) => {
    let settled = false;

    const fail = (error) => {
      if (settled) return;
      settled = true;
      try {
        ws.close();
      } catch {
        // Ignore cleanup errors.
      }
      reject(error);
    };

    ws.addEventListener("open", () => {
      ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "slotSubscribe"
        })
      );
    });

    ws.addEventListener("message", (event) => {
      let message;
      try {
        message = JSON.parse(String(event.data));
      } catch {
        state.errors.push("INVALID_JSON");
        return;
      }

      if (message.id === 1 && Object.hasOwn(message, "result")) {
        state.subscriptionId = message.result;
        if (!settled) {
          settled = true;
          resolve(state);
        }
        return;
      }

      if (message.method !== "slotNotification") return;

      const slot = message.params?.result?.slot;
      if (!Number.isSafeInteger(slot)) {
        state.errors.push("INVALID_SLOT_NOTIFICATION");
        return;
      }

      state.notifications += 1;
      const now = performance.now();
      if (state.slots.has(slot)) {
        state.duplicates += 1;
        return;
      }

      state.slots.set(slot, now);
      state.onSlot?.(slot);
    });

    ws.addEventListener("error", () => {
      state.errors.push("WEBSOCKET_ERROR");
      fail(new Error(`${label}: WebSocket error`));
    });

    ws.addEventListener("close", (event) => {
      if (!settled) {
        fail(
          new Error(
            `${label}: WebSocket closed before subscription acknowledgement (code=${event.code})`
          )
        );
      }
    });

    setTimeout(() => {
      if (!settled) {
        fail(new Error(`${label}: subscription acknowledgement timeout`));
      }
    }, Math.min(timeoutMs, 15_000));
  });
}

function createObservationState() {
  return {
    notifications: 0,
    duplicates: 0,
    slots: new Map(),
    errors: []
  };
}

function recordSlot(label, slot) {
  const state = observations[label];
  if (!state.slots.has(slot)) {
    state.slots.set(slot, performance.now());
    state.notifications += 1;
  } else {
    state.duplicates += 1;
  }
}

function summarizeObservation(state) {
  return {
    notifications: state.notifications,
    uniqueSlots: state.slots.size,
    duplicateNotifications: state.duplicates,
    errorCount: state.errors.length,
    errors: state.errors.slice(0, 5)
  };
}

function summarizeDeltas(values) {
  return {
    count: values.length,
    p50Ms: percentile(values, 0.50),
    p95Ms: percentile(values, 0.95),
    p99Ms: percentile(values, 0.99),
    minMs: minOrNull(values),
    maxMs: maxOrNull(values)
  };
}

function percentile(values, ratio) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(ratio * sorted.length) - 1)
  );
  return round(sorted[index], 2);
}

function minOrNull(values) {
  return values.length ? round(Math.min(...values), 2) : null;
}

function maxOrNull(values) {
  return values.length ? round(Math.max(...values), 2) : null;
}

function positiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function pct(part, total) {
  return total ? round((part / total) * 100, 2) : 0;
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
