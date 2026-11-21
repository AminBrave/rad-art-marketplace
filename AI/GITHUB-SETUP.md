# GitHub task-management setup

This is an operator checklist for the intended GitHub configuration. It is not evidence that the board, labels or repository settings already exist. Verify the live GitHub UI before recording any item as complete.

## 1. Create the single Kanban Project

Create one GitHub Project named **Rademan Workboard** (not “Rademan Roadmap”). Use the repository's Issues and Pull Requests as the source of truth.

Configure one Status field with these options, in order:
1. Backlog
2. Ready
3. In progress
4. In review
5. Blocked
6. Done

Add these fields:
- **Priority:** P0, P1, P2, P3.
- **Type:** Epic, Feature, Bug, Chore, Security, QA, Docs, Spike.
- **Area:** Backend, Frontend, Product, Design/RTL, Security, Tooling, Docs, Quality.
- **Decision ID:** text; enter D01–D41 only when the task derives from a product decision.

Do not add a Milestone field or create M0–M4 product milestones. Use linked parent/child issues for task breakdown and GitHub's native Assignees for ownership. Use saved views only when they help inspect the same board; do not create separate boards or duplicate status systems.

Add active delivery issues selectively. Do not convert all 41 product decisions into work items. #150 remains a decision register, not a task backlog. Include #152 and #153 while their setup work is active; do not reopen #153 merely to show it on the board.

## 2. Safe native Project automation

Configure automation in the Project's Workflows settings, not with repository GitHub Actions. This keeps the manual-only Actions policy intact.

Recommended baseline:
- **Auto-add repository issues:** add new delivery issues matching the repository filter, excluding the canonical decision register #150. Review the filter in the Project UI before enabling it; confirm a test issue is added and #150 is not.
- **Auto-add repository pull requests:** add PRs from this repository so review work is visible alongside delivery issues.
- **Auto-archive:** optional; archive completed items only after an owner-selected retention period, and only if this does not hide work needed for audit or follow-up.

Keep lifecycle decisions deliberate:
- Do not automatically move an issue to Ready. A human must confirm explicit authorization, a bounded MVP, acceptance criteria, dependencies and ownership.
- Do not automatically move an item to Done solely because a PR merged or an issue closed. Confirm acceptance criteria and required verification first; a merged PR may be only one part of a larger issue.
- Set In progress, In review and Blocked deliberately from observed work. A Blocked item must state its blocker and next action.
- Never turn product decisions in #150 into delivery tasks or treat a workflow as implementation permission.

If the Project UI offers only a subset of these workflows, configure only the safe available subset and record the actual configuration. Workflow availability and filters can vary; verify the options shown in the live Project UI rather than assuming a specific trigger exists.

## 3. Create repository labels

In Issues → Labels, create:
- Types: type:epic, type:feature, type:bug, type:chore, type:security, type:qa, type:docs, type:spike.
- Priorities: priority:p0, priority:p1, priority:p2, priority:p3.
- Areas: area:backend, area:frontend, area:product, area:design-rtl, area:security, area:tooling, area:docs, area:quality.
- Optional triage: status:needs-decision, status:blocked.

Use one type, one priority and one primary area per issue. Prefer the Project Status field over status labels; do not maintain conflicting states. Labels are filters, not permission grants. Apply this taxonomy only after the labels exist; template frontmatter does not create labels.

## 4. Operating rules

- **Backlog:** captured but not yet authorized/ready.
- **Ready:** explicit authorization, bounded MVP, acceptance criteria, owner and dependencies are clear.
- **In progress:** work has actually started.
- **In review:** a linked PR or investigation output is under review.
- **Blocked:** the issue records the blocker, owner if known, and next action.
- **Done:** acceptance criteria are met, required verification is recorded honestly, and implementation PRs are merged.

A task linked to a product decision must include its decision ID and direct canonical comment link. A small decision may be one delivery issue; a larger decision may have a parent epic and child tasks. Each task states its own MVP boundary and out-of-scope work. Standalone bugs and maintenance tasks need no decision ID.

## 5. Issue, PR and branch conventions

Use issue prefixes and titles defined in AI/TASK-MANAGEMENT.md. Examples:
- [FEAT] D02 — Improve buyer discovery entry point
- [EPIC] D06 — Deliver buyer personalization MVP
- [BUG] Fix artwork visibility regression
- [DOCS] Clarify contributor workflow
- [QA] Establish a reproducible performance baseline

Use short-lived branches from current main, named with task type and issue number (for example docs/152-kanban-workflow). Link each PR to its issue. Use Closes #123 only when the PR fully completes the issue; otherwise use Refs #123 or Part of #123. Never assume a branch is integrated until GitHub confirms the merge.

Issue templates should capture source decision/authorization where applicable, current baseline, MVP and exclusions, acceptance criteria, risks/dependencies and a verification plan. A verification plan does not authorize running checks. Project Priority, Type, Area and Decision ID fields should agree with the issue body and labels.

## 6. CI and protect main

### Committed workflow configuration

- **Repository policy: every GitHub Actions workflow is manual-only.** Each workflow must declare workflow_dispatch as its only trigger. Do not add push, pull-request, schedule, release, workflow-run or other automatic triggers.
- .github/workflows/color-accessibility.yml exposes frontend accessibility/regression and backend regression jobs for manual dispatch only. Expected job/check names are frontend-accessibility and backend-regression.
- .github/workflows/cleanup-workflow-runs.yml is also manual-dispatch-only; when explicitly run, it retains a 14-day investigation window plus up to 20 completed runs.
- A workflow may be manually dispatched only after the user explicitly authorizes that specific run. Opening/updating a PR, asking for a review, or saying “finish it” is not authorization to run CI.
- Workflow YAML is configuration, not evidence that a run completed successfully. Never dispatch or rerun a workflow merely to verify a change.

### Live repository settings — owner action

The live repository audit on 2026-11-19 found main unprotected (protected: false; protection disabled; no required status checks). The connected GitHub integration available for this task supports read-only inspection of branch protection/rulesets, but not writing those settings. An owner must configure and then verify the following in Settings → Rules → Rulesets or Settings → Branches:

- Target main.
- Require a pull request before merging.
- Require conversation resolution.
- Block force pushes and branch deletion.
- Require frontend-accessibility and backend-regression only after their names have appeared as successful checks on a real PR.
- For a solo-maintained repository, do not require an independent approving review that cannot be provided; use the PR checklist and deliberate self-review instead.
- Keep squash merging as the preferred one-issue/one-PR integration method.

Do not claim branch protection is enabled until the live settings have been re-read and verified. Do not make checks required before their first successful run, or merges may become blocked.

## 7. Dependency and security automation

- .github/dependabot.yml configures monthly npm, Composer and GitHub Actions updates, with bounded open-PR counts and grouped minor/patch updates.
- Enable Dependabot alerts and security updates in repository settings where available.
- Enable secret scanning and push protection where the repository plan supports them.
- Use least-privilege GitHub tokens and never commit .env, API keys or personal data.
- Review Actions permissions and grant the minimum required token permissions.
- Keep production deployment secrets in GitHub/Vercel environment secrets, not source files.

No CODEOWNERS file is configured: the current repository appears to be maintained by one owner, so assigning all paths back to that same owner would add little review value. Add CODEOWNERS when distinct maintainers or teams own specific areas.

## 8. Capability boundary

The connected GitHub workflow can manage repository files, issues, branches and pull requests, and can read branch-protection/ruleset settings. It does not expose GitHub Projects board creation/configuration, Project workflow configuration, repository label creation or branch-protection/ruleset write actions. The repository owner must complete those settings in GitHub's UI. Do not claim the Project, Project workflows, labels, ruleset, branch protection, Dependabot security alerts or secret-scanning settings are active until their live state is verified.
