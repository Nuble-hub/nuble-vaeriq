# VAERIQ Architecture v0.1

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
      /      \
     v        v
  Tempo    Solana
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

Chain-specific code lives behind a common adapter interface. The first live target is Tempo. Solana remains an expansion adapter until a real integration exists and is disclosed as such.

```text
                 chain-interface
                       |
             +---------+---------+
             |                   |
        tempo-adapter       solana-adapter
```

## Data placement

Off-chain application state may include invoices, budgets, vendor metadata, historical behavior, policy configuration, and AI reasoning. On-chain state includes the actual transaction and network-level execution evidence.

The bridge between them is the intent ID, policy version, decision record, and transaction hash.

## Security posture

- No private keys in the repository.
- No secrets committed to source control.
- Testnet credentials must be isolated from production credentials.
- Monetary arithmetic must be integer-safe or represented as exact strings.
- The system should fail closed at the execution boundary when approval evidence is missing or invalid.
