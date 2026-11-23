# Rademan GitHub task management

Use GitHub tracking to coordinate substantial work, parallel agent assignments and review. Keep it lightweight: the user's direct task instruction is sufficient for small, clear changes.

## 1. Task ownership and source of truth

- The user's current instruction defines the intended outcome and scope.
- A GitHub issue records a bounded task, owner, acceptance criteria and collaboration context.
- A pull request records the proposed code change, review and verification evidence.
- A project board, when configured, is a status view over issues and PRs—not a separate roadmap or source of product direction.
- Source code, tests and runtime evidence show what is implemented.
- Old issues, PRs, labels, milestones and decisions do not create new work automatically. Reassess their relevance before using them.

Do not require product decision IDs, MVP taxonomies or historical roadmap references for ordinary engineering tasks.

## 2. When to create an issue

Create or update an issue when work:
- Is substantial or spans multiple sessions.
- Is assigned to a particular agent or contributor.
- Runs in parallel with other tasks.
- Has dependencies, shared-file conflicts or integration requirements.
- Needs independent review, acceptance criteria or a durable handoff.

Skip the issue for a small, self-contained change directly requested and completed in the current workflow, unless the user wants tracking.

Before creating an issue, search for a relevant active issue to avoid duplicates. Do not revive an old issue merely because its title looks similar.

## 3. Recommended issue structure

Use a concise description. Include only relevant fields:

    ## Outcome
    What user-visible or engineering result is required?

    ## Scope
    What is included? What is explicitly not included?

    ## Acceptance criteria
    - [ ] Observable result one
    - [ ] Observable result two

    ## Owner
    Agent/contributor: <agent-name>

    ## Branch lane
    Persistent lane: agent/<agent-name>/lane
    Task branch: agent/<agent-name>/<task-type>/<task-name>

    ## Dependencies and coordination
    Related issues/PRs, shared files, API contracts or blockers.

    ## Tests and verification
    - Backend/frontend/Playwright tests to add or update.
    - Tests made obsolete by removed behavior, with rationale for removal.
    - Relevant commands and expected evidence.

For very small tasks, a short title and acceptance checklist may be enough. Do not force empty template sections.

## 4. Parallel work and ownership

- Assign one primary owner to each independently deliverable task.
- Give each task its own task branch named agent/<agent-name>/<task-type>/<task-name>, under the same agent-name namespace as the owner's persistent lane. The task PR targets agent/<agent-name>/lane.
- Split a larger outcome into child issues only when the parts can be delivered and reviewed independently.
- Use a parent issue/epic to coordinate dependencies and shared acceptance criteria.
- Record file/module ownership when tasks may overlap.
- Agree shared interfaces before parallel implementation.
- Avoid assigning multiple agents to the same files at the same time unless the user explicitly wants collaborative editing.
- Track blocked work with the specific dependency, responsible party if known and next action.

See DEVELOPMENT-WORKFLOW.md for the branch-lane and integration model.

## 5. Project board and labels

A GitHub Project is useful for a multi-agent team when it reduces coordination overhead. Use the existing board if available; do not assume it exists or create/reconfigure one without user direction.

Keep the board minimal and consistent with the repository's actual configuration:
- Status: Backlog, Ready, In progress, In review, Blocked, Done.
- Assignee: GitHub's native assignee field.
- Priority: P0–P3 only if the team actively uses priority.
- Type: Feature, Bug, Chore, Security, QA, Docs, Spike, or Epic.
- Area: Backend, Frontend, Design, Product, Security, Tooling, Docs, Quality, as useful.

Use labels for filtering and classification, not as a second conflicting status system. Prefer GitHub's native assignees and linked PRs over duplicate custom fields. Do not create milestones or elaborate taxonomies unless they solve a real coordination problem.

Suggested status meanings:
- Backlog: captured, not selected.
- Ready: outcome, scope and acceptance criteria are clear; dependencies are understood.
- In progress: work has started on a task branch.
- In review: a PR or deliverable is awaiting review.
- Blocked: a concrete blocker and next action are recorded.
- Done: acceptance criteria are met in the task's declared target lane.

## 6. Pull request practices

A useful PR should state:
- Why the change is needed and what outcome it delivers.
- The linked issue, if one exists.
- Agent lane and task branch.
- Scope and meaningful exclusions.
- Important contracts, migrations, configuration or compatibility changes.
- Security, privacy, accessibility, RTL or performance considerations where relevant.
- Tests added, updated or removed, with a brief rationale for removals or for making no test changes.
- Verification performed, not performed and any known risks.
- Integration status and any dependencies on other agent lanes.

Keep PRs focused. Combine changes only when they are tightly coupled and should be reviewed and reverted together. Do not mark work as released merely because its PR merged into an agent lane.

### Commit grouping by task

- Scope work around an outcome, not around individual files. One bounded task can legitimately update multiple related implementation, test and documentation files.
- Group those related files into one coherent task-level commit by default; do not create one commit per changed file or per small edit.
- Use additional commits only for distinct independently reviewable tasks or meaningful checkpoints. Keep unrelated outcomes separate, but avoid fragmented histories and excessive commits for incremental edits to the same file.
- For a batch of tasks, make the task boundaries explicit and use a small number of outcome-based commits, each with a clear imperative message.

## 7. Completion and stale work

A task is complete when its acceptance criteria are met in the declared target lane, affected tests are synchronized with the resulting code, and verification is honestly represented. Its integration or release status may still be pending.

Close or update stale issues when their scope is superseded, duplicated or no longer desired. Preserve useful history without treating it as a future commitment. Do not automatically convert every observation, idea or review suggestion into a new issue.
