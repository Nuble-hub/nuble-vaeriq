# Milestone 03 — Prove the Intent & Context Control Layer

**Status:** In progress  
**Started:** 2026-09-21  
**Product:** NUBLE / VAERIQ  
**Base:** M02 complete and merged into `main`

## Objective

Make VAERIQ's structural differentiator concrete: a wallet can authorize a signer, but VAERIQ evaluates whether a business payment should happen using intent, business context, evidence, policy, and risk.

M03 is intentionally split into two tracks:

1. **External proof** — validate the problem and workflow with real treasury/finance operators.
2. **Product proof** — expose a minimal, deterministic intent/context/evidence layer in the demo only where it directly strengthens the thesis.

M03 must not turn VAERIQ into a wallet, accounting system, AML platform, or autonomous signer.

## Core question

> Can VAERIQ explain not only who is allowed to spend, but why this payment is valid for the organization?

## What is already present

The M02 domain already carries:
- payment purpose
- counterparty ID
- invoice reference
- budget/project references
- historical payment context
- evidence references
- policy and risk decisions

The next step is to make this context explicit and auditable rather than relying on hardcoded demo context.

## Workstream A — External validation

- [ ] Conduct 5–10 relevant treasury/finance operator interviews where access is available.
- [ ] Record recurring payment-control failure modes in the validation log.
- [ ] Identify which business context fields operators actually use before approving payments.
- [ ] Test the PaymentIntent vocabulary against real workflows.
- [ ] Identify 2–3 concrete design-partner candidates where evidence supports it.
- [ ] Record at least one concrete workflow commitment if obtained.

No customer traction, design-partner, or product-market-fit claim should be made without supporting evidence.

## Workstream B — Intent/context/evidence product slice

- [x] Define a typed context snapshot contract separate from chain execution.
- [x] Add deterministic context-completeness evaluation.
- [x] Persist a `CONTEXT_ATTACHED` audit event with stable evidence references.
- [x] Surface the context/evidence that influenced policy or risk in the demo.
- [ ] Keep financial enforcement deterministic; AI remains advisory.
- [x] Add automated tests for context integrity and decision evidence binding.

## Workstream C — Demo narrative

- [x] Add one visible UI panel answering: "Why should this payment move?"
- [x] Show purpose, counterparty, invoice/evidence, and relevant risk/policy signals.
- [ ] Keep the live Solana execution path unchanged.
- [ ] Preserve the M02 recovery states and safe retry behavior.
- [ ] Update the final demo sequence and evidence package only after runtime verification.

## Acceptance criteria

1. A PaymentIntent can be evaluated with an explicit, typed business-context snapshot.
2. Context completeness is deterministic and reproducible.
3. Context/evidence is auditable and remains bound to the same PaymentIntent.
4. Policy and risk evaluation receives explicit context, and incomplete required business context deterministically prevents an APPROVE result by moving the decision to REVIEW.
5. The UI can explain the business reason and evidence behind an execution decision.
6. M02 execution guard and recovery invariants remain unchanged.
7. No AI output can directly authorize or sign value movement.

## Explicit non-goals

- Production accounting or ERP replacement.
- Full invoice ingestion platform.
- Autonomous agent signing.
- New chain integrations.
- Production persistence.
- Generic AML/KYC product scope.

## Strategic test

`Wallet authorization: "Can this signer spend?"`

versus

`VAERIQ control: "Should this business payment move?"`

The goal is not to add more fields. The goal is to prove that explicit business context can change a financial control decision in a deterministic, traceable way.

## Initial implementation note — 2026-09-21

The first M03 engineering slice is implemented on `feature/m03-intent-context-evidence`:

- `ContextSnapshot` captures intent-bound business context separately from chain execution.
- Context completeness is deterministic and reports missing purpose, counterparty, required invoice, or referenced invoice evidence.
- The evaluation bundle now includes the context snapshot and completeness result.
- Evaluation emits a `CONTEXT_ATTACHED` event before policy/risk/decision evidence.
- Context-to-intent and organization binding fail closed through explicit assertions.
- A dedicated automated M03 context/evidence gate is included in `npm test`.

Runtime/UI verification remains open.


## UI implementation note — 2026-09-22

The M03 demo UI now exposes a visible **Why should this payment move?** panel. After evaluation it shows the typed context snapshot, context-completeness status, business purpose, counterparty, invoice, destination/asset context, and evidence references. The panel is informational and auditable; it does not replace deterministic policy/risk enforcement or the M02 execution guard.

Browser runtime verification of the new UI slice remains open.

## Context-gate implementation note — 2026-09-22

The M03 evaluation layer now treats incomplete required business context as a deterministic review condition. An otherwise-approvable payment with missing required context receives REVIEW with an explicit reason rather than silently proceeding to execution. Existing BLOCK and REVIEW decisions remain unchanged except that incomplete context can add a review reason.

This keeps the M02 execution boundary intact: only a final APPROVE result can reach authorizeExecution.
## Decision-changing context runtime target

The next browser proof should demonstrate the strategic test directly: with an otherwise policy-compliant payment, removing required invoice context must change the final decision from APPROVE to REVIEW. Restoring the invoice evidence should allow APPROVE again when all other controls pass.

This is the main runtime demonstration that M03 context is a financial control input rather than a presentation-only field.