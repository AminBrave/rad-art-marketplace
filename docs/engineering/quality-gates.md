# Quality Gates

## During feature-branch development
- [ ] Acceptance criteria mapped to implementation.
- [ ] No unrelated edits, secrets or generated caches.
- [ ] Authorization, privacy, validation and abuse controls reviewed.
- [ ] Migration and rollback/forward recovery considered.
- [ ] Loading/empty/error/success and RTL/mobile/accessibility states considered.
- [ ] Relevant tests added or updated, selected by [risk tier](testing-strategy.md#risk-based-test-selection).
- [ ] Every affected document and knowledge-graph relationship updated.
- [ ] Agent supplies exact local verification commands; user runs them before merge.
- [ ] Focused diff reviewed.

## Before merge (human gate)
- [ ] User confirms relevant local tests pass on the feature branch.
- [ ] PR includes why/what/risk/migrations/local test evidence/rollback.
- [ ] Human review approved and blocking threads resolved.
- [ ] Branch current with base; no bypass or shared force-push.
- [ ] Do not expect PR Actions checks: they are intentionally disabled.

## After merge (automated main gate)
- [ ] GitHub Actions ran on the resulting `main` commit, unless the push changed only Markdown documentation.
- [ ] Backend, frontend, browser E2E, lint and production build jobs pass when CI runs.
- [ ] If main CI fails, create a fix branch, repair, have the user verify locally, then merge the fix.

## Risk tiers
Low: docs/copy/styling. Medium: API/UI behavior. High: auth, roles, messaging, uploads, moderation, migrations—require threat review, negative tests, concurrency/transaction review and explicit reviewer. Critical financial/data migrations require dedicated architecture/security, staged rollout, backup, reconciliation and rollback/forward-fix.

Merge is not release: verify deployment/health and smoke paths.
