# Advanced Git and GitHub Workflow

## Branch model
Protect `main`; use short-lived branches: `feat/<issue>-<slug>`, `fix/`, `refactor/`, `test/`, `docs/`, `chore/`, `hotfix/`. This is a lightweight GitFlow/trunk hybrid; no permanent develop branch unless a release train is adopted. Keep branches current with main.

## Conventional commits
Use `feat(scope):`, `fix(scope):`, `test(scope):`, `refactor(scope):`, `docs(scope):`, `chore(scope):`, `ci(scope):`. Keep commits atomic and buildable. Never commit secrets, environment files, local DBs or caches.

## Safe daily workflow
```bash
git status --short --branch
git fetch --prune origin
git switch main && git pull --ff-only
git switch -c feat/123-artist-portfolio-export
git add -p && git diff --cached
git commit -m "feat(portfolio): add artist portfolio export"
git fetch origin && git rebase origin/main
git push -u origin HEAD
```

## Advanced Git
- `git worktree add ../rad-feature -b feat/123-feature origin/main` for isolated parallel work.
- `git range-diff origin/main...HEAD` after rebase.
- `git rerere` for reviewed reusable conflict resolutions.
- `git bisect` with deterministic tests for regression search.
- `git blame`, `git log --follow -- path` for provenance.
- `git reflog` for local recovery.
- `git revert <sha>` for safe shared rollback; avoid reset/force-push on shared branches.
- `git cherry-pick -x <sha>` for traceable backports.
- Signed release tags where signing is configured.

## GitHub issue-to-release
1. Create issue with outcome, context, acceptance, risks and milestone.
2. Label by type/area/priority/risk; assign owner.
3. Use Projects for status/iteration/dependencies and Milestones for release outcomes.
4. Branch from current main; reference issue in commits/PR.
5. Open draft PR early with plan and test checklist.
6. Require CI, reviews, resolved blocking threads and no high-risk findings.
7. Use auto-merge/merge queue only when configured and all required checks pass.
8. Squash or rebase merge according to repo policy; delete merged branches.
9. Tag tested commit and publish GitHub Release notes.

## GitHub capabilities
Actions for CI/deploy/artifacts; CODEOWNERS/rulesets/branch protection for reviews; Dependabot/security advisories for dependencies; Projects for roadmap; milestones for releases; PR templates/reviews for auditable decisions; Releases/tags for reproducibility; environments/approvals for deployment secrets.

Never force-push main. After conflict resolution rerun tests and inspect range-diff. For shared-history mistakes revert, do not rewrite. Do not bypass checks without maintainer-approved emergency process and follow-up.
