# VAERIQ Architecture v0.2

## Product boundary

VAERIQ is an on-chain financial control layer. It evaluates a payment intent before execution and records the evidence behind the decision.

```text
User / Agent
     |
     v
Payment Intent
     |
     +-------------------+
     |                   |
     v                   v
Policy Engine        Risk Engine
     |                   |
     +---------+---------+
               v
        Decision Engine
          /    |    \
         /     |     \
        v      v      v
    APPROVE  REVIEW  BLOCK
        |
        v
  Execution Guard
        |
   Chain Adapter
        |
      Solana
      Devnet
```

## Core invariants

### Policy is deterministic

A policy evaluation must be reproducible from the payment intent, relevant context, and policy version.

### Risk is separate from policy

A transaction can be policy-compliant while still carrying risk signals, or it can violate policy without being a high-risk transaction. These dimensions stay separate so the system can explain the decision.

### AI is advisory

AI may summarize context, explain risk, or propose interpretation. It must never be the sole authority for transferring funds.

### Execution is capability-based

Only an approved intent can cross the execution boundary. `REVIEW` requires the required approval path. `BLOCK` cannot execute.

## Domain objects

The initial domain vocabulary is:

- `Organization`
- `Wallet`
- `Agent`
- `Counterparty`
- `PaymentIntent`
- `Policy`
- `PolicyEvaluation`
- `RiskSignal`
- `Decision`
- `Approval`
- `Transaction`
- `AuditEvent`

`PaymentIntent` is the central object linking business intent to an eventual transaction.

## Chain abstraction

Chain-specific code lives behind a common adapter interface. The first live target for the hackathon is Solana Devnet. Additional networks can be added later through adapters without changing the control engine.

```text
                 chain-interface
                       |
                    Solana
                     Devnet
                       |
              future adapters
```

## Data placement

Off-chain application state may include invoices, budgets, vendor metadata, historical behavior, policy configuration, and AI reasoning. On-chain state includes the actual transaction and network-level execution evidence.

The bridge between them is the intent ID, policy version, decision record, and transaction signature.

## Security posture

- No private keys in the repository.
- No secrets committed to source control.
- Devnet credentials must be isolated from production credentials.
- Monetary arithmetic must be integer-safe or represented as exact strings.
- The system should fail closed at the execution boundary when approval evidence is missing or invalid.

## Solana implementation direction

The initial implementation uses the current Solana TypeScript stack centered on `@solana/kit`. Wallet-connected execution is preferred for the demo so the user's wallet remains the signer and VAERIQ remains the control/orchestration layer.

For stablecoin movement, the first adapter targets standard SPL token transfer primitives. Token amounts are represented in base units using integers/strings, not floating-point numbers.

## Audit persistence

The control engine emits audit events for policy evaluation, risk evaluation, decision, and execution. The web demo persists these events through a replaceable `AuditEventStore` implementation using browser-local storage.

This persistence layer is intentionally demo-grade. It demonstrates that decision evidence survives a page refresh without coupling the control engine to a browser-specific storage API. A production implementation can replace the store with durable server-side storage while preserving the same event contract and intent-to-transaction traceability.
