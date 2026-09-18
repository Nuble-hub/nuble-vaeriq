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
- [x] Solana Devnet stablecoin read/validation path
- [x] Solana Devnet stablecoin execution path
- [x] Execution guard behavior for `APPROVE` / `REVIEW` / `BLOCK`
- [x] Execution audit events
- [x] VAERIQ Direction Audit v2
- [x] Founder-Market-Fit Thesis v1.0
- [x] Persistent demo audit storage (browser-local, replaceable backend)
- [x] Execution failure handling and persisted failure evidence
- [ ] Durable server-side audit storage
- [x] Transaction lookup and intent reconciliation (runtime verification pending)
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

## License

No open-source license has been selected yet. Until a license is added, repository contents remain proprietary to the project owner, except for third-party dependencies governed by their own licenses.
