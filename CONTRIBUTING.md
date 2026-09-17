# Contributing to VAERIQ

VAERIQ is currently a founder-led, private development project. These conventions keep the codebase auditable and safe while it moves quickly during the hackathon.

## Change discipline

- Keep changes small and attributable to one intent.
- Prefer one logical change per commit.
- Do not mix refactors with behavior changes unless necessary.
- Update tests and documentation when behavior or contracts change.
- Never commit secrets, private keys, seed phrases, customer data, or production exports.

## Branching

Use short-lived branches for non-trivial changes:

```text
feature/<area>-<short-name>
fix/<area>-<short-name>
docs/<short-name>
```

The `main` branch should remain in a demonstrable state.

## Commit messages

Use concise conventional-style messages:

```text
feat: add payment intent evaluation
fix: prevent blocked intents from execution
refactor: isolate chain adapter boundary
docs: update development history
test: cover daily agent limit
```

## TypeScript conventions

- Prefer strict TypeScript.
- Keep domain logic deterministic and framework-independent.
- Use explicit result types for policy, risk, and decision outcomes.
- Use integer-safe / string-safe representations for monetary values.
- Do not use floating-point arithmetic for money movement.

## Decision and execution safety

The following invariants are non-negotiable:

1. `BLOCK` is never executable.
2. `REVIEW` is never executable without the required approval path.
3. AI output never directly authorizes a transfer.
4. Policy evaluation must be reproducible from recorded inputs and policy version.
5. Execution must create an auditable link between the approved intent and the on-chain transaction.

## Testing

At minimum, changes affecting decision logic should cover:

- normal approval
- review conditions
- policy violations
- risk signals
- execution boundary rejection
- audit linkage

Before merging meaningful changes, run the project's typecheck, tests, and build commands defined in `package.json`.

## Documentation

Record important architectural or scope decisions in `docs/` and material development milestones in `DEVELOPMENT_HISTORY.md`.
