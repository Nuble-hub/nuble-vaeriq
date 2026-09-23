#!/usr/bin/env node

import process from "node:process";
import { performance } from "node:perf_hooks";
import {
  createObservationState,
  recordSlotObservation,
  summarizeDeltas,
  summarizeObservation,
  pct,
  positiveInt,
  nonNegativeInt,
  round
} from "./stream-observation-core.mjs";

const DEFAULT_BASELINE_WS = "wss://api.mainnet.solana.com";
const DEFAULT_TARGET_MATCHED_SLOTS = 30;
const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_RECONNECT_DELAY_MS = 500;
const DEFAULT_MAX_RECONNECTS = 3;

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
const reconnectDelayMs = positiveInt(
  process.env.STREAM_RECONNECT_DELAY_MS,
  DEFAULT_RECONNECT_DELAY_MS
);
const maxReconnects = nonNegativeInt(
  process.env.STREAM_MAX_RECONNECTS,
  DEFAULT_MAX_RECONNECTS
);
const forceReconnectAfterMs = nonNegativeInt(
  process.env.STREAM_FORCE_RECONNECT_AFTER_MS,
  0
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
  console.error(
    "Use a Node.js version with the built-in WebSocket client (Node 22+ recommended)."
  );
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
      reconnectDelayMs,
      maxReconnects,
      forceReconnectAfterMs,
      note:
        "Measures end-to-end notification arrival from the same machine. It does not measure validator-side processing time and does not establish execution truth."
    },
    null,
    2
  )
);

const [baseline, candidate] = await Promise.all([
  createStreamSession("baseline", baselineUrl, reconnectDelayMs, maxReconnects),
  createStreamSession("candidate", candidateUrl, reconnectDelayMs, maxReconnects)
]);

const streams = { baseline, candidate };
const observations = {
  baseline: createObservationState(),
  candidate: createObservationState()
};
const matchedSlots = new Map();
const startedMeasurementAt = performance.now();
let finished = false;

for (const [key, stream] of Object.entries(streams)) {
  stream.onSlot = (slot, timestamp) => {
    if (finished || timestamp < startedMeasurementAt) return;

    const state = observations[key];
    const observation = recordSlotObservation(state, slot, timestamp);

    if (observation.duplicate) return;

    const left = observations.baseline.slots.get(slot);
    const right = observations.candidate.slots.get(slot);

    if (left !== undefined && right !== undefined && !matchedSlots.has(slot)) {
      matchedSlots.set(slot, right - left);
    }
  };
}

const forceReconnectTimer =
  forceReconnectAfterMs > 0
    ? setTimeout(() => {
        for (const stream of Object.values(streams)) {
          stream.forceReconnect("scheduled-test");
        }
      }, forceReconnectAfterMs)
    : null;

const outcome = await waitForMatches();

finished = true;

if (forceReconnectTimer) clearTimeout(forceReconnectTimer);

for (const stream of Object.values(streams)) {
  stream.stop();
}

const unionSlots = new Set([
  ...observations.baseline.slots.keys(),
  ...observations.candidate.slots.keys()
]);
const baselineOnlySlots = [...unionSlots].filter(
  (slot) =>
    observations.baseline.slots.has(slot) &&
    !observations.candidate.slots.has(slot)
).length;
const candidateOnlySlots = [...unionSlots].filter(
  (slot) =>
    observations.candidate.slots.has(slot) &&
    !observations.baseline.slots.has(slot)
).length;

const deltas = [...matchedSlots.values()];
const candidateFirstCount = deltas.filter((value) => value < 0).length;
const baselineFirstCount = deltas.filter((value) => value > 0).length;
const tiedCount = deltas.filter((value) => value === 0).length;

const result = {
  startedAt,
  completedAt: new Date().toISOString(),
  durationMs: round(performance.now() - startedMeasurementAt, 2),
  outcome,
  targetMatchedSlots,
  matchedSlots: matchedSlots.size,
  reconnectTest: {
    enabled: forceReconnectAfterMs > 0,
    forcedDisconnectAfterMs: forceReconnectAfterMs || null
  },
  baseline: summarizeObservation(observations.baseline),
  rpcFastFocus: summarizeObservation(observations.candidate),
  slotComparison: {
    candidateMinusBaselineMs: summarizeDeltas(deltas),
    unionUniqueSlots: unionSlots.size,
    baselineOnlySlots,
    candidateOnlySlots,
    candidateFirstPct: pct(candidateFirstCount, matchedSlots.size),
    baselineFirstPct: pct(baselineFirstCount, matchedSlots.size),
    tiedPct: pct(tiedCount, matchedSlots.size),
    candidateFirstCount,
    baselineFirstCount,
    tiedCount
  },
  notes: [
    "Both subscriptions are established in parallel and measurement begins only after both subscription acknowledgements complete.",
    "Active WebSocket errors and closes are treated as recoverable events up to STREAM_MAX_RECONNECTS per stream.",
    "Negative candidateMinusBaselineMs means RPC Fast notification arrived earlier for that matched slot.",
    "Positive candidateMinusBaselineMs means the public baseline notification arrived earlier.",
    "Notification counts include duplicates; uniqueSlots counts distinct observed slot numbers.",
    "An observed slot gap is a jump in slot numbers on one stream. It indicates notifications were not observed for the intervening slots during this process lifetime; it does not prove where the loss occurred.",
    "The forced reconnect option intentionally closes both streams once so reconnect handling can be runtime-tested without waiting for a production network failure.",
    "This probe tests observation timing only. It does not replace confirmation, transaction lookup, or reconciliation.",
    "The reported delta is end-to-end client-observed arrival timing from the same machine, not validator-side processing time."
  ]
};

console.log(JSON.stringify(result, null, 2));

async function createStreamSession(key, url, baseDelayMs, maxReconnects) {
  const state = {
    key,
    url,
    ws: null,
    onSlot: null,
    errors: [],
    reconnectAttempts: 0,
    reconnectsSucceeded: 0,
    reconnectErrors: 0,
    stopped: false,
    reconnectTimer: null,
    reconnectInFlight: false
  };

  await connect(true);
  return {
    onSlot: null,
    forceReconnect,
    stop,
    state
  };

  async function connect(isInitial) {
    return new Promise((resolve, reject) => {
      if (state.stopped) {
        reject(new Error(`${key}: stream stopped`));
        return;
      }

      const ws = new WebSocket(url);
      state.ws = ws;

      let acknowledged = false;
      let settled = false;
      const ackTimeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        try {
          ws.close();
        } catch {
          // Ignore cleanup errors.
        }

        const error = new Error(`${key}: subscription acknowledgement timeout`);
        if (isInitial) {
          reject(error);
        } else {
          state.reconnectErrors += 1;
          state.errors.push("RECONNECT_ACK_TIMEOUT");
          resolve(false);
        }
      }, Math.min(timeoutMs, 15_000));

      const failInitial = (errorCode, error) => {
        if (settled) return;
        settled = true;
        clearTimeout(ackTimeout);
        state.errors.push(errorCode);
        try {
          ws.close();
        } catch {
          // Ignore cleanup errors.
        }
        reject(error);
      };

      ws.addEventListener("open", () => {
        try {
          ws.send(
            JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "slotSubscribe"
            })
          );
        } catch (error) {
          const message = error instanceof Error ? error : new Error(String(error));
          if (isInitial) {
            failInitial("WEBSOCKET_SEND_ERROR", message);
          } else {
            clearTimeout(ackTimeout);
            state.reconnectErrors += 1;
            state.errors.push("RECONNECT_SEND_ERROR");
            resolve(false);
          }
        }
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
            clearTimeout(ackTimeout);
            if (!isInitial) state.reconnectsSucceeded += 1;
            resolve(true);
          }
          return;
        }

        if (message.method !== "slotNotification") return;

        const slot = message.params?.result?.slot;
        if (!Number.isSafeInteger(slot)) {
          state.errors.push("INVALID_SLOT_NOTIFICATION");
          return;
        }

        state.onSlot?.(slot, performance.now());
      });

      ws.addEventListener("error", () => {
        state.errors.push("WEBSOCKET_ERROR");

        if (!acknowledged) {
          if (isInitial) {
            failInitial(
              "WEBSOCKET_INITIAL_ERROR",
              new Error(`${key}: WebSocket error before subscription acknowledgement`)
            );
          } else if (!settled) {
            settled = true;
            clearTimeout(ackTimeout);
            state.reconnectErrors += 1;
            resolve(false);
          }
          return;
        }

        scheduleReconnect("error");
      });

      ws.addEventListener("close", (event) => {
        if (!acknowledged) {
          if (isInitial) {
            failInitial(
              "WEBSOCKET_INITIAL_CLOSE",
              new Error(
                `${key}: WebSocket closed before subscription acknowledgement (code=${event.code})`
              )
            );
          } else if (!settled) {
            settled = true;
            clearTimeout(ackTimeout);
            state.reconnectErrors += 1;
            resolve(false);
          }
          return;
        }

        if (!state.stopped) {
          scheduleReconnect(`close:${event.code}`);
        }
      });
    }).then((connected) => {
      if (!connected && !isInitial && !state.stopped) {
        scheduleReconnect("connect-failed");
      }
      return connected;
    });
  }

  function scheduleReconnect(reason) {
    if (
      state.stopped ||
      state.reconnectInFlight ||
      state.reconnectAttempts >= maxReconnects
    ) {
      return;
    }

    state.reconnectInFlight = true;
    state.reconnectAttempts += 1;

    const attempt = state.reconnectAttempts;
    const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), 10_000);

    state.reconnectTimer = setTimeout(async () => {
      state.reconnectTimer = null;

      try {
        await connect(false);
      } catch (error) {
        state.reconnectErrors += 1;
        state.errors.push(
          `RECONNECT_EXCEPTION:${error instanceof Error ? error.message : String(error)}`
        );
      } finally {
        state.reconnectInFlight = false;

        if (
          !state.stopped &&
          state.reconnectAttempts < maxReconnects &&
          state.reconnectsSucceeded < state.reconnectAttempts
        ) {
          scheduleReconnect(`retry-after-${reason}`);
        }
      }
    }, delay);
  }

  function forceReconnect(reason) {
    if (state.stopped || !state.ws) return;
    state.errors.push(`FORCED_RECONNECT:${reason}`);
    try {
      state.ws.close(1000, "M04 forced reconnect");
    } catch {
      // The close event will trigger normal recovery if possible.
    }
  }

  function stop() {
    state.stopped = true;
    if (state.reconnectTimer) {
      clearTimeout(state.reconnectTimer);
      state.reconnectTimer = null;
    }

    try {
      state.ws?.close();
    } catch {
      // Ignore close errors during shutdown.
    }
  }
}

async function waitForMatches() {
  const deadline = performance.now() + timeoutMs;

  while (!finished && matchedSlots.size < targetMatchedSlots) {
    const remaining = deadline - performance.now();
    if (remaining <= 0) break;
    await new Promise((resolve) => setTimeout(resolve, Math.min(50, remaining)));
  }

  return matchedSlots.size >= targetMatchedSlots
    ? "TARGET_REACHED"
    : "TIMEOUT";
}
