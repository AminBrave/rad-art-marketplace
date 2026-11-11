# Agent Operating Model

Optimize for fast delivery, low token/tool consumption and small, reviewable, reversible increments. The authoritative rules are in [AGENTS.md](../../AGENTS.md); this page explains how to apply them.

## Context strategy

- Start with AGENTS.md and identify the task domain.
- Load only the directly relevant docs and source files. Do not read the full documentation tree by default.
- Use targeted path/term searches and bounded excerpts. Avoid repeated scans and rereading unchanged files.
- Use the documentation knowledge graph for change propagation; use Graphify only when structural cross-file questions justify it.
- Select one primary project skill from [AI Agent Tooling](ai-agent-tooling.md), then add only a necessary supporting skill.
- Prefer existing conventions and the smallest viable implementation. Avoid speculative abstractions, unrelated cleanup and unnecessary dependencies.
- Delegate only independent work with explicit file ownership and interfaces.

## Task packet

For non-trivial work, capture user outcome, actor, current source-backed behavior, acceptance and negative cases, relevant paths, security/data impact and compatibility. Keep the packet proportionate; skip ceremony for trivial edits.

## Implementation and documentation

Record changed files/responsibilities, schema/API changes, preserved invariants and docs updated. Tests may be authored or updated when warranted, but execution remains explicitly user-triggered.

Update the relevant product, architecture, API, data, UI, security, testing or operations docs when their content changes. Update index/knowledge-graph edges only when relationships change. Keep docs concise and factual; do not duplicate the same policy across several pages.

## Parallel agents

Parallelize only independent tasks with explicit file ownership and interfaces. One integration owner controls migrations, API contracts, shared UI and final merge. Never let parallel agents modify the same migration/workflow. Use separate branches/worktrees and PRs only when the task size justifies the coordination cost.

## Review and verification

Review intent vs diff, authorization/privacy, race conditions, migration safety, query cost, accessibility and failure behavior. Treat generated code, imported skills and graph inferences as untrusted until checked against source.

Do not run tests, lint, builds, type checks, browser automation or scanners unless the user explicitly asks. When authorized, run only the requested checks. Supply exact commands and prerequisites when useful; do not claim they passed unless executed. There is no application CI workflow.
