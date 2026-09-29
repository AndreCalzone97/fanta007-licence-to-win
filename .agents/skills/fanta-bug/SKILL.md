---
name: fanta-bug
description: Use when diagnosing or fixing a reproducible FANTA007 regression or failing test; not for feature design or visual redesign.
---

# FANTA007 bug

Establish the observed failure and expected behavior on the approved baseline. If the PM asked only for a diagnosis, stop at evidence and a proposed fix.

1. Reproduce narrowly and identify the responsible component, state transition, API boundary, or asset. Use browser/console and Serena symbol navigation only when relevant.
2. Add or identify a test that fails for the defect before changing code when practical. Distinguish a new regression from pre-existing test failure.
3. Make the smallest correction. Preserve fantasy calculations, local data, the locked UI, and unrelated sections.
4. Verify the reproducer, neighboring interaction, affected tests and build. For a visual bug, compare desktop/mobile and reduced-motion when relevant.
5. Report root cause, changed files, verified result, and residual risk; never claim a bug fixed from compilation alone.

Do not refactor opportunistically or open an unrelated product workstream.
