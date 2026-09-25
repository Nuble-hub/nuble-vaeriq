# Public Release Readiness — VAERIQ

## Current status

Repository remains private while M04 operator validation is in progress.
The purpose of this checklist is to prepare a clean public release without changing the product scope.

## Audit performed on 2026-09-25

| Check | Result | Notes |
|---|---|---|
| Repository visibility | Private | Keep private until release gate is complete |
| Default branch | main | Public release target |
| Unexpected environment files in tracked tree | None observed | Recursive branch tree contained no .env/.env.* files |
| Secret-oriented files/directories | None observed in tracked tree | .gitignore also excludes secret/environment patterns |
| RPC/API credentials | Not found in tracked source search | Runtime credentials are environment-provided |
| Private keys / seed files | Not found in tracked tree | .gitignore excludes .pem/.key/.seed |
| Customer validation records | Clean | Log contains only templates; no customer response data yet |
| Production financial exports | None observed | .gitignore excludes local exports/artifacts |
| License | Added | MIT License in LICENSE |
| Security policy | Requires public-release wording update | Current text refers to private development channel |
| Contributing guide | Requires public-release wording update | Current text refers to private development |
| README public positioning | Requires public-release wording update | Current README still describes private development |
| M04 engineering state | Evidence consolidated | Operator validation remains open |
| Demo runbook | Prepared | M04 final demo runbook exists |
| Claims boundary | Prepared | Submission claims ledger exists |
| Known demo cleanup | Open | npm run demo still references missing scripts/demo-server.mjs |

## Public-release gates

- [x] Add an explicit open-source license.
- [x] Verify tracked tree does not contain obvious environment/secret files.
- [x] Preserve customer-data prohibition in validation materials.
- [x] Consolidate M04 engineering evidence.
- [ ] Finish operator validation or explicitly record its final status.
- [ ] Resolve or document the known demo command cleanup.
- [ ] Update README for public audience.
- [ ] Update SECURITY.md for public vulnerability reporting.
- [ ] Update CONTRIBUTING.md for public contribution workflow.
- [ ] Review all public-facing claims against SUBMISSION_CLAIMS_LEDGER.md.
- [ ] Run final typecheck/tests/build on the exact release commit.
- [ ] Confirm no credentials are present in git history that should not be public.
- [ ] Decide final branch history to expose publicly.
- [ ] Change repository visibility to Public.

## Public-release principle

The public repository should present a verifiable implementation and evidence trail. It should not imply customer traction, production SLAs, production custody, or universal infrastructure performance unless those claims are supported.

## Known limitations to preserve

- Browser-local audit persistence is demo-grade, not durable server-side treasury storage.
- The Solana application path is Devnet for the demo.
- M04 RPC comparison is Mainnet-to-Mainnet because the provisioned RPC Fast Focus endpoint is Mainnet-only.
- WebSocket observation is an observation signal; confirmation, getTransaction, and reconciliation remain authoritative.
- Operator validation is an open evidence track until responses are collected and analyzed.