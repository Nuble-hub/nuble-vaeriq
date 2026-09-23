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

const methods = [
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

if (!candidateUrl) {
  console.error("RPC_FAST_RPC_URL is not set.");
  console.error("Create a RPC Fast Focus app, copy its JSON-RPC endpoint, and export RPC_FAST_RPC_URL before running the comparison.");
  process.exit(2);
}

const startedAt = new Date().toISOString();

console.log("VAERIQ M04 RPC benchmark");
console.log(JSON.stringify({
  startedAt,
  baselineUrl,
  candidateLabel: "RPC Fast Focus",
  methods: methods.map((method) => method.name),
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
  note: "Lower latency is not automatically better for every workload; interpret against VAERIQ's read/verification workload and observed error rate."
}, null, 2));

function positiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nonNegativeInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

async function benchmarkEndpoint(label, url) {
  const result = { label, url, methods: {} };

  for (const method of methods) {
    for (let i = 0; i < warmup; i += 1) {
      await callRpc(url, method);
    }

    const observations = [];
    let cursor = 0;

    while (cursor < samples) {
      const batchSize = Math.min(concurrency, samples - cursor);
      const batch = await Promise.all(
        Array.from({ length: batchSize }, () => timedCall(url, method))
      );
      observations.push(...batch);
      cursor += batchSize;
    }

    result.methods[method.name] = {
      requests: observations.length,
      successful: observations.filter((item) => item.ok).length,
      failed: observations.filter((item) => !item.ok).length,
      successRatePct: round(
        (observations.filter((item) => item.ok).length / observations.length) * 100,
        2
      ),
      p50Ms: percentile(observations.map((item) => item.ms), 0.50),
      p95Ms: percentile(observations.map((item) => item.ms), 0.95),
      p99Ms: percentile(observations.map((item) => item.ms), 0.99),
      minMs: round(Math.min(...observations.map((item) => item.ms)), 2),
      maxMs: round(Math.max(...observations.map((item) => item.ms)), 2),
      achievedReqPerSec: round(
        observations.length / (observations.reduce((sum, item) => sum + item.ms, 0) / 1000),
        2
      ),
      errors: observations
        .filter((item) => !item.ok)
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
      headers: { "content-type": "application/json" },
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
      throw new Error(body.error.message || `RPC_${body.error.code ?? "ERROR"}`);
    }

    return body.result;
  } finally {
    clearTimeout(timer);
  }
}

function percentile(values, ratio) {
  const sorted = values.slice().sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(ratio * sorted.length) - 1)
  );
  return round(sorted[index], 2);
}

function summarize(item) {
  return {
    successRatePct: item.successRatePct,
    p50Ms: item.p50Ms,
    p95Ms: item.p95Ms,
    p99Ms: item.p99Ms,
    minMs: item.minMs,
    maxMs: item.maxMs,
    achievedReqPerSec: item.achievedReqPerSec,
    errors: item.errors
  };
}

function delta(candidate, baseline) {
  return round(candidate - baseline, 2);
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
