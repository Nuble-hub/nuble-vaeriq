# Public Release Readiness — VAERIQ

## Current status

Repository remains **private** while the release gate is being completed. M04 is finalized and merged to `main`; the public snapshot review is complete, and the remaining work is final exact-commit verification plus the visibility decision.

## Audit updated on 2026-09-29

| Check | Result | Notes |
|---|---|---|
| Repository visibility | Private | Visibility change remains a final manual gate |
| Default branch | `main` | Public release target |
| M04 engineering state | Finalized | Engineering evidence consolidated; market validation constrained |
| Unexpected environment files in tracked tree | None observed | Prior recursive tracked-tree check found no `.env` / `.env.*` files |
| Secret-oriented files/directories | None observed | `.gitignore` excludes common environment/key/seed patterns |
| RPC/API credentials in tracked source | None found in prior source scan | Runtime credentials remain environment-provided |
| Private keys / seed files in tracked tree | None observed | `.gitignore` excludes `.pem`, `.key`, `.seed` |
| Customer validation records | Clean | No qualifying operator interview records were added |
| Production financial exports | None observed | Local export/artifact patterns are ignored |
| License | Ready | MIT License present in `LICENSE` |
| Security policy | Ready | Public vulnerability-reporting language updated |
| Contributing guide | Ready | Public contribution workflow and safety rules updated |
| README public positioning | Ready | Prototype status, evidence limits, license, and demo command updated |
| M04 finalization record | Ready | `docs/M04_FINALIZATION_DECISION.md` |
| M04 final evidence | Ready | Engineering evidence + validation boundary consolidated |
| Demo command cleanup | Resolved | `npm run demo` now starts the Vite web dev server |
| Release-gate CI | Added | `.github/workflows/release-gate.yml` runs typecheck, tests, web build, and an obvious-credential history scan |
| Final exact-release verification | Open | Code/tests/build were verified on commit `8edb2e7`; the final `main` snapshot needs one last exact-commit verification after the release-only documentation commit |
| Full credential-history review | Pass (scoped) | Local history scans found no credential files or actual key/token values; regex literals in the scanner are expected. Automated scan remains additional protection, not a full secret-forensics guarantee |
| Final branch history | Preserve | Keep M02/M03/M04 feature branches as historical development records so judges can inspect milestone implementation history and evidence paths |
| Repository visibility | Open | Change Private → Public only after exact-commit verification and the final manual GitHub visibility action |

## Public-release gates

- [x] Add an explicit open-source license.
- [x] Verify the current tracked tree has no obvious environment/secret files.
- [x] Preserve customer-data prohibition in validation materials.
- [x] Consolidate M04 engineering evidence.
- [x] Explicitly record the constrained operator-validation outcome.
- [x] Resolve the broken `npm run demo` entry point.
- [x] Update README for a public audience.
- [x] Update SECURITY.md for public vulnerability reporting.
- [x] Update CONTRIBUTING.md for public contribution workflow.
- [x] Review public-facing claims against `docs/SUBMISSION_CLAIMS_LEDGER.md`.
- [x] Add an automated release-gate workflow.
- [ ] Run final typecheck/tests/web build on the exact release commit.
- [x] Complete the scoped credential-history review; retain automated scan as defense-in-depth.
- [x] Merge the release candidate to `main` (merge commit `e38c0063f5e6fe3052c4f47071c28e8b5ce660f4`).
- [x] Decide historical branch policy: preserve the M02/M03/M04 feature branches for auditability and judge inspection.
- [ ] Change repository visibility to Public.

## Final public snapshot review — 2026-09-29

Reviewed the public-facing snapshot on `main` for stale private-development messaging, milestone-status consistency, demo-command consistency, license references, and claim boundaries. No release-blocking wording inconsistency was found. Historical validation warnings remain intentionally visible because they are part of the evidence boundary.

The only remaining gate is to run the code/test/web-build checks once more on the final `main` snapshot and then perform the manual Private → Public visibility change.

## Public-release principle

The public repository should present a verifiable implementation and evidence trail. It should not imply customer traction, production SLAs, production custody, lossless production streaming, or universal infrastructure performance unless those claims are supported.

## Known limitations to preserve

- Browser-local audit persistence is demo-grade, not durable server-side treasury storage.
- The Solana application path is Devnet for the demo.
- M04 RPC comparison is Mainnet-to-Mainnet because the provisioned RPC Fast Focus endpoint is Mainnet-only.
- WebSocket observation is an observation signal; confirmation, `getTransaction`, and reconciliation remain authoritative.
- Operator validation remains constrained because the qualifying 5–10 interview target was not reached.
- The repository's automated credential check scans for obvious credential patterns; it is not a substitute for human review of unusual sensitive material.
