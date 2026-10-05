# VAERIQ — Commercial & Startup Blueprint v1.0

**Status:** Working commercial hypothesis  
**Updated:** 2026-10-05  
**Product:** NUBLE / VAERIQ  
**Primary chain:** Solana  
**Current application network:** Solana Devnet  
**Long-term category:** Financial Value Control Infrastructure

> **VAERIQ decides whether value should move before it moves.**

## 1. Executive thesis

VAERIQ is a control layer for on-chain money.

The product sits between a payment request and blockchain execution. It evaluates the payment's intent, business context, supporting evidence, deterministic policy constraints, and risk signals before allowing value to move.

The core product loop is:

```
Intent
  ↓
Context / Evidence
  ↓
Policy
  ↓
Risk
  ↓
APPROVE / REVIEW / BLOCK
  ↓
Execution Guard
  ↓
On-chain execution
  ↓
Confirmation
  ↓
Reconciliation
  ↓
Audit
```

The current product is a bounded prototype on Solana Devnet. It is not production custody, an accounting replacement, or an autonomous signer.

The commercial objective is to turn the proven control mechanism into a durable B2B software business, starting with recurring stablecoin payment workflows and expanding only when external evidence supports the next use case.

## 2. Structural problem

### The problem

Wallet authorization answers:

> Who is allowed to spend?

It does not necessarily answer:

> Should this specific payment happen?

A technically authorized payment can still be wrong because the destination is new, the amount is anomalous, required evidence is missing, the payment violates an internal policy, the requester lacks the required business context, or the payment creates a reconciliation problem.

The structural distinction is:

**Authorization ≠ Business Validity**

As value becomes programmable and payment initiation becomes more automated, organizations need controls that evaluate the business validity of an action before signing and execution.

This remains a market hypothesis until validated across real operator workflows.

## 3. Why now

Three conditions make the problem more important:

1. Stablecoins make on-chain payments practical for recurring operational flows.
2. Software systems can initiate and route financial actions with increasing automation.
3. Faster, programmable value movement reduces the time available for manual error detection before execution.

VAERIQ is designed around the resulting control question:

> Before an on-chain payment moves, does the system have enough context and evidence to know that it should move?

## 4. Initial ICP

### Primary ICP

Web3 organizations with recurring stablecoin payment workflows:

- Web3 startups
- protocol and foundation operations
- crypto-native companies
- teams making recurring vendor, contractor, treasury, or operating payments

### Economic buyer

Likely buyers include:

- CFO / finance lead
- treasury lead
- payments or operations lead
- founder at smaller organizations
- owner of an autonomous-payment workflow

### Primary user

Treasury, finance, payments, or operations staff who review or control on-chain payments.

### Secondary wedge

Teams operating autonomous software or AI agents that can initiate financial actions and need bounded authority.

The agent use case is a growth surface, not a reason to weaken the deterministic control boundary.

## 5. Value proposition

### One sentence

> VAERIQ gives organizations a deterministic control layer that evaluates why an on-chain payment should move before allowing the payment to cross into execution.

### User value

VAERIQ aims to reduce:

- preventable payment errors
- manual checking across fragmented evidence
- uncontrolled agent spending
- payment-policy violations
- ambiguity around why a payment was approved
- post-execution investigation and reconciliation work

The product should prove these benefits through measured customer workflows rather than assumed ROI.

## 6. Product boundary

### VAERIQ does

- represent a payment as a stable PaymentIntent
- attach business context and evidence
- evaluate deterministic policy
- evaluate typed risk signals
- produce explicit APPROVE / REVIEW / BLOCK outcomes
- prevent non-approved execution at the control boundary
- execute only after explicit APPROVE
- confirm and reconcile the resulting transaction
- preserve intent-scoped audit evidence
- support bounded recovery for known pre-submission failures
- keep uncertain post-boundary outcomes from being retried automatically

### VAERIQ does not

- custody customer private keys
- replace wallets or multisig systems
- replace accounting or ERP systems
- act as a generic AML/KYT provider
- let an LLM directly authorize money movement
- promise production-grade lossless streaming
- claim universal RPC performance superiority
- claim customer traction or product-market fit without evidence

## 7. Why Solana

Solana is the primary chain for the current VAERIQ product and hackathon submission.

The reason is product-level, not decorative:

- VAERIQ controls an actual on-chain payment execution path.
- The current live prototype uses Solana Devnet for stablecoin payment execution.
- Wallet signing, transaction confirmation, transaction lookup, and reconciliation are part of the demonstrated control loop.
- Solana also provides an important future environment for stablecoin payments and autonomous-agent payment workflows.

The current production boundary remains explicit:

**Solana Devnet for the application demo.**

**Solana Mainnet is used only for the M04 infrastructure benchmark, not for production value movement.**

Additional chains remain adapter-based expansion opportunities after validated demand.

## 8. Business model

### Core hypothesis

VAERIQ should be monetized as B2B financial-control infrastructure.

### Initial model

**Organization subscription + usage**

Customers pay for a control layer that includes the core policy, decision, evidence, audit, and workflow capabilities.

Usage-based expansion can be tied to measures such as:

- payment-intent volume
- controlled workflows
- organizations / entities
- API activity where applicable

### Enterprise expansion

Enterprise plans can add:

- advanced policy orchestration
- multiple entities / organizations
- treasury and workflow integrations
- audit export and retention controls
- API access
- custom approval workflows
- enterprise support and security requirements

### Platform / API

A longer-term platform model can expose VAERIQ decisioning to:

- wallets
- treasury systems
- payment systems
- agent runtimes
- other financial applications

The API model should preserve the same deterministic trust boundary rather than becoming a generic AI decision API.

### Pricing status

Pricing is currently a hypothesis.

We should not publish a precise price until customer discovery establishes:

- frequency of the problem
- financial / operational cost of failures
- budget owner
- current spend on alternative controls
- willingness to pilot
- willingness to pay
- value created per controlled workflow

## 9. Go-to-market

### Phase 1 — Founder-led discovery

Target a small set of highly relevant treasury / finance / payments operators.

Conversation sequence:

```
Workflow discovery
  ↓
Concrete recent failure
  ↓
Current controls and workaround
  ↓
Show bounded VAERIQ workflow
  ↓
Identify missing capability
  ↓
Pilot discussion
```

Do not pitch before understanding the existing workflow.

### Phase 2 — Bounded pilot

Pilot VAERIQ on one non-production or tightly bounded payment workflow.

Success criteria should be jointly defined with the organization, for example:

- clear approval criteria
- reduced manual checking
- reproducible audit evidence
- predictable review handling
- successful reconciliation
- acceptable false-review / false-block behavior

### Phase 3 — Workflow expansion

After proving one workflow:

- add adjacent payment classes
- integrate with the existing treasury / wallet stack
- introduce API access
- extend policy coverage
- expand to more entities

### Phase 4 — Agent control

Where customer demand exists, extend the same control model to autonomous agents:

```
Agent intent
  ↓
Context / evidence
  ↓
Policy / risk
  ↓
VAERIQ decision
  ↓
Bounded execution
```

The agent remains a requester / actor; it does not become the final financial authority.

## 10. Distribution strategy

Initial distribution should be deliberately narrow and founder-led:

- direct outreach to treasury and finance operators
- Web3 operator communities
- Solana ecosystem relationships
- protocol / foundation operations networks
- referrals from pilot users
- technical integrations with existing wallet / treasury systems

Public build updates and the demo are credibility surfaces, not substitutes for customer discovery.

## 11. Competitive position

VAERIQ should be positioned relative to categories, not as a claim that every alternative is inadequate.

| Existing category | Primary strength | VAERIQ's distinction |
|---|---|---|
| Wallet / multisig | Controls who can sign | Evaluates business validity before signing |
| Treasury platform | Workflow and asset management | Pre-execution intent/context/policy/risk control |
| Accounting / ERP | Financial records and reconciliation | Decision control before on-chain value movement |
| KYT / AML tooling | Compliance / transaction intelligence | Deterministic business-policy gate tied to intent |
| Generic AI agent tooling | Automation | Bounded financial authority with deterministic enforcement |

The competitive question to validate is whether customers will pay for a dedicated control layer when parts of this function can be assembled from existing wallet, treasury, accounting, and compliance systems.

## 12. Trust and security as product value

For financial infrastructure, trust is part of the product.

Non-negotiable principles:

- deterministic policy remains the enforcement authority
- AI cannot override a BLOCK or create signing authority
- PaymentIntent binding prevents approval reuse across intents
- REVIEW and BLOCK cannot cross the execution boundary
- transaction outcome is reconciled against the original intent
- uncertain post-boundary outcomes are not automatically retried
- user wallet cancellation is classified as a known pre-submission failure
- credentials and production secrets remain outside repository contents

The current demo proves these controls at prototype scope. Production readiness requires further hardening, infrastructure durability, security review, and operational controls.

## 13. Validation plan

### What is proven

- Working public product prototype
- Real Solana Devnet approval / execution path
- Explicit APPROVE / REVIEW / BLOCK decisions
- Intent-bound execution guard
- Intent-bound business context
- Transaction confirmation and reconciliation
- Persisted browser-local audit evidence
- Bounded recovery behavior
- Public feedback intake

### What is not yet proven

- recurring demand across treasury / finance operators
- willingness to pay
- production adoption
- design-partner commitments
- product-market fit
- universal superiority over existing treasury / wallet controls

### Validation ladder

1. Problem evidence
2. Workflow fit
3. Interest / follow-up
4. Design-partner candidate
5. Concrete workflow commitment
6. Paid pilot
7. Production adoption

Public claims should never skip these levels.

## 14. Metrics we should measure after the hackathon

### Product metrics

- payment intents evaluated
- APPROVE / REVIEW / BLOCK distribution
- review rate
- execution success rate
- reconciliation success rate
- recovery outcomes
- duplicate-prevention events
- time from intent creation to decision

### Customer metrics

- qualified operator conversations
- repeated pain patterns
- pilot requests
- pilot conversion
- active organizations
- retained workflows
- willingness-to-pay signals
- expansion requests

### Economic metrics

- subscription revenue
- usage revenue
- gross retention / expansion
- implementation cost
- gross margin of the control layer

These are measurement categories, not current achievements.

## 15. Product roadmap

### Near term

- public beta feedback
- external operator validation
- bounded pilot design
- final submission package
- durable server-side audit design

### Next

- production-grade backend persistence
- organization / role model
- integrations with existing wallet / treasury workflows
- API surface
- enterprise policy / audit controls
- security hardening

### Later, evidence-dependent

- autonomous-agent control workflows
- additional chains through adapters
- external intelligence / evidence providers
- more advanced decision analytics

The rule is:

> Expand only when repeated user evidence justifies the next capability.

## 16. 12-month operating hypothesis

### 0–3 months

Prove one recurring payment-control workflow with a small number of qualified operators.

### 3–6 months

Convert validated workflows into repeatable product onboarding and bounded pilots.

### 6–9 months

Harden production infrastructure, integrations, security, and organization-level controls.

### 9–12 months

Expand successful workflows across organizations, add API distribution, and evaluate agent-control expansion.

This is a planning hypothesis, not a forecast.

## 17. Long-term vision

The long-term opportunity is larger than a single treasury dashboard.

As money becomes increasingly programmable, more financial actions will be initiated by software rather than directly by humans.

VAERIQ can become the control layer that gives those systems bounded financial authority:

```
Human or Agent
     ↓
Financial Intent
     ↓
Context + Evidence
     ↓
Policy + Risk
     ↓
Decision
     ↓
Execution Authority
     ↓
On-chain Value
     ↓
Verified Outcome
```

The long-term category is therefore:

> **Financial Value Control Infrastructure for programmable money.**

The current Solana Devnet payment demo is the narrow proof of that larger thesis.

## 18. Current strategic decisions

**Now**

- Keep Solana as the primary chain.
- Keep the MVP narrow.
- Keep deterministic enforcement at the trust boundary.
- Validate treasury / finance workflows.
- Use subscription + usage as the initial business-model hypothesis.
- Treat pilots and real workflow evidence as the next commercial proof.

**Later**

- Production backend durability
- Enterprise integrations
- API distribution
- Agent-control expansion
- Multi-chain expansion
- External intelligence providers such as Elfa where they improve evidence/context without gaining authorization authority

## 19. Decision rule for the company

Do not ask:

> What feature would make the hackathon demo look bigger?

Ask:

> What evidence would make the next version of VAERIQ more useful, more trusted, and more commercially viable?

That is the operating principle for taking VAERIQ from a hackathon prototype to a real crypto product.
