# Quality Gates

## During feature-branch development
- [ ] Acceptance criteria mapped to implementation.
- [ ] No unrelated edits, secrets or generated caches.
- [ ] Authorization, privacy, validation and abuse controls reviewed.
- [ ] Migration and rollback/forward recovery considered.
- [ ] Loading/empty/error/success and RTL/mobile/accessibility states considered.
- [ ] Relevant tests added or updated, selected by [test design checklist](testing-strategy.md#test-design-checklist).
- [ ] Coverage matrix and affected documentation updated.
- [ ] Run local checks only if the user explicitly requested verification; otherwise record them as intentionally not run.
- [ ] Focused diff reviewed.

## Before merge
- [ ] PR targets main and includes why/what/risk/migrations/test evidence/rollback.
- [ ] No GitHub Actions application checks are expected; do not run tests automatically.
- [ ] Human review approved and blocking threads resolved.
- [ ] Branch current with base; no bypass or shared force-push.
- [ ] Security-sensitive changes include negative authorization/privacy tests.

## After merge
- [ ] No GitHub Actions application verification is expected after merge.
- [ ] If the user explicitly requested local verification, report the exact checks actually run.
- [ ] If main CI fails, create a fix branch, repair, validate, then merge the fix.
- [ ] Deployment/health and smoke paths verified separately where a release is intended.

## Test-specific gates
- Unit tests isolate domain logic and avoid framework/database boot where practical.
- Feature tests assert API contract, persistence, validation and authorization.
- Integration tests exercise real infrastructure adapters at the intended boundary.
- Frontend tests assert accessible behavior, not implementation internals.
- Critical E2E journeys cross the real browser/application/backend/database boundary.
- Coverage thresholds are introduced only after a trustworthy baseline; prioritize critical branches and changed code.
- No flaky retries should conceal deterministic application failures.

## Risk tiers
Low: docs/copy/styling. Medium: API/UI behavior. High: auth, roles, messaging, uploads, moderation, migrations—require threat review, negative tests, concurrency/transaction review and explicit reviewer. Critical financial/data migrations require dedicated architecture/security, staged rollout, backup, reconciliation and rollback/forward-fix.

Merge is not release: deployment/health and smoke paths are separate activities and must not trigger automatic test execution.
