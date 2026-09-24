# VAERIQ Final Demo Runbook — Engineering + Operator Validation

## Goal

Show one coherent control story instead of a feature tour.

## Recommended sequence

### 1. Start with the control problem

State the question:

> Before an on-chain payment moves, does the system understand the intent, business context, evidence, policy constraints, and risk behind the payment?

Then state that VAERIQ is the control layer above execution.

### 2. Create / show a PaymentIntent

Show:
- requester
- recipient
- asset and exact amount
- purpose
- counterparty
- invoice / budget / project when applicable

Do not explain every field. Focus on why the payment is being requested.

### 3. Show business context

Open the M03 "Why should this payment move?" area.

Show the context completeness state and evidence references.

Use the same payment shape already validated in M03.

### 4. Show the decision path

Walk through:

`Context → Policy → Risk → Decision`

Show an APPROVE case.

Then demonstrate the minimum useful counterexample:

`Required context removed → INCOMPLETE → REVIEW → execution unavailable`

Do not add unrelated scenarios unless needed to answer a question.

### 5. Show the hard execution boundary

Show that only APPROVE can cross:

`APPROVE → Execution Guard → Chain Adapter`

Explain that REVIEW/BLOCK cannot reach signing/execution.

### 6. Show execution + reconciliation

For the real Devnet path, show:

`Execution → Transaction signature → Confirmation → Reconciliation → Audit`

Keep reconciliation as execution truth.

### 7. Show recovery behavior

Use the already verified M02 recovery path:

`FAILED_BEFORE_SUBMISSION → safe retry`

and:

`UNKNOWN_AFTER_SUBMISSION → retry blocked`

Do not create another real transaction just for the demo.

### 8. Show M04 operating evidence briefly

One slide/screen is enough:

- Mainnet HTTP benchmark measured matched workloads
- isolated getTransaction runs
- Mainnet WebSocket observation
- bounded forced reconnect verified
- RPC Fast kept optional

Do not turn local benchmark data into a universal provider-performance claim.

### 9. Show operator-validation stage

Explain that the engineering control model is now being tested against real treasury/finance workflows through a short written research form.

Show the research question, not a fabricated customer success story.

### 10. End with architecture

```text
VAERIQ
  ↓
Execution Provider
  ↓
Wallet / Custody
  ↓
Solana
```

Observation remains subordinate to:

`Confirmation → getTransaction → Reconciliation`

## Demo discipline

- Do not live-code during the main demo.
- Do not introduce features that are not needed for the narrative.
- Do not claim production custody or production SLAs.
- Do not claim customer traction until operator evidence supports it.
- Keep the strongest visual proof on screen: decision change, execution boundary, transaction/reconciliation, and recovery state.