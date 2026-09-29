#!/usr/bin/env node

import { performance } from "node:perf_hooks";
import process from "node:process";

const DEFAULT_BASELINE = "https://api.devnet.solana.com";
const DEFAULT_SAMPLES = 30;
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_WARMUP = 3;

const baselineUrl = process.env.SOLANA_BASELINE_RPC_URL || DEFAULT_BASELINE;
const candidateUrl = process.env.RPC_FAST_RPC_URL || "";
const wallet = process.env.BENCHMARK_WALLET || "";
const txSignature = process.env.BENCHMARK_TX_SIGNATURE || "";
const samples = positiveInt(process.env.BENCHMARK_SAMPLES, DEFAULT_SAMPLES);
const concurrency = positiveInt(process.env.BENCHMARK_CONCURRENCY, DEFAULT_CONCURRENCY);
const warmup = nonNegativeInt(process.env.BENCHMARK_WARMUP, DEFAULT_WARMUP);
const timeoutMs = positiveInt(process.env.BENCHMARK_TIMEOUT_MS, 10_000);
const rpcFastToken = process.env.RPC_FAST_TOKEN || "";
const requestedMethods = process.env.BENCHMARK_METHODS || "";

const allMethods = [
  {
    name: "getHealth",
    request: () => ["getHealth", []]
  },
  {
    name: "getLatestBlockhash",
    request: () => ["getLatestBlockhash", [{ commitment: "confirmed" }]]
  },
  {
    name: "getBlockHeight",
    request: () => ["getBlockHeight", [{ commitment: "confirmed" }]]
  },
  ...(wallet
    ? [{
        name: "getBalance",
        request: () => ["getBalance", [wallet, { commitment: "confirmed" }]]
      }]
    : []),
  ...(txSignature
    ? [{
        name: "getTransaction",
        request: () => [
          "getTransaction",
          [txSignature, {
            commitment: "confirmed",
            encoding: "jsonParsed",
            maxSupportedTransactionVersion: 1
          }]
        ]
      }]
    : [])
];

const methods = selectMethods(allMethods, requestedMethods);

if (!candidateUrl) {
  console.error("RPC_FAST_RPC_URL is not set.");
  console.error(
    "Create a RPC Fast Focus app, copy its JSON-RPC endpoint, and export RPC_FAST_RPC_URL before running the comparison."
  );
  process.exit(2);
}

if (methods.length === 0) {
  console.error("No benchmark methods selected.");
  process.exit(2);
}

const startedAt = new Date().toISOString();

console.log("VAERIQ M04 RPC benchmark");
console.log(JSON.stringify({
  startedAt,
  baselineUrl,
  candidateLabel: "RPC Fast Focus",
  methods: methods.map((method) => method.name),
  methodSelection: requestedMethods || "all",
  samples,
  concurrency,
  warmup,
  timeoutMs
}, null, 2));

const [baseline, candidate] = await Promise.all([
  benchmarkEndpoint("baseline", baselineUrl),
  benchmarkEndpoint("rpc-fast-focus", candidateUrl)
]);

const comparison = methods.map((method) => {
  const left = baseline.methods[method.name];
  const right = candidate.methods[method.name];
  return {
    method: method.name,
    baseline: summarize(left),
    rpcFastFocus: summarize(right),
    p50DeltaMs: delta(right.p50Ms, left.p50Ms),
    p95DeltaMs: delta(right.p95Ms, left.p95Ms),
    p99DeltaMs: delta(right.p99Ms, left.p99Ms),
    successRateDeltaPct: round(right.successRatePct - left.successRatePct, 2)
  };
});

console.log(JSON.stringify({
  startedAt,
  completedAt: new Date().toISOString(),
  comparison,
  note:
    "Latency percentiles/min/max are calculated from successful measurement requests only. Failed requests remain visible through failure counts and sampled errors; a zero-success method reports null latency statistics."
}, null, 2));

function positiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nonNegativeInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function selectMethods(all, selection) {
  if (!selection.trim()) return all;

  const requested = selection
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const available = new Map(all.map((method) => [method.name, method]));
  const unknown = requested.filter((name) => !available.has(name));

  if (unknown.length) {
    console.error(`Unknown benchmark method(s): ${unknown.join(", ")}`);
    console.error(`Available methods: ${all.map((method) => method.name).join(", ")}`);
    process.exit(2);
  }

  return requested.map((name) => available.get(name));
}

async function benchmarkEndpoint(label, url) {
  const result = { label, url, methods: {} };

  for (const method of methods) {
    const warmupErrors = [];

    for (let i = 0; i < warmup; i += 1) {
      const warmupObservation = await timedCall(url, method);
      if (!warmupObservation.ok) {
        warmupErrors.push(warmupObservation.error);
      }
    }

    const observations = [];
    const methodStartedAt = performance.now();
    let cursor = 0;

    while (cursor < samples) {
      const batchSize = Math.min(concurrency, samples - cursor);
      const batch = await Promise.all(
        Array.from({ length: batchSize }, () => timedCall(url, method))
      );
      observations.push(...batch);
      cursor += batchSize;
    }

    const methodElapsedMs = performance.now() - methodStartedAt;
    const successful = observations.filter((item) => item.ok);
    const failed = observations.filter((item) => !item.ok);
    const successfulLatencies = successful.map((item) => item.ms);

    result.methods[method.name] = {
      requests: observations.length,
      successful: successful.length,
      failed: failed.length,
      successRatePct: round(
        (successful.length / observations.length) * 100,
        2
      ),
      p50Ms: percentile(successfulLatencies, 0.50),
      p95Ms: percentile(successfulLatencies, 0.95),
      p99Ms: percentile(successfulLatencies, 0.99),
      minMs: minOrNull(successfulLatencies),
      maxMs: maxOrNull(successfulLatencies),
      attemptedReqPerSec: round(
        observations.length / (methodElapsedMs / 1000),
        2
      ),
      successfulReqPerSec: round(
        successful.length / (methodElapsedMs / 1000),
        2
      ),
      elapsedMs: round(methodElapsedMs, 2),
      warmupRequests: warmup,
      warmupFailed: warmupErrors.length,
      warmupErrors: warmupErrors.slice(0, 5),
      errorCounts: countErrors(failed),
      errors: failed
        .slice(0, 5)
        .map((item) => item.error)
    };
  }

  return result;
}

async function timedCall(url, method) {
  const start = performance.now();

  try {
    await callRpc(url, method);
    return { ok: true, ms: performance.now() - start };
  } catch (error) {
    return {
      ok: false,
      ms: performance.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function callRpc(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const [rpcMethod, params] = method.request();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(url === candidateUrl && rpcFastToken
          ? { "X-Token": rpcFastToken }
          : {})
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: rpcMethod,
        params
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP_${response.status}`);
    }

    const body = await response.json();

    if (body.error) {
      throw new Error(
        body.error.message || `RPC_${body.error.code ?? "ERROR"}`
      );
    }

    return body.result;
  } finally {
    clearTimeout(timer);
  }
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

function summarize(item) {
  return {
    successRatePct: item.successRatePct,
    successful: item.successful,
    failed: item.failed,
    p50Ms: item.p50Ms,
    p95Ms: item.p95Ms,
    p99Ms: item.p99Ms,
    minMs: item.minMs,
    maxMs: item.maxMs,
    attemptedReqPerSec: item.attemptedReqPerSec,
    successfulReqPerSec: item.successfulReqPerSec,
    warmupFailed: item.warmupFailed,
    errorCounts: item.errorCounts,
    errors: item.errors
  };
}

function countErrors(observations) {
  return observations.reduce((counts, item) => {
    counts[item.error] = (counts[item.error] || 0) + 1;
    return counts;
  }, {});
}

function delta(candidate, baseline) {
  if (candidate === null || baseline === null) return null;
  return round(candidate - baseline, 2);
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
