---
name: fanta-release
description: Use when preparing, validating, publishing, or rolling back a FANTA007 version or deployment; not for ordinary local feature work.
---

# FANTA007 release

The approved v0.5.0 UI is the baseline. Inspect the current branch, working tree, release notes, CI, deployment configuration, and target environment before making release claims.

1. Separate **read-only readiness checks** from **mutations**. A request to verify readiness does not authorize commit, tag, push, merge, deploy, rollback, or domain changes. Require explicit authorization for each material external action.
2. Run the relevant frontend test/build and backend pytest checks. Use Codex Security or Gitleaks for scoped secret checks if risk warrants it; redact findings in output.
3. Confirm the exact commit and deployment URL from evidence. Never infer production equivalence from a local dev preview or an unverified CI badge.
4. If CI or deployment fails, identify the specific failure and propose the smallest fix. Do not bypass a gate, rotate credentials, or change production architecture as a workaround.
5. Report what is published, what is only prepared, and what remains blocked. Produce the compact `CHATGPT HANDOFF` requested by the PM.

Use Vercel/GitHub tools only for the authorized target. Keep release documentation under `docs/`; do not place DevKit tooling in the runtime dependency manifests.
