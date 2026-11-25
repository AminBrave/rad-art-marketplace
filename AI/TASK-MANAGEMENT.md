# Rademan GitHub issues and pull requests

Use GitHub tracking to improve ownership, collaboration and review—not as mandatory ceremony. The user's current instruction defines the task and its authorization.

## 1. Sources of truth

- User direction defines the intended outcome and scope.
- An issue records a bounded task, acceptance criteria, owner and dependencies.
- A PR records the proposed change, review discussion and verification evidence.
- Source code, tests and runtime evidence describe what is implemented.
- A project board, if configured, is a status view—not a separate roadmap or source of product direction.
- Old issues, PRs, labels, milestones and decisions are historical context. Reassess them before relying on them.

Do not require product-decision IDs, MVP taxonomies or separate approval records for ordinary engineering work.

## 2. When to create an issue

Create or update an issue when work is substantial, spans sessions, is assigned across contributors, has dependencies/shared-file conflicts, or needs durable acceptance criteria and handoff.

Skip an issue for a small, self-contained change directly requested and completed in the current workflow unless the user wants tracking. Search active issues before creating one; avoid duplicates and do not revive stale issues solely because a title looks similar.

Use one issue per independently deliverable outcome. Use an epic/parent only when multiple child issues have meaningful dependencies or shared completion criteria.

## 3. Issue content

Keep issues concise and complete only the sections that matter:

- **Outcome:** what result is required and who benefits.
- **Context:** current behavior/evidence and why the change is needed.
- **Scope:** included work and explicit non-goals.
- **Acceptance criteria:** observable, testable outcomes.
- **Owner:** primary contributor/agent, when known.
- **Dependencies:** related issues, PRs, shared files/contracts and blockers.
- **Verification:** relevant tests/checks and expected evidence.
- **Branch/PR:** add links when they exist; do not guess branch names or create empty placeholders.

A plan to run a test is not a test result. An issue template must not imply that creating an issue grants or withholds permission to perform ordinary development checks. Follow the user's request and repository safety rules.

## 4. Branching and PR targets

The default workflow for a single contributor/task is a short-lived branch from `main` and a PR back to `main`:

- `feat/<issue>-<slug>`
- `fix/<issue>-<slug>`
- `docs/<issue>-<slug>`
- `chore/<issue>-<slug>`

An issue number is optional when no issue exists. For genuinely parallel agent work, use the optional `agent/<name>/lane` and `agent/<name>/<type>/<issue>-<slug>` model. An agent task PR targets its own lane; cross-agent integration is owner-directed and ultimately reaches `main` through a reviewed PR. Check for Git ref collisions before creating nested agent branches. See [DEVELOPMENT-WORKFLOW.md](DEVELOPMENT-WORKFLOW.md) for the full procedure.

A PR must state its base/target clearly. Never assume that every task PR targets an agent lane or that every PR targets `main`; follow the workflow selected for that task.

## 5. Pull request practices

A useful PR explains:

- **Outcome and why:** the problem and result.
- **Related issue:** link it; use `Closes #123` only if fully completed, otherwise `Refs #123`.
- **Scope:** what changed and meaningful exclusions.
- **Implementation:** important contracts, migrations, compatibility or rollout details.
- **Risk:** security, privacy, accessibility, RTL, performance and data considerations where relevant.
- **Verification:** exact commands/checks run, observed CI links, checks not run and blockers.
- **Review notes:** screenshots for visible UI changes; known risks and rollback notes where relevant.

Keep PRs focused. Combine files when they deliver one coherent outcome and should be reviewed/reverted together. Do not claim tests or CI passed unless the result was observed. Do not mark work released merely because a PR merged.

### Commit grouping

Commit by coherent task/outcome, not by file. A task may update implementation, tests, configuration and documentation in one commit. Use separate commits for distinct, independently reviewable outcomes or meaningful checkpoints; avoid both fragmented commit noise and unrelated changes bundled together.

## 6. Boards, labels and completion

Use an existing project board when it reduces coordination overhead. Do not assume a board exists or create/reconfigure one without direction. Keep fields minimal and aligned with the board's actual configuration.

Suggested statuses, only if supported by the existing board:
- Backlog — captured, not selected.
- Ready — scope and acceptance criteria are clear.
- In progress — work has started.
- In review — PR is awaiting review.
- Blocked — blocker and next action are recorded.
- Done — acceptance criteria are met in the task's declared target.

Use labels for classification/filtering, not as a competing status system. Native assignees and linked PRs are preferable to duplicated custom fields.

A task is complete when its acceptance criteria are met in its declared target and verification is honestly represented. Integration, release and deployment may remain separate. Update or close stale/duplicated issues when appropriate; do not convert every idea or review comment into backlog work.
