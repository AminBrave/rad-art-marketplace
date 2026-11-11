# ChatGPT Project Entry Point

This file is the repository-specific instruction entry point for ChatGPT when the GitHub repository is connected and repository files are available in the conversation.

## Mandatory reading order

1. Read `AGENTS.md` first. It is the authoritative repository contract.
2. Read `docs/engineering/ai-agent-tooling.md` for the skill catalog, routing and precedence.
3. For a coding, planning, debugging or review task, retrieve the relevant skill file(s) listed below from the connected repository before doing the work. Do not rely on skill names or summaries alone; read the actual `SKILL.md` content.
4. Read only the additional project documentation and source files relevant to the task.

## Skill routing

All six curated skills are adapted from patterns in [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) and tailored to Rademan. They are maintained in `.agents/skills/` as the canonical copy and mirrored in `.claude/skills/`.

| Task | Required skill path |
|---|---|
| New feature, scope, acceptance criteria | `.agents/skills/feature-planning/SKILL.md` |
| Laravel, PHP, Eloquent, API, migrations, backend | `.agents/skills/laravel-backend/SKILL.md` |
| React, JavaScript, UI, routing, RTL | `.agents/skills/react-frontend/SKILL.md` |
| Defect, exception, unexpected behavior | `.agents/skills/debugging/SKILL.md` |
| Authentication, authorization, privacy, uploads, security-sensitive work | `.agents/skills/security-review/SKILL.md` |
| Read-only implementation/diff review | `.agents/skills/code-review/SKILL.md` |

Load only the primary skill and the supporting skills relevant to the task. For example, a feature spanning Laravel and React may need feature-planning, laravel-backend and react-frontend; add security-review only when the feature touches a security-sensitive boundary.

## Non-negotiable project rules

- User instructions and `AGENTS.md` take precedence over all skills.
- Never run tests, lint, builds, type checks, browser automation, scanners or other verification unless the user explicitly asks.
- A request to implement, debug, review, commit or open a PR is not permission to run verification.
- Do not claim to have read a skill, inspected a file, executed a command or verified a result unless that actually happened.
- If GitHub/repository access is unavailable, say so and ask the user to connect the repository or provide the relevant files. Do not pretend the skills were loaded.
- Skills are advisory workflow guidance, not dependencies of the Laravel application and not permission to install packages or execute commands.

## ChatGPT availability limitation

Keeping this file and the skill files in GitHub does not automatically load them into every ChatGPT conversation. To use them in a ChatGPT Project:
- Connect the GitHub repository through the available GitHub app/connector, with access to `AminBrave/rad-art-marketplace`.
- Add the short instruction below to that ChatGPT Project's Instructions:

  > For Rademan repository work, read `CHATGPT.md` from `AminBrave/rad-art-marketplace` first, then follow its mandatory reading order and load the actual relevant skill `SKILL.md` files. If repository access is unavailable, tell me instead of guessing.

- In each new conversation, ChatGPT must have repository access (or the relevant files must be attached/provided). Project instructions alone cannot grant GitHub access or guarantee automatic retrieval.

For maintenance, update the canonical `.agents/skills/` files and keep their `.claude/skills/` mirrors synchronized. Update this routing table if skills are added, renamed or removed.
