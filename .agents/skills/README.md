# Rademan agent skills

This directory is the canonical, tool-neutral skill library for AI agents working in Rademan. ChatGPT should discover skills through this index and read the selected `SKILL.md` before acting. Claude-compatible copies live in `.claude/skills/`.

## Loading protocol

1. Read the root `AGENTS.md` for project invariants and permission boundaries.
2. For ChatGPT, also read `CHATGPT.md`; other agents should follow their configured repository entry point.
3. Select one primary skill from the routing table below.
4. Load supporting skills only when the task crosses a relevant boundary.
5. Treat skills as task procedures, not policy overrides. `AGENTS.md` remains authoritative.
6. Do not load every skill by default.

## Skill routing

| Task | Canonical skill |
|---|---|
| Feature scope, actors, acceptance criteria, implementation plan | `feature-planning/SKILL.md` |
| Laravel, PHP, Eloquent, APIs, migrations, backend | `laravel-backend/SKILL.md` |
| React, JavaScript, routing, UI, accessibility, RTL | `react-frontend/SKILL.md` |
| Defect, exception, regression, unexpected behavior | `debugging/SKILL.md` |
| Authentication, authorization, privacy, uploads, threat review | `security-review/SKILL.md` |
| Read-only implementation and diff review | `code-review/SKILL.md` |
| Tests, test architecture, browser checks, quality reports | `quality-engineering/SKILL.md` |
| Branches, commits, GitHub, pull requests, GitHub Actions | `git-github/SKILL.md` |

## Directory contract

Each skill is a self-contained folder containing one `SKILL.md` with YAML frontmatter:

- `name`: stable, kebab-case identifier matching the folder name.
- `description`: concise statement of when the skill applies.
- Body: actionable workflow, Rademan-specific constraints and any task-specific verification boundary.

Keep skills concise and non-overlapping. Put global project rules in `AGENTS.md`, ChatGPT connector guidance in `CHATGPT.md`, and task procedures in the individual skill. Avoid copying global policy into every skill when a clear reference is sufficient.

## Canonical and mirror policy

- Edit `.agents/skills/<skill>/SKILL.md` as the source of truth.
- Apply the same content to `.claude/skills/<skill>/SKILL.md` in the same change.
- Add, rename or remove both copies together and update this index plus `CHATGPT.md` routing when needed.
- Keep the two trees byte-for-byte identical.
- Do not create a third copy of the skill library.
- Skills are repository guidance; their presence does not guarantee automatic loading by every AI product. ChatGPT must have repository access and follow `CHATGPT.md`.
