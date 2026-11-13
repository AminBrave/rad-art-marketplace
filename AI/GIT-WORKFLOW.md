# Git and GitHub workflow

Canonical task procedure: `.agents/skills/git-github/SKILL.md`.

## Branch model
- `main` is the releasable integration branch; do not work directly on it for normal feature work.
- Create short-lived branches from latest `origin/main`.
- Naming: `feat/<issue>-slug`, `fix/<issue>-slug`, `chore/<issue>-slug`, `docs/<issue>-slug`, `sec/<issue>-slug`, `qa/<issue>-slug`.
- One issue/outcome per branch; avoid long-lived feature branches.

## Commits
Use Conventional Commits: `feat(scope):`, `fix(scope):`, `docs(scope):`, `refactor(scope):`, `test(scope):`, `chore(scope):`, `ci(scope):`, `perf(scope):`, `security(scope):`. Use imperative, specific subjects and atomic commits. Add `Refs #123` when useful; use `BREAKING CHANGE:` only for deliberate compatibility breaks. Never amend/rebase shared commits or force-push without explicit approval.

## Pull requests
- Open draft PRs early when feedback helps; mark ready only when acceptance criteria are met.
- Title: `<type>(<scope>): <outcome> (#123)`.
- Use `Closes #123` only when fully resolved; otherwise `Refs #123`.
- Include summary, rationale, scope, implementation notes, UI screenshots, risks, migration/rollback notes and verification evidence.
- One PR = one coherent issue-sized outcome. Prefer small PRs (often under ~400 changed lines), splitting larger work by vertical slice rather than enforcing a hard limit.
- Distinguish not run, locally run and CI-confirmed. Never claim checks passed without evidence.
- No CI runs, merge, deployment or release without permission required by `AGENTS.md`.

## Review and integration
Review the full diff and affected call sites; resolve conversations before merge. Prefer squash merge for one-issue/one-PR work. Delete topic branches after merge only when safe. Keep `main` fast-forwardable.

## Releases
Use annotated immutable SemVer tags `vMAJOR.MINOR.PATCH`. Tag only reviewed commits on `main` after release acceptance. Never move/overwrite published tags. Release notes include user-visible changes, migrations, compatibility and limitations.

## GitHub settings to check manually
Where supported, protect `main`: require PRs, at least one approval when collaborators exist, dismiss stale approvals, require conversation resolution, block force pushes and branch deletion, and require stable CI checks only after configured. Solo maintainers should use deliberate self-review rather than inventing reviewers. Prefer squash merge. Keep secrets out of source and use least-privilege tokens. Enable Dependabot security updates and secret scanning when available. This document does not mean settings are enabled.
