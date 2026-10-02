# VAERIQ × Elfa — External Intelligence POC

**Status:** Experimental POC — not part of the public demo
**Provider:** Elfa API v2
**Primary experiment:** Counterparty / account social-mention enrichment
**Boundary:** External signals are evidence only; they cannot authorize execution.

## Goal

Test whether external intelligence can enrich a VAERIQ PaymentIntent without becoming a decision-maker.

```text
PaymentIntent
    ↓
External identity
    ↓
Elfa
    ↓
ExternalSignal[]
    ↓
Context / Evidence
    ↓
Deterministic Policy / Risk
    ↓
APPROVE / REVIEW / BLOCK
    ↓
Execution Guard
```

## Current provider contract

VAERIQ introduces a provider-neutral ExternalIntelligenceProvider interface. The first implementation is ElfaExternalIntelligenceProvider.

The adapter currently uses Elfa V2 keyword-mentions with either accountName or up to five keywords. The V2 response provides mention metadata, timestamps, engagement metrics, limited author fields, and source links. It does not return raw post text.

## Why mentions first

Mentions are a low-complexity input for testing whether public external activity adds useful context around a payment counterparty. The POC does not convert mention volume or engagement into an automatic risk score.

The adapter normalizes provider output into ExternalSignal records so downstream code can treat Elfa data as external evidence rather than provider-specific objects.

## Run locally

```bash
export ELFA_API_KEY="..."
npm run poc:elfa -- --account elfa_ai
```

Or:

```bash
export ELFA_API_KEY="..."
npm run poc:elfa -- --keywords solana,treasury --time-window 7d --limit 10
```

The API key is read only from the process environment. Do not commit it, print it, or add it to browser code.

## Initial experiment

Run two observations:

### A — Known entity

Use a known public account or entity identity. Record the returned mention count, engagement metrics, timestamps, source links, and verified-author metadata where available.

### B — Comparison entity

Use a second relevant identity or keyword set with materially different context.

Do not label either entity as risky solely from Elfa output. The research question is whether the signal improves the context available to a reviewer.

## Safety boundary

The POC intentionally does not modify the public web demo or execution guard.

Out of scope:
- direct APPROVE / REVIEW / BLOCK decisions from Elfa output;
- automatic execution;
- Auto monitoring;
- x402 payment flows;
- LLM-generated risk scores;
- treating social activity as proof of fraud or legitimacy.

External social data is treated as untrusted input. Elfa can supply evidence and source links; VAERIQ retains decision authority.

## Definition of done

- [x] Provider-neutral external-intelligence contract
- [x] Elfa V2 keyword-mentions adapter
- [x] Response normalization
- [x] Offline regression tests without network calls
- [x] Local POC CLI with environment-only API key handling
- [ ] Real Elfa request completed
- [ ] Evidence recorded for known/comparison entities
- [ ] Decision impact evaluated experimentally
- [ ] Go / no-go decision for future VAERIQ integration

## Current conclusion

This POC is an experiment in external context enrichment, not a new VAERIQ decision engine. Real Elfa query evidence must be reviewed before any future integration into the product context layer.