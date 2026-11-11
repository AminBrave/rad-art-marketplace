# AI Agent Tooling

This repository uses a small, project-scoped toolset. The goal is better code understanding and specialist guidance without always-on hooks, duplicate instructions, background verification, or unnecessary context.

## Authority and precedence

1. System/developer instructions and user requests.
2. AGENTS.md — authoritative repository contract.
3. Relevant project architecture, product, API, security and operational documentation.
4. Project skills under .agents/skills/ and platform-specific skills installed by the developer.
5. Third-party agent frameworks and generated knowledge graphs.

Imported skills are advisory. They must not override project architecture, security rules, user instructions, or the opt-in verification policy. If a skill says to run tests, lint, type-check, build, start a server, install dependencies or execute a scanner, treat that as a recommendation and ask for explicit authorization before executing it.

## Selected upstream projects

| Project | Use in Rademan | Integration approach |
|---|---|---|
| [Everything Claude Code (ECC)](https://github.com/affaan-m/ECC) | Agent workflow patterns, specialist roles, context discipline and optional security tooling | Use selectively. Do not install the full bundle or enable hooks by default. |
| [Graphify](https://github.com/Graphify-Labs/graphify) | Local code-relationship graph and graph queries for unfamiliar or cross-cutting changes | Install the official project-scoped skill when desired; build/update the graph only when it will save repeated exploration. |
| [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) | Specialist skill patterns for Laravel, React, debugging, security and code review | Use the small project-specific skills in .agents/skills/; they are adapted to Rademan rather than copied wholesale. |

Upstream licenses: ECC and Jeffallan/claude-skills are MIT-licensed; Graphify is Apache-2.0. Review upstream licenses and notices again before redistributing substantial copied material.

## 1. Graphify — optional local knowledge graph

Graphify parses code locally using tree-sitter and can build a persistent graph for repeated codebase questions. Its semantic pass over documentation and media may call a configured model/backend. Do not assume every extraction mode is offline or cost-free.

Install the official package using the upstream instructions, then install the project-scoped skill from the repository root:

    uv tool install graphifyy
    graphify install --project

If you use Codex and auto-detection does not select it, use the documented platform option:

    graphify install --project --platform codex

Review generated files before committing them. Graphify may create a platform skill under .agents/skills/graphify/ or .claude/skills/graphify/, including a references sidecar. Do not manually copy only the skill file and omit its references.

Build the graph only when the task is broad, cross-cutting, or likely to require repeated architecture queries:

    graphify . --no-viz
    graphify query "Trace the artist artwork publishing flow"
    graphify path "ArtworkController" "ArtworkPolicy"
    graphify explain "Conversation"
    graphify . --update

Use --update for incremental refresh. Use a full rebuild only when files were removed or a stale graph must shrink. A graph is an index, not implementation truth: open referenced source files before changing code. Distinguish EXTRACTED edges from INFERRED edges and never present inferred links as proven behavior.

**Privacy and scope:** before the first graph build, inspect Graphify's ignore/exclusion behavior for the installed version. Exclude .env files, credentials, local databases, logs, private uploads, user-generated/private content, vendor/, node_modules/, build output and generated caches. Do not run semantic extraction over secrets or private user data. Do not upload graph artifacts to a hosted service unless the user explicitly approves.

Graph outputs are local developer artifacts by default. Keep graphify-out/ untracked unless the team explicitly decides to review and share a sanitized graph.

## 2. ECC — selective, no-hooks integration

ECC is a broad agent harness, not a dependency of the Laravel application. Its workflows and hook runtime may add automatic tool actions that conflict with Rademan's no-automatic-verification rule.

If using Claude Code, prefer ECC's minimal/no-hooks install profile. The upstream README currently documents:

    npx ecc-universal@2.2.3 install --profile minimal --target claude

For another supported harness, consult the current official README and select its matching target. Preview the installer plan where supported. Do not combine multiple install methods for the same harness.

- Do not install ECC's hooks runtime or copy raw hook configuration into agent settings.
- Do not enable TDD, post-edit test, lint, type-check, build or browser hooks.
- Do not install the full 300+ skill set. Add only a specialist that solves a demonstrated gap.
- Keep AGENTS.md as the authority if ECC instructions conflict with this repository.
- Review future ECC updates for changed hooks, permissions, commands and auto-execution behavior before applying them.

ECC's MIT license permits use subject to its license notice. It is not necessary to vendor ECC into this application repository.

## 3. Jeffallan skills — project-scoped specialist skills

The curated skills in .agents/skills/ are deliberately limited to this stack:

- feature-planning: define user outcome, scope, acceptance and edge cases.
- laravel-backend: Laravel 13, PHP 8.3+, Eloquent, API and authorization work.
- react-frontend: React 18, JavaScript, React Router 7, TanStack Query 5 and RTL.
- debugging: hypothesis-driven root-cause investigation.
- security-review: threat-aware implementation and review.
- code-review: read-only review of the focused diff.

These skills are adapted from patterns in Jeffallan/claude-skills and intentionally remove incompatible assumptions (for example React 19/TypeScript defaults and mandatory test execution). They are not a substitute for reading current project source and contracts.

Codex discovers project skills in .agents/skills/. For Claude Code, install/copy selected skill folders into .claude/skills/ using the platform's supported project-scope mechanism. Avoid installing the same skill twice through both a marketplace plugin and a manual copy.

## Task routing

| Task | Start with | Add when needed |
|---|---|---|
| New feature | feature-planning | laravel-backend, react-frontend, security-review |
| API/database change | laravel-backend | security-review, relevant API/data docs |
| UI change | react-frontend | relevant frontend/API docs |
| Bug | debugging | one relevant implementation skill |
| Auth, roles, uploads, messaging, moderation | security-review | Laravel/React specialist as applicable |
| Review | code-review | security-review for sensitive paths |
| Architecture change | relevant architecture docs and ADR process | Graphify if cross-file relationships are unclear |

Do not activate every skill for every task. Load one primary skill and only the supporting skills needed for the actual change.

## Update and maintenance policy

- Pin or record the upstream version/commit when importing or materially adapting a skill.
- Review changes before updating; never blindly overwrite local adaptations.
- Recheck platform compatibility, license, permissions and execution behavior.
- Keep skill content short and link to project docs instead of duplicating them.
- Do not add package dependencies to Laravel's Composer/npm manifests for agent-only tooling.
- Do not run installation, graph generation, tests, lint, builds or scanners without explicit user authorization.
