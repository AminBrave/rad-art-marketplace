# Agent Operating Contract

Mandatory entrypoint for every AI coding agent. Follow before exploring or editing code.

## Bootstrap
1. Read this file, [knowledge graph](docs/knowledge-graph.md), [docs index](docs/index.md), [product scope](docs/product/vision-and-scope.md) and [system overview](docs/architecture/system-overview.md).
2. Read linked domain/API/frontend/security/testing nodes relevant to the task.
3. Inspect executable source, migrations, routes, tests, manifests and workflows. Code + tests + migrations are implementation truth; docs are navigation, not proof.
4. Never infer missing behavior. If docs conflict with code/tests, report it and prefer executable evidence.
5. Never expose secrets, inspect production personal data or weaken authorization to make tests pass.

## Before coding
- Confirm branch, worktree status, HEAD, target base and related issue/PR.
- Link work to an issue and milestone. If absent, create/propose one before broad work.
- Define user outcome, actor, scope/non-goals, Given/When/Then acceptance criteria, edge cases, security/privacy, data/API/UI changes, rollout and rollback.
- Map affected routes/controllers/policies/models/migrations/React pages/API callers and existing tests.
- Identify dependencies and backward compatibility. Add ordered stages to issue/PR.

## Implementation rules
- Laravel authorization is the security boundary; React guards are UX only.
- Validate untrusted input server-side. Use transactions for multi-record invariants and idempotency for retryable writes.
- Add forward migrations; never rewrite deployed historical migrations.
- Preserve `/api/v1` response/pagination contracts unless a reviewed contract change is intended.
- Keep UI Persian-first, RTL, responsive, keyboard accessible and consistent with shared UI primitives.
- Prevent N+1 queries, unbounded lists, unsafe file access and private data leakage.
- Add tests at the correct layers. Never delete/weaken a failing test without justified replacement.
- Do not add dependencies without compatibility review and lockfile update.
- Claim checks passed only with execution evidence or a green GitHub Actions run.

## Required stages — tick only with evidence
- [ ] S0 Understand: source, graph, dependencies and existing tests inspected.
- [ ] S1 Specify: acceptance, edge cases, security/data impact and rollout defined.
- [ ] S2 Design: API/data/UI contract and material alternatives recorded.
- [ ] S3 Implement: smallest coherent vertical slice completed.
- [ ] S4 Verify: backend, frontend, browser, lint and build checks pass.
- [ ] S5 Review: full diff inspected; review threads resolved.
- [ ] S6 Release: merge/deploy/health verified; rollback documented.
- [ ] S7 Close: issue, milestone, docs and release notes updated.

## GitHub delivery
Follow [Git/GitHub workflow](docs/engineering/git-and-github.md): short-lived issue branches, atomic conventional commits, PR review, required checks and no shared-branch force pushes.

## Definition of done
Acceptance criteria met; backend/frontend/browser coverage appropriate; auth/privacy/failure paths tested; migrations safe; lint/tests/build green; docs graph and milestone updated; review approved; release smoke checks completed where applicable.

If blocked by an irreversible decision, stop and report evidence, options and recommendation. Never mark a milestone complete based on intention.
