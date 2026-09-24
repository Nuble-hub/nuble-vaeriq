# VAERIQ Operator Validation — Interview 01 Guide

**Milestone:** M04 — Prove the Operating Layer  
**Purpose:** Test whether the VAERIQ control model maps to a real treasury/payment workflow without leading the interviewee.

## 1. Interview target

Prioritize a person who directly operates or oversees one or more of:

- Web3 treasury
- Stablecoin/vendor payments
- Protocol/foundation finance
- Crypto-native company payments
- Treasury operations
- Payment approval/reconciliation
- Automated services or agents that can initiate financial actions

Do not substitute general crypto users for treasury/payment operators.

## 2. Evidence objective

The interview is intended to establish, in order:

1. **Problem evidence** — a real workflow or concrete failure exists.
2. **Workflow fit** — the real workflow uses information that can be mapped to intent/context/policy/risk/decision.
3. **Interest** — the operator requests a follow-up, demo, or technical discussion.
4. **Design-partner candidate** — a concrete workflow is discussed for testing.
5. **Workflow commitment** — a defined pilot or integration experiment is agreed.

Do not skip from generic interest to a stronger evidence class.

## 3. 30-minute interview structure

### 0–3 min — Context

Opening:

> I'm researching how treasury and payment teams actually control stablecoin or on-chain payments. I'm not looking for a pitch-confirmation answer; I'd like to understand how your process works today, including what already works well and where it breaks.

Ask:

1. What part of treasury, finance, or payments do you personally operate or oversee?
2. Roughly what kind of payments or payment workflows are in your scope?

### 3–10 min — Current workflow

Ask these before mentioning VAERIQ:

1. Walk me through a typical payment from request to final reconciliation.
2. Who can request a payment?
3. Who reviews it?
4. Who approves it?
5. What information does the reviewer need before approving?
6. Where does that supporting information or evidence live?
7. What does the signer or wallet enforce?
8. What happens after the transaction is executed?
9. How is the on-chain result reconciled with the business record?

Record concrete system names only when the interviewee volunteers them.

### 10–17 min — Concrete failure discovery

Prefer the most recent real incident over hypothetical questions.

1. Tell me about the most recent payment that was wrong, delayed, blocked, or difficult to reconcile.
2. What happened?
3. What caused it?
4. When could you first have detected the problem?
5. What control caught it, if any?
6. What happened after the transaction was sent?
7. How was it resolved?
8. Roughly how much manual work or delay did this create?

Probe for concrete examples such as wrong recipient, wrong amount, missing evidence, budget/policy violation, unusual behavior, duplicate payment, requester-authority confusion, or reconciliation mismatch — but only when relevant to what the interviewee describes.

### 17–22 min — Existing controls and gaps

Ask:

1. What controls do you already have before signing?
2. What does your wallet, multisig, policy layer, or approval process enforce?
3. Where do those controls become insufficient or require manual work?
4. How do you detect unusual recipients, amounts, invoices, or behavior?
5. Which parts are handled by software and which still require people?
6. Are there controls that you deliberately do not automate? Why?

Do not assume that existing controls are inadequate.

### 22–25 min — Automated / agentic payments

Ask only if relevant:

1. Do automated services or agents ever initiate payments?
2. What boundaries do they operate under?
3. What would stop an automated system from making a technically valid but business-invalid payment?
4. What would you want to remain human-controlled?

Do not imply that autonomous payments are required.

### 25–29 min — VAERIQ reaction

Only after workflow and failure discovery:

> Suppose a control layer evaluated a payment before signing using payment intent, business context, policy, risk, and supporting evidence, and returned APPROVE / REVIEW / BLOCK. Where, if anywhere, would that fit into the workflow you described?

Then ask:

1. What part of that model matches your current process?
2. What part does not match?
3. What would it need to integrate with?
4. What would make you trust it?
5. What would make you reject it?
6. What would you need to see before trying it with non-production funds?
7. What concrete workflow would you be willing to test?

Do not ask: "Would you use VAERIQ?" until the end, and do not use a positive answer as evidence of a design partnership without a concrete next step.

### 29–30 min — Next step

Ask:

1. Is there a specific workflow you would be willing to walk through in more detail?
2. Would a follow-up technical/demo session be useful?
3. Who else owns this workflow and should be involved?

Classify the next step separately as:

- No next step
- Follow-up discussion
- Demo requested
- Technical evaluation
- Concrete workflow test
- Defined pilot/integration experiment

## 4. Evidence classification

Use these definitions consistently.

### Observed
Directly demonstrated in the interview or supplied as a specific artifact/process detail.

Examples:
- A described approval sequence with named systems.
- A concrete incident with sequence and resolution.
- A documented manual reconciliation step shown during the conversation.

### Reported
The interviewee states that something happens, but we have not independently verified it.

Examples:
- "We require invoices above a certain amount."
- "Our multisig blocks transfers to unknown destinations."

### Inferred
Our interpretation of what the interviewee's statement may imply.

Examples:
- "This sounds like a counterparty-context gap."
- "This workflow may fit an intent-bound policy layer."

Keep inferred statements separate from observed/reported evidence.

## 5. Mapping to the VAERIQ model

Do this after the interview, not during the discovery questions.

| Operator evidence | VAERIQ concept | Evidence type | Confidence |
|---|---|---|---|
| Why the payment exists | Intent / purpose | Observed / Reported / Inferred | High / Medium / Low |
| Who the payment is for | Counterparty | Observed / Reported / Inferred | High / Medium / Low |
| Supporting document or record | Evidence | Observed / Reported / Inferred | High / Medium / Low |
| Budget / project / cost center | Context | Observed / Reported / Inferred | High / Medium / Low |
| Allowed asset / destination / amount | Policy | Observed / Reported / Inferred | High / Medium / Low |
| Unusual behavior / anomaly | Risk | Observed / Reported / Inferred | High / Medium / Low |
| Human escalation path | REVIEW | Observed / Reported / Inferred | High / Medium / Low |
| Explicit stop condition | BLOCK | Observed / Reported / Inferred | High / Medium / Low |
| Approval condition | APPROVE | Observed / Reported / Inferred | High / Medium / Low |
| On-chain result vs business record | Reconciliation | Observed / Reported / Inferred | High / Medium / Low |

Do not force every interview statement into a VAERIQ field. Record "No match" where appropriate.

## 6. Interviewer rules

- Ask for real recent examples before hypotheticals.
- Ask what they do today before showing VAERIQ.
- Ask what already works before asking what is missing.
- Do not reveal the desired answer.
- Do not describe an existing VAERIQ feature as if it were already validated.
- Record negative evidence and objections.
- Separate the interviewee's statement from our interpretation.
- Do not record confidential credentials, private keys, wallet addresses, private financial data, or sensitive customer information.
- An interesting conversation is not a customer commitment.

## 7. Immediately after the interview

Complete `docs/CUSTOMER_VALIDATION_LOG.md` while details are fresh.

Also record:

- strongest concrete incident
- strongest recurring control
- clearest unresolved friction
- strongest objection
- exact next step
- evidence class: observed / reported / inferred
- whether the next step is only interest or a concrete workflow commitment

Do not synthesize across interviews until at least the first interview is fully recorded.

## 8. Interview 01 success condition

Interview 01 is complete when we have:

- a concrete workflow from request through reconciliation,
- at least one real failure example or an explicit statement that no such example was available,
- existing controls,
- the business impact or operational cost where known,
- the operator's reaction after the neutral VAERIQ description,
- one clearly classified next step,
- and evidence separated into observed / reported / inferred.
