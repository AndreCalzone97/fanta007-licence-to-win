# FANTA007 DevKit workflows

Pick the primary repo skill from `AGENTS.md`, then only 1–5 secondary skills/tools that answer the specific question. A skill may be paired with the corresponding Superpowers/Codex Security skill; this is routing, not a background agent or automatic tool invocation. The 23 new personal skills and eight on-demand Domain Packs are listed in [SKILL_LIBRARY.md](SKILL_LIBRARY.md). Do not load a pack as a whole.

| Mission | Typical path | Stop condition |
| --- | --- | --- |
| Feature | `fanta-feature` → Superpowers planning/TDD/implementation → one stack skill (`vite-react` or `api-contract-design`) → focused tests/browser QA | Product/architecture choice, credential, cost, or locked UI expansion needs PM. |
| Bug | `fanta-bug` → Superpowers systematic debugging/TDD → one relevant stack skill (`vitest` for unit/component tests) → regression verification | `analyze` is for read-only explanation; diagnosis-only requests end before edits. |
| UI QA | `fanta-ui-qa` → `a11y` or `visual-regression` or `testing-playwright` as appropriate → one browser tool → affected tests/build | Do not redesign the locked baseline or confuse screenshots with interaction tests. |
| Data/API | `fanta-data-api` → `api-contract-design` → `backend-test-plan` or a focused schema/auth/error skill → deterministic API tests | No unsourced data, unauthorized scraping, or hidden live/mock swap. |
| Research | `fanta-research` → current primary sources/Context7/Firecrawl when available → compare cost, rights, fit → cite and synthesize | No install or external write unless requested; prefer official source evidence. |
| Security | `fanta-security` → appropriate Codex Security workflow → scoped Gitleaks check if useful → validated findings | Read-only audit does not authorize remediation. |
| Release | `fanta-release` → `production-readiness-review` and `deployment-plan`/`rollback-plan` only if relevant → authorized push/deploy → production smoke | Never infer publication authority from readiness. |

Outside FANTA007: a React bug routes to systematic debugging plus `vite-react`/`testing-playwright`; a FastAPI feature to planning plus `api-contract-design`/`backend-test-plan`; AI evaluation to OpenAI/Vercel guidance plus `prompt-regression-testing`; ML work to Hugging Face plus `metric-definition` when KPI definitions matter; game work to the cataloged game-dev pack only after selecting engine/asset/QA specialists; technical writing to `concise-technical-writing`. Use `acceptance-criteria-mapper` for a genuinely ambiguous definition of done and `decision-memo` for a decision with competing options.

Add `fanta-handoff` at the end of a substantial mission. The handoff is 8 lines by default, 10 only when the PM asks, and must be understandable without earlier chat context.

Phase 2 routing smoke cases and negative boundaries live in `SKILL_LIBRARY.md`. In the subsequent Codex session, all 23 global and eight local skills appeared in the skill catalog. See [PHASE3_TOOLING.md](PHASE3_TOOLING.md) for observed MCP/CLI state, activation levels and future MCP candidates.

## Phase 3 tool routing

Keep the FANTA007 skill primary; choose 1–5 secondary skills/tools, 2–6 relevant tools total. Registered MCP are not instructions to invoke them on every task.

| Mission | Tool path after selecting the primary skill | Boundary |
| --- | --- | --- |
| Bug | Debugging → Serena for cross-file symbols → focused test → Playwright only for UI | A visual bug adds `fanta-ui-qa`; one browser surface is enough. |
| API feature | `fanta-feature`; add `fanta-data-api` for provider/boundary work → backend tests → Schemathesis when OpenAPI contract matters | Run generated requests only against local/controlled data. |
| Security | `fanta-security`/Codex Security → Gitleaks → Trivy only for scoped dependency/config/container risk | Classify findings before allowlists; redact secrets. |
| Release | Relevant tests → Gitleaks → optional Trivy → browser smoke | Readiness is not authorization for commit, push or deploy. |
| Performance | Profile first → k6 for a defined latency/concurrency question | Never load-test production without explicit scope. |
| AI feature | Relevant AI skill → Promptfoo for reproducible evals → security → Langfuse only when traces are needed | No provider key or AI runtime dependency in v0.5.0. |
| Automation | n8n only when an external event/workflow integration has a concrete owner and trigger | No persistent service or channel credentials by default. |

## Local checks

From `frontend/`: `npm.cmd test` and `npm.cmd run build`. From repository root: set `PYTHONPATH` to `.;backend` in the current PowerShell process, then run `.venv\Scripts\python.exe -m pytest backend/tests -q -rs`. These are the existing project checks; use a focused subset during iteration and the full set at a release/freeze boundary. Do not lower Windows ExecutionPolicy to make a wrapper work—use `.cmd`.

For MCP diagnosis, `codex mcp list` reports registration; a direct tool call or Inspector `tools/list` proves a server responds. Serena's registered command is `serena start-mcp-server --context=codex --project-from-cwd`. Playwright MCP uses direct `node.exe` with its user-level `cli.js`; its configured Chromium headless shell was restored in Phase 3, and a direct `browser_navigate` to `about:blank` passed. Serena and Playwright are callable in this session. Newly registered MCP tools may still need a new Codex session to appear.

For large context handoff, run Repomix on demand with inclusion/exclusion chosen for the task; inspect the generated package for secrets before sharing it. Never export `.env`, local caches, media, node_modules, build output, or private datasets merely to provide context.

## Verification wording

Use `verified` only with a command or observed behavior and its result. Say `configured, not browser-smoke-tested` when MCP startup passed but no browser page was exercised. Say `available in catalog` for a plugin not yet called. Separate local tests, GitHub Actions, and public deployment—none proves the others.
