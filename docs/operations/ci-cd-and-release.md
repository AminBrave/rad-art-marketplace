# CI/CD and Release

## CI trigger policy
`.github/workflows/ci.yml` is intentionally triggered only by pushes to `main`. There is no feature-branch push trigger and no `pull_request` trigger. Therefore, automated tests/lint/build run after a change is merged into main (and on any other push to main). Repository permissions/branch protection should restrict direct pushes so main CI represents integrated changes.

This is a deliberate resource-efficiency decision: do not start GitHub Actions for every small task or send workflow results back to agents during feature development. The user runs the relevant tests locally on non-main branches before merge. PR review relies on human review and the user's local verification confirmation; PR status checks are not available under this policy.

## CI jobs on main
- Laravel feature tests + Pint.
- Node unit tests + ESLint + Vite production build.
- Playwright browser/full-stack E2E tests against migrated SQLite.

## Workflow rules
Use reviewed action versions, minimum permissions, concurrency cancellation, lockfile-keyed caches and deterministic runtime versions. Keep CI independent from production. Upload failure artifacts only when safe; never include secrets or user data. Validate workflow syntax and observe the actual main-branch run after workflow changes are merged.

## Release
1. User verifies the feature locally; required review passes.
2. Merge via repository policy.
3. Confirm main-branch CI is green for the merge commit.
4. Tag the tested commit; publish release notes/migration notes.
5. Deploy through protected environment/approval.
6. Apply migrations in approved order; run health and smoke checks.
7. Monitor errors; record deployment ID, commit, workflow and rollback decision.

CI does not prove production deployment, backup recovery, monitoring or branch-protection configuration. Verify these separately.
