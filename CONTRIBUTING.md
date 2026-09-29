# Contributing to VAERIQ

VAERIQ is an open-source hackathon project led by NUBLE. Contributions should keep the control layer auditable, deterministic, and safe around financial execution.

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

Keep `main` in a demonstrable, buildable state.

## Pull requests

For non-trivial changes:

1. Explain the problem and the intended behavior.
2. Include tests or runtime evidence for behavior changes.
3. Call out security or execution-boundary implications.
4. Keep public claims aligned with repository evidence.

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

Before merging meaningful changes, run the project's typecheck, tests, and web build commands defined in `package.json`.

## Documentation

Record important architectural or scope decisions in `docs/` and material development milestones in `DEVELOPMENT_HISTORY.md`.

## Scope discipline

Avoid adding new chains, production custody, ERP replacement, autonomous AI authorization, or provider lock-in without a separately documented product decision.
