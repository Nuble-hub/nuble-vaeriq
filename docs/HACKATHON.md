# Colosseum Hackathon Notes

## Current stage

VAERIQ is in the Build & Submit phase of the Colosseum Crypto World's Fair, with the repository released publicly as a bounded prototype.

## Project positioning

- **Project:** VAERIQ
- **Master brand:** NUBLE
- **Category:** Payments & Remittance
- **Primary chain for the submission:** Solana
- **Initial network:** Solana Devnet
- **Planned expansion:** Additional chains through adapters
- **Primary user:** Web3 treasury operator
- **Secondary actor:** Autonomous AI agent

## Milestone 01 — Chain-connected control loop

The first engineering milestone is intentionally narrow: prove that VAERIQ can evaluate one stablecoin payment intent and enforce the decision boundary before a real Solana Devnet transaction.

### Acceptance criteria

1. Payment intent is represented with exact monetary values.
2. Deterministic policy evaluation returns a reproducible result.
3. Risk signals are evaluated separately from policy.
4. Decision engine returns `APPROVE`, `REVIEW`, or `BLOCK`.
5. `REVIEW` and `BLOCK` cannot reach signing/execution.
6. An `APPROVE` intent can build and submit a Solana Devnet stablecoin transfer through the chain adapter.
7. The resulting transaction signature is linked back to the payment intent and audit event.
8. No credentials, seed phrases, or private keys are committed to the repository.

## Demo thesis

The live demo should prove one complete loop:

```text
Payment Intent
  -> Context
  -> Policy
  -> Risk
  -> Decision
  -> Execution
  -> Confirmation
  -> Reconciliation
  -> Audit
```

The minimum compelling demonstration contains:

1. A compliant payment that is approved and executed on Solana Devnet.
2. A payment with a policy/risk violation that is blocked before execution.
3. An incomplete-context case that moves an otherwise approvable payment to `REVIEW`.
4. A clear audit link from intent to decision and transaction signature.
5. A recovery case showing safe retry after known pre-submission failure and retry blocking after an uncertain post-boundary outcome.

## Submission discipline

Do not claim a chain, user, integration, or traction milestone before it actually exists.

The repository is now public. Public materials should distinguish prototype behavior, bounded infrastructure evidence, and open customer-validation questions.

M04 is finalized with constrained operator validation. No customer traction, production demand, design partnership, willingness-to-pay, or product-market-fit claim is supported by the current evidence.

## Weekly updates

Updates should focus on what materially changed, what was learned, and the next validation step. They should show actual product progress rather than slide-only status reports.

## Current workstream — M05

The next workstream is public productization and external validation:

```text
Public repository
      ↓
Public demo
      ↓
Treasury / finance operator validation
      ↓
Evidence consolidation
      ↓
Final submission
```

M05 does not authorize broad feature expansion. New product scope should be justified by new external evidence.

## Accelerator posture

VAERIQ is being developed as a long-term NUBLE product, not only as a competition prototype. Accelerator application materials should accurately describe current stage, production-user status, business model hypotheses, founder status, and any customer validation achieved by submission time.
