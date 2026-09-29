---
name: fanta-ui-qa
description: Use when verifying FANTA007 screens, responsive behavior, visual regressions, accessibility, or an approved UI polish; not as permission to redesign.
---

# FANTA007 UI QA

Compare against the approved v0.5.0 baseline and the exact task scope. A screenshot is evidence of one viewport/state, not a substitute for interaction checks.

- Verify the affected route at representative desktop and mobile widths; exercise keyboard focus, overlays/dock, loading/error/empty states, and `prefers-reduced-motion` where relevant.
- Use one browser automation surface that works (Playwright MCP or existing Codex browser). Check console/runtime errors and any visual asset crop or overflow. Use axe-core only for a targeted accessibility pass; interpret findings manually.
- Keep the locked composition, copy, palette, navigation, and business behavior unless the PM specifically requests a change. Preserve the original screenshot proportions when documenting the result.
- Run affected frontend tests and build after code changes. Report viewports and states actually checked, with limits; do not claim complete accessibility from one scanner.

Select 2–6 pertinent tools, not every available UI tool.
