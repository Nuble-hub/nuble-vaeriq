# M04 RPC Benchmark Results Template

Run date:
Operator:
Machine / region:
Baseline endpoint:
RPC Fast Focus endpoint/app:
Known transaction signature (optional):
Sample count:
Concurrency:
Warmup:
Timeout:

## Results

> p50/p95/p99 and min/max latency are calculated from **successful measurement requests only**. Record success/failure counts separately so throttling or transport errors are not mistaken for latency observations.

| Method | Baseline success | RPC Fast success | Baseline p50 (successful) | RPC Fast p50 (successful) | Baseline p95 (successful) | RPC Fast p95 (successful) | Baseline p99 (successful) | RPC Fast p99 (successful) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| getHealth | | | | | | | | |
| getLatestBlockhash | | | | | | | | |
| getBlockHeight | | | | | | | | |
| getBalance | | | | | | | | |
| getTransaction | | | | | | | | |

## Errors / throttling

| Method | Baseline errors | RPC Fast errors | Notes |
|---|---|---|---|
| getHealth | | | |
| getLatestBlockhash | | | |
| getBlockHeight | | | |
| getBalance | | | |
| getTransaction | | | |

Record error counts such as `HTTP_429` explicitly when observed.

## Interpretation

Describe only the observed workload results. Note provider errors, throttling, timeout behavior, network variability, and region-specific effects.

Do not treat the latency percentile for a zero-success method as meaningful; the harness reports those latency statistics as `null`.

Do not state that one provider is universally faster based on a single run.

## Decision

Keep RPC Fast as:

- optional provider
- preferred provider for a measured workload
- or no change

Record the reasoning and evidence.
