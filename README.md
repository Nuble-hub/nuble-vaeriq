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

The current engineering focus is Milestone 01: a narrow, chain-connected payment-control loop on Solana Devnet.

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
- [ ] Core decision engine in repository
- [ ] Solana Devnet stablecoin read path
- [ ] Solana Devnet stablecoin execution path
- [ ] Execution guard tests for `APPROVE` / `REVIEW` / `BLOCK`
- [ ] Persistent audit trail
- [ ] Public demo URL
- [ ] Customer discovery / user validation
- [ ] Live demo
- [ ] Final Colosseum submission

## Documentation

- `DEVELOPMENT_HISTORY.md` — development timeline and disclosure record
- `CONTRIBUTING.md` — repository and engineering conventions
- `docs/ARCHITECTURE.md` — system boundaries and technical decisions
- `docs/HACKATHON.md` — Colosseum scope, demo and submission notes
- `docs/MILESTONE_01.md` — concrete acceptance criteria for the first chain-connected milestone

## License

No open-source license has been selected yet. Until a license is added, repository contents remain proprietary to the project owner, except for third-party dependencies governed by their own licenses.
