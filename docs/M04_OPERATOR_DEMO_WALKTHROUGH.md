# M04 Operator Demo Walkthrough

## Purpose

Use this walkthrough only after a respondent has described a relevant payment workflow.

The demo should map the respondent's own workflow to the existing VAERIQ control path rather than introducing unrelated product breadth.

## Demo sequence

### 1. Payment intent

Show:
- requester
- recipient
- asset
- amount
- purpose
- counterparty
- invoice / budget / project references where applicable

Question:

> Does this resemble how your team represents a payment request today?

Do not assume the answer is yes.

### 2. Why should this payment move?

Show the M03 ContextSnapshot and evidence panel.

Highlight only fields relevant to the respondent's workflow:
- purpose
- counterparty
- invoice
- budget / project
- destination
- asset
- evidence references
- completeness status

Question:

> Which of these are actually required in your process, and which are unnecessary?

This is a validation question, not a confirmation question.

### 3. Policy and risk

Show:
- deterministic policy evaluation
- risk signals
- decision reasons

Ask:

> Which rules or checks in your process would need to be represented here?

Then:

> Which checks are currently manual?

### 4. Decision boundary

Show APPROVE / REVIEW / BLOCK.

Use the existing deterministic control behavior.

Question:

> Where does a human review happen in your current workflow?

Do not imply that REVIEW must be the right operating model.

### 5. Execution and verification

Show the existing path:

APPROVE → Execution Guard → Solana execution → Transaction → Reconciliation → Audit

Question:

> Which part of this chain would need to integrate with your existing wallet, multisig, custody, accounting, or reconciliation system?

### 6. Trust and objections

Ask:
- What would make you trust this enough to test it?
- What would prevent adoption?
- What data or system integration would be required first?
- What would you never delegate to the system?

## Demo stop condition

Stop adding explanation when the respondent can clearly state:
- what fits,
- what does not fit,
- what is missing,
- and what would have to change for a real workflow test.

Do not use a successful demo reaction as proof of demand without a concrete next step.

## Current evidence boundary

The demo is based on already-verified engineering behavior from M01–M03 and the M04 operating-layer infrastructure work.

It does not establish that the shown workflow is validated for the respondent until their written or spoken feedback is recorded.