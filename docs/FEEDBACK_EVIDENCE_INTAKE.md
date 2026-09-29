# VAERIQ Feedback Evidence Intake

Milestone: M05 — Public Productization & Validation
Status: Active
Purpose: Turn public-beta feedback into traceable evidence without overstating product validation.

## Operating principle

VAERIQ now has two public feedback paths: general product/workflow research and structured technical issues. These sources answer different questions and must stay separate.

A submission is evidence to review, not automatically a customer, design partner, traction signal, or product-market-fit signal.

## Intake flow

Public response or GitHub issue
→ preserve source
→ remove sensitive data
→ relevance check
→ evidence classification
→ workflow/problem mapping
→ counterevidence check
→ next action
→ claims ledger update only when evidence qualifies

## Evidence sources

| Source | Primary use | Evidence class |
|---|---|---|
| Public research form | Workflow, controls, pain, objections, fit | External validation |
| Live operator conversation | Concrete workflow and incident discovery | External validation |
| GitHub technical issue | Reproducible implementation failure | Engineering evidence |
| Direct message / community reply | Routing or discovery | Lead until qualified |
| Demo observation | Product usability or runtime behavior | Engineering / UX evidence |
| Third-party research | Domain context | Domain evidence only |

Do not combine counts across these classes.

## Intake record

Create one record in docs/FEEDBACK_EVIDENCE_LOG.md for each reviewed item.

Required fields:

- Record ID: FB-YYYYMMDD-###
- Source and source reference
- Received date
- Role relevance: High / Medium / Low / Unknown
- Workflow relevance: High / Medium / Low / Unknown
- Evidence strength: Observed / Reported / Inferred
- Evidence class: Problem / Workflow / Control Gap / Objection / Technical Bug / UX / Other
- Original finding
- Concrete incident, when available
- Current controls
- Unresolved friction
- Business impact, stated only
- VAERIQ mapping
- Counterevidence
- Next action
- Qualification status
- Public-claim eligibility
- Notes

## Relevance

High role relevance means the person directly operates or approves treasury, finance, payment, or stablecoin workflows.

Medium means the person builds, oversees, or maintains systems closely supporting those workflows.

Low means general crypto use or unrelated work. Unknown means there is not enough information; do not infer.

High workflow relevance means the response contains an actual payment flow, control, incident, or reconciliation process.

## Evidence strength

Observed = supported by an artifact, trace, reproducible behavior, or directly witnessed process.

Reported = the respondent states that a workflow, problem, or control exists.

Inferred = a project-team interpretation.

Keep reported and inferred findings separate. Never convert an inference into an observed fact.

## Problem taxonomy

- Wrong recipient or destination
- Wrong amount or asset
- Missing invoice or supporting evidence
- Budget or policy violation
- Unusual payment behavior
- Requester authority ambiguity
- Duplicate payment
- Failed or uncertain execution
- Reconciliation mismatch or delay
- Manual approval burden
- Manual evidence gathering
- Agent-initiated payment controls
- Other or no clear match

Do not force a response into a category when the workflow does not support it.

## Existing-control rule

Always record what already works: multisig, wallet allowlist, role-based approval, spending limits, simulation, transaction policy, accounting or ERP controls, monitoring, reconciliation, or other controls.

The product question is what remains unresolved after existing controls, not whether the respondent likes VAERIQ.

## Technical feedback handling

GitHub technical issues are engineering evidence first. Capture area, impact, environment, network, scenario, actual behavior, expected behavior, reproduction steps, error details, confirmation status, fix or disposition, and related commit or PR when applicable.

A technical issue may contain workflow observations from a relevant operator. Preserve those observations as a separate validation record rather than treating the bug report itself as customer validation.

## Qualification ladder

Problem evidence → Workflow fit → Interest → Design-partner candidate → Concrete workflow commitment

Problem evidence = a real problem or failure described from experience.

Workflow fit = the documented workflow contains a meaningful point where the VAERIQ model maps.

Interest = the person explicitly requests follow-up, a demo, or deeper discussion.

Design-partner candidate = an organization discusses testing a concrete workflow.

Concrete workflow commitment = a defined non-production test, pilot, or integration experiment is agreed.

Do not jump levels because the respondent is enthusiastic.

## Counterevidence

Every review should ask what would make the evidence point in the opposite direction.

Examples include existing controls already solving the problem, the issue occurring only after execution, low frequency or low cost, added process burden, no meaningful VAERIQ decision point, or insufficient operational relevance.

Record negative evidence explicitly.

## Privacy

Do not store private keys, seed phrases, wallet credentials, transaction secrets, sensitive customer data, confidential company financial records, or unnecessary personal contact information.

Raw contact details and form exports should remain in the form platform or another controlled private location, not in this public repository.

Never paste confidential responses into a public GitHub issue.

## Public-claim gate

A finding is eligible for public claims only when the source is traceable, evidence strength is recorded, workflow context is preserved, counterevidence is considered, and the wording does not exceed the evidence.

Use bounded wording such as: An operator reported... / In a tested workflow... / We observed... / We are validating...

Do not use customers need..., validated demand..., PMF..., or production adoption... unless the evidence truly supports the statement and the claims ledger is updated.

## Review cadence

Review new items at least once per batch. For each batch: review relevance, add qualified records, identify recurring patterns, record counterexamples, decide whether a product change is justified, and update the claims ledger only when evidence crosses the relevant threshold.

Do not change product architecture because of a single generic suggestion.

## Operational readiness

The feedback loop is operational when every reviewed response has an intake record, technical issues use the structured GitHub form, research and engineering evidence remain separate, recurring patterns can be traced to source records, and unsupported market claims remain explicitly open.