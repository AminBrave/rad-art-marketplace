# Agent Operating Contract

Mandatory entrypoint for every AI coding agent. Follow before exploring or editing code.

## Operating priorities
- Deliver the requested outcome quickly with the smallest safe change.
- Minimize token, tool, compute and CI usage. Avoid broad repository scans, repeated file reads, speculative refactors, redundant summaries and unnecessary agent delegation.
- Start from this contract and the knowledge graph; read only the nodes and source files relevant to the task. Expand scope only when evidence requires it.
- Prefer existing patterns and dependencies. Do not redesign unrelated systems.
- Do not run GitHub Actions for feature-branch work. GitHub CI is intentionally restricted to pushes to `main` after merge.
- The user runs relevant tests locally on non-main branches. Do not launch full test suites automatically on their behalf; provide the exact local commands and let the user execute them. Run a narrow local check only when explicitly requested or essential to diagnose a concrete issue.

## Bootstrap
1. Read this file, [knowledge graph](docs/knowledge-graph.md), [docs index](docs/index.md), [product scope](docs/product/vision-and-scope.md) and [system overview](docs/architecture/system-overview.md).
2. Read only linked domain/API/frontend/security/testing nodes relevant to the task.
3. Inspect the smallest relevant set of source files, migrations, routes, tests, manifests and workflows. Code + tests + migrations are implementation truth; docs are navigation, not proof.
4. Never infer missing behavior. If docs conflict with code/tests, report it and prefer executable evidence.
5. Never expose secrets, inspect production personal data or weaken authorization to make tests pass.

## Before coding
- Confirm branch, worktree status, HEAD, target base and related issue/PR.
- Link work to an issue when useful; do not create planning overhead for trivial changes.
- Define user outcome, actor, scope/non-goals, acceptance criteria, edge cases, security/privacy and data/API/UI impact.
- Map only the affected routes/controllers/policies/models/migrations/React pages/API callers and existing tests.
- Identify dependencies and backward compatibility. Add ordered stages to issue/PR when the task warrants them.

## Implementation and documentation rules
- Make the smallest coherent change that satisfies the user's request.
- Laravel authorization is the security boundary; React guards are UX only.
- Validate untrusted input server-side. Use transactions for multi-record invariants and idempotency for retryable writes.
- Add forward migrations; never rewrite deployed historical migrations.
- Preserve `/api/v1` response/pagination contracts unless a reviewed contract change is intended.
- Keep UI Persian-first, RTL, responsive, keyboard accessible and consistent with shared UI primitives.
- Prevent N+1 queries, unbounded lists, unsafe file access and private data leakage.
- Never delete/weaken a failing test without justified replacement.
- Do not add dependencies without compatibility review and lockfile update.
- **When the user requests or approves a codebase change, update every related document whose description, contract, architecture, workflow, test instructions or operational guidance is affected.** Update cross-links and the knowledge graph/index where relationships change. This applies equally to user-requested changes and agent-authored changes; do not leave docs stale. Do not edit unrelated docs.
- Claim checks passed only with execution evidence. Do not imply that feature-branch GitHub CI ran.

## Required stages — tick only with evidence
- [ ] S0 Understand: relevant source, graph nodes and dependencies inspected.
- [ ] S1 Specify: acceptance, edge cases and security/data impact defined.
- [ ] S2 Design: only necessary API/data/UI contract decisions recorded.
- [ ] S3 Implement: smallest coherent vertical slice completed.
- [ ] S4 Handoff verification: relevant local commands documented; user-run results recorded when supplied. Main-branch CI evidence is recorded only after merge.
- [ ] S5 Review: focused diff inspected; review threads resolved.
- [ ] S6 Release: main-branch CI, deployment/health and rollback verified where applicable.
- [ ] S7 Close: issue, milestone, affected docs and release notes updated.

## GitHub delivery
Follow [Git/GitHub workflow](docs/engineering/git-and-github.md). Feature branches are developed and reviewed without Actions runs; the user performs local verification before merging. The repository workflow runs automated checks only after changes reach `main`.

## Definition of done
Acceptance criteria met; appropriate tests exist; auth/privacy/failure paths are covered; migrations are safe; focused diff reviewed; affected docs and graph updated; local test commands and merge expectations communicated. After merge, main-branch CI must pass. Never mark a milestone complete based on intention.
