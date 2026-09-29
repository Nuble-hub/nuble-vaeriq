# Security Policy

VAERIQ is a financial-control product under active development. Security-sensitive behavior must be treated as a first-class product requirement.

## Reporting

Please do not publish sensitive vulnerability details, credentials, private keys, seed phrases, or exploit instructions in public GitHub issues.

When GitHub private vulnerability reporting is available for this repository, use that mechanism. Otherwise, open a minimal public issue without sensitive details and request a private reporting channel.

## Non-negotiable rules

- Never commit private keys, seed phrases, RPC credentials, API secrets, or access tokens.
- Use isolated testnet wallets for development and demos.
- Never use production funds during development or testing.
- AI output must not directly authorize a financial transaction.
- `REVIEW` and `BLOCK` states must fail closed at the execution boundary.
- Monetary values must use exact representations rather than floating-point arithmetic.
- Audit records must preserve enough evidence to reconstruct why a transaction was allowed, reviewed, or blocked.

## Dependency and deployment hygiene

- Keep dependencies pinned or lockfile-controlled where practical.
- Run typecheck, tests, and the web build before merging meaningful changes.
- Treat deployment credentials as external secrets, never repository content.
- Keep demo data synthetic until approved production-data controls exist.

## Scope and limitations

The current repository contains a hackathon/demo implementation. Browser-local audit persistence is not production treasury storage, the demonstrated Solana application path is Devnet, and the M04 streaming path is an observation prototype rather than a production-grade delivery system.
