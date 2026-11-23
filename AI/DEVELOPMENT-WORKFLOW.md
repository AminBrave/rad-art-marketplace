# Rademan multi-agent development and delivery workflow

This document defines how independent agents collaborate safely, how task branches move through agent lanes, and how completed work is integrated. It is designed for parallel development without making the user's workflow rigid.

## 1. Operating model

Use three layers:

1. Agent lane — a persistent branch owned by one agent identity, such as agent/chatgpt or agent/claude.
2. Task branch — a short-lived branch for one bounded assignment, created under that agent's lane and isolated from other tasks.
3. Integration branch — an owner-directed place to combine selected agent lanes or task results before promotion to main.

The default flow:

    main
     ├── agent/chatgpt
     │    ├── feature/chatgpt/<task>
     │    └── fix/chatgpt/<task>
     ├── agent/claude
     │    ├── feature/claude/<task>
     │    └── docs/claude/<task>
     └── agent/<other-agent>
          └── <type>/<other-agent>/<task>

    Selected agent lane(s) -> owner-directed integration -> integration
    integration -> reviewed release promotion -> main

Agent lanes are isolated workspaces, not release branches. main remains the stable shared baseline. Integration is deliberate, not an automatic consequence of task completion.

## 2. Agent identity and branch naming

Each independently working agent uses one stable, unique, lowercase agent ID. Keep existing IDs chatgpt and claude; add another ID only when another distinct agent/workspace needs its own lane.

| Purpose | Pattern | Example |
|---|---|---|
| Persistent agent lane | agent/<agent-id> | agent/chatgpt |
| Feature task | feature/<agent-id>/<issue>-<slug> | feature/chatgpt/123-artist-search |
| Bug fix | fix/<agent-id>/<issue>-<slug> | fix/claude/456-message-state |
| Refactor | refactor/<agent-id>/<issue>-<slug> | refactor/chatgpt/234-query-hooks |
| Design/UI | design/<agent-id>/<issue>-<slug> | design/claude/321-profile-layout |
| Documentation | docs/<agent-id>/<issue>-<slug> | docs/chatgpt/789-dev-guide |
| Tests/quality | test/<agent-id>/<issue>-<slug> | test/claude/555-message-tests |
| Security | security/<agent-id>/<issue>-<slug> | security/chatgpt/654-upload-checks |
| Chore/tooling | chore/<agent-id>/<issue>-<slug> | chore/agent-x/888-scripts |
| Integration workstream | integration/<slug> | integration/messaging-refresh |

Use the GitHub issue number when one exists; a concise unique slug is acceptable for small assigned tasks without an issue. Avoid branch names based on temporary model versions or session dates. An agent identity represents the working lane, not a particular model release.

## 3. Starting a task

For each assignment:

1. Confirm the agent ID, task outcome, scope and intended base lane.
2. Inspect live remote branch state and the relevant issue/PR. When a local checkout is available, inspect local status and uncommitted work separately.
3. Start from the current head of that agent's lane. If the lane does not exist, create it from the agreed stable base only when that is part of the authorized task.
4. Create a dedicated task branch. Do not implement multiple unrelated assignments directly on the persistent lane.
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

1. Open a PR from the task branch to its owning agent/<agent-id> lane when PR-based review is useful or required by the team's repository settings.
2. Link the relevant issue and state outcome, scope, exclusions, affected contracts, risks and verification.
3. Review the diff and relevant callers. Run suitable local checks; inspect any CI status that starts automatically under repository configuration.
4. Merge only into the matching agent lane. Do not target main or a different agent lane.
5. After a task merges, other open task branches based on the old lane head may need updating. Rebase only the task branch (never rewrite the shared lane), or merge the updated lane into the task branch when appropriate. Resolve conflicts deliberately and rerun affected checks.
6. Close the task when its acceptance criteria are met in the agent lane. Clearly state that it is lane-complete, not yet integrated or released.

For very small tasks or workflows that do not use PRs, a direct commit to the agent's own task branch is reasonable. Keep the persistent lane protected from unrelated direct edits.

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

## 10. Verification and safe operations

Run relevant local checks as part of normal engineering when they are safe and useful. Inspect scripts and environment before stateful browser tests, database operations or commands with external effects. Report exact commands and results.

Do not trigger, rerun, cancel or approve CI workflows manually unless the user requests that action. Read-only inspection of automatically triggered CI is fine. Do not merge, deploy, release, force-push, rewrite shared history or delete shared branches without clear authorization.

## 11. Handoff format

For each task, report:
- Agent ID, task branch and base lane.
- Issue and PR links where applicable.
- Outcome and key files/contracts changed.
- Verification actually performed and remaining gaps.
- Status: task branch ready, merged into agent lane, blocked, or integrated.
- Dependencies and whether it is ready for cross-agent integration.

For an integration batch, additionally list source lanes/commits, conflict resolutions, combined checks, deferred work and the exact resulting integration commit/PR.
