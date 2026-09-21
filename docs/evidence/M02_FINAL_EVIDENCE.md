# M02 Final Evidence Package

**Product:** NUBLE / VAERIQ  
**Milestone:** M02 — Prove & Harden the Control Layer  
**Primary network:** Solana Devnet  
**Runtime verification date:** 2026-09-21  
**Branch:** `feature/m02-recovery-idempotency`  
**Pull Request:** #1 — M02 — Harden execution control boundary and recovery

## Verification status

| Evidence area | Result | Evidence |
|---|---|---|
| Typecheck | PASS | `npm run check` |
| Build | PASS | `npm run check` |
| Control-boundary gate | PASS | APPROVE / REVIEW / BLOCK + intent binding + execution guard |
| Audit persistence | PASS | Automated test + browser refresh evidence |
| Transaction reconciliation | PASS | Real Solana Devnet execution reported `MATCHED` |
| BLOCK execution boundary | PASS | Browser runtime verification; no execution/submission |
| Pre-submission failure | PASS | `FAILED_BEFORE_SUBMISSION` + `EXECUTION_FAILED` |
| Safe retry | PASS | New execution attempt ID; same intent-scoped idempotency key |
| Unknown execution | PASS | `UNKNOWN_AFTER_SUBMISSION` + `EXECUTION_UNKNOWN`; retry blocked |
| Refresh persistence | PASS | Failed and uncertain execution states restored after refresh |

## Evidence artifacts

1. `01_automated_check_pass.png`  
   Full `npm run check` result showing typecheck, build, control-boundary, audit persistence, reconciliation, and recovery/idempotency tests all passing.

2. `02_approve_reconciled.png`  
   Real Solana Devnet APPROVE flow with execution state `RECONCILED`, reconciliation `MATCHED`, transaction signature, and persisted audit trail.

3. `03_execution_failure.png`  
   Approved payment with `INSUFFICIENT_USDC_BALANCE`, execution state `FAILED_BEFORE_SUBMISSION`, no transaction signature, and retry allowed.

4. `04_safe_retry.png`  
   Retry of the same PaymentIntent showing a new execution-attempt ID while retaining the same intent-scoped idempotency key.

5. `05_unknown_execution.png`  
   Deterministic Recovery · UNKNOWN scenario showing `UNKNOWN_AFTER_SUBMISSION`, `EXECUTION_UNKNOWN`, no transaction signature, and retry blocked.

6. `06_unknown_after_refresh.png`  
   Browser refresh result showing the same uncertain execution state and attempt identity persisted after reload.

7. `07_persisted_events.png`  
   Persisted recent-event view showing the approved transaction lifecycle and reconciliation events surviving page reload.

## End-to-end recovery evidence

### Known pre-submission failure

```
APPROVE
  ↓
EXECUTION_STARTED
  ↓
INSUFFICIENT_USDC_BALANCE
  ↓
FAILED_BEFORE_SUBMISSION
  ↓
retry allowed
```

The retry was exercised against the same PaymentIntent. The retry created a distinct execution-attempt ID while keeping the same intent-scoped idempotency key.

### Uncertain execution

```
APPROVE
  ↓
EXECUTION_STARTED
  ↓
UNKNOWN_AFTER_SUBMISSION
  ↓
EXECUTION_UNKNOWN
  ↓
retry blocked
```

The demo-only uncertainty scenario is deterministic and does not intentionally submit a real transaction. It exists to exercise the safety path where an execution provider cannot establish whether value movement completed.

### Refresh

Browser refresh preserved the latest persisted execution state, attempt ID, idempotency key, and audit evidence for the failed and uncertain scenarios.

## Scope and wording guardrails

- The idempotency mechanism demonstrated here is an **intent-scoped execution-attempt model inside VAERIQ**. It is not a claim of provider-level or network-level idempotency.
- Browser-local storage is **demo-grade persistence**, not production treasury storage.
- The Recovery · UNKNOWN scenario is a **deterministic demo simulation**, not a live network fault injection.
- The demo does not allow an LLM to authorize or sign a financial transaction.
- Solana Devnet evidence demonstrates the current execution adapter path; it should not be described as production custody infrastructure.

## Submission evidence narrative

VAERIQ's M02 work hardens the control boundary around programmable value movement. The evidence demonstrates that an approval is bound to a specific PaymentIntent, only approved and valid evidence can cross the execution guard, execution outcomes are persisted as distinct attempts, known pre-submission failures can be retried safely, and uncertain post-boundary outcomes are explicitly locked against automatic retry to reduce duplicate-payment risk.

The resulting control loop is:

`Intent → Context → Policy → Risk → Decision → Execution Guard → Execution Attempt → Verification/Reconciliation → Audit`

This package is intended to accompany the M02 repository history and runtime runbook as the concise proof bundle for hackathon review.
