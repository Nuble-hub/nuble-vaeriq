# Security Policy

VAERIQ is a financial-control product under active development. Security-sensitive behavior must be treated as a first-class product requirement.

## Reporting

During the private development period, report security issues directly to the project owner through the private project channel. Do not publish sensitive vulnerabilities, credentials, private keys, seed phrases, or exploit details in public issues.

## Non-negotiable rules

- Never commit private keys, seed phrases, RPC credentials, API secrets, or access tokens.
- Use isolated testnet wallets for development and demos.
- Never use production funds during development or testing.
- AI output must not directly authorize a financial transaction.
- `REVIEW` and `BLOCK` states must fail closed at the execution boundary.
- Monetary values must use exact representations rather than floating-point arithmetic.
- Audit records must preserve enough evidence to reconstruct why a transaction was allowed, reviewed, or blocked.

## Dependency and deployment hygiene

- Keep dependencies pinned or lockfile-controlled.
- Run typecheck and tests before merging meaningful changes.
- Treat deployment credentials as external secrets, never repository content.
- Keep demo data synthetic until approved production-data controls exist.
