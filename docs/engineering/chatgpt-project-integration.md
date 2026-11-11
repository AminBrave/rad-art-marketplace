# ChatGPT Project Integration

## Purpose

Make the repository's curated Jeffallan-derived skills discoverable and usable by ChatGPT when the GitHub repository is connected to a ChatGPT Project. This is an integration guide, not an assumption that ChatGPT can read a user's local filesystem or automatically load arbitrary GitHub files.

## Entry point

Use the root [CHATGPT.md](../../CHATGPT.md). It defines the mandatory reading order, skill routing, project constraints and the short instruction to place in ChatGPT Project Instructions.

## Skill source and routing

The canonical skill files are in `.agents/skills/`; corresponding Claude Code copies live in `.claude/skills/`.

| Skill | File |
|---|---|
| feature-planning | `.agents/skills/feature-planning/SKILL.md` |
| laravel-backend | `.agents/skills/laravel-backend/SKILL.md` |
| react-frontend | `.agents/skills/react-frontend/SKILL.md` |
| debugging | `.agents/skills/debugging/SKILL.md` |
| security-review | `.agents/skills/security-review/SKILL.md` |
| code-review | `.agents/skills/code-review/SKILL.md` |

These are selected and adapted skill workflows inspired by [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills), not an unmodified copy of the entire upstream collection. They are deliberately tailored to Rademan's actual stack and operating constraints.

## Setup in ChatGPT

1. Connect the GitHub app/connector to the ChatGPT account and authorize access to `AminBrave/rad-art-marketplace`.
2. Create or open the ChatGPT Project used for Rademan.
3. Add the instruction from the ChatGPT availability section of root `CHATGPT.md` to the Project Instructions.
4. Ask ChatGPT to read `CHATGPT.md` and the relevant skill files before a repository task. ChatGPT must report if it cannot retrieve them.

A repository file cannot itself grant access to GitHub or force every ChatGPT chat to fetch it. Project Instructions guide retrieval; the GitHub connection and per-conversation availability of repository access are still required.

## Authority and safety

- System/developer instructions and user requests take precedence.
- `AGENTS.md` is the authoritative repository contract.
- Project docs and current source define Rademan behavior.
- Skill files provide task-specific workflow guidance.
- Never execute tests, lint, builds, type checks, browser automation, scanners or other verification without explicit user authorization.
- Do not claim a skill was loaded or work was verified unless there is direct evidence.

## Maintenance

When changing skills, update the canonical `.agents/skills/` copy first, synchronize the matching `.claude/skills/` copy, and update `CHATGPT.md` and this page if routing or setup changes. Do not duplicate full skill content into ChatGPT-specific docs.
