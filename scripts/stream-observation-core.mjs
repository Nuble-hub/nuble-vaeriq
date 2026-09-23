export function createObservationState() {
  return {
    notifications: 0,
    duplicates: 0,
    slots: new Map(),
    errors: [],
    gaps: 0,
    gapEvents: [],
    lastObservedSlot: null,
    reconnectAttempts: 0,
    reconnectsSucceeded: 0,
    reconnectErrors: 0,
    forcedReconnects: 0
  };
}

export function recordSlotObservation(state, slot, timestamp) {
  state.notifications += 1;

  if (state.slots.has(slot)) {
    state.duplicates += 1;
    return { duplicate: true, gap: 0 };
  }

  let gap = 0;
  if (state.lastObservedSlot !== null && slot > state.lastObservedSlot + 1) {
    gap = slot - state.lastObservedSlot - 1;
    state.gaps += gap;
    state.gapEvents.push({
      previousSlot: state.lastObservedSlot,
      currentSlot: slot,
      missedSlots: gap
    });
  }

  state.slots.set(slot, timestamp);

  if (state.lastObservedSlot === null || slot > state.lastObservedSlot) {
    state.lastObservedSlot = slot;
  }

  return { duplicate: false, gap };
}

export function summarizeObservation(state) {
  return {
    notifications: state.notifications,
    uniqueSlots: state.slots.size,
    duplicateNotifications: state.duplicates,
    observedGapSlots: state.gaps,
    gapEvents: state.gapEvents.slice(0, 5),
    reconnectAttempts: state.reconnectAttempts,
    reconnectsSucceeded: state.reconnectsSucceeded,
    reconnectErrors: state.reconnectErrors,
    forcedReconnects: state.forcedReconnects,
    errorCount: state.errors.length,
    errors: state.errors.slice(0, 5)
  };
}

export function summarizeDeltas(values) {
  return {
    count: values.length,
    p50Ms: percentile(values, 0.50),
    p95Ms: percentile(values, 0.95),
    p99Ms: percentile(values, 0.99),
    minMs: minOrNull(values),
    maxMs: maxOrNull(values)
  };
}

export function percentile(values, ratio) {
  if (!values.length) return null;

  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(ratio * sorted.length) - 1)
  );

  return round(sorted[index], 2);
}

export function minOrNull(values) {
  return values.length ? round(Math.min(...values), 2) : null;
}

export function maxOrNull(values) {
  return values.length ? round(Math.max(...values), 2) : null;
}

export function pct(part, total) {
  return total ? round((part / total) * 100, 2) : 0;
}

export function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function positiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function nonNegativeInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}
