# M05 — Public Productization & Validation

**Status:** In progress  
**Start date:** 2026-09-29  
**Base:** Public `main` snapshot `c152dc0`

## Goal

Move VAERIQ from a publicly visible engineering prototype to a reproducible public product surface with a working demo entry point and evidence-driven external validation.

M05 is intentionally a productization and validation milestone. It does not authorize broad feature expansion.

## Current product boundary

```text
Payment Intent
   ↓
Context / Evidence
   ↓
Policy / Risk
   ↓
APPROVE / REVIEW / BLOCK
   ↓
Execution Guard
   ↓
On-chain execution
   ↓
Confirmation
   ↓
Reconciliation
   ↓
Audit
```

AI remains advisory/explanatory. Financial enforcement remains deterministic and policy-driven.

## Workstreams

### M05.1 — Public surface audit

Acceptance criteria:

- README describes the repository as public.
- Stale private-release messaging is removed from public-facing documentation.
- Demo limitations are explicit.
- Devnet execution and Mainnet benchmark evidence remain clearly separated.
- Customer-validation limitations remain explicit.
- Claims remain aligned with `docs/SUBMISSION_CLAIMS_LEDGER.md`.

**Status:** Complete on the M05 branch.

### M05.2 — Public demo deployment

Target: GitHub Pages project site.

Acceptance criteria:

- Vite build supports the GitHub Pages project base path.
- A deployment workflow builds the web app from `main`.
- The Pages artifact contains the Vite production build.
- The deployed URL is verified from an external browser.
- The README links the verified public demo URL.

**Status:** Deployment workflow prepared. Live URL verification remains open.

### M05.3 — Treasury / finance operator validation

Use the existing research protocol and written form before live calls.

Evidence progression:

1. Problem evidence
2. Workflow fit
3. Interest
4. Design-partner candidate
5. Concrete workflow commitment

Target remains:

- 5–10 relevant operator interviews
- recurring failure patterns documented
- 2–3 serious design-partner candidates where evidence supports them
- at least one concrete workflow commitment where possible

These are investigation targets, not guaranteed outcomes.

Public claim rule: do not promote research responses, positive comments, demos, or introductions into customers, traction, PMF, or production demand without qualifying evidence.

### M05.4 — Submission readiness

After the public demo and validation pass:

- consolidate current evidence
- refresh the claims ledger
- capture the final demo path
- prepare the Colosseum submission package
- keep unsupported claims explicitly marked open

## Out of scope for M05 unless new evidence requires it

- multi-chain production support
- production custody
- autonomous AI signing
- token/TGE work
- mobile application
- full ERP/accounting replacement
- production-grade streaming guarantees
- large dashboard rewrites
- provider-specific infrastructure coupling

## Evidence standard

Engineering evidence demonstrates what the prototype does.

External validation evidence demonstrates what real operators actually do, need, reject, or agree to test.

The two evidence classes must remain separate.

## Definition of done

M05 is complete when:

1. the public repo clearly communicates the product and its evidence boundaries;
2. a verified public demo URL is available;
3. operator validation evidence has been collected and logged, or the remaining gap is explicitly documented;
4. claims are updated without overstatement;
5. the final submission package is reproducible from the public repository.
