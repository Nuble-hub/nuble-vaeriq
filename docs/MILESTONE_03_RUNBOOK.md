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
## Decision-changing context proof

1. Switch to **Compliant · APPROVE**.
2. Set an amount above the configured invoice threshold but below the policy review threshold, for example `2000` USDC.
3. Clear the invoice reference.
4. Evaluate the payment.
5. Confirm the base policy remains passable but the context completeness result is `INCOMPLETE`.
6. Confirm the final decision is `REVIEW` with an explicit business-context reason.
7. Confirm execution remains unavailable because the final decision is not `APPROVE`.
8. Restore the invoice reference and evaluate again.
9. Confirm context becomes `COMPLETE` and the decision can return to `APPROVE` when policy and risk also pass.

This scenario is the key M03 proof that explicit business context is a control input, not merely a UI display.