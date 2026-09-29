# AVENGERS DEVKIT v1.0 — checkpoint

Date: **2026-09-29**. This is a version of the development kit. The FANTA007 application remains **v0.5.0**; this checkpoint does not change, release or deploy the product.

## Scope and evidence

- **Repo-local/persistent:** `AGENTS.md`, eight `.agents/skills/fanta-*/SKILL.md`, DevKit documentation and optional read-only `scripts/devkit-check.ps1`. The 23 personal skills persist in the Windows/Codex user profile and are cataloged with source pins in [SKILL_LIBRARY.md](SKILL_LIBRARY.md). Eight Domain Packs are routing catalogs, not installed bundles.
- **Core MCP:** Serena and Playwright are registered and enabled in Codex on the reference host. Phase 4 exercised Serena symbol navigation and a local mobile Playwright smoke. MCP registration is user-scope and must be recreated on another PC. Context7 was visible in the active session catalog; its external connector availability is session-dependent.
- **Core local CLI:** Git, Node/npm/npx, uv/uvx, Serena, Gitleaks and Ruff are on the reference host PATH. Gitleaks 8.30.1 and Ruff 0.16.9 were exercised in Phase 4. Their presence does not imply a new product dependency.
- **On demand:** Schemathesis 4.28.0 parsed the local OpenAPI schema with 13 paths; Repomix 1.18.1 and MCP Inspector responded via npx. These may need package cache or network on a fresh PC. Trivy, k6 and Promptfoo have documented routes but were not installed or used in Phase 4.
- **Plugin/cloud:** Superpowers and Codex Security skills were present in the session; Codex Security tools and Context7 tools were exposed in the tool catalog. Plugin availability is not a local installation guarantee. External apps/connectors require their own availability and often account authorization.
- **Deferred/future:** Langfuse, n8n, AI runtime/gateway, external chat integrations, and bulk Domain Pack specialists remain unintegrated. No new paid service, credential, runtime dependency or production configuration is included.

The source of mission results is [PHASE4_VALIDATION.md](PHASE4_VALIDATION.md): six of six smoke missions passed. This does not claim a full product test suite, production readiness or unrestricted browser/provider coverage. Restore steps are in [BOOTSTRAP.md](BOOTSTRAP.md).

The optional PowerShell check parsed without errors, but execution was blocked by the reference PC's existing script policy. The equivalent read-only inventory commands passed; no ExecutionPolicy setting was changed. This is a portability warning, not a missing DevKit component.

## Free-readiness matrix

“Locally without Plus” describes the software/Markdown itself on a configured Windows machine; access to the Codex client and hosted features remains subject to the current plan. OpenAI currently describes Codex access across ChatGPT plans with differing limits, while [plugins](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt-and-codex) and [connected apps](https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt) can vary by plan, workspace, region and provider authorization. See the [Codex plan guide](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan).

| Capability | Works locally without Plus | Depends on ChatGPT/Codex plan | Depends on external service | Fallback |
| --- | --- | --- | --- | --- |
| 23 personal Markdown skills | Yes, after user-scope copy/install | Codex discovery/use depends on available client access and limits | Only to redownload upstream | Read `SKILL.md` and follow the guidance manually in another editor/agent. |
| Eight FANTA007 skills | Yes, versioned in repo checkpoint | Codex auto-discovery depends on client access | No | Read `.agents/skills/` directly. |
| `AGENTS.md` | Yes | Automatic use depends on client support | No | Read and apply the rules manually. |
| Serena MCP/CLI | Yes, local process after installation | MCP integration depends on client support | Only to download/update | `rg` and editor symbol search. |
| Playwright MCP | Yes, local browser after package/browser installation | MCP integration depends on client support | Only to download/update or visit live sites | Local browser/manual QA or existing test runner. |
| Schemathesis | Yes, cached/local CLI against local schema | No for CLI itself | Package download if uncached; remote API only if deliberately tested | Existing pytest/OpenAPI checks. |
| Gitleaks | Yes | No for CLI itself | Download/update only | Focused manual secret review, with reduced coverage. |
| Ruff | Yes | No for CLI itself | Download/update only | Existing Python checks/manual lint. |
| Repomix | Yes when cached | No for CLI itself | npm download if uncached | Scoped `rg`/file list and manual context selection. |
| MCP Inspector | Yes when cached | MCP use depends on client; CLI itself does not | npm download if uncached | `codex mcp list` plus direct tool probe. |
| Context7 | No exact offline equivalent | Yes, connector availability/session permissions vary | Yes, documentation service | Official documentation or local installed-package docs. |
| Codex Security | No exact offline equivalent | Yes, plugin/tool availability varies | Hosted plugin capability | Gitleaks, Ruff and scoped manual review; coverage differs. |
| Superpowers | Its local skill text can be read if present | In-client skill discovery depends on client/plugin access | Redownload/plugin delivery if absent | Repo-local workflow rules plus manual plan/debug/test process. |
| External plugins/connectors | Usually no | Often; varies by app and workspace | Usually provider auth/API | Local CLI, browser and official docs where applicable. |

## KNOWN_TECH_DEBT

- **Gitleaks:** Phase 4 reported two `generic-api-key` matches in `frontend/src/lib/squadPersistence.ts:3–4` for `SQUAD_KEY` and `LEGACY_SQUAD_KEY`, localStorage key names. They are **likely false positives**, not a blanket clearance of repository history. Classify before an allowlist; no code or rule change in Phase 5. An earlier, differently scoped historical scan reported three matches and remains historical evidence.
- **Ruff:** `ruff check backend --no-cache` reported **41 existing findings** in Phase 4: I001 ×32, F401 ×3 and six single findings (DTZ011, UP037, C408, UP035, TRY004, RUF022). No formatting, lint gate or backend fix in Phase 5.

## Checkpoint boundaries

The commit proposal is `chore(devkit): finalize Avengers DevKit v1.0`. Include only `AGENTS.md`, the eight `.agents/skills/fanta-*/SKILL.md` files, the eight files in `docs/devkit/` and `scripts/devkit-check.ps1`. Do not include `.serena/`, caches, user-scope skills, credentials or application files. Commit/push/deploy require separate PM authorization under `AGENTS.md`; this checkpoint may remain `READY_TO_COMMIT`.
