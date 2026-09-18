# Milestone 02 — Prove the Control Layer

**Status:** In progress  
**Started:** 2026-09-19  
**Product:** NUBLE / VAERIQ  
**Primary network:** Solana Devnet

## Objective

Strengthen the control layer after Milestone 01 by making decision evidence persistent and easier to inspect across a browser session, while keeping the product boundary narrow.

Milestone 02 is not a feature-expansion milestone. It is a proof-and-hardening milestone.

## Core question

> Does VAERIQ provide a reliable control record around programmable value movement?

Milestone 01 proved that VAERIQ can make an APPROVE decision that reaches a real Solana Devnet transaction while BLOCK stops before execution.

Milestone 02 starts by making that decision evidence durable and inspectable.

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

## Workstream B — Product hardening

- [ ] Expand automated tests around evaluation and execution boundaries.
- [x] Add execution failure handling and evidence.
- [x] Add transaction lookup/reconciliation.
- [ ] Improve demo reliability and recovery states.

## Workstream C — Customer validation

- [ ] Interview relevant treasury/finance operators.
- [x] Define structured customer-validation protocol and interview log.
- [ ] Record recurring control failures and existing workflows.
- [ ] Test whether the payment-intent model matches real operating practice.
- [ ] Identify concrete design-partner candidates.

No customer-validation claim should be made until evidence is collected.

## Workstream D — Founder and ecosystem proof

- [x] Founder-Market-Fit Thesis v1.0 captured factually.
- [ ] Connect founder proof to the final pitch narrative without overclaiming.
- [ ] Make Solana's role explicit in the causal story: programmable value movement → increased need for bounded control.

## Acceptance criteria

The persistent-audit slice is implemented and verified by the founder across browser refresh for both APPROVE and BLOCK flows. Execution-failure handling is implemented and runtime-verified: an approved intent that fails with `INSUFFICIENT_USDC_BALANCE` records `EXECUTION_STARTED` and `EXECUTION_FAILED` without `TRANSACTION_SUBMITTED` or `TRANSACTION_CONFIRMED`. Transaction lookup and reconciliation are implemented and runtime-verified on Solana Devnet: the founder observed MATCHED after a real approved payment, confirmed that the observed signature matched the PaymentIntent evidence, and confirmed the TRANSACTION_RECONCILED event persisted across refresh. The BLOCK path produced no submission, confirmation, or reconciliation events. The remaining Milestone 02 acceptance criteria are still open.


1. A payment evaluation creates a persistent audit record.
2. An APPROVE execution appends transaction events with the real transaction signature.
3. A BLOCK evaluation persists the decision but produces no execution event or transaction signature.
4. Refreshing the browser does not erase the audit history.
5. Automated tests cover persistence behavior, the execution guard, and reconciliation rules.
6. The demo can explain the control evidence without relying on hidden state.

## Explicit non-goals

- Production custody or key management.
- Autonomous AI signing.
- Full accounting replacement.
- Multi-chain execution expansion during this milestone.
- Claiming production-grade audit durability from browser-local storage.


## Transaction reconciliation design

After an approved payment returns a transaction signature, VAERIQ queries Solana at the `confirmed` commitment and inspects the transaction's parsed SPL token movement. The reconciliation layer compares the observed chain record with the original PaymentIntent:

- chain
- asset
- exact atomic amount
- sender
- recipient
- confirmation status

Possible results:

- `MATCHED` — observed transaction matches the intent and is confirmed.
- `MISMATCHED` — a chain record exists but one or more intent fields do not match.
- `NOT_FOUND` — the transaction cannot be located at the requested commitment.

The reconciliation result is itself written to the audit trail as `TRANSACTION_RECONCILED`.

The adapter uses Solana's current `getTransaction` RPC with explicit `confirmed` commitment and a transaction-version capability setting. The RPC returns a confirmed transaction by signature or `null` when it is not found at the requested commitment.


## Verified runtime evidence

The founder completed the current reconciliation runbook on 2026-09-19.

Approved intent `pi_8e09d2a4-c2dc-40ae-bfe2-f308c00f4fc8` produced transaction `nh97Q3Vw9nEVYRmthSZTefr8NJbCK4xdDGMRGPHcWLJ8sPRUS7hyGLgdTmm6kCv1JNPVMHaTDWU9zjteTEQnmFN`. VAERIQ reported `Reconciliation: MATCHED`, and the persisted history contained `TRANSACTION_SUBMITTED`, `TRANSACTION_CONFIRMED`, and `TRANSACTION_RECONCILED` for the same intent and signature after refresh.

A separate BLOCK intent produced only policy, risk, and decision events, with no submission, confirmation, or reconciliation events.

The previously tested approved-but-unfunded flow also records `EXECUTION_STARTED` and `EXECUTION_FAILED:INSUFFICIENT_USDC_BALANCE` without submission or confirmation.
