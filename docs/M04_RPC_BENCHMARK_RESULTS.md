# M04 RPC Benchmark Results

## Scope

These are observed measurements from the local operator environment against Solana Mainnet:

- Baseline: `https://api.mainnet-beta.solana.com`
- Candidate: RPC Fast Focus Mainnet endpoint
- The RPC Fast Focus endpoint provisioned for this work is Mainnet-only, so the comparison is intentionally Mainnet-to-Mainnet.
- API credentials are not recorded here.

## HTTP benchmark runs

### Full method set — 30 samples / concurrency 4

This run is retained primarily as a capacity/throttling observation.

| Method | Baseline success | RPC Fast success | Baseline successful p50 | RPC Fast p50 | Baseline successful p95 | RPC Fast p95 | Baseline successful p99 | RPC Fast p99 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| getHealth | 30/30 (100%) | 30/30 (100%) | 34.97 ms | 192.99 ms | 172.01 ms | 657.38 ms | 205.46 ms | 657.48 ms |
| getLatestBlockhash | 10/30 (33.33%) | 30/30 (100%) | 37.34 ms | 192.41 ms | 53.64 ms | 196.37 ms | 53.64 ms | 198.52 ms |
| getBlockHeight | 0/30 (0%) | 30/30 (100%) | null | 192.38 ms | null | 198.75 ms | null | 199.21 ms |

Baseline error observations:
- `getLatestBlockhash`: 20 x `HTTP_429`
- `getBlockHeight`: 30 x `HTTP_429`

Interpretation: this run demonstrates rate-limit interaction on the public baseline under the tested request sequence. It is not a universal reliability comparison.

### Isolated getTransaction — 30 samples / concurrency 4

| Metric | Baseline | RPC Fast Focus |
|---|---:|---:|
| Success | 10/30 (33.33%) | 30/30 (100%) |
| HTTP 429 | 20 | 0 |
| Successful p50 | 266.98 ms | 193.87 ms |
| Successful p95 | 553.08 ms | 694.88 ms |
| Successful p99 | 553.08 ms | 767.03 ms |
| Successful req/s | 5.96 | 11.01 |

Interpretation: in this load-oriented isolated transaction lookup run, RPC Fast completed all 30 requests while the baseline returned 20 HTTP 429 responses. Among successful requests, RPC Fast had a lower p50 but higher p95/p99. The two endpoints did not have equal numbers of successful observations, so tail comparisons should be treated as directional rather than definitive.

### Isolated getTransaction — 10 samples / concurrency 1

| Metric | Baseline | RPC Fast Focus |
|---|---:|---:|
| Success | 10/10 (100%) | 10/10 (100%) |
| Errors | 0 | 0 |
| Successful p50 | 200.61 ms | 195.32 ms |
| Successful p95 | 434.32 ms | 653.21 ms |
| Successful p99 | 434.32 ms | 653.21 ms |

Interpretation: in this clean sequential run, both endpoints completed all 10 requests. RPC Fast's p50 was 5.29 ms lower, while its p95/p99 were 218.89 ms higher.

## Observed conclusion

1. RPC Fast Focus did not show a consistent raw-latency advantage. Generic methods were materially slower from the operator's local environment, while the isolated `getTransaction` p50 was sometimes slightly lower.
2. The strongest repeated difference was request success under the tested load pattern: the public baseline returned HTTP 429 in some 30-request runs, while RPC Fast completed those runs without observed errors.
3. The evidence is local and workload-specific. It does not establish a universal provider performance ranking.
4. Current engineering decision: keep RPC Fast as an **optional infrastructure provider**, not a core VAERIQ dependency. The Solana adapter remains provider-neutral.

## Limitations

- Measurements are end-to-end from one local operator environment.
- Only a small number of runs and samples were collected.
- Public RPC rate limiting can confound multi-method and repeated-request comparisons.
- The current RPC Fast endpoint is Mainnet-only; VAERIQ's application demo remains Devnet.
- These results are infrastructure evidence, not production SLA claims.
