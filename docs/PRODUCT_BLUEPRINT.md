# NUBLE / VAERIQ — Product Blueprint v1.0

**Status:** Current product source of truth for the public repository  
**Updated:** 2026-10-05  
**Product:** VAERIQ  
**Master brand:** NUBLE  
**Primary chain:** Solana  
**Current application network:** Solana Devnet  
**Long-term category:** Financial Value Control Infrastructure

> **VAERIQ decides whether value should move before it moves.**

## 1. Product definition

VAERIQ is the financial control layer for on-chain money.

It sits between a payment request and blockchain execution and evaluates whether a payment has sufficient intent, context, evidence, policy compliance, and acceptable risk before value is allowed to move.

VAERIQ is a control/orchestration layer. It is not a wallet, custody provider, exchange, accounting/ERP replacement, generic AML/KYT product, portfolio tracker, or autonomous AI signer.

## 2. Core problem

Wallet authorization answers: **Who can spend?**

VAERIQ answers: **Should this specific payment happen?**

A technically authorized transaction can still be wrong for the business because the destination is new, the amount is anomalous, required evidence is missing, the requester lacks relevant business context, or an internal policy is violated.

The core distinction is:

**Authorization ≠ Business Validity**

## 3. Core control loop

Payment Intent → Context / Evidence → Policy → Risk → APPROVE / REVIEW / BLOCK → Execution Guard → Chain Adapter → Solana → Confirmation → Reconciliation → Audit

Financial enforcement is deterministic and policy-driven.

AI may assist with contextual reasoning and explanation, but it cannot override a policy decision, convert BLOCK into APPROVE, create signing authority, bypass an approval requirement, or silently modify financial policy.

## 4. PaymentIntent as the control object

PaymentIntent is the bridge between business intent and chain execution. It carries requester/actor, counterparty, asset, exact amount, purpose, invoice/supporting evidence, project/business context, policy and risk references, and lifecycle/execution state.

Decision evidence is bound to a specific PaymentIntent so that approval for one payment cannot be reused for another.

## 5. Decision model

### APPROVE

All required controls pass. The intent may cross the execution guard.

### REVIEW

The payment requires human review or additional evidence. It cannot execute automatically.

### BLOCK

A hard policy or blocking risk condition prevents execution.

REVIEW and BLOCK are non-executable states.

## 6. Execution and outcome controls

The execution boundary is explicit: APPROVE → Execution Guard → Chain Adapter → Transaction.

The current prototype records STARTED, SUBMITTED, CONFIRMED, RECONCILED, FAILED_BEFORE_SUBMISSION, and UNKNOWN_AFTER_SUBMISSION.

Retries are permitted only when there is explicit evidence that failure happened before transaction submission. Uncertain post-boundary outcomes are not automatically retried because duplicate payment risk is more dangerous than silent recovery. An explicit wallet/user cancellation is treated as a known pre-submission outcome rather than an uncertain transaction state.

## 7. Solana implementation

Solana is the primary chain for VAERIQ's current product and hackathon submission.

The current public application runs on Solana Devnet and demonstrates browser wallet connection, Devnet stablecoin payment evaluation, APPROVE / REVIEW / BLOCK outcomes, real approved Devnet execution, transaction confirmation, transaction lookup, reconciliation, intent-scoped audit evidence, and bounded execution recovery.

The application demo and infrastructure benchmark are intentionally separated: Solana Devnet is used for application/demo execution; Solana Mainnet is used only for M04 infrastructure benchmarking. Additional chains remain adapter-based expansion opportunities after validated customer demand.

## 8. Primary use cases

### Stablecoin treasury payments

Evaluate vendor, contractor, and operational payments before signing.

### Protocol / foundation treasury operations

Attach business context and policy requirements to recurring operational value movement.

### Autonomous-agent spending

Allow software or AI agents to initiate bounded payment intents without receiving unrestricted financial authority. The agent is an actor/requester, not the final authorization authority.

## 9. Product architecture

VAERIQ → Context/Evidence + Policy Engine + Risk Engine → Decision Engine → Execution Guard → Chain Interface → Solana Adapter → Solana Devnet → Confirmation/Lookup → Reconciliation → Audit

The business decision layer remains chain-agnostic behind the adapter boundary.

## 10. Trust boundary

The critical trust boundary is: **No value movement without an approved, intent-bound decision.**

The wallet remains responsible for signing authority. VAERIQ is responsible for determining whether the payment is permitted to reach the signing/execution step under the configured control model.

## 11. Current product status

Engineering/runtime evidence currently covers pre-execution evaluation; APPROVE / REVIEW / BLOCK decisions; execution-boundary enforcement; intent binding; context completeness checks; Solana Devnet execution; transaction confirmation and reconciliation; browser-local audit persistence; recovery and retry gating; bounded WebSocket observation; and provider-neutral RPC benchmarking.

Production-grade server-side audit durability, broader security hardening, and customer validation remain open.

## 12. Current commercial direction

VAERIQ is being developed as a durable B2B software product rather than a disposable hackathon project.

Initial commercial hypothesis: **B2B organization subscription + usage, with enterprise/API expansion.**

Primary economic buyers are expected to be treasury, finance, payments, operations, or founders of smaller Web3 organizations. Pricing is intentionally a hypothesis until willingness to pay, budget ownership, pain frequency, and pilot conversion are validated.

See `docs/VAERIQ_COMMERCIAL_STARTUP_BLUEPRINT.md` for the commercial and startup operating model.

## 13. Product roadmap

### Now

Public beta and external workflow validation; submission readiness; bounded pilot design; trust and reliability hardening.

### Next

Durable server-side audit storage; organization and role model; wallet/treasury integrations; API distribution; enterprise policy and audit capabilities; production security hardening.

### Evidence-dependent later

Autonomous-agent control workflows; external intelligence/evidence providers; additional chains through adapters; more advanced decision analytics.

## 14. Product decision rule

Do not expand the product merely to increase feature count. A new capability enters scope only when it strengthens the financial control boundary, solves a validated user workflow, improves trust/auditability/execution safety, or creates a defensible distribution/commercial path supported by evidence.

The central product thesis remains unchanged:

> **Control before value moves.**
