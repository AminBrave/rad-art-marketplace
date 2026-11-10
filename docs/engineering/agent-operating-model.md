# Agent Operating Model

Optimize for fast delivery, low token/tool consumption and small, reviewable, reversible increments.

## Efficient context strategy
- Read `AGENTS.md`, the graph/index, and only the documents and source files directly relevant to the task.
- Use targeted file/path searches and bounded excerpts. Avoid full-repository inventories unless the task requires them.
- Do not reread unchanged files or repeat searches whose results are already in context.
- Prefer existing conventions and the smallest viable implementation. Avoid speculative abstractions, unrelated cleanup and unnecessary dependencies.
- Delegate only independent work with explicit file ownership; integration overhead often costs more than parallelism on small tasks.
- Keep agent handoffs and final reports concise: changed paths, key decisions, risks, local commands for the user, and documentation updates.
- Do not launch expensive/full test suites or GitHub Actions for feature-branch tasks unless the user explicitly asks. The user owns local test execution on non-main branches.

## Discovery packet
For non-trivial tasks, capture outcome, actor, relevant graph/source paths, current behavior/evidence, acceptance and negative cases, security/data impact, compatibility and rollback. Keep it proportionate; skip ceremony for trivial edits.

## Implementation packet
Record changed files/responsibilities, schema/API changes, preserved invariants, tests added, failure/observability behavior and updated docs/graph nodes.

## Documentation propagation
Any user-requested or user-approved codebase change is a documentation trigger. Update the relevant product, architecture, API, data, UI, security, testing or operations documents when their content is affected. Update index/knowledge-graph edges when document relationships change. Keep docs concise and factual; do not churn unrelated pages. Include doc updates in the same branch/PR as the implementation.

## Parallel agents
Parallelize only independent tasks with explicit file ownership and interfaces. One integration owner controls migrations, API contracts, shared UI and final merge. Never let parallel agents modify the same migration/workflow. Use separate branches/worktrees and PRs.

## Review and verification
Review intent vs diff, auth/privacy, race conditions, migration safety, query cost, accessibility and test quality. Treat generated code as untrusted until inspected.
Feature-branch checks are performed by the user locally. Supply exact commands and prerequisites; do not claim they passed unless the user provides results or they were actually run. GitHub Actions is reserved for `main` after merge.

## Progress
GitHub issue checklists and milestones are authoritative. Tick stages only with commit, user-supplied local test result, review or main-branch CI evidence.
