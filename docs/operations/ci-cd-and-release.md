# CI/CD and Release

## CI trigger policy
`.github/workflows/ci.yml` runs only on pushes to `main`. It ignores pushes where every changed path is Markdown (`**/*.md`), because documentation-only edits do not change executable behavior. There is no feature-branch push trigger and no `pull_request` trigger. Therefore, application test/lint/build automation runs after a code change is merged into main (and on other non-docs pushes to main). Repository permissions/branch protection should restrict direct pushes so main CI represents integrated changes.

This is a deliberate resource-efficiency decision: do not start GitHub Actions for every small task or send workflow results back to agents during feature development. The user runs relevant tests locally on non-main branches before merge. PR review relies on human review and the user's local verification confirmation; PR status checks are not available under this policy.

## CI jobs on main
- Laravel feature tests + Pint.
- Node unit tests + ESLint + Vite production build.
- Playwright browser/full-stack E2E tests against migrated SQLite.

## Workflow-run cleanup
`.github/workflows/cleanup-workflow-runs.yml` is a separate maintenance workflow, not application CI. It runs hourly and can also be started manually. It uses `igorjs/gh-actions-clean-workflow@v8` to delete completed workflow runs older than one day, retaining zero eligible old runs. The action accepts whole days only, so this implements an approximately 24-hour cleanup threshold—not an exact 12-hour threshold. Running hourly means eligible runs are normally removed on the next scheduled sweep. Queued and in-progress runs are not deleted.

The cleanup workflow has only `actions: write` and `contents: read` permissions. It does not change the main-only application CI policy and does not run on feature branches or pull requests. The Marketplace action version is pinned to major version `v8`; review upstream changes before upgrading it.

## Workflow rules
Use reviewed action versions, minimum permissions, concurrency cancellation, lockfile-keyed caches and deterministic runtime versions. Keep CI independent from production. Upload failure artifacts only when safe; never include secrets or user data. Validate workflow syntax and observe the actual main-branch run after workflow changes are merged.

## Release
1. User verifies the feature locally; required review passes.
2. Merge via repository policy.
3. Confirm main-branch CI is green for the merge commit (unless docs-only).
4. Tag the tested commit; publish release notes/migration notes.
5. Deploy through protected environment/approval.
6. Apply migrations in approved order; run health and smoke checks.
7. Monitor errors; record deployment ID, commit, workflow and rollback decision.

CI does not prove production deployment, backup recovery, monitoring or branch-protection configuration. Verify these separately.
