# GitHub task-management setup

This is an operator checklist for the intended GitHub configuration. It is not evidence that the board, labels or repository settings already exist.

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

Add the repository's active issues to the Project as appropriate. Do not convert all 41 product decisions into work items. #150 remains a decision register, not a task backlog. Add #152 and #153 while this setup work is active.

## 2. Create repository labels

In **Issues → Labels**, create:
- Types: type:epic, type:feature, type:bug, type:chore, type:security, type:qa, type:docs, type:spike.
- Priorities: priority:p0, priority:p1, priority:p2, priority:p3.
- Areas: area:backend, area:frontend, area:product, area:design-rtl, area:security, area:tooling, area:docs, area:quality.
- Optional triage: status:needs-decision, status:blocked.

Use one type, one priority and one primary area per issue. Prefer the Project Status field over status labels; do not maintain conflicting states. Labels are filters, not permission grants.

## 3. Operating rules

- Backlog: captured but not yet authorized/ready.
- Ready: explicit authorization, bounded MVP, acceptance criteria, owner and dependencies are clear.
- In progress: work has actually started.
- In review: a linked PR or investigation output is under review.
- Blocked: the issue records the blocker and next action.
- Done: acceptance criteria are met, required verification is recorded honestly, and implementation PRs are merged.

A task linked to a product decision must include its decision ID and direct canonical comment link. A small decision may be one delivery issue; a larger decision may have a parent epic and child tasks. Each task states its own MVP boundary and out-of-scope work. Standalone bugs and maintenance tasks need no decision ID.

## 4. Issue and branch conventions

Use issue prefixes and titles defined in AI/TASK-MANAGEMENT.md. Examples:
- [FEAT] D02 — Improve buyer discovery entry point
- [EPIC] D06 — Deliver buyer personalization MVP
- [BUG] Fix artwork visibility regression

Use short-lived branches from the current main, named with the task type and GitHub issue number (for example feat/123-buyer-discovery or docs/153-decision-kanban). Link each PR to its issue. Never assume a branch is integrated until GitHub confirms the merge.

## 5. Protect main

In **Settings → Branches** or repository rulesets, consider:
- Require a pull request before merging.
- Require review when multiple collaborators are available; for solo work use a deliberate self-review checklist.
- Require conversation resolution.
- Block force pushes and branch deletion.
- Require only stable CI checks that actually exist.
- Prefer squash merging for one-task/one-PR work when suitable.

Do not claim a rule is enabled without inspecting the live repository settings.

## 6. Security and project hygiene

Where available:
- Enable Dependabot alerts and security updates.
- Enable secret scanning and push protection.
- Use least-privilege GitHub tokens and never commit .env, API keys or personal data.
- Review Actions permissions and grant the minimum required token permissions.
- Keep production deployment secrets in GitHub/Vercel environment secrets, not source files.

## 7. Capability boundary

The current connected GitHub workflow can manage repository files, issues, branches and pull requests, but it does not expose GitHub Projects board creation/configuration actions. If the board cannot be created from the available GitHub UI/integration, the repository owner must create the Project and fields manually using this checklist. Do not claim the Project exists until its live URL and fields have been verified.