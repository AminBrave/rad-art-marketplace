# AI Agent Tooling

This repository uses a small, project-scoped set of specialist skills. The goal is better task guidance without always-on hooks, duplicate instructions, background verification, or unnecessary context.

## Authority and precedence

1. System/developer instructions and user requests.
2. AGENTS.md — authoritative repository contract.
3. Relevant project architecture, product, API, security and operational documentation.
4. Project skills under .agents/skills/ or .claude/skills/.
5. Third-party agent frameworks and imported skill material.

Imported skills are advisory. They must not override project architecture, security rules, user instructions, or the opt-in verification policy. If a skill says to run tests, lint, type-check, build, start a server, install dependencies or execute a scanner, treat that as a recommendation and ask for explicit authorization before executing it.

## Selected upstream projects

| Project | Use in Rademan | Integration approach | Reviewed source |
|---|---|---|---|
| [Everything Claude Code (ECC)](https://github.com/affaan-m/ECC) | Agent workflow patterns, specialist roles, context discipline and optional security tooling | Use selectively. Do not install the full bundle or enable hooks by default. | MIT; reviewed README commit d2ef268 |
| [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) | Specialist skill patterns for Laravel, React, debugging, security and code review | Use the small project-specific skills in .agents/skills/ and .claude/skills/; they are adapted to Rademan rather than copied wholesale. | MIT; reviewed source commit 078a25c |

Review upstream licenses and notices again before redistributing substantial copied material.

## 1. ECC — selective, no-hooks integration

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

## 2. Jeffallan skills — project-scoped specialist skills

The curated skills are deliberately limited to this stack and mirrored for the two common project-level skill locations:

- feature-planning: define user outcome, scope, acceptance and edge cases.
- laravel-backend: Laravel 13, PHP 8.3+, Eloquent, API and authorization work.
- react-frontend: React 18, JavaScript, React Router 7, TanStack Query 5 and RTL.
- debugging: hypothesis-driven root-cause investigation.
- security-review: threat-aware implementation and review.
- code-review: read-only review of the focused diff.

Codex reads .agents/skills/. Claude Code reads .claude/skills/. The mirrored copies should be kept in sync. These skills are adapted from patterns in Jeffallan/claude-skills and intentionally remove incompatible assumptions (for example React 19/TypeScript defaults and mandatory test execution). They are not a substitute for reading current project source and contracts.

## Task routing

| Task | Start with | Add when needed |
|---|---|---|
| New feature | feature-planning | laravel-backend, react-frontend, security-review |
| API/database change | laravel-backend | security-review, relevant API/data docs |
| UI change | react-frontend | relevant frontend/API docs |
| Bug | debugging | one relevant implementation skill |
| Auth, roles, uploads, messaging, moderation | security-review | Laravel/React specialist as applicable |
| Review | code-review | security-review for sensitive paths |
| Architecture change | relevant architecture docs and ADR process | focused source exploration and an ADR when warranted |

Do not activate every skill for every task. Load one primary skill and only the supporting skills needed for the actual change.

## Update and maintenance policy

- Pin or record the upstream version/commit when importing or materially adapting a skill.
- Review changes before updating; never blindly overwrite local adaptations.
- Recheck platform compatibility, license, permissions and execution behavior.
- Keep skill content short and link to project docs instead of duplicating them.
- Do not add package dependencies to Laravel's Composer/npm manifests for agent-only tooling.
- Do not run installation, tests, lint, builds or scanners without explicit user authorization.
