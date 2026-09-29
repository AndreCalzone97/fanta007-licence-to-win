---
name: fanta-research
description: Use when comparing external libraries, providers, UI references, or architectural options for a FANTA007 decision; not when implementation is already specified.
---

# FANTA007 research

Frame the decision and acceptance criteria first: compatibility with the current React/Vite + FastAPI stack, licensing, free-tier limits, maintenance, performance, accessibility, and data provenance as applicable.

- Check current primary sources and dates for claims that can change. Use Context7 for library docs and the official MCP Registry for MCP discovery; a registry listing is not proof that a tool is installed or callable.
- Distinguish `verified`, `inferred`, and `unverified`. Compare only candidates that address the same job; avoid tool accumulation and duplicate integrations.
- Recommend KEEP / ADAPT / DEFER / SKIP with one reason each. Include cost, auth, and data-rights caveats before recommending a provider.
- Do not install, modify application files, contact vendors, or launch paid services unless the PM asks. Hand off a small decision and the next reversible test.

For production sports data, pair this with `fanta-data-api` only when integration is in scope.
