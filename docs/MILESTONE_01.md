# Milestone 01 — Chain-Connected Payment Control

**Status:** Completed  
**Completed:** 2026-09-18  
**Target network:** Solana Devnet  
**Product:** NUBLE / VAERIQ  
**Primary use case:** Stablecoin treasury payment control

## Objective

Prove one complete, deterministic control loop from a business payment request to a real Solana Devnet stablecoin transaction, while proving that REVIEW and BLOCK cannot reach signing or execution.

## Acceptance criteria

### A. Intent and money representation

- [x] PaymentIntent has a stable ID and explicit business purpose.
- [x] Monetary amounts are represented as exact base-unit integers/strings.
- [x] Destination, asset mint, requester, and supporting context are explicit.

### B. Deterministic control

- [x] Policy evaluation is deterministic and versioned.
- [x] Risk evaluation is separate from policy evaluation.
- [x] Decision engine returns exactly one of APPROVE, REVIEW, BLOCK.
- [x] AI output is advisory and cannot authorize execution.

### C. Execution boundary

- [x] Only APPROVE can call the execution adapter.
- [x] REVIEW stops before signing.
- [x] BLOCK stops before signing.
- [x] Missing/invalid approval evidence fails closed.

### D. Solana Devnet

- [x] Solana Devnet RPC connectivity is working.
- [x] Wallet connection/signing path is working for the demo.
- [x] SPL stablecoin transfer instruction can be constructed safely.
- [x] An approved intent produced a real Devnet transaction signature.
- [x] The transaction signature is linked in the audit record to the intent ID.

### E. Demo proof

- [x] Approved payment: executes successfully.
- [x] Blocked payment: no transaction is created.
- [x] Audit screen shows intent → decision → signature for the approved flow and no signature/execution events for the blocked flow.

## Runtime evidence

### APPROVE path

A compliant 12 USDC payment with invoice reference INV-001 was evaluated and returned APPROVE. The user signed the resulting Solana Devnet transaction in the browser wallet. VAERIQ displayed the resulting transaction signature and execution events:

    APPROVE
      → EXECUTION_STARTED
      → TRANSACTION_SUBMITTED
      → TRANSACTION_CONFIRMED
      → audit record

### BLOCK path

An adversarial 8,500 USDC payment to an unapproved destination with no invoice reference was evaluated and returned BLOCK. The UI showed no transaction signature and no execution events, and the execution action remained disabled.

    BLOCK
      → no signer
      → no transaction
      → no execution events

## Non-goals for Milestone 01

- Multi-chain support.
- Autonomous AI signing.
- Production key management.
- Complex smart-account architecture.
- Full treasury accounting replacement.
- Mainnet deployment.

## Completion evidence

1. Git history contains the milestone implementation and Solana-first integration work.
2. A real Solana Devnet transaction was executed and its signature was displayed in the VAERIQ audit trail.
3. A reproducible blocked scenario produced no transaction signature or execution events.
4. Runtime screenshots provide visual evidence of both paths.

**Milestone 01 is complete.**

The next engineering milestone should focus on strengthening the audit model, test coverage, and product/demo robustness rather than expanding scope prematurely.