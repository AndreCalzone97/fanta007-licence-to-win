---
name: fanta-feature
description: Use when implementing an authorized new FANTA007 capability; not for bug fixes, UI verification, or speculative roadmap work.
---

# FANTA007 feature

Confirm the requested outcome, current baseline, affected surfaces, and acceptance checks. Keep the v0.5.0 locked UI intact except where the PM explicitly approves a change.

- Trace the existing data flow before implementation. Keep provider, API, state/persistence, and UI responsibilities separate; do not make an LLM the source of factual football data.
- For a material architecture or product choice, present 2–4 short options to the PM; do not block on reversible details. Never infer permission for auth, live services, new paid dependencies, or production deploy from a feature request.
- Implement only the requested slice, with a failing test first where practical. Select a few relevant tools (e.g. Serena for symbol navigation, Context7 for changing libraries, browser QA for affected flows); do not run a full tool checklist.
- Check affected tests, build, responsive/accessibility where UI changes, and actual behavior. Report the evidence and remaining limits in `CHATGPT HANDOFF`.

Avoid adding runtime dependencies or changing scoring, datasets, routing, or locked pages without an explicit task need.
