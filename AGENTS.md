# FANTA007 working rules

- Baseline: v0.5.0. The approved UI/UX is locked; change only the surface and behavior the PM requests. Preserve existing data, scoring, API, and persistence unless explicitly in scope.
- Prefer 2–6 relevant tools per mission. Use existing Codex skills/plugins and repo-local skills in `.agents/skills/`; never activate every tool as a checklist.
- Route by intent: new capability → `fanta-feature`; regression → `fanta-bug`; release/deploy → `fanta-release`; comparison/research → `fanta-research`; provider/API → `fanta-data-api`; visual/responsive/accessibility QA → `fanta-ui-qa`; requested audit/finding → `fanta-security`. Add `fanta-handoff` for substantial deliverables.
- Use the project-specific skill plus its relevant general skill when appropriate. Tool availability and overlap are recorded in `docs/devkit/TOOL_REGISTRY.md`.
- Stop for a consequential architecture/product choice, required credential or paid service, material repo conflict, or irreversible operation. Ask the PM with concise options; do not pause for trivial reversible choices.
- Commit, push, merge, release, deployment, domain changes, and production settings changes need explicit authorization. A successful local build is not authorization or evidence of publication.
- Keep tools outside application runtime manifests unless the feature requires a reviewed dependency. Do not add secrets, silently scrape data, or present mocks as live.
- Main checks: `cd frontend; npm.cmd test; npm.cmd run build`; backend: `.venv\Scripts\python.exe -m pytest backend/tests -q -rs` from repo root with the needed `PYTHONPATH`. Use focused checks when only docs change; report what actually ran.
- End substantial tasks with a self-contained `CHATGPT HANDOFF` (8 lines by default, up to 10 when requested): done, changes, incomplete, tests, problems, next step, PM decisions, and only useful public links.
