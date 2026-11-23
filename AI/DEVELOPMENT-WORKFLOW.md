# Rademan multi-agent development and delivery workflow

This document defines how independent agents collaborate safely, how task branches move through agent lanes, and how completed work is integrated. It is designed for parallel development without making the user's workflow rigid.

## 1. Operating model

Use three layers:

1. Agent lane — normally a persistent branch named agent/<agent-name>/lane.
2. Task branch — normally a short-lived branch named agent/<agent-name>/<task-type>/<task-name>.
3. Collision fallback — when a legacy branch named agent/<agent-name> already exists and cannot be renamed safely, use agent-<agent-name>/lane and agent-<agent-name>/<task-type>/<task-name> until the legacy ref is migrated.
3. Integration branch — an owner-directed place to combine selected agent lanes or task results before promotion to main.

The default flow:

    main
     └── agent/
          ├── chatgpt/
          │    ├── lane
          │    ├── feature/<task-name>
          │    └── fix/<task-name>
          ├── claude/
          │    ├── lane
          │    └── docs/<task-name>
          └── <other-agent>/
               ├── lane
               └── <task-type>/<task-name>

    Selected agent lane(s) -> owner-directed integration -> integration
    integration -> reviewed release promotion -> main

Agent lanes are isolated workspaces, not release branches. main remains the stable shared baseline. Integration is deliberate, not an automatic consequence of task completion.

## 2. Agent identity and branch naming

Each independently working agent uses one stable, unique, lowercase agent name. Keep existing names chatgpt and claude; add another name only when another distinct agent/workspace needs its own lane.

| Purpose | Pattern | Example |
|---|---|---|
| Persistent agent lane | agent/<agent-name>/lane | agent/chatgpt/lane |
| Feature task | agent/<agent-name>/feature/<task-name> | agent/chatgpt/feature/123-artist-search |
| Bug fix | agent/<agent-name>/fix/<task-name> | agent/claude/fix/456-message-state |
| Refactor | agent/<agent-name>/refactor/<task-name> | agent/chatgpt/refactor/234-query-hooks |
| Design/UI | agent/<agent-name>/design/<task-name> | agent/claude/design/321-profile-layout |
| Documentation | agent/<agent-name>/docs/<task-name> | agent/chatgpt/docs/789-dev-guide |
| Tests/quality | agent/<agent-name>/test/<task-name> | agent/claude/test/555-message-tests |
| Security | agent/<agent-name>/security/<task-name> | agent/chatgpt/security/654-upload-checks |
| Chore/tooling | agent/<agent-name>/chore/<task-name> | agent/agent-x/chore/888-scripts |
| Integration workstream | integration/<slug> | integration/messaging-refresh |

The preferred task hierarchy is agent/<agent-name>/<task-type>/<task-name>; the preferred persistent lane is agent/<agent-name>/lane. Use a stable lowercase agent name, a short task type (feature, fix, refactor, design, docs, test, security or chore), and a concise kebab-case task name. Include an issue number when one exists; otherwise use a descriptive unique slug. Avoid model versions and session dates.

**Git ref collision rule:** Git cannot have both a branch named agent/<agent-name> and nested refs such as agent/<agent-name>/lane. Before creating nested refs, inspect the remote. If the legacy flat branch exists, do not repeatedly attempt creation and do not delete, force-update or rewrite it. Preferred resolution is an owner-approved rename of the legacy branch to agent/<agent-name>-baseline, preserving its history; then create agent/<agent-name>/lane from the agreed baseline. If rename is unavailable or not authorized, use the collision-safe namespace agent-<agent-name>/lane and agent-<agent-name>/<task-type>/<task-name>. This fallback is a complete valid workflow, not a blocker. Record the chosen namespace and base commit in the handoff. Migrate to the preferred namespace only as a separate, owner-approved operation.

## 3. Starting a task

For each assignment:

1. Confirm the agent name, task outcome, scope and intended base lane.
2. Inspect live remote branch state and the relevant issue/PR. When a local checkout is available, inspect local status and uncommitted work separately.
3. Select the preferred namespace unless the Git ref collision rule requires the fallback. Start from the current head of that namespace's lane. If no lane exists, create it from the agreed stable base only when authorized.
4. Create a dedicated task branch under the same namespace and type. Do not implement multiple unrelated assignments directly on the persistent lane.
5. Identify likely file ownership, shared contracts, dependencies and overlap with other active agent tasks.
6. Record the task branch, base commit and linked issue in the task/PR description when tracking is useful.

Do not assume remote GitHub state reveals local uncommitted changes. Do not switch or overwrite a working tree that may contain another task's work.

## 4. Parallel task isolation

- Assign each task to one primary agent and one task branch. Multiple agents may contribute only when the user explicitly asks for collaboration on the same task.
- Keep tasks independent by separating files, modules, APIs or deliverables where practical.
- Before parallelizing work that touches shared files, shared schemas, route contracts, design tokens, central navigation or common components, agree on ownership and interface boundaries.
- If two tasks must edit the same files, serialize those edits or have one task own the shared change and expose a stable contract to the other.
- Do not let agents commit directly to another agent's task branch or persistent lane.
- Do not cherry-pick, copy or merge code between agent lanes as an informal shortcut.
- Share concise handoff notes: task, branch, base commit, files/interfaces owned, expected contract, dependencies and verification state.
- Keep each task branch focused and independently reviewable. A task may span several commits.

Parallelism should be limited by actual independence, not by a target number of agents. More concurrent branches are not better if they contend for the same files or contracts.

## 5. Updating and merging task branches into their lane

1. Open a PR from the task branch to its owning agent/<agent-name>/lane when PR-based review is useful or required by the team's repository settings.
2. Link the relevant issue and state outcome, scope, exclusions, affected contracts, risks and verification.
3. Review the diff and relevant callers. Run suitable local checks; inspect any CI status that starts automatically under repository configuration.
4. Merge only into the matching agent/<agent-name>/lane. Do not target main or a different agent lane.
5. After a task merges, other open task branches based on the old lane head may need updating. Rebase only the task branch (never rewrite the shared lane), or merge the updated lane into the task branch when appropriate. Resolve conflicts deliberately and rerun affected checks.
6. Close the task when its acceptance criteria are met in the agent lane. Clearly state that it is lane-complete, not yet integrated or released.

For very small tasks or workflows that do not use PRs, a direct commit to the agent's own task branch is reasonable. Keep the persistent lane protected from unrelated direct edits.

### Task scope and commit batching

- Define the task boundary before implementation: intended outcome, in-scope behavior and files, explicit non-goals, dependencies and acceptance/verification criteria.
- Keep all files required to deliver one coherent task together. A task may touch backend, frontend, tests, configuration and documentation; file count does not determine task count.
- Commit related files together in one task-level commit by default. Never make a separate commit merely because a file changed, and do not create repeated commits for successive small edits to the same file.
- Split work into multiple commits only when there are distinct, independently understandable outcomes or a useful intermediate checkpoint that should stand on its own. Each commit should be coherent and reviewable, not an arbitrary slice of the file list.
- If a user requests multiple independent tasks, keep their scopes distinct and create a small number of task-level commits—one per independently reviewable task/outcome, not one per file. Do not bundle unrelated tasks just to reduce the count.
- Before pushing, review the complete task diff and commit history to ensure related changes are grouped, unrelated changes are excluded, and commit messages describe outcomes.

## 6. Cross-agent integration

Cross-agent integration happens only when the user asks for it or clearly authorizes the integration scope.

1. Identify exactly which agent lanes, task PRs or commits are in scope. Do not integrate every existing lane by default.
2. Confirm the intended integration base and whether the target is a temporary integration branch or a maintained integration branch.
3. Fetch current heads and compare each selected lane with the agreed common base.
4. Review changes, overlapping files, dependencies, API/schema contracts, design tokens, route ownership and incompatible assumptions.
5. Integrate in dependency order. Resolve conflicts based on current user direction and implementation evidence, not on which agent produced the code.
6. Keep an integration log/PR description with source lanes, commits, conflict decisions and deferred changes.
7. Run the combined verification appropriate to the integrated surface. Individually passing task checks do not prove the combined system works.
8. Report what integrated, what remains isolated, and any unresolved risk.

Do not automatically back-merge integration results into every agent lane. Backports are separate, scoped changes.

## 7. Promotion to main and releases

- Agent lanes and task branches do not target main for ordinary development.
- Promote a reviewed integration result to main through the repository's agreed PR/review process.
- Release, production deployment, destructive migrations and production data operations are separate activities with explicit scope and authorization.
- A merged PR is not proof of deployment. Report the actual commit and environment when promotion or deployment occurs.
- Never force-push, rewrite shared history, delete persistent agent lanes or alter repository protections as routine cleanup.

## 8. GitHub task and project management

Use GitHub issues for substantial assignments, parallel work, dependencies and traceable acceptance criteria. Small, self-contained edits can proceed without an issue when the user directly assigns them.

A useful task issue states:
- User-requested outcome and primary owner/agent.
- Scope, non-goals and observable acceptance criteria.
- Intended agent lane and task branch, when known.
- Files/modules/interfaces likely owned and known overlap with other tasks.
- Dependencies, blockers and required handoffs.
- Verification approach appropriate to the change.

Use one issue per independently deliverable outcome. Use a parent issue/epic for a coordinated group of tasks and link child issues. Do not create duplicate issues or expand an assignment into unrelated backlog work.

A project board is useful when it reflects live issue state and multiple contributors need a shared view. If the repository has an existing Rademan Workboard, use its actual fields and statuses. Do not assume it exists or create/change its configuration without an explicit request. Keep board fields minimal: status, assignee, priority, type and area are usually sufficient. Use GitHub native assignees, labels and issue/PR links rather than duplicating them in custom fields.

Suggested status flow, adaptable to the actual project configuration:
- Backlog — captured, not yet selected.
- Ready — scope and acceptance criteria are clear, dependencies understood.
- In progress — an agent has started work.
- In review — a PR or deliverable is ready for review.
- Blocked — a concrete blocker and next action are recorded.
- Done — acceptance criteria are met and the task is complete in its declared target lane.

Board status and priority organize work; they do not override the user's instructions or create product direction. Old issues and PRs are historical until reviewed and selected for current work.

## 9. Batches and parallel assignment

When the user assigns multiple tasks or asks for a batch:

1. List the assignments and identify a primary agent/lane for each.
2. Check dependencies and shared-file conflicts.
3. Parallelize independent tasks; sequence dependent or overlapping tasks.
4. Use a separate task branch and issue/PR link for each deliverable when tracking helps.
5. Provide a concise consolidated handoff with task status, branches, PRs, changed areas, verification and integration readiness.

The user's assignment defines the authorized batch. Do not silently add backlog tasks. If the scope is clear, proceed without requesting repeated approval for each task.

## 10. Test synchronization, verification and safe operations

Tests are part of the implementation, not a separate optional cleanup. Whenever code, behavior, contracts or dependencies change, inspect the affected backend, frontend and Playwright coverage and keep it aligned in the same task branch and PR.

- Add tests for new behavior, important edge cases and regression risks at the layer that best observes the contract.
- Update existing tests when behavior, API/data contracts, UI interactions or expected outcomes change. Prefer assertions on observable behavior over implementation details.
- Remove tests only when the covered code or behavior has genuinely been removed, or when the test is demonstrably redundant or invalid. Confirm no remaining supported path relies on that behavior; do not delete or weaken a test merely because it fails after a change.
- When code is moved or replaced, migrate useful coverage to the new location or layer rather than dropping it with the old implementation.
- Keep backend (unit/feature/integration), frontend (component/state/interaction) and Playwright (critical end-to-end journey) coverage consistent with the changed surface. Avoid duplicating the same assertion at every layer without a reason.
- Include test additions, updates and justified removals with the implementation. A code-only PR should explain why existing coverage remains valid or why no test change is warranted.
- Run the most relevant tests and broader checks when proportionate and safe. Report exact commands, results, skipped suites and environment blockers; never imply unrun checks passed.

Inspect scripts and environment before stateful browser tests, database operations or commands with external effects. Read-only inspection of CI is fine; do not manually dispatch, rerun, cancel or approve CI workflows unless the user requests that action.

Do not trigger, rerun, cancel or approve CI workflows manually unless the user requests that action. Read-only inspection of automatically triggered CI is fine. Do not merge, deploy, release, force-push, rewrite shared history or delete shared branches without clear authorization.

## 11. Handoff format

For each task, report:
- Agent name, task branch and base lane.
- Issue and PR links where applicable.
- Outcome and key files/contracts changed.
- Verification actually performed and remaining gaps.
- Status: task branch ready, merged into agent lane, blocked, or integrated.
- Dependencies and whether it is ready for cross-agent integration.

For an integration batch, additionally list source lanes/commits, conflict resolutions, combined checks, deferred work and the exact resulting integration commit/PR.
