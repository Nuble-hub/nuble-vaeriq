# M04 WebSocket Streaming Observation Results

## Scope

Observed on Solana Mainnet using the same local operator environment:

- Baseline: public Solana Mainnet WebSocket
- Candidate: RPC Fast Focus WebSocket
- Method: `slotSubscribe`
- Target matched slots: 30
- Measurement starts only after both subscriptions acknowledge, using the corrected probe.

## Result — 30 matched slots

| Metric | Baseline | RPC Fast Focus |
|---|---:|---:|
| Notifications | 30 | 30 |
| Unique slots | 30 | 30 |
| Duplicate notifications | 0 | 0 |
| WebSocket errors | 0 | 0 |

### Same-slot arrival comparison

`candidateMinusBaselineMs` is RPC Fast notification arrival time minus baseline arrival time.

| Metric | Observed |
|---|---:|
| Matched slots | 30 |
| Candidate first | 10/30 (33.33%) |
| Baseline first | 20/30 (66.67%) |
| Tied | 0 |
| p50 delta | +2.40 ms |
| p95 delta | +136.00 ms |
| p99 delta | +382.81 ms |
| Min delta | -22.22 ms |
| Max delta | +382.81 ms |
| Baseline-only slots | 0 |
| Candidate-only slots | 0 |

A positive delta means the baseline notification arrived earlier for that matched slot.

## Interpretation

In this 30-slot observation run, both streams delivered all matched slots without duplicate notifications or WebSocket errors. The public baseline notification arrived first for 20 of 30 matched slots, while RPC Fast arrived first for 10 of 30.

This is an end-to-end client-observed timing comparison, not validator-side processing latency and not execution truth.

## Limits / next work

This probe does not test reconnects, long-lived stream stability, transaction-first-observed timing, or polling-vs-streaming end-to-end reconciliation latency. It should therefore remain an observation prototype rather than a production streaming claim.

The observation path remains subordinate to confirmation, `getTransaction`, and reconciliation.


## Forced reconnect runtime verification — 30 matched slots

### Configuration

- Baseline: public Solana Mainnet WebSocket
- Candidate: RPC Fast Focus WebSocket
- Method: `slotSubscribe`
- Target matched slots: 30
- Forced reconnect: 5,000 ms after measurement start
- Reconnect delay: 500 ms
- Maximum reconnect attempts per stream: 3

### Observed result

| Metric | Baseline | RPC Fast Focus |
|---|---:|---:|
| Reconnect attempts | 1 | 1 |
| Successful reconnects | 1 | 1 |
| Reconnect errors | 0 | 0 |
| Forced reconnects | 1 | 1 |
| WebSocket errors | 0 | 0 |
| Duplicate notifications | 0 | 0 |
| Unique slots | 38 | 30 |
| Observed gap slots | 5 | 13 |

The process reached the configured target of 30 matched slots after the forced disconnect/reconnect cycle. This verifies that the bounded reconnect path can re-establish the subscription and resume observation in the tested runtime.

The observed slot gaps occurred during the same measurement window and should not be interpreted as provider packet-loss attribution. A gap means this process did not observe the intervening slot notifications; the test does not identify whether the cause was provider delivery, transport, client scheduling, or the intentional disconnect interval.

The signed same-slot timing delta in this forced-reconnect run was p50 +6.22 ms, p95 +218.23 ms, and p99 +292.38 ms. Because this run intentionally introduces a disconnect/reconnect event, these timing values should be treated as resilience-run observations rather than a clean latency benchmark.

## Verification boundary

The reconnect runtime proof is complete for this bounded observation prototype. It does not establish production-grade stream durability, lossless delivery, or provider-wide performance characteristics. Confirmation, `getTransaction`, and reconciliation remain the execution-truth path.
