# M04 RPC Benchmark Results Template

Run date:
Operator:
Machine / region:
Baseline endpoint:
RPC Fast Focus endpoint/app:
Known Devnet transaction signature (optional):
Sample count:
Concurrency:
Warmup:
Timeout:

## Results

| Method | Baseline p50 | RPC Fast p50 | Baseline p95 | RPC Fast p95 | Baseline p99 | RPC Fast p99 | Baseline success | RPC Fast success |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| getHealth | | | | | | | | |
| getLatestBlockhash | | | | | | | | | |
| getBlockHeight | | | | | | | | | |
| getBalance | | | | | | | | | |
| getTransaction | | | | | | | | | |

## Interpretation

Describe only the observed workload results. Note any provider errors, throttling, network variability, and region-specific effects.

Do not state that one provider is universally faster based on a single run.

## Decision

Keep RPC Fast as:

- optional provider
- preferred provider for a measured workload
- or no change

Record the reasoning and evidence.