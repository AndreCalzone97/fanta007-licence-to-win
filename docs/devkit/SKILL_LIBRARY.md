# Personal skill library — Phase 2 (2026-09-29)

The 23 `GLOBAL_INSTALLED` skills below live in the Codex user scope at `C:\Users\Andry\.codex\skills\<skill>` and are reusable outside FANTA007. Existing plugin skills are **not** included in that count. The eight `fanta-*` skills remain in `.agents/skills/`. Select one primary skill and at most 1–5 relevant secondary skills/tools for a mission; this document is a catalog, not an instruction to load all entries.

Sources are pinned to audited commits: [c47-dev/skills](https://github.com/c47-dev/skills/tree/6918150b50c5e99f97af737e011a3238ec6949e4) `6918150`, [Syo-M/codex-frontend-skills](https://github.com/Syo-M/codex-frontend-skills/tree/0c25f8e1c616da6242ca09a7f3613412521cef69) `0c25f8e`, [AgentSkills](https://github.com/jeremylongworth-source/AgentSkills/tree/45f314d2a3d3201dd5a0304a3a4f3a5f23a905a2) `45f314d`, and [PaulRBerg/agent-skills](https://github.com/PaulRBerg/agent-skills/tree/2d4f4a6e5d6988a8ebd8422821bb98449497e7b0) `2d4f4a6`. All four declare MIT licenses. The selected directories contain only Markdown/YAML: no executable scripts or symlinks were installed. File content was checked against those commits (ignoring Git line-ending conversion).

## GLOBAL_INSTALLED — 23 new user-scope skills

| Skill | Source | Purpose / precise trigger | Overlap boundary |
| --- | --- | --- | --- |
| `analyze` | c47 | Read-only, cross-file repository explanation | For diagnosis without edits; `systematic-debugging` owns fixes. |
| `vite-react` | Syo-M | Vite + React SPA architecture/configuration | Not Next.js or generic React review. |
| `a11y` | Syo-M | UI semantics, keyboard, focus and accessibility implementation | Complements visual `fanta-ui-qa`; not a security scan. |
| `images-media` | Syo-M | Images, SVG, font and video delivery/performance | Only when media is in scope. |
| `motion` | Syo-M | UI animation, reduced motion and transition behavior | Not general design or Figma motion. |
| `testing-playwright` | Syo-M | Browser E2E tests and flaky locator/assertion fixes | Playwright MCP is the tool, not this test-design guidance. |
| `vitest` | PaulRBerg | Vitest unit/component tests, mocks, fixtures and coverage | Respects existing repo test setup; complements TDD and Playwright. |
| `visual-regression` | Syo-M | Deterministic screenshot baseline/diff tests | Not a substitute for E2E behavior tests. |
| `api-contract-design` | AgentSkills | API endpoints, schemas, errors, versioning and compatibility | Before or beside `fanta-data-api`, not provider implementation. |
| `backend-test-plan` | AgentSkills | Backend/API/database/auth test matrix | `test-driven-development` still governs implementation tests. |
| `database-schema-review` | AgentSkills | Tables, indexes, constraints and migration risks | Review/design, not automatic migrations. |
| `auth-flow-design` | AgentSkills | Sessions, tokens, permissions and identity flow design | General backend scope; Vercel `auth` is provider-specific. |
| `rate-limit-design` | AgentSkills | API quotas, abuse controls and retry policy | No invented production traffic limits. |
| `error-handling-contracts` | AgentSkills | Client-safe backend/API error semantics | Pair with API contract only when errors are in scope. |
| `acceptance-criteria-mapper` | AgentSkills | Map broad requirements to observable pass/fail checks | Not a substitute for product decision ownership. |
| `ci-workflow-plan` | AgentSkills | CI jobs, permissions, artifacts and quality gates | Planning; do not mutate GitHub settings unasked. |
| `deployment-plan` | AgentSkills | Deployment runbook, rollout and smoke-check design | Vercel deployment skill handles Vercel-specific execution. |
| `rollback-plan` | AgentSkills | Reversal triggers, data recovery and validation | Planning does not authorize rollback. |
| `prompt-regression-testing` | AgentSkills | Repeatable AI/skill prompt regression cases | AI evaluations only when a model workflow exists. |
| `production-readiness-review` | AgentSkills | Evidence-backed go/no-go review | Does not authorize release or deploy. |
| `concise-technical-writing` | AgentSkills | README, PR, changelog and technical prose clarity | `fanta-handoff` owns the project-specific handoff shape. |
| `metric-definition` | AgentSkills | KPI formula, grain, source and caveats | No invented business metrics. |
| `decision-memo` | AgentSkills | Options, tradeoffs and decision record for PM/architecture | Human owns the final decision. |

## DOMAIN_PACK — cataloged, not bulk-installed

Each pack is a routing group, not an active bundle or new runtime. Start with the installed skill named below; install only a missing specialist from the pinned source after reviewing its `SKILL.md`, references, license and scripts. AgentSkills pack manifests are [here](https://github.com/jeremylongworth-source/AgentSkills/tree/45f314d2a3d3201dd5a0304a3a4f3a5f23a905a2/skillsets). Use the official `skill-installer` helper with `--repo`, full `--ref` and individual `--path`; do **not** run an uninspected pack installer or copy an entire pack into FANTA007.

| Pack | Primary global skill / existing capability | On-demand candidates (not installed) | Activation boundary |
| --- | --- | --- | --- |
| `frontend-product` | `vite-react`, `a11y`, `motion`, `vitest`, `testing-playwright`; Vercel React guidance | Syo-M `data-viz`, `design-system` | Only when the specific UI/testing concern appears. |
| `backend-api` | `api-contract-design`, `backend-test-plan`, `auth-flow-design`, `database-schema-review` | AgentSkills `service-boundary-design`, `integration-test-plan` | API/provider/schema work, never routine UI polish. |
| `security-quality` | Codex Security; `rate-limit-design`, `production-readiness-review` | AgentSkills `safe-install-checklist`, `supply-chain-review` | Explicit audit or boundary risk; no background scan. |
| `devops-release` | `ci-workflow-plan`, `deployment-plan`, `rollback-plan`; Vercel deployment guidance | AgentSkills `containerization-plan`, `environment-config-review` | Planning is separate from authorized production mutation. |
| `ai-agent` | OpenAI Developers/Agents, Vercel AI, `prompt-regression-testing` | AgentSkills `skill-benchmark-design`; [MCP server-dev reference](https://modelcontextprotocol.io/docs/develop/build-with-agent-skills) | No AI runtime/tool addition until an AI feature is approved. |
| `data-ml` | Hugging Face plugin; `metric-definition` | AgentSkills `sql-analysis-plan`, `experiment-design-validation`, `performance-test-plan` | Install per ML experiment; no always-on ML bundle. |
| `game-dev` | On-demand AgentSkills [game-dev manifest](https://github.com/jeremylongworth-source/AgentSkills/blob/45f314d2a3d3201dd5a0304a3a4f3a5f23a905a2/skillsets/game-dev.yaml) | `game-skill-orchestration`, `game-content-design`, `game-phaser-development`, `game-sprite-design`, `game-3d-asset-design`, `game-playtesting-usability`, `itch-html5-game-publishing` | Pick only the engine/art/QA skills for a real game; no Godot/Blender tooling installed now. |
| `product-research` | `acceptance-criteria-mapper`, `decision-memo`, `concise-technical-writing` | AgentSkills `customer-research-validation`, `competitive-market-research`, `write-spec` | Use source-backed research and explicit PM decisions. |

## EXISTING_PLUGIN_CAPABILITY — not counted among the 23

Superpowers covers planning, TDD, debugging, review, verification and skill authoring. Codex Security covers security scans and threat modeling. Vercel provides React, browser, CI/CD, env and AI guidance. OpenAI Developers/OpenAI Docs covers API and agent work. Hugging Face covers data/ML workflows. Firecrawl provides live-web research skills where configured; `web.run` remains a fallback. `ui-ux-pro-max` is already a personal design skill. Context7, Serena MCP, Playwright MCP, Repomix, Inspector, Gitleaks and Ruff are **tools**, not additional global skills in this count. Availability of a plugin capability is not proof that it was exercised in a particular mission.

## FANTA007_LOCAL — 8, unchanged

`fanta-feature`, `fanta-bug`, `fanta-release`, `fanta-research`, `fanta-data-api`, `fanta-ui-qa`, `fanta-security`, `fanta-handoff`. These remain repository-local in `.agents/skills/` and preserve the v0.5.0 locked-UI and authorization rules in `AGENTS.md`.

## REFERENCE_ONLY / DEFERRED / SKIP_DUPLICATE

- `REFERENCE_ONLY`: c47 `deep-interview`, `best-practice-research`, `autoresearch`, `optimize-performance` and `simplify-code` have useful ideas, but some refer to host-specific `plan`/goal tools or broad output contracts. Existing Superpowers plus `analyze` cover the current core without installing those variants. The official MCP `mcp-server-dev` guide is a reference until a real MCP build is requested.
- `DEFERRED`: AgentSkills game-dev, data/ML and specialist security/DevOps manifests; no additional Godot, Blender, model, provider or container runtime was installed.
- `SKIP_DUPLICATE`: c47 `plan`, `autopilot`, `code-review`, `skill`; aruma planning/debug/refactor variants; PaulRBerg `autoresearch`; Syo-M `testing-vitest` (more Storybook-prescriptive than the installed `vitest`); broad wshobson/alirezarezvani bundles. Prefer existing Superpowers, Codex Security and the specific installed skill over parallel generic workflows.

## Validation and maintenance

Static routing smoke (description/mission fit; not a live auto-selection claim):

| Mission | Primary → secondary | Negative boundary |
| --- | --- | --- |
| React regression | `fanta-bug` or Superpowers systematic debugging → `vite-react` / `vitest` / `testing-playwright` as appropriate | `analyze` only if the user wants explanation without edits. |
| FastAPI feature | `fanta-feature` or Superpowers planning → `api-contract-design` / `backend-test-plan` | No new API feature merely because the skills exist. |
| API research | `fanta-research` → official docs/Context7 → `api-contract-design` only if defining a contract | Research is not implementation authority. |
| Security audit | `fanta-security` → Codex Security scan or diff scan | No scan/remediation triggered by routine UI work. |
| AI feature | OpenAI Agents guidance → `prompt-regression-testing` → Codex Security as needed | No LLM runtime dependency until approved. |
| ML task | Hugging Face plugin → `metric-definition` if a KPI is being specified | Game/ML specialist packs remain on demand. |
| Game-development task | `game-dev` Domain Pack selection → engine/art/QA specialist only | No global game workflow or engine installed now. |
| Technical writing | `concise-technical-writing` → `fanta-handoff` only for FANTA007 substantial work | No duplicate generic handoff format. |

All 23 installed folders passed the official `quick_validate.py` structure/frontmatter check with Python UTF-8 mode. This static routing matrix passed a manual trigger/overlap review; the subsequent Codex session detected all 23 global and eight local skills. Recheck discovery after a new-PC restore. Re-audit upstream diffs before updating pinned source commits. Do not install a full pack automatically or add these skills to application dependencies. The repo documents routing only; no product file, CI workflow, package manifest or production configuration was changed in Phase 2.
