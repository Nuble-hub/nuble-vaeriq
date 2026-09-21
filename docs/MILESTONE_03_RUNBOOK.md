# Milestone 03 — Initial Runbook

## Goal

Demonstrate that VAERIQ can connect a PaymentIntent to explicit business context and evidence without changing the M02 execution boundary.

## Target demo sequence

1. Create a compliant PaymentIntent.
2. Show the context snapshot:
   - purpose
   - counterparty
   - invoice reference
   - evidence references
   - relevant historical/budget context
3. Evaluate deterministic policy.
4. Evaluate deterministic risk.
5. Show the resulting decision and the context/evidence that contributed to it.
6. Confirm that only `APPROVE` reaches the unchanged M02 execution guard.
7. Verify the resulting audit trail contains a context attachment linked to the same intent.

## Validation sequence

For each external operator interaction, capture:

- workflow being controlled
- payment amount/frequency
- current approval mechanism
- business context used before approval
- failure mode or exception
- current manual controls
- evidence required
- reaction to VAERIQ's intent/context model
- willingness to test or co-design the workflow

Do not convert opinions into traction claims. Record exact evidence and attributable observations.

## Completion evidence

### Product

- typed context contract
- deterministic context evaluation tests
- context audit event
- UI explanation
- M02 regression suite remains green

### Market

- completed interview notes
- recurring failure patterns
- validated context fields
- candidate design-partner evidence
- any concrete workflow commitment