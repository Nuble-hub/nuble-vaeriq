# Milestone 04 — Runtime Runbook

## A. Baseline vs RPC Fast Focus

### Environment

Use the same machine, region, wallet, transaction signature, sample count, concurrency, and timeout for both endpoints.

Set:

```bash
export SOLANA_BASELINE_RPC_URL="https://api.mainnet-beta.solana.com"
export RPC_FAST_RPC_URL="YOUR_RPC_FAST_FOCUS_ENDPOINT"
```

Optional:

```bash
export RPC_FAST_TOKEN="YOUR_TOKEN"
export BENCHMARK_WALLET="YOUR_DEVNET_WALLET"
export BENCHMARK_TX_SIGNATURE="KNOWN_CONFIRMED_MAINNET_SIGNATURE"
export BENCHMARK_SAMPLES=30
export BENCHMARK_CONCURRENCY=4
export BENCHMARK_WARMUP=3
export BENCHMARK_TIMEOUT_MS=10000
```

Do not commit tokens or private credentials.

### Run

```bash
npm run benchmark:rpc
```

The harness runs matched JSON-RPC workloads against both endpoints and reports:

- success and failure counts
- success rate
- p50 / p95 / p99 latency from successful measurement requests only
- min/max latency from successful measurement requests only
- attempted request rate
- successful request rate
- warmup failures
- error counts and first five sampled errors

A warmup failure no longer aborts the benchmark. Warmup failures are recorded separately from measured samples.

If a method has zero successful measurement requests, its latency statistics are reported as `null`.

### Interpretation

Compare endpoints only for the same workload and test conditions.

Treat success rate and throttling as first-class results. Do not use latency numbers from failed requests to characterize successful RPC response latency.

For the current RPC Fast Focus app, use a known confirmed **Mainnet** signature for `getTransaction` because the candidate endpoint is Mainnet-only. This makes the workload directly relevant to VAERIQ reconciliation while keeping both endpoints on the same network.

Do not claim that one provider is universally faster from one local run. Preserve the run conditions with every recorded result.

## B. Streaming observation spike

When RPC Fast stream credentials are available, evaluate a separate observation prototype.

Measure:

```text
transaction first observed
        ↓
transaction confirmed
        ↓
reconciliation complete
```

Track:

- observation latency
- confirmation latency
- reconciliation latency
- duplicate deliveries
- reconnect events
- missing/gapped observations

An early transaction stream is an observation signal. Confirmation and reconciliation remain authoritative.

## C. Operator validation

For every interview, capture workflow evidence in `docs/CUSTOMER_VALIDATION_LOG.md`:

- workflow
- who requests payment
- who approves
- required business context
- required evidence
- current failure modes
- current workaround
- reaction to VAERIQ
- next step offered

Do not turn a positive comment into a traction claim.
