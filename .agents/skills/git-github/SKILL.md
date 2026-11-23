---
name: git-github
description: Coordinate Git branches, parallel agent lanes, commits, pull requests and GitHub project work for Rademan.
---

# Git, GitHub and multi-agent collaboration

## Purpose
Protect independent work, coordinate multiple agents and make changes easy to review and integrate.

## Start with the task
1. Confirm repository, agent identity, assigned task, target lane and scope.
2. Inspect live remote branch/issue/PR state. If using a local checkout, inspect local status and uncommitted changes independently.
3. Read AI/DEVELOPMENT-WORKFLOW.md for the complete lane and integration workflow.
4. Choose a task-specific branch. Never assume remote state includes another workspace's uncommitted work.

## Branch model
- Persistent lane: agent/<agent-name>/lane; examples: agent/chatgpt/lane and agent/claude/lane.
- Task branch: agent/<agent-name>/<task-type>/<task-name>, e.g. agent/chatgpt/feature/123-search or agent/claude/docs/234-guide.
- Integration branch: integration or a scoped integration/<workstream>, used only for owner-directed cross-agent integration.
- main is the stable shared baseline and release destination, not an ordinary task target.

Each agent works only in its own task branches and lane. Task PRs target agent/<agent-name>/lane for that same agent. Do not merge, cherry-pick, copy or rebase commits into another agent's lane without an explicit integration task. Keep shared lane history stable; update/rebase only short-lived task branches when needed.

## Parallel work
- Give each independent task its own branch and primary owner.
- Check shared-file and interface overlap before starting concurrent work.
- Coordinate ownership for central routes, schemas, navigation, design tokens and shared components.
- Avoid simultaneous edits to the same files; serialize or divide work by clear interfaces.
- After another task merges into the same lane, update dependent task branches carefully and rerun relevant checks.
- Keep a clear handoff of branch, base commit, files owned, contracts and verification status.

## Commits and PRs
- Keep commits coherent and use specific imperative messages.
- Use PRs for substantial, collaborative or review-sensitive work; small direct task-branch commits may be appropriate.
- Link the issue when one exists. Describe outcome, scope, risks, compatibility and actual verification.
- Include related backend, frontend and Playwright test additions/updates in the same task branch and PR. Explain justified obsolete-test removals and state why no test changes were needed when applicable.
- Do not remove or weaken failing tests merely to obtain a green result; verify that removed tests cover behavior that no longer exists.
- PRs from task branches target their owning agent lane. Cross-agent PRs target the agreed integration branch only after owner authorization.
- A task merged into an agent lane is lane-complete, not automatically integrated or released.
- Never merge to main as part of ordinary task work.

## Safe Git practices
- Do not overwrite uncommitted work or assume local and remote states are identical.
- Never force-push, rewrite shared history, delete persistent agent lanes, move published tags or change repository protections as routine cleanup.
- Fetch the latest file/blob SHA before GitHub Contents API updates and use the exact branch and path.
- Inspect scripts and environment before stateful tests or data operations.
- Inspect and synchronize affected backend, frontend and Playwright tests whenever implementation or behavior changes: add coverage for new behavior, update expectations/contracts, and remove tests only when their covered code or supported behavior is truly gone or the test is demonstrably redundant/invalid.
- Run relevant local checks when useful and safe. Report commands and actual results, including suites not run and blockers.
- Read-only inspection of CI is fine; do not manually dispatch, rerun, cancel or approve workflows unless the user requests it.
- Merge, release, deployment and destructive operations require clear authorization for the target and scope.

## Project management
Use issues and a board when they improve parallel coordination. Assign one primary owner per task, define observable acceptance criteria, track real dependencies and avoid duplicate or speculative backlog items. Use the existing board configuration rather than inventing fields. See AI/TASK-MANAGEMENT.md.

## Deliverable
Report agent name, task branch, base lane, changed files/contracts, issue/PR links, verification, lane-merge status and whether cross-agent integration remains pending.
