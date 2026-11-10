# Advanced Git and GitHub Workflow

## Branch model
Protect `main`; use short-lived branches: `feat/<issue>-<slug>`, `fix/`, `refactor/`, `test/`, `docs/`, `chore/`, `hotfix/`. This is a lightweight GitFlow/trunk hybrid; no permanent develop branch unless a release train is adopted. Keep branches current with main.

## Conventional commits
Use `feat(scope):`, `fix(scope):`, `test(scope):`, `refactor(scope):`, `docs(scope):`, `chore(scope):`, `ci(scope):`. Keep commits atomic and buildable. Never commit secrets, environment files, local DBs or caches.

## Efficient daily workflow
```bash
git status --short --branch
git fetch --prune origin
git switch main && git pull --ff-only
git switch -c feat/123-artist-portfolio-export
# Make the smallest coherent change; update affected docs in this same branch.
git add -p && git diff --cached
git commit -m "feat(portfolio): add artist portfolio export"
git fetch origin && git rebase origin/main
git range-diff origin/main...HEAD   # especially after rebasing
git push -u origin HEAD
```

## Verification policy (important)
- Do not configure or trigger GitHub Actions for feature, fix, docs, chore or other non-main branches.
- Do not run Actions on pull requests. Feature branches are intentionally CI-silent to conserve runner resources and avoid returning workflow results to agents for every small task.
- The user runs the relevant tests locally on the feature branch before merging. Agents should provide exact commands, not run the full suite automatically. A narrow diagnostic check is appropriate only when explicitly requested or needed to resolve a concrete failure.
- GitHub Actions runs automated test/lint/build jobs only on pushes to `main`, which normally means after a PR is merged. Direct pushes to main should be restricted by repository policy.
- Because PR checks are intentionally disabled, require human review and the user's local test confirmation before merge. Do not describe a PR as CI-green; main CI is the post-merge verification gate. If main CI fails, fix forward on a new branch and merge the repair.

## Advanced Git
- `git worktree add ../rad-feature -b feat/123-feature origin/main` for isolated parallel work.
- `git rerere` for reviewed reusable conflict resolutions.
- `git bisect` with deterministic tests for regression search.
- `git blame`, `git log --follow -- path` for provenance.
- `git reflog` for local recovery.
- `git revert <sha>` for safe shared rollback; avoid reset/force-push on shared branches.
- `git cherry-pick -x <sha>` for traceable backports.
- Signed release tags where signing is configured.

## GitHub issue-to-release
1. Create an issue with outcome, context, acceptance, risks and milestone when useful.
2. Label by type/area/priority/risk; assign owner.
3. Use Projects for status/iteration/dependencies and Milestones for release outcomes.
4. Branch from current main; reference issue in commits/PR.
5. Open a draft PR early when it helps review; describe local test commands and require user confirmation.
6. Require human review, resolved blocking threads and local verification confirmation. PR CI is intentionally not configured.
7. Merge using repository policy; delete merged branches.
8. Main-branch Actions must pass after merge. If not, prioritize a fix-forward repair.
9. Tag the verified commit and publish GitHub Release notes.

## GitHub capabilities
Actions for main-branch CI/deploy/artifacts; CODEOWNERS/rulesets/branch protection for reviews; Dependabot/security advisories for dependencies; Projects for planning; milestones for releases; PR templates/reviews for auditable decisions; Releases/tags for reproducibility; environments/approvals for deployment secrets.

Never force-push main. After conflict resolution inspect the diff and rerun local tests yourself only if requested; otherwise provide commands to the user. For shared-history mistakes revert, do not rewrite. Do not bypass repository policy.


## Main branch protection — repository owner action
The repository connection used for this change cannot administer branch-protection settings, so these controls are documented but not enabled by this commit. A repository owner should configure **Settings → Branches → Add branch protection rule** (or a repository ruleset) targeting `main`:

- Require a pull request before merging; do not allow direct pushes.
- Require at least one approval when an independent reviewer is available; resolve conversations before merging.
- Block force pushes and branch deletion; restrict bypass to a deliberate emergency path.
- Do **not** require GitHub Actions status checks on PRs: this project intentionally has no PR workflow, so required CI checks would block every merge.
- Keep the PR template's local-verification evidence as the pre-merge test gate; verify main-branch Actions after merge.

If this repository is maintained by one person, a mandatory independent approval may make merging impossible. Keep PR-only merges and explicit local verification, and enable required approval when another reviewer is available.
