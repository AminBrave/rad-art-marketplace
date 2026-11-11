# Quality Gates

## During feature-branch development
- [ ] Acceptance criteria mapped to implementation.
- [ ] No unrelated edits, secrets or generated caches.
- [ ] Authorization, privacy, validation and abuse controls reviewed.
- [ ] Migration and rollback/forward recovery considered.
- [ ] Loading/empty/error/success and RTL/mobile/accessibility states considered.
- [ ] Relevant tests added or updated, selected by [test design checklist](testing-strategy.md#test-design-checklist).
- [ ] Coverage matrix and affected documentation updated.
- [ ] Relevant local test commands executed where possible; unrun checks clearly marked.
- [ ] Focused diff reviewed.

## Before merge
- [ ] PR targets main and includes why/what/risk/migrations/test evidence/rollback.
- [ ] Required GitHub Actions checks for the PR head are green.
- [ ] Human review approved and blocking threads resolved.
- [ ] Branch current with base; no bypass or shared force-push.
- [ ] Security-sensitive changes include negative authorization/privacy tests.

## After merge
- [ ] GitHub Actions ran on the resulting main commit, unless workflow path filters intentionally skipped it.
- [ ] Backend, frontend, browser E2E, lint and production build jobs pass.
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

Merge is not release: verify deployment/health and smoke paths.
