# M04 Final Evidence — Operating Layer

**Status:** Finalized — engineering evidence complete; operator validation constrained  
**Decision date:** 2026-09-29  
**Branch:** feature/m04-validation-rpc-benchmark  
**Base:** M03 complete and merged into `main`

## Scope

M04 tested two things in parallel:

1. Whether VAERIQ's relevant Solana read/verification infrastructure can be characterized with repeatable measurements.
2. Whether the M03 intent/context/evidence control model can be compared with real treasury/finance/payment workflows without overstating limited evidence.

This document records measured engineering evidence and the final validation boundary. It does not claim customer traction or product-market fit.

## Evidence matrix

| Area | Evidence | Status | Boundary |
|---|---|---|---|
| JSON-RPC benchmark | Provider-neutral harness with matched Mainnet workloads | Complete | Local workload evidence only |
| `getTransaction` | Isolated sequential and concurrent runs | Complete | Tail comparisons are workload-specific |
| Rate-limit observation | Repeated public-baseline HTTP 429s under tested load | Complete | Not a universal provider reliability claim |
| WebSocket observation | Mainnet `slotSubscribe`, matched-slot comparison | Complete | Client-observed timing only |
| Duplicate/gap accounting | Explicit duplicate and observed-gap reporting | Complete | Gaps are not provider-loss attribution |
| Reconnect handling | Bounded reconnect implementation | Complete | Prototype-level resilience only |
| Forced reconnect runtime | 5-second forced disconnect; both streams reconnected and resumed | Complete | Does not prove production durability |
| Polling vs streaming | No strict end-to-end benchmark required for bounded prototype | Closed by decision | Streaming is not execution truth |
| Operator validation | Written form/outreach plus limited domain research | Constrained | No customer / PMF claim |

## HTTP benchmark evidence

Network: Solana Mainnet.

### Isolated getTransaction — 30 samples / concurrency 4

| Metric | Baseline | RPC Fast Focus |
|---|---:|---:|
| Success | 10/30 (33.33%) | 30/30 (100%) |
| HTTP 429 | 20 | 0 |
| Successful p50 | 266.98 ms | 193.87 ms |
| Successful p95 | 553.08 ms | 694.88 ms |
| Successful p99 | 553.08 ms | 767.03 ms |

Interpretation: under this load-oriented run, the candidate completed all measured requests while the public baseline returned 20 HTTP 429 responses. Successful-request latency distributions were not uniformly lower across the measured percentiles.

### Isolated getTransaction — 10 samples / concurrency 1

| Metric | Baseline | RPC Fast Focus |
|---|---:|---:|
| Success | 10/10 | 10/10 |
| Successful p50 | 200.61 ms | 195.32 ms |
| Successful p95 | 434.32 ms | 653.21 ms |
| Successful p99 | 434.32 ms | 653.21 ms |

Interpretation: both endpoints completed the sequential run. The observed p50 difference was small relative to the larger tail difference in this run.

### Engineering decision

Keep RPC Fast as an optional infrastructure provider, not a core VAERIQ dependency. The Solana adapter remains provider-neutral.

## WebSocket observation evidence

Network: Solana Mainnet.

A clean 30-slot observation run recorded 30 matched slots with zero duplicate notifications and zero WebSocket errors. Same-slot arrival timing was measured end-to-end from the same client machine.

The canonical forced-reconnect run used:

- target: 30 matched slots
- forced disconnect: 5,000 ms
- reconnect delay: 500 ms
- maximum reconnect attempts: 3

Observed:

| Metric | Baseline | RPC Fast Focus |
|---|---:|---:|
| Reconnect attempts | 1 | 1 |
| Successful reconnects | 1 | 1 |
| Reconnect errors | 0 | 0 |
| Forced reconnects | 1 | 1 |
| WebSocket errors | 0 | 0 |
| Duplicate notifications | 0 | 0 |
| Observed gap slots | 3 | 10 |

The process reached 30 matched slots after the forced disconnect/reconnect cycle.

Observed gaps are explicitly treated as process-observation gaps. The benchmark does not establish provider packet loss or identify the causal layer.

The canonical resilience-run same-slot timing was p50 +4.46 ms, p95 +291.29 ms, and p99 +393.67 ms. These values are not used as the clean latency benchmark because the run intentionally included a forced reconnect.

## Architectural conclusion

Measured work supports the following operating shape:

```text
VAERIQ
  ↓
Execution Provider
  ↓
Wallet / Custody
  ↓
Solana
```

For transaction observation:

```text
Observation signal
      ↓
Confirmation
      ↓
getTransaction
      ↓
Reconciliation
```

Observation is not execution truth.

## Operator / workflow validation — constrained

The written operator-research form was prepared and targeted outreach was performed. The original M04 target of 5–10 qualifying treasury/finance operator interviews was not reached.

Available third-party workflow research is retained as **domain evidence only**. One external crypto payroll/payment workflow was examined in a test environment. Observed or reported patterns included:

- destination/address checks before payment,
- configurable human approval thresholds,
- payment records retained in a dashboard,
- re-approval after a material amount or wallet change, as reported by the product team.

This is a single external product/test configuration, not independent customer validation. It does not establish demand, adoption, traction, design-partner status, willingness to pay, or product-market fit.

No product-scope change was made from this evidence.

## Final evidence boundary

### Supported by M04

- repeatable local Mainnet RPC measurements for VAERIQ-relevant read/verification workloads;
- a bounded Mainnet WebSocket observation probe;
- deterministic forced-reconnect behavior in the tested runtime;
- a provider-neutral decision to keep RPC Fast optional;
- a documented operating architecture where confirmation and reconciliation remain authoritative.

### Not supported by M04

- universal RPC provider performance claims;
- production-grade or lossless streaming;
- streaming superiority over polling for reconciliation;
- customer traction or product-market fit;
- production custody or production SLA claims.

## Source files

- `docs/M04_FINALIZATION_DECISION.md`
- `docs/M04_RPC_BENCHMARK_RESULTS.md`
- `docs/M04_STREAM_BENCHMARK_RESULTS.md`
- `docs/MILESTONE_04.md`
- `docs/MILESTONE_04_RUNBOOK.md`
- `docs/M04_FINAL_DEMO_RUNBOOK.md`
- `docs/CUSTOMER_VALIDATION.md`
- `docs/CUSTOMER_VALIDATION_INTERVIEW_01.md`
- `docs/OPERATOR_VALIDATION_FORM.md`
- `docs/CUSTOMER_VALIDATION_LOG.md` 
