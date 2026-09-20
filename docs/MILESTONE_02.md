# Milestone 02 — Prove & Harden the Control Layer

**Status:** In progress  
**Started:** 2026-09-19  
**Product:** NUBLE / VAERIQ  
**Primary network:** Solana Devnet

## Objective

Strengthen the control layer after Milestone 01 and make the working demo reliable, explainable, and repeatable without expanding the MVP.

Milestone 02 is a proof-and-hardening milestone, not a feature-expansion milestone.

## Core question

> Can VAERIQ reliably enforce and explain its control boundary around programmable value movement?

Milestone 01 proved that VAERIQ can make an APPROVE decision that reaches a real Solana Devnet transaction while BLOCK stops before execution.

Milestone 02 focuses on making that boundary harder to misuse and easier to demonstrate.

## Workstream A — Persistent audit evidence

- [x] Define a small audit-store interface independent of browser storage.
- [x] Persist policy, risk, and decision audit events.
- [x] Persist execution events and transaction references.
- [x] Reload persisted events after a browser refresh.
- [x] Show recent audit events in the product UI.
- [x] Preserve intent IDs so decision evidence can be traced to a transaction signature.
- [x] Restore the latest persisted audit summary after browser refresh.

### Initial persistence boundary

The first implementation uses browser-local persistent storage for the demo. The store is intentionally isolated behind a small interface so the persistence backend can be replaced later.

This is intentionally a demo-grade persistence layer, not a production treasury database. The storage interface should remain replaceable so a durable server-side store can be added later without changing the control engine.

## Workstream B — Control-boundary hardening

- [x] Expand automated tests around decision and execution boundaries.
- [x] Bind approval evidence to the evaluated PaymentIntent ID.
- [x] Fail closed when the decision evidence is not policy-pass, is high risk, or the intent is in an invalid execution state.
- [x] Add execution failure handling and evidence.
- [x] Add transaction lookup/reconciliation.
- [x] Implement demo recovery state tracking, intent-scoped idempotency keys, safe retry gating, and explicit uncertain-execution state.
- [ ] Runtime-verify recovery behavior across refresh, pre-submission failure, retry, and uncertain execution scenarios.

The execution guard is defense-in-depth: APPROVE alone is not sufficient if the decision evidence is inconsistent with the intent or otherwise unsafe to execute.

### Recovery model

Execution attempts are persisted separately from audit events and are keyed to the PaymentIntent:

    STARTED
      ↓
    SUBMITTED
      ↓
    CONFIRMED
      ↓
    RECONCILED

Pre-submission failures enter `FAILED_BEFORE_SUBMISSION` and may be retried because the system has explicit evidence that no transaction was submitted.

Any error after the adapter execution boundary enters `UNKNOWN_AFTER_SUBMISSION` unless the adapter can establish a known pre-submission failure. In this state VAERIQ disables automatic retry to avoid accidental duplicate payment.

The current idempotency key is intent-scoped (`intent:<PaymentIntent.id>`). Multiple attempts for a retryable pre-submission failure share the same key while retaining distinct attempt IDs for auditability.

## Workstream C — Demo proof

- [x] Approved payment path verified on Solana Devnet.
- [x] Blocked payment path verified with no submitted transaction.
- [x] Execution-failure path verified without submission/confirmation.
- [x] Transaction lookup and reconciliation verified.
- [x] Audit rehydration verified.
- [ ] Run a repeatable final demo sequence without manual recovery.
- [ ] Capture final evidence package for submission.

## Workstream D — Customer discovery (parallel, not a release blocker)

- [ ] Interview relevant treasury/finance operators when access is available.
- [x] Define structured customer-validation protocol and interview log.
- [ ] Record recurring control failures and existing workflows.
- [ ] Test whether the payment-intent model matches real operating practice.
- [ ] Identify concrete design-partner candidates.

Customer validation remains important market evidence, but it is not a dependency for completing the hackathon engineering path. No customer or product-market-fit claims should be made until evidence is collected.

## Workstream E — Solana and founder narrative

- [x] Founder-Market-Fit Thesis v1.0 captured factually.
- [ ] Connect founder proof to the final pitch narrative without overclaiming.
- [ ] Make Solana's role explicit in the causal story: programmable value movement -> increased need for bounded control.
- [ ] Prepare concise technical evidence showing why Solana is an integral first execution environment.

## Acceptance criteria

1. A payment evaluation creates auditable decision evidence bound to the correct PaymentIntent.
2. An APPROVE decision can cross the execution guard only when its intent binding, policy result, risk state, and intent status are valid.
3. A BLOCK or REVIEW decision cannot cross the execution guard.
4. A decision that is inconsistent with its PaymentIntent cannot be reused for another intent.
5. A decision with failed/review policy evidence or HIGH risk cannot be promoted to execution.
6. Completed execution appends transaction events with the real transaction signature.
7. Failed execution records EXECUTION_STARTED and EXECUTION_FAILED without TRANSACTION_SUBMITTED or TRANSACTION_CONFIRMED when failure is known to be pre-submission; uncertain post-boundary failures are recorded as EXECUTION_UNKNOWN and cannot be retried automatically.
8. Reconciliation can return MATCHED, MISMATCHED, or NOT_FOUND.
9. Refreshing the browser preserves the demo audit evidence.
10. The final demo can explain the control boundary without relying on hidden state.

## Explicit non-goals

- Production custody or key management.
- Autonomous AI signing.
- Full accounting replacement.
- Multi-chain execution expansion during this milestone.
- Production-grade audit durability from browser-local storage.

## Transaction reconciliation design

After an approved payment returns a transaction signature, VAERIQ queries Solana at the confirmed commitment and inspects the parsed SPL token movement. The reconciliation layer compares the observed chain record with the original PaymentIntent:

- chain
- asset
- exact atomic amount
- sender
- recipient
- confirmation status

Possible results:

- MATCHED — observed transaction matches the intent and is confirmed.
- MISMATCHED — a chain record exists but one or more intent fields do not match.
- NOT_FOUND — the transaction cannot be located at the requested commitment.

The reconciliation result is itself written to the audit trail as TRANSACTION_RECONCILED.

The adapter uses Solana's current getTransaction RPC with explicit confirmed commitment and a transaction-version capability setting. The RPC returns a confirmed transaction by signature or null when it is not found at the requested commitment.

## Verified runtime evidence

The founder completed the current reconciliation runbook on 2026-09-19.

Approved intent pi_8e09d2a4-c2dc-40ae-bfe2-f308c00f4fc8 produced transaction nh97Q3Vw9nEVYRmthSZTefr8NJbCK4xdDGMRGPHcWLJ8sPRUS7hyGLgdTmm6kCv1JNPVMHaTDWU9zjteTEQnmFN. VAERIQ reported Reconciliation: MATCHED, and the persisted history contained TRANSACTION_SUBMITTED, TRANSACTION_CONFIRMED, and TRANSACTION_RECONCILED for the same intent and signature after refresh.

A separate BLOCK intent produced only policy, risk, and decision events, with no submission, confirmation, or reconciliation events.

The previously tested approved-but-unfunded flow also records EXECUTION_STARTED and EXECUTION_FAILED:INSUFFICIENT_USDC_BALANCE without submission or confirmation.
