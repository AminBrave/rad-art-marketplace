# Rademan Git and delivery workflow

This document defines a practical default for everyday contribution and an optional lane model for genuinely parallel agent work. Keep the workflow proportional to the task.

## 1. Choose the workflow that fits

**Default: one contributor or one independent task**
- Start from the current `main` branch.
- Create one short-lived task branch: `<type>/<issue>-<slug>` (for example, `docs/42-contribution-guide`, `fix/81-cart-total`, `feat/93-artist-search`).
- Open a PR from that branch to `main`.
- Merge only after review and required checks pass.

**Parallel agent workflow: use only when concurrent work benefits from isolation**
- Each active agent may have a persistent lane: `agent/<agent-name>/lane`.
- Its task branches use `agent/<agent-name>/<type>/<issue>-<slug>`.
- Task PRs target that same agent's lane.
- Cross-agent integration is explicit and owner-directed. A reviewed integration PR then targets `main`.

Do not create a persistent lane merely to complete a small task. The existence of a lane does not make it a release branch.

## 2. Branch naming and Git ref collisions

Use lowercase kebab-case names and these short types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `security`.

| Work | Branch example | PR target |
|---|---|---|
| Normal task | `fix/81-cart-total` | `main` |
| Documentation | `docs/42-contribution-guide` | `main` |
| Persistent agent lane | `agent/chatgpt/lane` | — |
| Agent task | `agent/chatgpt/docs/42-contribution-guide` | `agent/chatgpt/lane` |
| Cross-agent integration | `integration/<workstream>` | `main` |

Include an issue number when one exists; do not invent one for work that does not need an issue. Avoid dates, model versions and unnecessarily deep branch paths.

Git cannot have both a branch named `agent/<agent-name>` and nested refs such as `agent/<agent-name>/lane`. Before creating a nested agent ref, inspect remote branches. If the legacy flat ref exists, do not delete, force-update or rewrite it. Prefer a normal task branch targeting `main` unless parallel lanes are genuinely needed. If the owner explicitly wants lanes, use the collision-safe namespace `agent-<agent-name>/lane` and `agent-<agent-name>/<task-name>` until a separate, owner-approved migration is possible.

## 3. Starting and updating work

1. Confirm the requested outcome, scope, exclusions and acceptance checks.
2. Inspect the current default branch and relevant open issues/PRs. Check local uncommitted work separately when using a local checkout.
3. Choose the default or parallel workflow above. Check for branch-name collisions before creating a branch.
4. Create the task branch from its intended target's current head. Do not branch from a stale local copy.
5. Keep the change focused. Coordinate ownership before concurrent edits to shared files, schemas, APIs, routes or design tokens.
6. Commit related files together by coherent task/outcome, not one commit per file. Use another commit only for a distinct, independently reviewable outcome or useful checkpoint.
7. Push the task branch and open a PR to the target specified above. State the base branch explicitly in the handoff.

Never assume remote GitHub state reveals another workspace's uncommitted changes. Do not switch or overwrite a working tree that may contain someone else's work.

## 4. Pull requests and integration

- Keep each PR focused, reviewable and small enough to reason about.
- Link the issue when one exists. Use `Closes #123` only when the PR fully completes that issue; use `Refs #123` for partial work.
- Explain outcome, scope, exclusions, important implementation choices, risks and actual verification.
- Review the diff and affected callers. Address review feedback and rerun relevant checks.
- Merge only into the PR's declared target. A task PR must not silently change from an agent lane to `main`, or vice versa.
- For parallel lanes, integrate only the specifically selected lanes/tasks in dependency order. Record source branches/commits and conflict decisions. Run combined checks; individually passing tasks do not prove the integrated result works.
- Promote reviewed integration work to `main` through a PR. A merged PR is not proof of deployment or release.

## 5. GitHub issues and coordination

Use an issue when work is substantial, spans sessions, has dependencies, needs multiple contributors, or benefits from durable acceptance criteria. A small, self-contained task directly assigned by the user does not need an issue by default.

Create one issue per independently deliverable outcome. Use an epic/parent only when several child tasks have real dependencies or shared completion criteria. Search active issues before creating a new one; do not treat old issues as automatic commitments.

An issue should capture the outcome, scope, acceptance criteria, owner when known, dependencies and verification approach. Branch and PR links can be added once they exist. A board is optional; use an existing board and its real fields rather than assuming or creating one.

## 6. Verification and safe operations

- Inspect project scripts and environment before running commands with database, browser, network or other stateful side effects.
- Add/update tests when behavior or contracts change. Do not remove or weaken failing tests merely to make a check green.
- Report exact commands and results, including checks not run and blockers.
- Read-only CI inspection is fine. Do not manually dispatch, rerun, cancel or approve workflows unless requested.
- Do not force-push, rewrite shared history, delete persistent lanes, change branch protections, merge, deploy or release without clear authorization for that action and target.

## 7. Handoff

Report the task branch, base/PR target, issue and PR links where applicable, changed areas, verification actually performed, review/merge status and remaining risks. For lane-based work, also state the owning lane and whether cross-agent integration remains pending.
