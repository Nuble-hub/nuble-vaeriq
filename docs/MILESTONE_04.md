# Milestone 04 — Prove the Operating Layer

**Status:** In progress  
**Started:** 2026-09-23  
**Product:** NUBLE / VAERIQ  
**Base:** M03 complete and merged into `main`

## Objective

Test whether VAERIQ fits a real operating environment rather than adding product breadth for its own sake.

M04 has two parallel evidence tracks:

1. **Infrastructure proof** — benchmark the Solana RPC path under a repeatable VAERIQ-specific workload and determine whether RPC Fast Focus improves the read/verification path.
2. **Market proof** — validate the payment-control workflow with real treasury/finance operators.

## Core question

> Can VAERIQ operate reliably enough on Solana infrastructure and fit the control workflow of organizations moving programmable value?

## Workstream A — RPC infrastructure benchmark

- [x] Add a repeatable JSON-RPC benchmark harness.
- [ ] Run baseline vs RPC Fast Focus with matched methods, sample count, concurrency, and timeout.
- [ ] Measure p50 / p95 / p99 latency and success rate.
- [x] Add a rate-limit-aware method-isolation mode for clean HTTP latency comparisons.
- [x] Include `getTransaction` against a known confirmed transaction on the selected benchmark network; the current RPC Fast Focus comparison uses Mainnet because the provisioned endpoint is Mainnet-only.
- [x] Record run date, workload configuration, and observed results.
- [x] Decide whether RPC Fast should remain an optional provider rather than a core dependency.

The benchmark is comparative evidence for VAERIQ's workload. It does not convert RPC Fast's public benchmarks into VAERIQ performance claims.

## Workstream B — Transaction observation spike

- [x] Add a minimal streaming observation probe using Mainnet `slotSubscribe`.
- [ ] Keep chain confirmation/reconciliation as the source of execution truth.
- [ ] Compare polling lookup with streaming observation latency where measurable.
- [x] Run and preserve the Mainnet slot-observation results.
- [ ] Handle duplicate delivery, reconnects, and stream gaps explicitly before production claims.

Early transaction feeds should be treated as observation signals, not final execution truth. RPC Fast's current documentation distinguishes early transaction visibility from full execution metadata and recommends a separate confirmation path. [RPC Fast Aperture documentation](https://rpcfast.com/blog/aperture-gRPC-explained)

## Workstream C — Operator validation

- [ ] Conduct 5–10 relevant treasury/finance operator interviews.
- [ ] Record current approval workflows and failure modes.
- [ ] Validate the business context fields used in M03.
- [ ] Test whether the PaymentIntent vocabulary matches real workflows.
- [ ] Identify concrete design-partner candidates only where evidence supports it.
- [ ] Record any workflow commitment separately from general interest.

No customer traction or product-market-fit claim should be made without attributable evidence.

## Workstream D — Demo/evidence

- [ ] Add a concise benchmark result to the final technical evidence.
- [ ] Show the M03 context decision proof in the final demo sequence.
- [ ] Preserve M02 recovery behavior.
- [ ] Update submission narrative from measured evidence only.

## Explicit non-goals

- New chain integrations.
- Production custody.
- ERP/accounting replacement.
- Autonomous AI authorization.
- Provider lock-in.
- Replacing reconciliation with an early transaction feed.

## M04 completion test

M04 is complete when we can state, with evidence:

- what infrastructure characteristics VAERIQ actually needs,
- whether RPC Fast materially changes the measured workload,
- how transaction observation should fit beside confirmation/reconciliation,
- and which parts of the M03 control model map to real operator workflows.