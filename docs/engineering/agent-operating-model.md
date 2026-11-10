# Agent Operating Model

Optimize for small, reviewable, reversible increments.

## Discovery packet
Record outcome, actor, workflow, graph nodes/source paths, current behavior/evidence, acceptance and negative cases, security/data impact, compatibility, tests and rollback.

## Implementation packet
Record changed files/responsibilities, schema/API changes, preserved invariants, tests, failure/observability behavior and updated graph nodes.

## Parallel agents
Parallelize only independent tasks with explicit file ownership and interfaces. One integration owner controls migrations, API contracts, shared UI and final merge. Never let parallel agents modify the same migration/workflow. Use separate branches/worktrees and PRs.

## Review
Check intent vs diff, auth/privacy, race conditions, migration safety, query cost, accessibility, test quality and doc propagation. Treat generated code as untrusted until inspected and executed.

## Progress
GitHub issue checklists and milestones are authoritative. Tick stages only with commit, test-run or review evidence.
