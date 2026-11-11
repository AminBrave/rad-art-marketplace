# Agent Operating Contract

Mandatory entrypoint for every AI coding agent. Follow before exploring or editing code.

## Operating priorities
- Deliver the requested outcome quickly with the smallest safe change.
- Minimize token, tool, compute and CI usage. Avoid broad repository scans, repeated file reads, speculative refactors, redundant summaries and unnecessary agent delegation.
- Start from this contract and the knowledge graph; read only the nodes and source files relevant to the task. Expand scope only when evidence requires it.
- Prefer existing patterns and dependencies. Do not redesign unrelated systems.
- Run relevant local tests for requested code changes when the execution environment supports the repository. Never claim checks passed without execution evidence. If local execution is unavailable, record exact commands and mark them not run.

## Explicit force mode override
- **Trigger:** when the exact token #FORCE_MODE appears at the very end of a user's command, treat it as explicit authorization to prioritize completing the requested in-scope repository work over ordinary project process gates.
- In this mode, make a best-effort pass over incomplete tasks and blockers directly related to the requested scope; implement, commit, merge or close only work explicitly authorized and completed.
- It does not override system/developer instructions, repository permissions, branch protection, security/privacy controls, authorization boundaries or explicit confirmation requirements.
- Never fabricate tests, verification, review, acceptance or deployment. If checks are skipped, record them as not run / unverified and explain residual risk.
- Do not close unrelated issues or mark incomplete work complete to make a tracker look clean.
- If a required safety or platform gate cannot be bypassed, finish safe work and state the exact blocker.

## Bootstrap
1. Read this file, [knowledge graph](docs/knowledge-graph.md), [docs index](docs/index.md), [product scope](docs/product/vision-and-scope.md) and [system overview](docs/architecture/system-overview.md).
2. Read only linked domain/API/frontend/security nodes relevant to the task.
3. Inspect the smallest relevant set of source files, migrations, routes, tests, manifests and workflows. Code + tests + migrations are implementation truth; docs are navigation, not proof.
4. Never infer missing behavior. If docs conflict with code/tests, report it and prefer executable evidence.
5. Never expose secrets, inspect production personal data or weaken authorization to make tests pass.

## Before coding
- Confirm branch, worktree status, HEAD, target base and related issue.
- Define user outcome, actor, scope/non-goals, acceptance criteria, edge cases, security/privacy and data/API/UI impact.
- Map affected routes/controllers/policies/models/migrations/React pages/API callers and existing tests.
- Identify dependencies and backward compatibility. Add ordered stages to issue/PR when warranted.

## Implementation and documentation rules
- Make the smallest coherent change that satisfies the request.
- Laravel authorization is the security boundary; React guards are UX only.
- Validate untrusted input server-side. Use transactions for multi-record invariants and idempotency for retryable writes.
- Add forward migrations; never rewrite deployed historical migrations.
- Preserve /api/v1 response/pagination contracts unless a reviewed contract change is intended.
- Keep UI Persian-first, RTL, responsive, keyboard accessible and consistent with shared UI primitives.
- Prevent N+1 queries, unbounded lists, unsafe file access and private data leakage.
- Never delete/weaken a failing test without justified replacement.
- Do not add dependencies without compatibility review and lockfile update.
- When behavior, contracts, architecture, workflow, testing instructions or operational guidance change, update every directly affected document and knowledge graph/index where needed.
- Distinguish PR-head checks from post-merge main checks.

## Testing program
Follow [Testing Strategy](docs/engineering/testing-strategy.md) and [Test Coverage Matrix](docs/engineering/test-coverage-matrix.md). New tests use the correct layer and domain directory. Cover success, validation, authorization/privacy and failure cases as applicable. Line coverage alone does not prove completeness.

## Required stages — tick only with evidence
- [ ] S0 Understand: relevant source, graph nodes and dependencies inspected.
- [ ] S1 Specify: acceptance, edge cases and security/data impact defined.
- [ ] S2 Design: necessary API/data/UI contract decisions recorded.
- [ ] S3 Implement: smallest coherent vertical slice completed.
- [ ] S4 Verify: relevant tests actually run; unrun commands explicitly documented.
- [ ] S5 Review: focused diff inspected; review threads resolved.
- [ ] S6 Release: main-branch CI, deployment/health and rollback verified where applicable.
- [ ] S7 Close: issue, milestone, affected docs and release notes updated.

## GitHub delivery
Follow [Git/GitHub workflow](engineering/git-and-github.md). Pull requests targeting main run the configured CI workflow. Require relevant checks and human review before merge. After merge, verify the main-branch workflow. Merge is not production deployment.

## Definition of done
Acceptance criteria met; appropriate tests exist; auth/privacy/failure paths are covered; migrations are safe; focused diff reviewed; affected docs and graph updated; verification evidence accurately recorded; merge and deployment status clearly communicated.
