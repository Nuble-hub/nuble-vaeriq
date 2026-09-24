# M04 Operator Response Intake & Analysis

## Purpose

This document defines the handling process for written operator responses collected through the M04 validation form.

The written response is the primary research record. Live calls, demos, and follow-up messages are supplementary.

## Intake rule

1. Preserve the original wording.
2. Record the respondent's relevant role and workflow scope.
3. Separate facts stated by the respondent from project interpretation.
4. Do not infer missing facts.
5. Ask a written clarification question when an important point is ambiguous.
6. Only after the original response is preserved, map evidence to the VAERIQ model.

## Response record

### Response ID

RESP-__

### Received date

YYYY-MM-DD

### Relevance

**Role:**  
**Workflow scope:**  
**Direct involvement:** High / Medium / Low

### Raw response

Paste the respondent's original written answers here.

### Evidence extraction

| Evidence | Source wording | Classification | Confidence |
|---|---|---|---|
|  |  | Observed / Reported / Inferred | High / Medium / Low |

### Current workflow

```text
Request
  ↓
Context / evidence
  ↓
Review
  ↓
Approval
  ↓
Signing
  ↓
Execution
  ↓
Reconciliation
```

Replace each stage with the respondent's actual workflow. Use "Not stated" where the response does not provide enough information.

### Concrete failure / friction

**What happened:**  
**Cause:**  
**Earliest detection point:**  
**Control that caught it, if any:**  
**What happened afterward:**  
**Operational impact:**  

If the respondent gives no concrete incident, record that explicitly.

### Existing controls

- Wallet / multisig:
- Allowlist:
- Approval roles:
- Spending limits:
- Policy engine:
- Simulation:
- Manual review:
- Accounting / ERP:
- Monitoring:
- Reconciliation:

### Potential VAERIQ mapping

| Respondent evidence | Potential mapping | Match | Notes |
|---|---|---|---|
|  | Intent | Clear / Partial / No clear match |  |
|  | Context | Clear / Partial / No clear match |  |
|  | Evidence | Clear / Partial / No clear match |  |
|  | Policy | Clear / Partial / No clear match |  |
|  | Risk | Clear / Partial / No clear match |  |
|  | Decision | Clear / Partial / No clear match |  |
|  | Reconciliation | Clear / Partial / No clear match |  |

Do not force a match. "No clear match" is a valid result.

### Product signal

**Strongest recurring pain:**  
**Strongest existing control:**  
**Clearest unresolved friction:**  
**Strongest objection:**  
**Integration requirement:**  

### Next step

- None
- Written follow-up
- Research conversation
- Demo
- Specific workflow discussion
- Concrete test
- Pilot / integration discussion

### Evidence boundary

**Observed:**  
**Reported:**  
**Inferred:**  

### Decision for next contact

State exactly what we need to learn next.

## Cross-response synthesis rule

Do not update the consolidated M04 findings from a single response unless it is clearly a product-critical fact or a falsifying signal. Prefer recurring patterns across multiple relevant respondents.

When a pattern begins to appear, record:
- Number of relevant respondents showing it
- Exact workflow evidence supporting it
- Existing controls already solving part of it
- Remaining gap or friction
- Counterexamples
- Confidence level

## Public-claim rule

Before publishing any validation claim, verify:
- number of relevant respondents
- evidence source
- whether the signal is reported or independently demonstrated
- whether it represents recurring workflow evidence or a single anecdote
- whether any next step is merely interest or a concrete commitment

Never convert form submissions, positive comments, or demo requests into customer, traction, or product-market-fit claims by themselves.