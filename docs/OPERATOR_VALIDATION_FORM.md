# VAERIQ Operator Validation — Short Written Form

## Purpose

This form is a first-stage research filter for M04 operator validation.

It is designed to collect written workflow evidence before any live interview. Responses should help the project team distinguish real operating experience from general interest.

## Public form introduction

**Title:** VAERIQ — Treasury & Stablecoin Payment Workflow Research

**Description:**

> I'm researching how treasury, finance, and payment teams control stablecoin or on-chain payments today.
>
> This is a short research form, not a sales form. I'm especially interested in real workflows, existing controls, and concrete problems you have actually experienced.
>
> Please do not share confidential company information, private keys, wallet credentials, transaction secrets, or sensitive financial/customer data.
>
> Short answers are completely fine. Specific examples are especially useful.

## Questions

### 1. What best describes your role?
**Type:** Multiple choice

- Treasury
- Finance
- Payments
- Operations
- Protocol / Foundation
- Engineering / Infrastructure supporting treasury
- Other

### 2. What type of on-chain or stablecoin payments do you work with?
**Type:** Checkboxes

- Vendor payments
- Payroll / contractor payments
- Treasury transfers
- Stablecoin settlement
- Customer / merchant payments
- Automated service payments
- Agent-initiated payments
- Other

### 3. How directly are you involved in these payment workflows?
**Type:** Multiple choice

- I operate them directly
- I approve or oversee them
- I build or maintain the systems used by them
- I work adjacent to them

### 4. Please describe the normal payment workflow in a few steps.
**Type:** Paragraph

**Prompt:**

> For example: who requests the payment, what information is checked, who approves it, who signs it, how it is executed, and how the result is reconciled.

### 5. What information or evidence usually needs to be checked before approval?
**Type:** Paragraph

**Prompt:**

> Examples may include recipient/counterparty, invoice, budget, purpose, asset, amount, project, policy, or other evidence. Please describe what you actually use today.

### 6. What is the most difficult or error-prone part of this process?
**Type:** Paragraph

**Prompt:**

> Please describe a real recurring problem or a recent incident where possible. What happened, and what did your team have to do afterward?

### 7. What controls do you already use?
**Type:** Checkboxes + optional paragraph

- Multisig
- Wallet allowlist
- Role-based approval
- Spending limits
- Transaction policy engine
- Simulation
- Manual review
- Accounting / ERP controls
- Monitoring
- Reconciliation tooling
- Other

**Optional follow-up:**

> What do these controls handle well, and what still requires manual work?

### 8. What would make you interested in a deeper conversation?
**Type:** Multiple choice

- I'd be open to a 15–20 min research conversation
- I'd like to see a prototype/demo
- I'd be interested in discussing a specific workflow
- I'm mainly sharing information for research
- Nothing further for now

### 9. Contact
**Type:** Short answer

> X / Telegram / Email — only if you'd like a follow-up.

## Optional question for higher-signal responses

Use only if the form platform supports conditional logic:

### 9A. If you described a real problem, when could it first have been detected?
**Type:** Paragraph

This helps distinguish pre-execution control problems from post-execution reconciliation problems.

## Qualification guidance

Do not score respondents automatically.

For each response, classify:

**Relevance**
- High: directly operates or approves treasury/payment workflows
- Medium: oversees or builds systems closely supporting them
- Low: general crypto user or unrelated role

**Evidence**
- Observed: concrete process or artifact shown
- Reported: respondent states the workflow/problem
- Inferred: project interpretation

**Next step**
- None
- Research conversation
- Demo
- Specific workflow discussion
- Concrete test
- Pilot/integration discussion

A form submission is research evidence, not customer traction.

## Recommended workflow after responses

```
Form response
   ↓
Relevance check
   ↓
Written evidence review
   ↓
Clarifying question by text, when needed
   ↓
Optional 15–20 min conversation
   ↓
Optional demo
   ↓
Concrete workflow test only if justified
```

The written response is the primary record. Any call should be treated as a supplement, not the only source of truth.

## Anti-distortion rules

- Keep the respondent's wording when summarizing.
- Quote short phrases only when useful; otherwise paraphrase conservatively.
- Mark uncertainty explicitly.
- Do not infer a missing fact from context.
- If a response is ambiguous, ask a written follow-up question instead of guessing.
- Do not reinterpret a respondent's problem into VAERIQ terminology until after the original workflow is recorded.
- Store the raw form response separately from the project's interpretation where the form platform permits export.

## Mapping after collection

Only after preserving the original response, map relevant evidence to:

```
Intent
Context
Evidence
Policy
Risk
Decision
Reconciliation
```

Record "No clear match" when appropriate.

## Why this form exists

The form is intentionally written so the research data can be reviewed asynchronously by the founder and AI development partner. This reduces reliance on live English listening/transcription and creates a written primary record for later validation analysis.
