# Quality Gates

## Before review
- [ ] Acceptance criteria mapped to code/tests.
- [ ] No unrelated edits, secrets or generated caches.
- [ ] Server auth, validation, privacy and abuse controls reviewed.
- [ ] Migration and rollback/forward recovery considered.
- [ ] Loading/empty/error/success and RTL/mobile/accessibility states considered.
- [ ] Backend/frontend tests, lint and production build pass.
- [ ] Relevant Playwright path passes.
- [ ] Knowledge graph updated.

## Before merge
- [ ] PR includes why/what/risk/migrations/test evidence/rollback.
- [ ] CI green on exact PR head.
- [ ] Required review approved and blocking threads resolved.
- [ ] Branch current with base; no bypass or shared force-push.

## Risk tiers
Low: docs/copy/styling. Medium: API/UI behavior. High: auth, roles, messaging, uploads, moderation, migrations—require threat review, negative tests, concurrency/transaction review and explicit reviewer. Critical financial/data migrations require dedicated architecture/security, staged rollout, backup, reconciliation and rollback/forward-fix.

Merge is not release: verify deployment/health and smoke paths.
