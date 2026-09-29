# M04 Finalization Decision — Operating Layer

**Milestone:** M04 — Prove the Operating Layer  
**Decision date:** 2026-09-29  
**Branch:** feature/m04-validation-rpc-benchmark

## Final status

**M04 is finalized for the bounded hackathon prototype with an explicit validation constraint.**

Engineering evidence is consolidated. The infrastructure and observation questions are answered well enough to define the current operating shape. Operator/market validation did not reach the original 5–10 interview target, so this milestone does **not** support claims of customer traction, product-market fit, or production demand.

This is a deliberate evidence boundary, not a hidden completion claim.

## What M04 established

### 1. Solana read / verification infrastructure

The repeatable Mainnet workload showed:

- RPC Fast Focus did not produce a consistent raw-latency advantage.
- In the tested 30-request workloads, the public baseline returned repeated HTTP 429 responses while RPC Fast completed the measured requests.
- Sequential `getTransaction` completed successfully on both endpoints; the observed p50 difference was small while tail latency was higher on RPC Fast in that run.
- Engineering decision: keep RPC Fast as an optional, provider-neutral infrastructure adapter rather than a core VAERIQ dependency.

These are local, workload-specific observations, not provider-wide performance claims.

### 2. Transaction observation

The Mainnet `slotSubscribe` probe established a bounded observation layer:

```text
Observation signal
      ↓
Confirmation
      ↓
getTransaction
      ↓
Reconciliation
```

The clean 30-slot run had no duplicates, no WebSocket errors, and no unmatched slots in the measurement window.

The forced-reconnect run verified one successful reconnect on both streams and resumed matched-slot collection after the deterministic disconnect. Observed gaps are treated as process-observation gaps; the test does not attribute them to a provider.

**Decision:** streaming remains an early observation signal. Confirmation, `getTransaction`, and reconciliation remain the execution-truth path.

### 3. Polling vs streaming

A strict end-to-end polling-vs-streaming latency benchmark was not completed.

**Decision:** do not block the bounded prototype release on this comparison. The architecture does not rely on streaming as execution truth, so the missing benchmark does not change the current control boundary.

The performance claim remains intentionally open: the repository does not claim that streaming is superior to polling for reconciliation.

### 4. Operator / workflow validation

The written research form and outreach path were prepared and used. However, the original target of 5–10 qualifying treasury/finance operator interviews was not reached.

Available external workflow research is retained as **domain evidence only**. It is not represented as customer validation.

One third-party crypto payroll/payment workflow was examined in a test environment. Observed or reported workflow patterns included:

- destination/address checks before payment,
- configurable human approval thresholds,
- payment records retained in a dashboard,
- re-approval after a material amount or wallet change, as reported by the product team.

These observations are useful for vocabulary and control-model comparison, but they come from a single external product/test configuration rather than independent operator interviews. No adoption, willingness-to-pay, design-partner, traction, or product-market-fit conclusion is drawn from them.

### 5. Product-scope decision

No new product scope is justified by the current evidence.

The release candidate remains centered on:

```text
Payment Intent
   ↓
Context / Evidence
   ↓
Policy / Risk
   ↓
APPROVE / REVIEW / BLOCK
   ↓
Execution Guard
   ↓
On-chain execution
   ↓
Confirmation
   ↓
Reconciliation
   ↓
Audit
```

AI remains advisory/explanatory. Financial enforcement remains deterministic and policy-driven.

## Release-gate consequence

M04 itself is no longer a reason to add features.

The remaining release gates are repository hygiene and reproducibility:

1. public-facing documentation must describe the prototype and evidence boundaries accurately;
2. the broken `npm run demo` entry point must be removed or corrected;
3. final typecheck, tests, and web build must pass on the exact release commit;
4. repository history must be checked for credentials before visibility changes;
5. final branch/PR history must be reviewed before publishing the repository.

## Evidence boundary

Supported:

- current prototype behavior and tests,
- Solana Devnet execution/reconciliation demo path,
- Mainnet infrastructure measurements collected for M04,
- bounded WebSocket reconnect behavior,
- provider-neutral RPC architecture.

Not supported:

- customer traction,
- product-market fit,
- production custody,
- production SLA,
- lossless production streaming,
- universal RPC provider performance claims,
- superiority of streaming over polling for reconciliation.

## Final decision

**Close M04 as an engineering-and-evidence milestone with constrained market validation.**

Proceed to release preparation without expanding the product scope.