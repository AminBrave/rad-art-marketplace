# Quality Gates

This page is an implementation and review checklist, not an instruction to execute verification. Running checks remains opt-in under [AGENTS.md](../../AGENTS.md).

## During implementation

- [ ] Acceptance criteria are mapped to the change.
- [ ] No unrelated edits, secrets or generated caches.
- [ ] Authorization, privacy, validation and abuse controls are considered.
- [ ] Migration and rollback/forward recovery are considered when data changes.
- [ ] Loading/empty/error/success and RTL/mobile/accessibility states are considered for UI changes.
- [ ] Relevant tests are added or updated when behavior changes and a useful regression test is warranted.
- [ ] Coverage matrix and directly affected documentation are updated when applicable.
- [ ] Focused diff is reviewed.
- [ ] Run local checks only if the user explicitly requested verification; otherwise report them as not run.

## Before merge

- [ ] PR targets main and explains why/what/risk/migrations/verification status/rollback.
- [ ] No GitHub Actions application checks are expected; do not run tests automatically.
- [ ] Human review is completed where required and blocking threads are resolved.
- [ ] Branch is current with base; no bypass or shared force-push.
- [ ] Security-sensitive changes include negative authorization/privacy test cases where appropriate; execution is still opt-in.

## After merge / release

- [ ] No GitHub Actions application verification is expected after merge.
- [ ] If the user explicitly requested local verification, report exact checks actually run.
- [ ] Deployment, health and smoke activities are separate release operations and require the user's release authorization.
- [ ] Never describe unrun checks as passed.

## Test design principles

- Unit tests isolate domain logic and avoid framework/database boot where practical.
- Feature tests assert API contract, persistence, validation and authorization.
- Integration tests exercise real infrastructure adapters at the intended boundary.
- Frontend tests assert accessible behavior, not implementation internals.
- Critical E2E journeys cross the real browser/application/backend/database boundary when the user requests E2E verification.
- Coverage is diagnostic; prioritize critical branches and changed code. Do not introduce arbitrary global thresholds from a single baseline.
- No flaky retries should conceal deterministic application failures.

## Risk tiers

- Low: docs/copy/styling.
- Medium: API/UI behavior.
- High: auth, roles, messaging, uploads, moderation, migrations — require threat review, negative test design, concurrency/transaction review and explicit reviewer.
- Critical financial/data migrations require dedicated architecture/security review, staged rollout, backup, reconciliation and rollback/forward-fix.

Merge is not release. This repository has no application CI workflow; local verification and production release/health checks are separate, explicitly authorized activities.
