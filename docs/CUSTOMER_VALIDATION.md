# VAERIQ Customer Validation Protocol v1.0

**Milestone:** 02 — Prove the Control Layer  
**Status:** Open  
**Purpose:** Test whether VAERIQ solves a recurring control problem for real organizations moving programmable value.

## Core hypothesis

Organizations can already restrict who or which wallet is allowed to spend. The unresolved hypothesis is whether treasury/finance operators also need a control layer that evaluates **why** a payment should move before execution using business context, policy, risk, and evidence.

This is a hypothesis, not a validated market claim.

## Primary interview target

People who currently operate or oversee treasury, finance, payments, or stablecoin flows for:

- Web3 startups
- protocols and foundations
- crypto-native companies
- businesses using stablecoins for vendor, payroll, contractor, treasury, or operational payments

Secondary target:

- operators building autonomous agents that can initiate financial actions

Do not treat general crypto users as equivalent to treasury/payment operators.

## What we need to learn

### 1. Existing workflow

Understand how a payment moves today:

Request → context/evidence → review → approval → signing → execution → reconciliation.

Ask what systems are used at each step.

### 2. Failure modes

Look for real examples involving:

- wrong recipient or changed destination
- incorrect amount
- missing invoice or supporting evidence
- budget or policy violations
- unusual payment behavior
- duplicate payment
- unclear requester authority
- transaction sent successfully but later discovered to be wrong
- reconciliation gaps between business records and on-chain execution

Ask about the most recent concrete incident rather than hypothetical fears.

### 3. Current controls

Determine which controls already exist:

- wallet allowlists
- multisig approval
- role-based permissions
- spending limits
- simulation
- transaction policies
- accounting/ERP controls
- manual review
- monitoring/reconciliation

The goal is to understand what is missing, not to assume existing infrastructure is inadequate.

### 4. Business impact

Capture what the failure costs:

- money lost
- time spent investigating
- payment delays
- operational disruption
- additional approval work
- reconciliation work
- customer/vendor impact
- internal risk or compliance escalation

Do not ask the interviewee to validate VAERIQ's thesis before establishing their actual workflow and pain.

## Interview questions

### Opening

1. Walk me through how a typical stablecoin/vendor/treasury payment gets from request to execution.
2. Who is allowed to initiate it?
3. Who reviews it, and what information do they need before approving it?
4. Where does the supporting evidence live?

### Failure discovery

5. Tell me about the most recent payment that was wrong, delayed, blocked, or difficult to reconcile.
6. What caused it?
7. At what point could the problem first have been detected?
8. What happened after the transaction was sent?
9. How much manual work was required to resolve it?

### Existing controls

10. What controls do you already use before signing?
11. What does your wallet or multisig enforce?
12. What do those controls *not* know about the business context of a payment?
13. How do you detect unusual recipients, amounts, invoices, or behavior today?

### Agentic systems

14. Do you have software agents or automated services that can initiate payments?
15. What limits or controls do they operate under?
16. What would prevent an agent from making a technically valid but business-invalid payment?

### Product reaction — only after workflow discovery

17. Suppose a system evaluated payment intent, business evidence, policy, and risk before signing and returned APPROVE / REVIEW / BLOCK. Where would that fit into your current workflow?
18. What existing system would it need to integrate with?
19. What would make you trust or reject such a system?
20. What would you need to see before running it with real money?

## Evidence rules

Record direct observations, not conclusions.

Strong evidence:

- specific incident described from experience
- existing workflow or control named
- measurable operational cost
- current workaround
- repeated problem across multiple people/teams
- willingness to test a concrete workflow
- willingness to introduce the product to the responsible operator

Weak evidence:

- generic agreement with the pitch
- "this sounds useful"
- hypothetical concerns
- social encouragement without workflow commitment

Do not record a person as a customer, design partner, or validated user unless they explicitly qualify for that status.

## Validation progression

The evidence progression is:

1. **Problem evidence** — real operators describe the same class of failure.
2. **Workflow fit** — VAERIQ's intent/context/policy/risk decision model maps to a real workflow.
3. **Interest** — an operator asks for a follow-up, demo, or technical discussion.
4. **Design-partner candidate** — an organization discusses testing a concrete workflow.
5. **Workflow commitment** — an organization agrees to run a defined pilot or integration experiment.

Do not skip levels in public claims.

## Milestone 02 target

Initial target:

- 5–10 relevant interviews
- identify recurring failure patterns
- identify 2–3 serious design-partner candidates
- obtain at least one concrete workflow commitment where possible

These are investigation targets, not guaranteed outcomes.

## What would falsify or materially change the thesis

Record negative evidence explicitly.

Examples:

- operators already solve the problem adequately with existing controls
- business-context checks are not part of the payment decision
- the problem is too infrequent or low-cost to justify a dedicated control layer
- the problem occurs mainly after execution rather than before execution
- organizations prefer accounting/reconciliation tooling instead of pre-execution control
- autonomous-agent spending does not create meaningful incremental demand for bounded controls

Negative evidence is useful. It should change the product thesis when warranted.

## Output

Each interview should produce:

- anonymized operator profile
- workflow summary
- concrete failure example
- current controls
- missing control or unresolved friction
- product fit notes
- objection
- next action
- evidence strength: observed / reported / inferred

The consolidated results will be summarized without exposing confidential company or financial information.
