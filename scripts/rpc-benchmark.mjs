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

