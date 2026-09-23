# NUBLE / VAERIQ

**VAERIQ** is the financial control layer for on-chain money.

> **VAERIQ decides whether value should move before it moves.**

**Category:** Payments & Remittance  
**Primary chain:** Solana  
**Initial network:** Solana Devnet  
**Expansion path:** Additional chains through adapters  
**Master brand:** NUBLE  
**Product:** VAERIQ  
**Status:** Colosseum Crypto World's Fair — Build & Submit

## Product thesis

Programmable money requires programmable control.

VAERIQ evaluates a payment request before execution using:

1. **Intent** — who is requesting the payment and what they intend to do.
2. **Context** — vendor, purpose, invoice, project, budget, and related evidence.
3. **Policy** — deterministic treasury rules and spending constraints.
4. **Risk** — anomalies and contextual risk signals.
5. **Decision** — `APPROVE`, `REVIEW`, or `BLOCK`.
6. **Execution** — only approved intent may cross the execution boundary.
7. **Audit** — decision evidence is linked to the resulting on-chain transaction.

## What VAERIQ is not

VAERIQ is not a wallet, exchange, accounting replacement, portfolio tracker, generic AML product, or autonomous AI signer.

AI is used for contextual reasoning and explanation. Financial enforcement remains deterministic and policy-driven.

## Repository status

This repository is the active development source for VAERIQ during the hackathon. It is intentionally private during development. The repository history is part of the project's development record.

**Milestone 01 is complete:** the Solana Devnet payment-control loop has been exercised end-to-end for both an approved payment and a blocked payment.

## Core team

- **Founder:** NUBLE founder (sole human team member)
- **AI development partner:** AI-assisted research, product design, architecture, coding, testing, and documentation

No external human builder is part of the core VAERIQ team. External community contacts may provide ecosystem introductions or informal feedback without being represented as team members or contributors unless that status changes explicitly.

## Planned technical shape

```text
                    VAERIQ
                       |
                Control Engine
                       |
        +--------------+--------------+
        |              |              |
      Policy          Risk           AI
        |              |              |
        +--------------+--------------+
                       |
                Decision Engine
                       |
             +---------+---------+
             |                   |
          APPROVE          REVIEW / BLOCK
             |
        Execution Guard
             |
        Chain Adapter
             |
          Solana
          Devnet
```

## Development principles

- Keep policy enforcement deterministic.
- Never let an LLM directly authorize movement of funds.
- Treat `REVIEW` and `BLOCK` as non-executable states.
- Represent monetary amounts safely; never use floating-point arithmetic for value movement.
- Preserve policy versions and decision evidence for auditability.
- Keep chain-specific code behind adapters.
- Prefer small, testable changes over large rewrites.
- Do not commit credentials, seed phrases, private keys, customer data, or production exports.

## Current roadmap

- [x] Product thesis and positioning
- [x] Product Blueprint v0.1
- [x] Builder Specification v0.1
- [x] Hackathon Execution Board v0.1
- [x] Repository foundation
- [x] Solana-first architecture decision
- [x] Milestone 01 — chain-connected payment control
- [x] Milestone 02 — control-boundary hardening and recovery
- [x] Solana Devnet stablecoin read/validation path
- [x] Solana Devnet stablecoin execution path
- [x] Execution guard behavior for `APPROVE` / `REVIEW` / `BLOCK`
- [x] Execution audit events
- [x] VAERIQ Direction Audit v2
- [x] Founder-Market-Fit Thesis v1.0
- [x] Persistent demo audit storage (browser-local, replaceable backend)
- [x] Execution failure handling and persisted failure evidence
- [ ] Durable server-side audit storage
- [x] Transaction lookup and intent reconciliation
- [x] Restore latest persisted audit summary after refresh
- [x] Persisted execution recovery state and safe retry gating (runtime verified)
- [x] Milestone 03 — intent/context/evidence control proof (engineering/runtime verified)
- [ ] Milestone 04 — operating-layer validation and RPC benchmark (harness ready)
- [ ] Public demo URL
- [ ] Customer discovery / user validation
- [ ] Final demo package
- [ ] Final Colosseum submission

## Documentation

- `DEVELOPMENT_HISTORY.md` — development timeline and disclosure record
- `CONTRIBUTING.md` — repository and engineering conventions
- `docs/ARCHITECTURE.md` — system boundaries and technical decisions
- `docs/HACKATHON.md` — Colosseum scope, demo and submission notes
- `docs/MILESTONE_01.md` — acceptance criteria and runtime evidence for the first chain-connected milestone
- `docs/DIRECTION_AUDIT_V2.md` — post-Milestone-01 strategic direction audit and Milestone 02 direction
- `docs/FOUNDER_MARKET_FIT.md` — founder journey, founder-market-fit thesis, evidence boundaries, and narrative draft
- `docs/MILESTONE_02.md` — control-layer hardening, persistent audit evidence, validation, and demo-proof plan
- `docs/MILESTONE_02_RUNBOOK.md` — runtime verification steps and evidence requirements for transaction reconciliation
- `docs/MILESTONE_03.md` — intent/context/evidence control-layer milestone and acceptance criteria
- `docs/MILESTONE_03_RUNBOOK.md` — product-proof and external-validation runbook for M03
- `docs/MILESTONE_04.md` — operating-layer milestone and RPC/market validation plan
- `docs/MILESTONE_04_RUNBOOK.md` — RPC benchmark and operator-validation runbook
- `docs/evidence/M03_FINAL_EVIDENCE.md` — consolidated M03 runtime verification matrix and evidence narrative
- `docs/evidence/M02_FINAL_EVIDENCE.md` — consolidated M02 verification matrix, scope notes, and submission evidence narrative
- `docs/CUSTOMER_VALIDATION.md` — customer discovery protocol, interview questions, evidence standards, and validation targets
- `docs/CUSTOMER_VALIDATION_LOG.md` — structured interview log and consolidated evidence template

## License

No open-source license has been selected yet. Until a license is added, repository contents remain proprietary to the project owner, except for third-party dependencies governed by their own licenses.


## M04 RPC benchmark

The repository includes a provider-neutral JSON-RPC benchmark harness at `scripts/rpc-benchmark.mjs`.

Run it with a matched Solana baseline and RPC Fast Focus endpoint:

```bash
export SOLANA_BASELINE_RPC_URL="https://api.devnet.solana.com"
export RPC_FAST_RPC_URL="YOUR_RPC_FAST_FOCUS_ENDPOINT"
npm run benchmark:rpc
```

Optional `RPC_FAST_TOKEN` can be supplied through the environment when the endpoint requires an `X-Token` header. Credentials are never stored in the repository.

The harness is designed to measure VAERIQ-relevant read and verification workloads rather than reproduce a provider's published benchmark. Results should retain the machine, region, sample count, concurrency, timeout, and run date alongside the measurements.
