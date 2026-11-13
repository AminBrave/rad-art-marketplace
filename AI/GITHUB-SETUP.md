# GitHub repository setup checklist

This file is an operator checklist, not a claim that GitHub metadata/settings are already configured.

## 1. Create milestones

In GitHub: **Issues → Milestones → New milestone**. Create these in order and use the descriptions/exit criteria from `AI/ROADMAP.md`:

| Title | Description |
|---|---|
| M0 — AI-ready foundation | Free-chat startup contract, compact context command, resumable handoff, issue/PR conventions |
| M1 — Product baseline | Evidence-backed product-flow audit, confirmed MVP scope, target segments and measurable outcomes |
| M2 — Discovery experience | Product-owner-approved artist discovery requirements and verified vertical slices |
| M3 — Artist identity and contact | Approved artist profile, contact, privacy, authorization and abuse-handling journeys |
| M4 — Release readiness | Security/privacy review, quality evidence, operations notes and release/rollback readiness |

Assign #149 to M0 and #150 to M1 once the milestones exist. Do not place future issues into a milestone until their scope is approved.

## 2. Create labels

In GitHub: **Issues → Labels**. Create the labels from the taxonomy in `AI/ROADMAP.md`:
- Types: `type:epic`, `type:feature`, `type:bug`, `type:chore`, `type:security`, `type:qa`, `type:docs`, `type:spike`.
- Priorities: `priority:p0`, `priority:p1`, `priority:p2`, `priority:p3`.
- Status: `status:ready`, `status:blocked`, `status:needs-decision`.
- Areas: `area:backend`, `area:frontend`, `area:product`, `area:design-rtl`, `area:security`, `area:tooling`, `area:docs`, `area:quality`.

Use one type, one priority and one primary area per issue. Add status labels only when useful. The issue templates propose default type/priority labels; templates do not create missing labels by themselves.

## 3. Protect main

In GitHub: **Settings → Branches → Add branch protection rule** for `main` (or the current ruleset UI):
- Require a pull request before merging.
- Require at least one approval when there are multiple collaborators; for a solo maintainer use a deliberate self-review checklist instead.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution.
- Block force pushes and branch deletion.
- Require CI checks only after the project has stable, relevant workflows. Do not enable required checks that do not exist.
- Prefer squash merging for one-issue/one-PR work; disable merge commits if not needed.

## 4. Security and project hygiene

Where available on the repository plan:
- Enable Dependabot alerts and security updates.
- Enable secret scanning and push protection.
- Use least-privilege GitHub tokens and never commit `.env`, API keys or personal data.
- Review Actions permissions and grant the minimum required token permissions.
- Keep production deployment secrets in GitHub/Vercel environment secrets, not source files.

## 5. Lightweight project board

If using GitHub Projects, create one board named **Rademan Roadmap** with:
- Status: Backlog, Ready, In progress, In review, Blocked, Done.
- Priority: P0, P1, P2, P3.
- Milestone: M0–M4.
- Type and Area fields aligned with `AI/ROADMAP.md`.

Do not duplicate the same workflow in several boards. Issues remain the source of truth; PRs link back to issues.
