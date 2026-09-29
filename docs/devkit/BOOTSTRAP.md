# Avengers DevKit v1.0 — restore on Windows

This procedure restores the **DevKit**, not the FANTA007 application deployment. Product version remains **v0.5.0**. The repository carries `AGENTS.md`, eight local `fanta-*` skills and these documents. The 23 personal skills, CLI installations, MCP registrations and plugin sessions live outside the repository.

## 1. New Codex session on the same PC

1. Open the existing `publish-v2` root, not `frontend/` or a parent directory. Run `Get-Location` and confirm `AGENTS.md` and `.agents/skills/` are visible.
2. In the new session, confirm the catalog detects the 23 personal skills and eight `fanta-*` skills. [SKILL_LIBRARY.md](SKILL_LIBRARY.md) is the exact name list. The eight Domain Packs are catalog entries, not eight installed bundles.
3. Where local PowerShell policy permits scripts, run `powershell.exe -NoProfile -File .\scripts\devkit-check.ps1`. It is read-only. `PASS` proves file/PATH presence or MCP registration; `WARN` asks for a targeted check; it never installs or changes a setting. On the reference PC, `.ps1` execution is restricted. Do not change ExecutionPolicy for this check: use the manual commands below instead.
4. If a mission needs Serena or Playwright, check `codex mcp list` and make one harmless direct tool probe. Registration alone does not prove the server responds. Check Context7, Codex Security and Superpowers in the session catalog only when relevant.

## 2. New clone on the same PC

1. Clone and open the repository root. Confirm `AGENTS.md`, `.agents/skills/fanta-*/SKILL.md` and `docs/devkit/` came from the DevKit checkpoint commit. If these are absent, the local uncommitted checkpoint has not been transferred.
2. Run the read-only check above. The user-scope skills, MCP and CLI are shared with the old clone if the same Windows user profile is used. Reopen Codex from the new root so Serena's `--project-from-cwd` targets the new clone.
3. Keep `.serena/` cache/local configuration, browser profiles, `.venv/`, `node_modules/` and credentials out of the DevKit transfer. Recreate project-specific caches as needed.

## 3. New Windows PC

### Prerequisites

- Install a supported Codex client, Git, Node/npm, Python and `uv` from their official sources. Use the project README for application setup. The Phase 3 reference host had Node 24.21.0, npm 11.19.0, uv 0.11.28 and Python 3.12.14 in `.venv`; these are observed versions, not a new application requirement.
- Sign in to Codex with the plan available to you. The local Markdown skills and CLI tools do not themselves require ChatGPT Plus. Codex features, usage limits and plugins can vary by plan, rollout, workspace and region; consult the [Codex plan guide](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan) and [plugin availability guide](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt-and-codex).
- Clone the DevKit checkpoint, then verify the repo-local instructions and skills as in section 2.

### Restore the 23 personal skills

Preferred offline route: from the old PC, copy **only the 23 named directories** in `%USERPROFILE%\.codex\skills\` listed in [SKILL_LIBRARY.md](SKILL_LIBRARY.md) into the same user-scope location on the new PC. These selected skill directories were audited as Markdown/YAML only. Do not transfer the whole `.codex` profile: it may contain account state, MCP configuration or credentials. Check the copied `SKILL.md` files before use.

If no backup exists, the library records four upstream repositories and exact audited commit hashes. Inspect each skill directory and its license at the pinned commit, then restore the individual directories with Codex's `skill-installer` helper (`--repo`, full `--ref`, `--path` per selected skill). Do not install an entire Domain Pack. The source/skill mapping and pins are in [SKILL_LIBRARY.md](SKILL_LIBRARY.md); re-audit any updated upstream commit.

### Restore MCP and CLI only as needed

| Capability | Restore/verify path | Boundary |
| --- | --- | --- |
| Serena MCP + CLI | Install Serena from its [official project](https://github.com/oraios/serena) in user scope, then run its Codex setup from the repository root. Verify `serena --version`, `codex mcp list`, then one read-only Serena tool call. | Registration is user-specific. Do not copy raw MCP config or credentials. Python symbol support was not observed in the reference setup. |
| Playwright MCP | Install [Playwright MCP](https://github.com/microsoft/playwright-mcp) in user scope, register it with Codex, install its compatible headless Chromium browser, then verify `codex mcp list` and navigate to `about:blank`. | A fresh PC may have the MCP package but no browser binary. Use a temporary/local page for the probe. |
| Schemathesis | Run `uvx schemathesis --version` when API-contract testing is needed. | On demand; network/package cache may be needed. Do not fuzz production. |
| Gitleaks / Ruff | Restore from their official releases or `uv tool` as recorded in [PHASE3_TOOLING.md](PHASE3_TOOLING.md); verify `gitleaks version` and `ruff --version`. | User-scope CLI, no application manifest changes. Use Gitleaks `--redact`. |
| Repomix / MCP Inspector | Resolve via `npx.cmd` on demand as recorded in [PHASE3_TOOLING.md](PHASE3_TOOLING.md); verify `--version` or `--help`. | npm cache/network may be required. Inspect any exported context for secrets. |
| Context7 / Codex Security / Superpowers | Inspect the current Codex plugin/skill catalog; reconnect or enable each only if offered and needed. | Availability and permissions vary; there is no repo-local install fallback for their exact cloud/plugin behavior. |

The pinned Phase 3 tool versions and activation policy are in [PHASE3_TOOLING.md](PHASE3_TOOLING.md). `codex mcp list` verifies registration, a direct tool call verifies response, and the script verifies neither a remote service nor an authenticated plugin session. Never copy tokens, browser profiles, whole Codex configuration, `.env` files or tool caches to restore the DevKit.

## 4. Acceptance after restore

Run the script if allowed, or use these read-only PowerShell commands from the repo root: `Get-Location`; `Test-Path AGENTS.md`; `Get-ChildItem .agents\skills -Directory | Select-Object -ExpandProperty Name`; `Get-ChildItem "$env:USERPROFILE\.codex\skills" -Directory | Select-Object -ExpandProperty Name`; `Get-Command codex,git,node,npm,npx,uvx,serena,gitleaks,ruff -ErrorAction SilentlyContinue`; `codex mcp list`. Compare skill names with [SKILL_LIBRARY.md](SKILL_LIBRARY.md), then inspect the current session catalog for plugin and connector capabilities. Confirm 23 global and eight local skills; the eight Domain Packs remain catalog-only. For an actual task, choose one primary skill plus at most 1–5 relevant secondary skills/tools. A missing optional service is a `WARN` with a documented local fallback, not a reason to install every tool.
