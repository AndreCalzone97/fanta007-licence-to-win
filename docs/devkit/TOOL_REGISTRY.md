# DevKit tool registry — 2026-09-29

This is an observed inventory for the current Windows/Codex host, not a requirement to run everything. `ACTIVE` means directly callable now or launched successfully in a probe; `AVAILABLE` means present in the catalog or usable on demand but not configured/probed for this mission; `MANUAL AUTH REQUIRED` means a needed credential or user action blocks activation; `DEFERRED` means deliberately not integrated; `SKIPPED` means no current value. KEEP/ADAPT/DEFER/SKIP is the product decision, separate from operational status.

Phase 2 adds **23 installed user-scope skills**, independently of the existing plugin count. Their exact names, source commits, triggers, overlaps and eight on-demand Domain Packs are in [SKILL_LIBRARY.md](SKILL_LIBRARY.md). The 23 folders passed frontmatter validation; all 23 global and eight local skills were detected in the subsequent session. Phase 3 operational status, activation policy, CLI methods, risk and future MCP shortlist are in [PHASE3_TOOLING.md](PHASE3_TOOLING.md). No application dependency or runtime package was added.

| Tool | Decision · status | Layer; activate for | Overlap / evidence / note |
| --- | --- | --- | --- |
| Superpowers | KEEP · ACTIVE | Codex skill; complex plans, TDD, debugging, verification | Skill catalog and instructions available; use only relevant subskill. |
| OpenAI/Codex skills + plugins | KEEP · ACTIVE | Codex catalog; task-specific capabilities | Already available, no duplicate installation. |
| Phase 2 personal skill library | KEEP · ACTIVE | 23 user-scope Codex skills; focused analysis, frontend, backend/API, CI/release and product writing | `C:\Users\Andry\.codex\skills\`; detected in the subsequent Codex session. Existing plugin capabilities are counted separately. |
| Phase 2 Domain Packs | ADAPT · AVAILABLE ON DEMAND | Eight cataloged groups: frontend, backend, security, DevOps, AI, data/ML, game, product research | Not bulk-installed; select and re-audit individual specialists before enabling. |
| Codex Security | KEEP · ACTIVE | Codex plugin/skills; explicit audit, diff scan, finding | Tools/skills present in current runtime; not a routine scan gate. |
| Context7 | KEEP · ACTIVE | MCP connector; current library documentation | `resolve_library_id` and `query_docs` callable in this runtime; no extra server. |
| [Repomix](https://github.com/yamadashy/repomix) | KEEP · AVAILABLE ON DEMAND | On-demand CLI; compact repo handoff/context | Phase 3 `--no-install` missed the cache; `npx.cmd --yes repomix@latest --version` restored it and returned 1.18.1. Sanitize output; do not package secrets or generated files. |
| [Serena](https://github.com/oraios/serena) | KEEP · ACTIVE | User CLI + Codex MCP; symbol/code intelligence | `uv tool install -p 3.13 serena-agent`; 1.7.0, MCP Inspector `tools/list` returned 29 tools. Direct calls and TypeScript symbol navigation passed in Phase 4. Complements `rg`, not mandatory for small edits. |
| [Playwright MCP](https://playwright.dev/docs/getting-started-mcp) | KEEP · ACTIVE | User-level Node package + Codex MCP; browser/E2E QA | 0.0.83; detected in this session. The configured headless shell was missing at the Phase 3 probe; restored via the installed Playwright CLI. `browser_navigate` to `about:blank` then passed. Existing Codex browser remains a fallback. |
| Existing Codex/Vercel browser tools | KEEP · ACTIVE | Plugin/browser; visual and interaction QA | Already callable; use one browser surface per task unless cross-checking a browser-specific failure. |
| [MCP Inspector](https://github.com/modelcontextprotocol/inspector) | KEEP · AVAILABLE ON DEMAND | On-demand CLI; diagnose MCP startup/schema | Phase 3 `npx.cmd --yes @modelcontextprotocol/inspector@latest --help` passed; `--no-install` initially missed the package in cache. Earlier `tools/list` probes are historical evidence, not a new server probe. Not an application dependency. |
| [Official MCP Registry](https://registry.modelcontextprotocol.io/) | KEEP · AVAILABLE | Public discovery source; candidate selection | A directory, not a local MCP server or proof of compatibility. Verify upstream docs and launch separately. |
| [GitHub Spec Kit](https://github.com/github/spec-kit) | ADAPT · DEFERRED | Planning reference for large authorized feature | Initializing an existing repo can add `.specify/`; use existing `docs/superpowers/plans/` now, no scaffolding. |
| [Gitleaks](https://github.com/gitleaks/gitleaks) | KEEP · ACTIVE | User CLI; scoped secret checks before release/security work | Windows 8.30.1 checksum verified; `gitleaks version` passed. Use `--redact` and never print a found secret. Phase 4 reported two likely false positives on `SQUAD_KEY`/`LEGACY_SQUAD_KEY` localStorage identifiers; an earlier, differently scoped historical scan reported three. See [V1_CHECKPOINT.md](V1_CHECKPOINT.md). |
| [Ruff](https://docs.astral.sh/ruff/) | KEEP · ACTIVE | User CLI; focused Python lint/format checks | `uv tool install ruff@latest`; 0.16.9 verified. No repo-wide formatting or CI gate added. |
| [Schemathesis](https://schemathesis.readthedocs.io/en/stable/) | ADAPT · ACTIVE_CLI | On-demand API contract/property tests when FastAPI endpoints change | `uvx schemathesis --version` returned 4.28.0; parser read the local FANTA007 OpenAPI schema (13 path). No backend dependency or endpoint fuzzing. |
| [axe-core](https://www.deque.com/axe/core-documentation/) | ADAPT · DEFERRED | Browser-side accessibility test on affected screens | No separate package installed; use a scoped browser test when requested. Does not replace keyboard/manual review. |
| [Biome](https://biomejs.dev/) | SKIP · SKIPPED | JS/TS lint/format candidate | No current lint migration approved; could duplicate TypeScript and introduce formatting churn. |
| [Trivy](https://trivy.dev/) | ADAPT · AVAILABLE ON DEMAND | Filesystem vulnerability/misconfiguration, secondary secret or container scan | Not installed; use verified official Windows release only for scoped risk. Existing CI npm audit/dependency review remains. |
| [Renovate](https://docs.renovatebot.com/) | DEFER · DEFERRED | Automated dependency PRs after PM approves maintenance policy | Avoid unsolicited PR volume and remote configuration. |
| Qodo | DEFER · DEFERRED | Optional review plugin | Overlaps existing Codex review/security; no auth or subscription added. |
| CodeRabbit | DEFER · DEFERRED | Optional PR review service | Same overlap; needs repository integration/permissions, not granted. |
| Promptfoo | ADAPT · AVAILABLE ON DEMAND | Future Fantagente AI evals | Not installed; `npx.cmd` route documented, no production AI feature or eval dataset yet. |
| Langfuse | DEFER · DEFERRED_READY | Future AI traces/evals | Cloud/self-host options documented; needs service/credentials and data policy. |
| Vercel AI SDK | DEFER · DEFERRED | Future authorized AI application feature | No runtime dependency added to v0.5.0. |
| Vercel AI Gateway | DEFER · DEFERRED | Future model routing | External service/credentials/cost decision belongs to PM. |
| n8n | DEFER · DEFERRED_READY | Future automation, including MCP-supported workflows | Cloud/self-host boundaries documented; no server/workflow deployment. |
| Vercel Chat SDK | DEFER · DEFERRED | Future chat integration | Product integration not authorized yet. |
| Telegram / Discord / Slack | DEFER · DEFERRED | Future notification/chat channels | Require product scope, provider credentials and data/privacy decision. |

## Operational boundaries

- No new `package.json` or `pyproject.toml` dependencies. Repo-local `.agents/skills/` and docs are the only tracked Phase 1 changes.
- Phase 2 global skills are in the Codex user scope, outside this repository. The eight `fanta-*` folders stay repository-local. Skills are guidance, not permission to execute installs, scans, production changes or releases on every task.
- `codex mcp list` confirms Serena and Playwright enabled globally. The Phase 3 session directly detected both: Serena reported the active project and Playwright navigated locally after its headless shell was restored. Inspector is a separate on-demand CLI.
- `npx.cmd` on this host needs a writable cache; the successful Phase 3/4 probes used the user-level npm cache. The user-level Playwright package and Gitleaks/Ruff/Serena installations are not copied into the repository.
- `MANUAL AUTH REQUIRED`: none for the active Phase 1 core. Future paid/credentialed services above remain `DEFERRED`, not secretly activated.
