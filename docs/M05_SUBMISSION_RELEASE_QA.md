# VAERIQ — Colosseum Pre-Submission QA Runbook

**Date:** 2026-10-08  
**Status:** Working checklist; browser/wallet verification pending  
**Scope:** Public Solana Devnet demo, PR #23, submission readiness  
**Target:** Merge only after the exact PR head passes CI and manual scenario checks.

## 1. Source and safety boundaries

- Work on branch `fix/demo-trusted-policy-fixtures`, not the public `main` deployment, until PR #23 is reviewed and merged.
- Treat `INV-001` and `vendor_demo` as **synthetic demo fixtures**, not verified external business documents.
- The allowlist is fixed: the demo recipient must not become approved solely because a user typed it.
- Signing remains controlled by the connected wallet. The client-side demo guard **does not prevent direct transfers outside VAERIQ**.
- Never use mainnet assets, production seed phrases, confidential data, or real customer invoices.
- Solana Devnet approved-transfer QA needs a separate test wallet with Devnet SOL for network fees and enough Devnet USDC for the intended amount. Do not execute a real Devnet transfer unless deliberate and funded.
- Wallet type, browser, date, commit and relevant observations must be recorded with the test outcome.

## 2. Automated release gate

Confirm the PR head passes the GitHub `Release Gate` workflow:

- `npm run check` (typecheck, build, existing tests, fixed-fixture tests, HTML escaping test).
- `npm run web:build` and `npm run web:build:pages`.
- The existing scoped credential-history check.
- Do not assume passing automation replaces live browser or wallet verification.

## 3. Browser QA matrix

Run from a clean profile or fresh browser state with a Solana Devnet-compatible wallet. For local branch testing run `npm install` then `npm run demo` from this branch. The public GitHub Pages URL remains the previous `main` build until merge/deploy.

| Case | Action | Expected outcome |
|---|---|---|
| Q01 | Open Guided Demo and connect Devnet wallet | UI loads, wallet connects, no boot error |
| Q02 | Compliant · APPROVE: fixed demo destination, 12 USDC, `INV-001`; Evaluate | APPROVE; context COMPLETE; Execute enabled |
| Q03 | Switch back to compliant, replace recipient with `11111111111111111111111111111111`; Evaluate | BLOCK; destination not known; Execute disabled |
| Q04 | Compliant destination and amount; change invoice to `INV-FAKE`; Evaluate | REVIEW due to missing evidence; Execute disabled |
| Q05 | Adversarial · BLOCK: 8500 USDC and blank invoice; Evaluate | BLOCK; clear reasons, no Execute |
| Q06 | Recovery · UNKNOWN; Evaluate, then simulate uncertainty | `UNKNOWN_AFTER_SUBMISSION`; no real transfer in this demo scenario; retry blocked |
| Q07 | Compliant payment; click Execute then reject wallet prompt | Known pre-submission cancellation; no transaction signature; safe retry option. Requires adequate test-wallet funds to reach signing |
| Q08 | Compliant payment; approve wallet transaction on Devnet | Transaction signature, confirmed result and `MATCHED` reconciliation. Requires test-wallet Devnet SOL and 12 Devnet USDC |
| Q09 | Reload after relevant evaluation or execution | Browser-local audit/attempt evidence restored according to demo semantics |
| Q10 | Set invoice input to a harmless string containing HTML syntax (e.g. `<b>sample</b>`); Evaluate | Markup appears as literal text; no unexpected new HTML element or code execution |
| Q11 | Open Feedback center, then technical issue link | Both destinations work and no credentials are requested |
| Q12 | Open the deployed GitHub Pages demo after merge | Deployed app matches approved commit and avoids blank / stale asset paths |
| Q13 | Evaluate APPROVE, then edit recipient/amount/invoice without re-evaluating | Previous approval becomes stale; Execute disabled; UI asks to re-evaluate |

For Q07/Q08, confirm the wallet prompt shows the intended Devnet recipient, mint and transfer amount before signing. **Do not sign** if the wallet shows unexpected information.

## 4. Recording prerequisites

Only record the final Colosseum Demo Video after Q02, Q03, Q04, Q05, Q08 and Q13 succeed on the intended recording environment.

Suggested video story: one adverse BLOCK, one missing-evidence REVIEW (brief), one compliant APPROVE with signed Devnet execution and reconciliation. Recovery is optional only if it does not obscure the control story. Avoid saying that the public demo enforces wallet activity outside VAERIQ.

- Demo video: maximum 3 minutes; live product and real interaction, no code or slides.
- Pitch video: maximum 2 minutes; founder/problem/solution/why-now/proven scope/market hypothesis.
- Check the video's public/unlisted viewing permissions, audio, duration, and access instructions in a logged-out browser.
- Make clear that approved-transfer evidence uses Solana **Devnet** and that demo evidence is synthetic.

## 5. Evidence capture and release decision

Record: tester, UTC/local test date, browser version, wallet name/network, source commit, Q01–Q13 PASS/FAIL/SKIPPED, relevant Devnet signature where safe to disclose, screen capture for BLOCK/REVIEW/APPROVE/MATCHED, and any blockers.

Before merging:
1. PR head Release Gate is green.
2. No known regression remains in Q02–Q05 or Q13.
3. Approved execution is verified in at least one genuine Devnet wallet session, **or** this gap is explicitly disclosed and no new live-execution claim is made.
4. No sensitive artifacts were added to Git.
5. Founder reviews PR, merge, and deployed site.

If QA fails, keep PR as draft. Fix the specific failure with a new commit and rerun the gate.

## 6. Not established by these checks

- Production-grade security or immutable audit storage.
- Enforced organizational authority across all wallet execution paths.
- Production mainnet funds or custody operation.
- Provider/network-level idempotency.
- Customer adoption, willingness to pay, or product-market fit.

These require separate post-hackathon milestones and independent evidence.
