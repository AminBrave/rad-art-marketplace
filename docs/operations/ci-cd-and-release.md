# CI/CD and Release

## CI jobs
`.github/workflows/ci.yml` runs Laravel feature tests + Pint, Node tests + ESLint + Vite build, and Playwright browser/full-stack tests against migrated SQLite. Pushes to main and task branches run CI; PRs targeting main run the same checks.

## Workflow rules
Use reviewed action versions, minimum permissions, concurrency cancellation, lockfile-keyed caches and deterministic runtime versions. Keep CI independent from production. Upload failure artifacts only when safe; never include secrets or user data. Validate workflow syntax and observe the actual run after changes.

## Release
1. Required checks and review pass.
2. Merge via repository policy.
3. Tag tested commit; publish release notes/migration notes.
4. Deploy through protected environment/approval.
5. Apply migrations in approved order; run health and smoke checks.
6. Monitor errors; record deployment ID, commit, workflow and rollback decision.

CI does not prove production deployment, backup recovery, monitoring or branch-protection configuration. Verify these separately.
