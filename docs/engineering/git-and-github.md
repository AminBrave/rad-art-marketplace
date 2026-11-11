# Advanced Git and GitHub Workflow

## Branch model

Protect main; use short-lived branches: feat/<issue>-<slug>, fix/, refactor/, test/, docs/, chore/, hotfix/. This is a lightweight GitFlow/trunk hybrid; no permanent develop branch unless a release train is adopted. Keep branches current with main.

## Conventional commits

Use feat(scope):, fix(scope):, test(scope):, refactor(scope):, docs(scope):, chore(scope):, ci(scope):. Keep commits atomic and buildable. Never commit secrets, environment files, local DBs or caches.

## Efficient daily workflow

    git status --short --branch
    git fetch --prune origin
    git switch main && git pull --ff-only
    git switch -c feat/123-artist-portfolio-export
    # Make the smallest coherent change; update affected docs in this same branch.
    git add -p && git diff --cached
    git commit -m "feat(portfolio): add artist portfolio export"
    git fetch origin && git rebase origin/main
    git range-diff origin/main...HEAD
    git push -u origin HEAD

## Verification policy

- GitHub Actions must not run application tests, lint, builds, browser checks or E2E on feature branches, pull requests, main or schedules. The application CI workflow has been removed.
- AI agents must not run local tests, lint, builds or verification commands unless the user explicitly asks. A code change, PR, merge or agent task is not permission to test.
- Normal development is localhost-first: implement the requested change and keep the feedback loop fast.
- When the user explicitly says to test/verify, run only the relevant checks locally and report exact commands and outcomes. Do not expand a narrow request into the full suite.
- Playwright/browser E2E is optional and must be explicitly requested; it is never part of the main workflow or an automated merge prerequisite.
- Provide test commands as guidance when useful, but do not execute them without permission. Never claim unrun checks passed.

## Advanced Git

- git worktree add ../rad-feature -b feat/123-feature origin/main for isolated parallel work.
- git rerere for reviewed reusable conflict resolutions.
- git bisect with deterministic tests for regression search, only when test execution is authorized.
- git blame and git log --follow -- path for provenance.
- git reflog for local recovery.
- git revert <sha> for safe shared rollback; avoid reset/force-push on shared branches.
- git cherry-pick -x <sha> for traceable backports.
- Signed release tags where signing is configured.

## GitHub issue-to-release

1. Create an issue with outcome, context, acceptance, risks and milestone when useful.
2. Label by type/area/priority/risk; assign owner.
3. Use Projects for status/iteration/dependencies and Milestones for release outcomes.
4. Branch from current main; reference issue in commits/PR.
5. Open a draft PR early when it helps review; describe verification status accurately.
6. Require human review and any local verification the user explicitly requested; there are no automated application checks.
7. Merge using repository policy; delete merged branches.
8. No application test workflow runs after merge.
9. Tag the release commit and publish GitHub Release notes when a release is requested; a release tag does not imply tests were run.

## GitHub capabilities

GitHub Actions only for separately approved non-test automation, never application verification; CODEOWNERS/rulesets/branch protection for reviews; Dependabot/security advisories for dependencies; Projects for planning; milestones for releases; PR templates/reviews for auditable decisions; Releases/tags for reproducibility; environments/approvals for deployment secrets.

Never force-push main. After conflict resolution inspect the diff; rerun local tests only if requested. For shared-history mistakes revert, do not rewrite. Do not bypass repository policy.

## Main branch protection — repository owner action

The repository connection used for this change cannot administer branch-protection settings, so these controls are documented but not enabled by this commit. A repository owner should configure Settings → Branches → Add branch protection rule (or a repository ruleset) targeting main:

- Require a pull request before merging; do not allow direct pushes.
- Require at least one approval when an independent reviewer is available; resolve conversations before merging.
- Block force pushes and branch deletion; restrict bypass to a deliberate emergency path.
- Do not require GitHub Actions application test status checks; no application CI workflow is configured.
- Record local verification in the PR only when the user explicitly requested it; do not make test execution a default merge gate or expect a post-merge application test workflow.

If this repository is maintained by one person, a mandatory independent approval may make merging impossible. Keep PR-only merges and explicit local verification, and enable required approval when another reviewer is available.
