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


## A2. WebSocket slot observation spike

The first streaming prototype compares the Solana `slotSubscribe` notification stream on the public Mainnet WebSocket and the RPC Fast Focus WebSocket.

Current Focus evaluation is Mainnet-only, so keep both endpoints on Mainnet for this comparison.

PowerShell example:

```powershell
$env:SOLANA_BASELINE_WS_URL="wss://api.mainnet.solana.com"
$env:RPC_FAST_WS_URL="YOUR_RPC_FAST_FOCUS_WEBSOCKET_ENDPOINT"
$env:STREAM_TARGET_MATCHED_SLOTS="30"
$env:STREAM_TIMEOUT_MS="45000"

npm run benchmark:stream
```

Do not paste or commit a WebSocket URL containing an API key.

The probe compares the arrival timestamp of the same slot notification on both streams and reports:

- matched slot count
- candidate-first / baseline-first / tied percentages
- p50 / p95 / p99 signed arrival delta
- duplicate notifications
- unmatched slot observations
- WebSocket errors

A negative `candidateMinusBaselineMs` means RPC Fast's notification arrived earlier for that matched slot.

This is an observation experiment only. A slot notification does not replace transaction confirmation, `getTransaction`, or reconciliation.

RPC Fast documents `slotSubscribe` as a supported WebSocket subscription and describes WebSocket PubSub for light/reactive workloads. [RPC Fast WebSocket guide](https://rpcfast.com/blog/solana-websocket-subscriptions)


### Rate-limit-aware HTTP runs

Solana's public Mainnet RPC is rate-limited. For a clean latency comparison, isolate a single method per run with `BENCHMARK_METHODS` so cumulative requests from multiple methods do not become a confounding factor.

PowerShell example for the reconciliation-oriented workload:

```powershell
$env:BENCHMARK_METHODS="getTransaction"
$env:BENCHMARK_SAMPLES="30"
$env:BENCHMARK_CONCURRENCY="4"
$env:BENCHMARK_WARMUP="0"
$env:BENCHMARK_TIMEOUT_MS="10000"

npm run benchmark:rpc
```

Use the full method set as a separate capacity/throttling observation, not as a pure latency comparison. [Solana public RPC documentation](https://solana.com/docs/references/clusters)
