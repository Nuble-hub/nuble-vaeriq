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

- [ ] Define a small audit-store interface independent of browser storage.
- [ ] Persist policy, risk, and decision audit events.
- [ ] Persist execution events and transaction references.
- [ ] Reload persisted events after a browser refresh.
- [ ] Show recent audit events in the product UI.
- [ ] Preserve intent IDs so decision evidence can be traced to a transaction signature.

### Initial persistence boundary

The first implementation uses browser-local persistent storage for the demo.

This is intentionally a demo-grade persistence layer, not a production treasury database. The storage interface should remain replaceable so a durable server-side store can be added later without changing the control engine.

## Workstream B — Product hardening

- [ ] Expand automated tests around evaluation and execution boundaries.
- [ ] Add execution failure handling and evidence.
- [ ] Add transaction lookup/reconciliation.
- [ ] Improve demo reliability and recovery states.

## Workstream C — Customer validation

- [ ] Interview relevant treasury/finance operators.
- [ ] Record recurring control failures and existing workflows.
- [ ] Test whether the payment-intent model matches real operating practice.
- [ ] Identify concrete design-partner candidates.

No customer-validation claim should be made until evidence is collected.

## Workstream D — Founder and ecosystem proof

- [x] Founder-Market-Fit Thesis v1.0 captured factually.
- [ ] Connect founder proof to the final pitch narrative without overclaiming.
- [ ] Make Solana's role explicit in the causal story: programmable value movement → increased need for bounded control.

## Acceptance criteria

Milestone 02 can be marked complete when:

1. A payment evaluation creates a persistent audit record.
2. An APPROVE execution appends transaction events with the real transaction signature.
3. A BLOCK evaluation persists the decision but produces no execution event or transaction signature.
4. Refreshing the browser does not erase the audit history.
5. Automated tests cover persistence behavior and the execution guard.
6. The demo can explain the control evidence without relying on hidden state.

## Explicit non-goals

- Production custody or key management.
- Autonomous AI signing.
- Full accounting replacement.
- Multi-chain execution expansion during this milestone.
- Claiming production-grade audit durability from browser-local storage.
