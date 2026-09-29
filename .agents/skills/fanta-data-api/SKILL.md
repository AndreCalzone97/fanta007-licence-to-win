---
name: fanta-data-api
description: Use when integrating, validating, or replacing a sports-data provider or FANTA007 API boundary; not for purely visual dashboard work.
---

# FANTA007 data/API

Data first: a provider supplies facts; UI and any future AI consume typed, sourced, dated facts. Do not invent live results, scrape without authorization, or silently label mocks as live.

1. Identify the provider's current official contract, terms, coverage, quotas, auth, and update cadence. Keep credentials server-side and out of git; stop if required credentials or paid service lack approval.
2. Preserve a replaceable adapter boundary and explicit states for loading, stale/cache, no data, rate limit, and failure. Separate fixture/test data from production data.
3. Validate incoming schemas and timestamps, including season/matchday and timezone. Never change fantasy scoring or datasets as a side effect.
4. Test provider mapping and fallback with deterministic fixtures. Use existing FastAPI/OpenAPI tests; consider Schemathesis for an authorized endpoint-contract pass, not as a routine dependency.
5. Report what is genuinely live, what is cached or mock, and how to activate the provider safely.

Choose only the browser, docs, and API test tools needed by this integration.
