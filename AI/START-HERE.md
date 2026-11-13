# Start here — free ChatGPT / Claude coding workflow

## Every new chat
Tell the AI:

> Work on AminBrave/rad-art-marketplace. Before changing anything, read `AGENTS.md`, `AI/PROJECT.md`, `AI/SESSION.md` and `.agents/skills/README.md`. Select and read only relevant skill files. Check current GitHub issues and PRs before creating duplicate work. Follow `AI/GIT-WORKFLOW.md`. Do not run tests, builds, lint, migrations or CI unless I explicitly authorize the exact command/run. If you cannot access a file, say so; never guess.

Then provide one bounded task and expected outcome.

## Before a task (local checkout)
```bash
npm run ai:context -- --task "Describe the task in one sentence"
```
For ChatGPT-specific connector guidance:
```bash
npm run ai:context -- --task "Describe the task" --chatgpt
```
The command prints the mandatory contract, brief, resumable handoff, skill index and only task-matched skills. It is read-only. A browser-only chat cannot execute it: ask the AI to read the same files through connected GitHub access or attach/paste them.

## Keep context small
- One chat/task targets one issue and one deliverable.
- Do not paste the whole repository or all skills; load exact relevant files.
- Ask for concise plans before broad/cross-layer changes.
- Inspect relevant files/callers, not the whole codebase.
- Keep durable decisions and next 1–3 actions in `AI/SESSION.md`, not chat transcripts.
- At context-window boundaries, start a fresh chat and repeat startup. Resume from repository files and live PR/issue state, not chat memory.

## Completion handoff
Report changed files, behavior, issue/PR links, assumptions, risks, verification status (not run / locally run / CI confirmed) and next 1–3 tasks. Update `AI/SESSION.md` when durable state changes.
