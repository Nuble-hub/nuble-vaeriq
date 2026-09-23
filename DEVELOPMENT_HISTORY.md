# VAERIQ Development History

This document records the development timeline of NUBLE / VAERIQ for product traceability and hackathon disclosure.

## 2026-09-17 — Product direction established

- VAERIQ was selected as the product name under the NUBLE master brand.
- The product thesis was fixed as an **on-chain treasury control layer**.
- Primary use case: stablecoin payments with pre-execution policy and risk evaluation.
- Initial chain direction was explored across multiple ecosystems before the hackathon implementation target was fixed.
- Core loop: `Intent → Context → Policy → Risk → Decision → Execution → Audit`.

## 2026-09-17 to 2026-09-18 — Initial engineering baseline

- The product blueprint and builder specification were completed.
- A local engineering scaffold and prototype decision layer were developed.
- Core states implemented and tested conceptually: `APPROVE`, `REVIEW`, and `BLOCK`.
- Deterministic policy enforcement was separated from AI reasoning.
- An execution boundary was defined so non-approved intents cannot proceed to signing/execution.
- No production credentials or private keys were used.

## 2026-09-18 — Solana-first implementation decision

- Solana was selected as the initial chain for the Colosseum implementation.
- The first target network is Solana Devnet.
- The decision was made to keep the product chain-agnostic through adapters while making the hackathon build concrete on one chain.
- The first engineering milestone is a narrow stablecoin payment-control loop: intent → policy/risk → decision → approved execution → audit.
- Solana-specific work will use the current `@solana/kit` TypeScript stack and standard SPL token transfer primitives where appropriate.

## 2026-09-18 — Repository foundation aligned to milestone 01

- Official private GitHub repository: `Nuble-hub/nuble-vaeriq`.
- Architecture and hackathon documentation were updated from the earlier chain plan to the Solana-first implementation path.
- Milestone acceptance criteria were documented so claims about chain integration and execution are tied to demonstrable evidence.

## 2026-09-18 — Milestone 01 completed

- Local dependency installation completed successfully with zero reported vulnerabilities.
- Solana Devnet connectivity probe returned status `ok` with the configured Devnet USDC mint and 6 decimals.
- VAERIQ web application connected to a browser Solana wallet.
- A compliant 12 USDC payment with invoice reference `INV-001` evaluated to `APPROVE`.
- The approved intent crossed the execution guard, was signed by the browser wallet, and produced a real Solana Devnet transaction signature.
- VAERIQ displayed execution audit events for the approved path: `EXECUTION_STARTED`, `TRANSACTION_SUBMITTED`, and `TRANSACTION_CONFIRMED`.
- An adversarial 8,500 USDC payment to an unapproved destination with no invoice reference evaluated to `BLOCK`.
- The blocked scenario showed no transaction signature and no execution events, and the execution action remained disabled.
- Milestone 01 acceptance criteria are therefore marked complete in `docs/MILESTONE_01.md`.

## Disclosure principle

Any meaningful development completed before a final submission will be described accurately in the submission materials. The repository should preserve enough history to distinguish early design/prototype work from subsequent hackathon development.

## Team attribution

The core project is solo-founder led. No external human builder is represented as a team member. AI-assisted research, design, coding, testing, and documentation are treated as part of the development workflow rather than as human teammates.


## 2026-09-19 — Milestone 02 started: persistent audit evidence

Milestone 02 was opened as a hardening/proof milestone rather than a scope expansion.

Implemented the first audit-persistence slice:
- added a replaceable `AuditEventStore` interface with a JSON-backed implementation
- persisted decision audit events and execution/transaction events in browser-local storage for the demo
- surfaced recent persisted audit events in the web UI
- added automated coverage for audit-store persistence and reload behavior
- documented the boundary clearly as demo-grade browser-local persistence, not production treasury storage

The next open work remains execution failure handling, transaction reconciliation, customer validation, and final demo evidence.


## 2026-09-19 — Persistent audit verification and execution-failure hardening

- Founder runtime testing confirmed that persisted audit events remain visible after browser refresh for both APPROVE and BLOCK flows.
- The persistent audit slice is therefore treated as runtime-verified for the demo.
- Execution failure handling was added at the post-authorization boundary.
- VAERIQ now records `EXECUTION_STARTED` before simulation/transaction work and persists an `EXECUTION_FAILED` event when an authorized execution attempt fails.
- Failure evidence remains attached to the same payment intent and is stored through the replaceable audit store.
- Runtime verification of the failure path remains open.


## 2026-09-19 — Execution-failure path runtime verified

- Founder runtime testing triggered an approved payment execution failure with `INSUFFICIENT_USDC_BALANCE`.
- The audit trail recorded `EXECUTION_STARTED` followed by `EXECUTION_FAILED` for the same payment intent.
- No `TRANSACTION_SUBMITTED` or `TRANSACTION_CONFIRMED` event was recorded for the failed execution attempt.
- Milestone 02 execution-failure evidence is therefore runtime-verified for the demo.


## 2026-09-19 — Transaction lookup and reconciliation implementation

- Added a replaceable reconciliation layer that compares an executed PaymentIntent with the chain-observed transaction.
- Solana transaction lookup now uses the configured Devnet RPC and `getTransaction` with confirmed commitment.
- The adapter inspects parsed SPL token movement and token-account ownership to derive the observed sender, recipient, asset, and exact atomic amount.
- Reconciliation returns `MATCHED`, `MISMATCHED`, or `NOT_FOUND`.
- A `TRANSACTION_RECONCILED` audit event is persisted after a successful transaction lookup/reconciliation attempt.
- Added automated coverage for matching, mismatch, and not-found reconciliation rules.
- Runtime verification of the on-chain lookup/reconciliation path remains open.


## 2026-09-19 — Transaction reconciliation runtime verified

- Founder runtime testing executed a real approved Solana Devnet payment for intent pi_f707e37d-69f0-4a03-b842-b827c2425261.
- The observed transaction signature was 2eeGYWa7noWMfdPbE5C9sPjVLNg3bYFe7kzhNNePHmbf7J7wiLt6Ld75ocBCcVumMn9byUZ2LwAPG61rGsKfjTAc.
- VAERIQ reported Reconciliation: MATCHED.
- The audit trail contained TRANSACTION_SUBMITTED, TRANSACTION_CONFIRMED, and TRANSACTION_RECONCILED, all referencing the same transaction signature.
- Refresh testing confirmed the TRANSACTION_RECONCILED event remained in persisted audit history.
- A separate BLOCK test recorded only policy/risk/decision events for intent pi_391c9422-6082-4b53-853e-d34de8862149; no submission, confirmation, or reconciliation events were created.
- Transaction lookup and reconciliation are therefore runtime-verified for the current Solana Devnet demo path.


## 2026-09-19 — Persisted audit summary rehydration implemented

- Added browser-refresh rehydration for the latest persisted audit intent.
- The web demo can restore the latest decision, transaction signature, reconciliation status, failure message, and intent-scoped audit events from the persistent audit store.
- This keeps the visible audit summary aligned with persisted evidence instead of relying only on in-memory page state.
- Runtime verification of the rehydrated summary remains open.


## 2026-09-19 — Audit rehydration runtime verified

- Founder refresh testing confirmed persisted audit history survives page reload.
- The latest persisted intent can be restored with its decision and execution-failure state.
- The UI was refined to distinguish the latest persisted intent from the last reconciled transaction, preventing two different payment intents from being visually conflated after refresh.
- The latest reconciled transaction remains available from persisted reconciliation evidence.


## 2026-09-19 — Full current reconciliation verification completed

- Founder completed the new-transaction verification after audit rehydration changes.
- Approved intent `pi_8e09d2a4-c2dc-40ae-bfe2-f308c00f4fc8` produced Devnet transaction `nh97Q3Vw9nEVYRmthSZTefr8NJbCK4xdDGMRGPHcWLJ8sPRUS7hyGLgdTmm6kCv1JNPVMHaTDWU9zjteTEQnmFN`.
- VAERIQ reported `MATCHED` reconciliation.
- The same intent and signature appeared across `TRANSACTION_SUBMITTED`, `TRANSACTION_CONFIRMED`, and `TRANSACTION_RECONCILED` persisted evidence after refresh.
- BLOCK verification remained isolated: no submission, confirmation, or reconciliation events were produced for the blocked intent.
- The current audit, lookup, reconciliation, and rehydration slices are runtime-verified for the demo path.


## 2026-09-19 — Customer validation protocol prepared

- Added a structured customer-validation protocol focused on real treasury/payment workflows rather than pitch confirmation.
- Added an interview log template for concrete incidents, existing controls, business impact, objections, product fit, and workflow commitments.
- Validation targets remain 5–10 relevant operators, recurring problem evidence, 2–3 serious design-partner candidates, and at least one concrete workflow commitment where possible.
- No customer or product-market-fit claims are being made until interviews produce supporting evidence.

## 2026-09-20 — Control-boundary hardening

- Reworked the decision result to bind an evaluation explicitly to its PaymentIntent ID.
- Hardened the execution guard so it fails closed when approval evidence is bound to a different intent, the intent is not in the expected pre-execution state, policy evidence is not a clean pass, or risk is already classified as high.
- Expanded the automated control-boundary gate to cover intent mismatch, tampered policy evidence, tampered high-risk evidence, invalid intent status, and existing REVIEW/BLOCK cases.
- Reframed Milestone 02 so product hardening and demo proof remain the hackathon critical path; customer validation continues in parallel and does not block engineering progress.


## 2026-09-21 — Execution recovery and idempotency hardening implemented

- Added a persisted execution-attempt model separate from audit events.
- Bound execution attempts to the PaymentIntent through an intent-scoped idempotency key.
- Added explicit lifecycle states: STARTED, SUBMITTED, CONFIRMED, RECONCILED, FAILED_BEFORE_SUBMISSION, and UNKNOWN_AFTER_SUBMISSION.
- Retry is permitted only when the system has explicit evidence that failure occurred before transaction submission.
- Any error after entering the chain execution adapter is treated conservatively as UNKNOWN_AFTER_SUBMISSION unless it is a known pre-submission balance failure.
- The web demo now restores the latest execution state after browser refresh and disables automatic retry for uncertain execution outcomes.
- Added automated tests for persistence, retry gating, idempotency-key reuse, and unknown-execution locking.
- Runtime verification of the new recovery behavior remains open.


## 2026-09-21 — Deterministic uncertain-execution demo scenario

- Added a dedicated **Recovery · UNKNOWN** browser scenario to exercise the post-execution-boundary uncertainty path without intentionally submitting a real transaction.
- The scenario crosses the execution boundary marker and records `UNKNOWN_AFTER_SUBMISSION` with an `EXECUTION_UNKNOWN` audit event.
- Retry remains blocked because the execution outcome is intentionally treated as uncertain.
- Added the scenario to the Milestone 02 runtime verification runbook and final evidence checklist.
- Browser runtime verification of this scenario remains open.


## 2026-09-21 — Recovery runtime verification completed

- Founder runtime testing verified the pre-submission failure path with `FAILED_BEFORE_SUBMISSION` and safe retry behavior.
- Retry produced a new execution-attempt ID while retaining the same intent-scoped idempotency key.
- Browser refresh restored the latest failed execution state and persisted audit evidence.
- Founder runtime testing verified the deterministic **Recovery · UNKNOWN** scenario: `UNKNOWN_AFTER_SUBMISSION` was persisted with `EXECUTION_UNKNOWN`, no transaction signature was created by the demo scenario, and retry remained blocked.
- Browser refresh preserved the uncertain execution state and attempt identity.
- Milestone 02 recovery runtime verification is therefore complete for the current demo path.


## 2026-09-21 — Milestone 02 completed and merged

- M02 engineering and browser runtime verification were completed across control-boundary hardening, persistent audit evidence, transaction reconciliation, recovery, safe retry, uncertain execution handling, and browser refresh persistence.
- Final evidence was consolidated in `docs/evidence/M02_FINAL_EVIDENCE.md` and the associated evidence bundle.
- PR #1 (`M02 — Harden execution control boundary and recovery`) was marked ready and merged into `main` with squash merge commit `012fc7d83a47710a827eef10ce74b00529ff8103`.
- Customer discovery and final narrative work remain parallel activities and are not represented as completed customer traction or product-market-fit evidence.


## 2026-09-21 — Milestone 03 context/evidence slice started

- Started M03 on branch `feature/m03-intent-context-evidence`.
- Added a typed, intent-bound `ContextSnapshot` separate from chain execution.
- Added deterministic context-completeness evaluation for purpose, counterparty, required invoice, and invoice evidence.
- Added explicit context-to-intent and organization binding checks.
- Added `CONTEXT_ATTACHED` audit evidence before policy/risk/decision events.
- Added automated M03 context/evidence tests and included them in the repository test gate.
- UI exposure and browser runtime verification remain open.


## 2026-09-22 — M03 intent/context/evidence UI slice

- Added a visible **Why should this payment move?** panel to the web demo.
- The panel exposes the evaluated ContextSnapshot, completeness status, purpose, counterparty, invoice, destination/asset context, and evidence references.
- The UI remains informational: deterministic policy/risk enforcement and the M02 execution boundary are unchanged.
- Browser runtime verification of the new panel remains open.


## 2026-09-22 — M03 deterministic context gate

- Extended M03 evaluation so incomplete required business context can no longer silently produce an APPROVE result.
- An otherwise-approvable payment with incomplete context is deterministically converted to REVIEW with an explicit context-completeness reason.
- Existing BLOCK decisions remain BLOCK; existing REVIEW decisions can include the additional context reason.
- Added automated coverage for the incomplete-context review gate.
- The M02 execution guard remains unchanged and still requires a final APPROVE before execution.

## 2026-09-22 — M03 UI decision explanation refinement

- Updated the context panel to state explicitly when incomplete required context changes the final decision to REVIEW.
- Clarified that the context snapshot is evaluated before execution and is part of the control flow, not only presentation.
- The next runtime proof is to demonstrate APPROVE → REVIEW solely by changing required business context while keeping the payment otherwise policy-compliant.

## 2026-09-22 — M03 decision-changing context runtime proof

- Browser runtime verification demonstrated the key M03 control transition using the same 2,000 USDC payment intent shape.
- With the required invoice removed, the context became INCOMPLETE and the final decision changed to REVIEW.
- Restoring `INV-001` returned the context to COMPLETE and the decision to APPROVE.
- The UI made the decision change explicit and kept execution unavailable while the decision was REVIEW.
- This runtime proof establishes the intended context-as-control behavior; final regression verification after the latest UI changes remains open.


## 2026-09-22 — Milestone 03 engineering proof completed

- M03 typed context, deterministic completeness, context audit evidence, UI explanation, and decision-changing context behavior were completed and runtime-verified.
- Browser evidence demonstrated a 2,000 USDC payment changing from APPROVE with invoice context to REVIEW when required invoice context was removed, then returning to APPROVE when restored.
- M02 execution guard and recovery behavior remained green through the final regression check.
- Final M03 evidence was consolidated in `VAERIQ_M03_Final_Evidence_2026-09-22.zip`.
- Customer-validation work remains open and no traction or product-market-fit claim is implied.


## 2026-09-23 — M04 operating-layer benchmark started

- Started `feature/m04-validation-rpc-benchmark` from M03-complete `main`.
- Added a repeatable JSON-RPC benchmark harness for matched Solana workloads.
- The harness measures p50/p95/p99 latency, success rate, min/max latency, wall-clock achieved request rate, and sampled errors.
- Workloads include `getHealth`, `getLatestBlockhash`, `getBlockHeight`, and optional `getBalance` / `getTransaction` when a wallet or known transaction signature is supplied.
- Added optional RPC Fast token support through the `X-Token` request header without committing credentials.
- Added M04 operating-layer milestone and runtime runbook.
- Benchmark execution against RPC Fast Focus is pending endpoint setup and a matched runtime run.


## 2026-09-23 — M04 benchmark harness documented

- Added repository documentation for the M04 JSON-RPC benchmark harness.
- Added a benchmark results template so each run retains comparable conditions and measured outputs.

## 2026-09-24 — M04 benchmark measurement-quality hardening

- Refined the JSON-RPC benchmark so latency percentiles and min/max are calculated from successful measurement requests only.
- Added explicit attempted vs successful request rates, measured success/failure counts, error aggregation, and warmup-failure reporting.
- Warmup failures no longer abort the entire benchmark; they are recorded and the matched measurement run continues.
- Updated the M04 benchmark results template and runbook to preserve error/throttling evidence separately from successful-request latency.

## 2026-09-24 — M04 benchmark network aligned to RPC Fast Focus

- The provisioned RPC Fast Focus endpoint is Mainnet-only, so the comparative benchmark network was aligned to Solana Mainnet for apples-to-apples endpoint testing.
- The M04 runbook and evidence template were updated to distinguish the current Mainnet benchmark from VAERIQ's existing Devnet application path.
- The next reconciliation-oriented benchmark input is a known confirmed Mainnet transaction signature available to both endpoints.

## 2026-09-24 — M04 streaming observation probe added

- Added a provider-neutral WebSocket observation probe using Solana Mainnet `slotSubscribe`.
- The probe compares same-slot notification arrival between the public Mainnet WebSocket and RPC Fast Focus, while separately recording duplicates, unmatched slots, and WebSocket errors.
- Added `benchmark:stream` and documented the runtime procedure.
- The probe is observation-only; transaction confirmation, `getTransaction`, and reconciliation remain authoritative.

## 2026-09-24 — M04 HTTP benchmark rate-limit isolation added

- Added `BENCHMARK_METHODS` so individual JSON-RPC methods can be benchmarked in isolation.
- This separates clean latency measurement from full-suite capacity/throttling observations on rate-limited public RPC endpoints.
- The next HTTP measurement is an isolated `getTransaction` run using the same Mainnet transaction signature on both endpoints.

## 2026-09-24 — M04 probe runtime bug fixes

- Fixed the HTTP benchmark helper regression introduced while adding method selection; required integer parsing helpers are restored.
- Fixed the WebSocket observation probe's stream-key mismatch that caused slot notifications to crash the process.
- Added explicit baseline-only and candidate-only slot counts to the streaming report so observation gaps are measurable rather than described only in notes.

## 2026-09-24 — M04 HTTP and WebSocket benchmark evidence captured

- Completed Mainnet HTTP benchmark runs, including generic RPC methods and isolated `getTransaction` runs at sequential and concurrent settings.
- Observed public-baseline `HTTP_429` responses in repeated 30-request runs, while the same runs completed without observed RPC Fast errors.
- Completed a corrected 30-slot Mainnet `slotSubscribe` observation run with 30 matched slots, zero duplicates, zero stream errors, and no baseline-only or candidate-only slots.
- Preserved the measured results in `docs/M04_RPC_BENCHMARK_RESULTS.md` and `docs/M04_STREAM_BENCHMARK_RESULTS.md`.
- Engineering decision from the measured workload: keep RPC Fast as an optional provider rather than a core VAERIQ dependency.
- Streaming remains an observation layer; confirmation, `getTransaction`, and reconciliation remain authoritative.


## 2026-09-24 — M04 streaming resilience hardening

- Added a small provider-neutral stream observation core for duplicate detection, slot-gap accounting, reconnect counters, and delta summaries.
- Hardened the Mainnet `slotSubscribe` probe with bounded reconnect handling and optional deterministic forced disconnect testing.
- Added a regression test covering duplicate delivery, observed slot gaps, reconnect accounting, and signed timing delta summaries.
- Added `STREAM_RECONNECT_DELAY_MS`, `STREAM_MAX_RECONNECTS`, and `STREAM_FORCE_RECONNECT_AFTER_MS` runtime controls.
- Reconnect/gap implementation is complete at code level; live forced-reconnect verification remains open.
