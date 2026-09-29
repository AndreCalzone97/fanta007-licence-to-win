# Read-only Avengers DevKit inventory. No installation, network fetch or configuration changes.
$globalSkills = @(
    'analyze', 'vite-react', 'a11y', 'images-media', 'motion',
    'testing-playwright', 'vitest', 'visual-regression', 'api-contract-design',
    'backend-test-plan', 'database-schema-review', 'auth-flow-design',
    'rate-limit-design', 'error-handling-contracts', 'acceptance-criteria-mapper',
    'ci-workflow-plan', 'deployment-plan', 'rollback-plan',
    'prompt-regression-testing', 'production-readiness-review',
    'concise-technical-writing', 'metric-definition', 'decision-memo'
)
$localSkills = @(
    'fanta-feature', 'fanta-bug', 'fanta-release', 'fanta-research',
    'fanta-data-api', 'fanta-ui-qa', 'fanta-security', 'fanta-handoff'
)
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$missing = 0

function Report($state, $item, $detail) {
    Write-Output "$state | $item | $detail"
    if ($state -eq 'MISSING') { $script:missing++ }
}

function Test-Skill($base, $name) {
    $file = Join-Path $base "$name/SKILL.md"
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
        Report 'MISSING' $name 'SKILL.md absent'
        return
    }
    $header = Get-Content -LiteralPath $file -TotalCount 25
    if ($header.Count -eq 0 -or $header[0] -ne '---' -or
        -not ($header -match '^name:\s*') -or -not ($header -match '^description:\s*')) {
        Report 'MISSING' $name 'frontmatter incomplete'
    } else {
        Report 'PASS' $name 'SKILL.md and frontmatter present'
    }
}

Report 'PASS' 'root' $repoRoot
if (Test-Path -LiteralPath (Join-Path $repoRoot 'AGENTS.md') -PathType Leaf) {
    Report 'PASS' 'AGENTS.md' 'repo-local instructions present'
} else {
    Report 'MISSING' 'AGENTS.md' 'repo-local instructions absent'
}

$globalBase = Join-Path $codexHome 'skills'
$localBase = Join-Path $repoRoot '.agents/skills'
foreach ($name in $globalSkills) { Test-Skill $globalBase $name }
foreach ($name in $localSkills) { Test-Skill $localBase $name }

foreach ($command in @('codex', 'git', 'node', 'npm.cmd', 'npx.cmd', 'uvx', 'serena', 'gitleaks', 'ruff')) {
    if (Get-Command $command -ErrorAction SilentlyContinue) {
        Report 'PASS' $command 'available on PATH'
    } else {
        Report 'WARN' $command 'not on PATH; restore only if needed'
    }
}

if (Get-Command codex -ErrorAction SilentlyContinue) {
    try {
        # Capture internally; MCP listing can contain local paths or environment metadata.
        $mcpRows = @(codex mcp list 2>$null)
        if ($LASTEXITCODE -ne 0) { throw 'codex mcp list failed' }
        foreach ($name in @('serena', 'playwright')) {
            if ($mcpRows -match "(?m)^$name\s+.*\benabled\b") {
                Report 'PASS' "$name MCP" 'registered and enabled; response requires a separate probe'
            } else {
                Report 'WARN' "$name MCP" 'registration/enabled state not confirmed'
            }
        }
    } catch {
        Report 'WARN' 'MCP registration' 'codex mcp list unavailable; inspect manually'
    }
} else {
    Report 'WARN' 'MCP registration' 'Codex CLI unavailable; inspect in session'
}

Report 'WARN' 'Schemathesis / Repomix / MCP Inspector' 'on-demand; verify version/help manually without installing via this script'
Report 'WARN' 'Context7 / Codex Security / Superpowers' 'plugin or session capabilities; inspect the active Codex catalog'
Report 'WARN' 'Domain Packs (8)' 'catalog only in docs/devkit/SKILL_LIBRARY.md; never bulk-activate'
Write-Output "RESULT | missing=$missing | PASS confirms local presence only; WARN requires a targeted check"
if ($missing -gt 0) { exit 1 }
