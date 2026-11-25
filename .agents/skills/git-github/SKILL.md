---
name: git-github
description: Coordinate Git branches, parallel agent lanes, commits, pull requests and GitHub project work for Rademan.
---

# Git, GitHub and collaboration

## Start with the task
1. Confirm repository, requested outcome, scope and acceptance checks.
2. Inspect live remote branches and relevant open issues/PRs. If using a local checkout, inspect local status and uncommitted changes separately.
3. Read AI/DEVELOPMENT-WORKFLOW.md and AI/TASK-MANAGEMENT.md.
4. Use a normal task branch from `main` by default. Use persistent agent lanes only for genuinely parallel work that needs isolation.

## Branches and PR targets
- Normal task: `feat/<issue>-<slug>`, `fix/<issue>-<slug>`, `docs/<issue>-<slug>` or `chore/<issue>-<slug>`; PR targets `main`.
- Optional persistent lane: `agent/<agent-name>/lane`.
- Optional agent task: `agent/<agent-name>/<type>/<issue>-<slug>`; PR targets that same agent's lane.
- Cross-agent integration is owner-directed and uses a scoped integration branch/PR to `main`.
- Check remote refs before creating nested branches. Git cannot have both `agent/<name>` and `agent/<name>/lane`. Never delete, force-update or rewrite a legacy branch to satisfy naming convention. Prefer the normal task workflow unless lanes are needed; if lanes are explicitly required, use the documented collision-safe namespace.

Never assume a task PR's target: state and verify the base branch. Do not send ordinary task work to another agent's lane.

## Collaboration and commits
- Give each independent task one primary owner and one task branch.
- Coordinate shared files, schemas, APIs, routes and design tokens before parallel edits.
- Keep related files for one coherent outcome together. Commit by task/outcome, not by file.
- Link an issue when one exists. Describe outcome, scope, risks and actual verification in the PR.
- A task merged into an agent lane is lane-complete, not automatically integrated or released.

## Safe Git practices
- Do not overwrite uncommitted work or assume local and remote states are identical.
- Never force-push, rewrite shared history or delete persistent lanes as routine cleanup.
- Fetch the latest file/blob SHA before GitHub Contents API updates and use the exact branch and path.
- Inspect scripts/environment before stateful tests or data operations.
- Add/update relevant tests when behavior or contracts change. Never delete or weaken a failing test merely to obtain a green result.
- Report exact commands and results, including suites not run and blockers.
- Read-only CI inspection is fine; do not manually dispatch, rerun, cancel or approve workflows unless requested.
- Merge, release, deployment, branch-protection changes and destructive operations require clear authorization for the target and scope.

## Issues and PRs
Use issues for substantial, multi-session, dependent or collaborative work. Skip them for small self-contained tasks directly assigned by the user unless tracking is requested. Search for active duplicates first. Keep issue acceptance criteria observable and concise; branch/PR links can be added when known. Use `Closes #N` only when the PR fully completes the issue; otherwise use `Refs #N`.

## Handoff
Report task branch, PR target, issue/PR links where applicable, changed areas, verification, merge status and remaining risks. For lane-based work, include owning lane and integration status.
