# Milestone 04 — Prove the Operating Layer

**Status:** Finalized — engineering evidence complete; operator validation constrained  \
**Decision date:** 2026-09-29  \
**Product:** NUBLE / VAERIQ  \
**Base:** M03 complete and merged into `main`

## Objective

Test whether VAERIQ fits a real operating environment rather than adding product breadth for its own sake.

M04 ran two parallel evidence tracks:

1. **Infrastructure proof** — characterize the Solana read/verification path with repeatable workload measurements.
2. **Market/workflow proof** — test the control model against real treasury/finance/payment workflows without overstating limited evidence.

## Core question

> Can VAERIQ operate reliably enough on Solana infrastructure and fit the control workflow of organizations moving programmable value?

## Workstream A — RPC infrastructure benchmark

- [x] Add a repeatable JSON-RPC benchmark harness.
- [x] Run baseline vs RPC Fast Focus with matched methods, sample count, concurrency, and timeout.
- [x] Measure p50 / p95 / p99 latency and success rate.
- [x] Add a rate-limit-aware method-isolation mode for clean HTTP latency comparisons.
- [x] Include `getTransaction` against a known confirmed transaction on the selected benchmark network; the current RPC Fast Focus comparison uses Mainnet because the provisioned endpoint is Mainnet-only.
- [x] Record run date, workload configuration, and observed results.
- [x] Decide whether RPC Fast should remain an optional provider rather than a core dependency.

**Result:** RPC Fast did not show a consistent raw-latency advantage in the tested local workloads. Repeated 30-request runs showed HTTP 429 responses from the public baseline while RPC Fast completed the measured requests. The engineering decision is to keep RPC Fast optional and provider-neutral.

The benchmark is comparative evidence for VAERIQ's workload. It does not convert RPC Fast's public benchmarks into VAERIQ performance claims.

## Workstream B — Transaction observation spike

- [x] Add a minimal streaming observation probe using Mainnet `slotSubscribe`.
- [x] Keep chain confirmation/reconciliation as the source of execution truth.
- [x] Decide how streaming should fit beside confirmation and reconciliation.
- [x] Run and preserve the Mainnet slot-observation results.
- [x] Add explicit duplicate/gap accounting and reconnect-capable stream handling to the observation probe.
- [x] Runtime-test forced reconnect and observe post-reconnect slot continuity before treating reconnect/gap handling as verified.
- [x] Handle duplicate delivery, reconnects, and stream gaps explicitly before production claims.

**Result:** the clean 30-slot observation run recorded 30 matched slots with zero duplicates and zero WebSocket errors. The canonical forced-reconnect run re-established both subscriptions and resumed matched-slot collection after a deterministic disconnect.

A strict end-to-end polling-vs-streaming latency benchmark was not required for the bounded prototype because streaming is not the execution-truth path. The repository therefore does not claim that streaming is superior to polling for reconciliation.

The current stream probe remains an observation layer. Confirmation, `getTransaction`, and reconciliation remain authoritative.

## Workstream C — Operator / workflow validation

The original target was 5–10 relevant treasury/finance operator interviews. That target was **not reached** during M04.

- [x] Publish the written operator-research form.
- [x] Perform targeted outreach using the written-first workflow.
- [x] Preserve limited external workflow/domain evidence separately from customer validation.
- [x] Record the validation limitation explicitly and prevent traction / PMF overclaiming.
- [ ] 5–10 qualifying operator interviews — not completed in this milestone.
- [ ] Broad recurring-pattern synthesis from qualifying operator interviews — remains open.
- [ ] Design-partner candidate / workflow commitment evidence — remains open.

Available third-party workflow research is useful for vocabulary and control-model comparison, but it does not establish customer demand, adoption, traction, design-partner status, or product-market fit.

See `docs/M04_FINALIZATION_DECISION.md` for the final evidence boundary.

## Workstream D — Demo / evidence

- [x] Add a concise benchmark result to the final technical evidence.
- [x] Show the M03 context decision proof in the final demo sequence.
- [x] Preserve the M02 recovery behavior.
- [x] Update the submission narrative boundary from measured evidence only.

## Explicit non-goals

- New chain integrations.
- Production custody.
- ERP/accounting replacement.
- Autonomous AI authorization.
- Provider lock-in.
- Replacing reconciliation with an early transaction feed.

## M04 completion test

M04 is complete for the bounded prototype when we can state, with evidence:

- what infrastructure characteristics VAERIQ actually needs,
- how RPC Fast changes the measured workload in the tested environment,
- how transaction observation fits beside confirmation/reconciliation,
- and which parts of the M03 control model can be compared against real payment-workflow evidence.

**M04 completion outcome:** engineering evidence is consolidated and the product scope remains intentionally frozen. Market validation is explicitly constrained because the qualifying operator-interview target was not reached.

## Final decision

Close M04 as an engineering-and-evidence milestone with constrained market validation.

No additional product scope is justified by the current M04 evidence.