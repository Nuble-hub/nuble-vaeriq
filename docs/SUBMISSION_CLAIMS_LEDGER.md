# VAERIQ Submission Claims Ledger

## Purpose

This is the working claim boundary for the hackathon submission. Every externally stated claim should be traceable to repository evidence or explicitly identified as open.

## Claims currently supported by engineering evidence

| Claim | Evidence source | Boundary |
|---|---|---|
| VAERIQ evaluates an on-chain payment before execution using intent, context, policy, risk, and a decision state | M03 domain/evaluation implementation and runtime evidence | Current prototype behavior |
| APPROVE / REVIEW / BLOCK are distinct decision outcomes | M01–M03 tests and runtime evidence | Current prototype behavior |
| Non-APPROVE decisions are prevented from crossing the execution boundary | M02 control-boundary tests and runtime evidence | Current prototype behavior |
| Decision evidence is bound to a specific PaymentIntent | M02 control-boundary implementation/tests | Current prototype behavior |
| VAERIQ records execution and reconciliation evidence for the demonstrated Solana Devnet path | M01/M02 runtime evidence | Demo path, not production infrastructure |
| VAERIQ has intent-bound business context and deterministic completeness checks | M03 implementation/tests/runtime evidence | Current prototype behavior |
| Missing required context can change an otherwise approvable payment to REVIEW | M03 runtime evidence | Current prototype behavior |
| Execution recovery distinguishes known pre-submission failure from uncertain post-boundary outcomes | M02 recovery implementation/tests/runtime evidence | Current demo path |
| A bounded WebSocket observation layer can reconnect after a deterministic forced disconnect in the tested runtime | M04 canonical forced-reconnect run | Prototype-level resilience only |
| RPC Fast remains an optional provider rather than a core VAERIQ dependency | M04 comparative measurements and provider-neutral adapter | Local, workload-specific engineering decision |

## Claims that remain open

| Claim | Why open |
|---|---|
| Treasury/finance operators have a recurring need for VAERIQ's control model | Operator validation is still in progress |
| M03 context fields match real-world treasury workflows | Requires respondent evidence |
| Organizations would adopt VAERIQ in production | No production adoption evidence |
| VAERIQ has customer traction or product-market fit | No supporting evidence yet |
| RPC Fast is generally faster or more reliable than public Solana RPC | Current measurements are local and workload-specific |
| WebSocket observation is lossless or production-grade | Current probe is bounded and does not establish lossless delivery |
| Streaming is superior to polling for reconciliation | Polling-vs-streaming comparison is not yet measured end-to-end |

## Public wording rules

- Prefer "in our tested workload" over universal provider claims.
- Prefer "prototype" or "demo path" where production durability has not been verified.
- Prefer "we are validating" when customer evidence is open.
- Do not describe form responses, positive comments, demos, or introductions as customers, traction, or product-market fit by themselves.
- Keep AI positioning explicit: AI may assist context/reasoning/explanation, while financial enforcement remains deterministic.