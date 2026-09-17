# Milestone 01 — Chain-Connected Payment Control

**Status:** In progress  
**Target network:** Solana Devnet  
**Product:** NUBLE / VAERIQ  
**Primary use case:** Stablecoin treasury payment control

## Objective

Prove one complete, deterministic control loop from a business payment request to a real Solana Devnet stablecoin transaction, while proving that `REVIEW` and `BLOCK` cannot reach signing or execution.

## Acceptance criteria

### A. Intent and money representation

- [ ] `PaymentIntent` has a stable ID and explicit business purpose.
- [ ] Monetary amounts are represented as exact base-unit integers/strings.
- [ ] Destination, asset mint, requester, and supporting context are explicit.

### B. Deterministic control

- [ ] Policy evaluation is deterministic and versioned.
- [ ] Risk evaluation is separate from policy evaluation.
- [ ] Decision engine returns exactly one of `APPROVE`, `REVIEW`, `BLOCK`.
- [ ] AI output is advisory and cannot authorize execution.

### C. Execution boundary

- [ ] Only `APPROVE` can call the execution adapter.
- [ ] `REVIEW` stops before signing.
- [ ] `BLOCK` stops before signing.
- [ ] Missing/invalid approval evidence fails closed.

### D. Solana Devnet

- [ ] Solana Devnet RPC connectivity is working.
- [ ] Wallet connection/signing path is working for the demo.
- [ ] SPL stablecoin transfer instruction can be constructed safely.
- [ ] An approved intent can produce a real Devnet transaction signature.
- [ ] The transaction signature can be resolved from the audit record back to the intent ID.

### E. Demo proof

- [ ] Approved payment: executes successfully.
- [ ] Blocked payment: no transaction is created.
- [ ] Audit screen shows intent → policy/risk → decision → signature (for approved flow).

## Non-goals for Milestone 01

- Multi-chain support.
- Autonomous AI signing.
- Production key management.
- Complex smart-account architecture.
- Full treasury accounting replacement.
- Mainnet deployment.

## Evidence required before claiming completion

1. Git commit(s) showing the implementation.
2. A working Devnet transaction signature for the approved scenario.
3. A reproducible blocked scenario with no submitted transaction.
4. A short screen recording showing the end-to-end flow.

Until all evidence exists, the milestone remains **in progress** and should not be described as completed in the hackathon submission.
