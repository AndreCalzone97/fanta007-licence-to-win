---
name: fanta-security
description: Use for an explicitly requested FANTA007 security review, secret scan, hardening proposal, or validated finding; not for routine UI work.
---

# FANTA007 security

Match the requested scope: standard audit, patch/diff review, threat model, or verification of a named fix. Use the corresponding Codex Security skill rather than improvising a parallel audit framework.

- Establish the commit/paths and whether the task is read-only. A review does not authorize changing code, rotating keys, or modifying remote settings.
- Prefer evidence-backed findings with impact and reproduction. Redact any credential; never paste raw secret values into logs, tickets, or the handoff.
- Use Gitleaks for a scoped local secret check when useful; a clean scan is not a proof of overall security. Do not run noisy network scans or install broad scanners as a default.
- Separate actionable findings from assumptions and pre-existing risk. Ask before a change that touches production architecture, credentials, or policy.
- If fixes are authorized, verify with a focused test and any relevant security recheck; report unresolved exposure plainly.

Keep the locked product UI and release boundaries intact.
