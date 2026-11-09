# RAD Art AI Execution Playbook

## Purpose and authority

This document defines how AI coding agents collaborate on RAD Art. It does not replace the approved product strategy or reorder the seven-phase roadmap.

**Approved product direction:** premium, discovery-first contemporary art platform.  
**Visual direction:** Contemporary Art Editorial.  
**North-star outcome:** qualified artwork-to-artist connections per month.  
**Primary source of truth:** `ROADMAP.md`, GitHub delivery tracker [#30](https://github.com/AminBrave/rad-art-marketplace/issues/30), milestone issues [#60–#65](https://github.com/AminBrave/rad-art-marketplace/issues/60) and task issues [#66–#75](https://github.com/AminBrave/rad-art-marketplace/issues/66).  
**Architecture:** Laravel modular monolith + React 18/Vite + React Router + MySQL.  
**Current implementation status:** see the historical MVP 2 sections in `ROADMAP.md`; the roadmap below is planned, not implemented by this documentation change.

Read `AGENTS.md` and `SKILLS.md` before using this playbook.

## The two-day AI execution window

The owner wants the next work accelerated into a two-day AI-assisted sprint. Treat two days as a strict coordination/timebox target—not as permission to compress the approved roadmap estimates, skip code review, waive security, or claim all seven milestones are complete.

The six milestones remain in their approved order:

1. M00 Foundation — 1–2 weeks.
2. M01 Design system — 2 weeks.
3. M02 Discovery pages — 2–3 weeks.
4. M03 Curation — 2 weeks.
5. M04 Artist experience — 2 weeks.
6. M05 Launch readiness — 2–3 weeks.

AI agents can reduce implementation/research overhead and work on independent issues concurrently. The full scope includes browser QA, editorial decisions, production-host verification, legal review, and restore testing; those cannot be honestly guaranteed within two calendar days. At the end of the sprint, report completed issues with evidence and leave everything else open. Do not change roadmap estimates or milestone exit criteria to make the sprint appear successful.

### Day 1 — Stabilize and establish shared foundations

- Kickoff: confirm latest `main`, review issues and open PRs, inspect repository instructions, assign issue owners and dependency order.
- Parallel work where files do not overlap: T01 route fix/tests, T02 lockfiles/CI, T03 count/price semantics.
- QA agent independently prepares role/route regression matrix and runs focused checks.
- Orchestrator integrates only reviewed changes; resolve shared-file conflicts deliberately.
- Begin M01 design-token audit after M00 risks are understood; do not redesign pages against unstable component contracts.

### Day 2 — Deliver bounded vertical slices and verify

- Complete/review M00 tasks and record remaining external QA blockers.
- Implement M01 shared design-system changes before dependent page redesign.
- Frontend and backend agents may start independent M02/M03/M04 work only after their API/data contracts are agreed; isolate worktrees and avoid shared-file edits.
- QA/reviewer agents run independent tests, inspect security/privacy and check responsive/RTL behavior.
- Prepare M05 SEO/operations work as separate bounded issues; production/legal/restore evidence must be performed by authorized people/environments.
- End-of-window report: merged/PR-ready/blocked/open issues, exact test evidence, risks and next actions.

If the dependency chain or review capacity prevents safe parallelization, reduce the amount of work attempted—not the quality gate.

## Agent roles and responsibility boundaries

| Role | Owns | Must not |
|---|---|---|
| Orchestrator / product architect | Scope, issue assignment, dependencies, shared contracts, integration and status | Change roadmap or silently expand scope |
| Backend specialist | Laravel domain logic, migrations, API, requests, policies, queries and backend tests | Change frontend UX outside agreed API contract |
| Frontend specialist | React routes/components, API integration, shared UI and frontend tests | Treat client guards as security |
| Design/UX reviewer | Editorial hierarchy, visual consistency, RTL/LTR, responsive interaction and accessibility review | Invent content or change approved brand direction |
| QA/security reviewer | Independent test plans, regression, role/ownership/privacy/upload checks and evidence | Approve own implementation as sole reviewer |
| Code reviewer | Changed-line review, maintainability, data integrity, security, scope and test quality | Accept unverified claims or generated code without inspection |

One person/agent may cover more than one specialist role if capacity is limited, but the implementation author cannot be the only reviewer.

## Task ownership and dependencies

| Milestone | Issue | Primary role | Dependency |
|---|---|---|---|
| M00 | #66 Route fix + browser tests | Frontend + QA | Existing route/API inspection |
| M00 | #67 Reproducible CI | Platform/backend | Lockfile generation |
| M00 | #68 Count + price semantics | Backend + frontend | Confirm business semantics with owner |
| M01 | #69 Design system | Frontend + design | M00 foundation |
| M02 | #70 Homepage + catalogue | Frontend + design | M01 shared tokens |
| M02 | #71 Artwork + artist pages | Frontend + backend | M01; verify data contracts |
| M03 | #72 Collections + editorial | Backend + frontend | Domain/API contract first |
| M04 | #73 Artist onboarding | Frontend + backend | Existing profile/artwork APIs |
| M05 | #74 SEO/shareability | Frontend + backend | Stable public slugs and publication rules |
| M05 | #75 Observability/privacy/release | Platform + QA/security | Hosting access and owner approvals |

The existing MVP 2 QA issues #26–#29 remain open until independently verified; map them to M00/M05 and do not duplicate or close them merely because a new milestone exists.

## Isolation and parallel-work rules

1. Use one task issue per branch/worktree and one focused PR per issue.
2. Branch from the latest approved `main`; target PRs at `main`. The `feat/premium-discovery-roadmap` branch contains planning/docs and must not become a long-lived mixed-feature branch.
3. Never assign two agents to edit the same files concurrently. Shared API contracts, migrations, design tokens and route registries require an agreed owner and integration order.
4. Before coding, every agent posts: issue, intended outcome, files/domains to inspect, files likely to change, dependencies, tests and explicit exclusions.
5. If a task requires another issue's changes, wait for the dependency PR or use a documented temporary interface agreed by the orchestrator.
6. Use isolated worktrees, never a shared dirty working tree. Do not let formatters, code generators or dependency installers mutate the same files concurrently.
7. After rebasing/merging, rerun focused tests and inspect the final diff. Conflict resolution is new code and requires review.
8. No agent pushes directly to `main`, merges its own PR, changes branch protection, or closes a milestone without owner approval and evidence.

## Standard task prompt contract

Use this structure for each coding agent:

```text
You are the [ROLE] agent working on RAD Art.

Read AGENTS.md, SKILLS.md, README.md, ROADMAP.md, docs/ai-execution-playbook.md,
the assigned milestone issue and task issue before editing.

Task: [ISSUE NUMBER + TITLE]
Goal: [one measurable outcome]
Allowed scope: [specific domain/files]
Dependencies: [completed issue/contract]
Acceptance criteria: [copy the issue checklist]
Explicit exclusions: [features/files not to change]

First inspect current implementation and tests. Return a short plan and likely
files before editing. Implement the smallest complete vertical slice. Preserve
Laravel server-side authorization, ownership, validation and privacy. Reuse
existing architecture and design tokens. Do not add dependencies or refactor
unrelated code without approval.

Add/update tests for success, invalid input, permissions/ownership and edge cases.
Update the existing source-of-truth docs and changelog where applicable.
Run the focused checks, then available repository quality gates. Report exact
commands, results, commit SHA, files changed, limitations and checks not run.
Do not mark any issue complete. Do not claim unexecuted browser, production,
accessibility or performance checks. Stop and ask if scope or business semantics
are ambiguous.
```

## Engineering standards

### Architecture and data

- Keep Laravel authoritative for authentication, authorization, validation, ownership, publication and moderation.
- Prefer a small vertical slice over broad speculative abstractions.
- Do not introduce microservices, a new frontend framework, global state framework, Redis, dedicated search engine, generic CMS or new runtime dependencies without measured need and documented approval.
- Inspect current schema before migrations. Use foreign keys, unique constraints, indexes supported by query patterns, transactions for atomic multi-step writes and rollback/data-loss review.
- Public discovery exposes public artist fields, published collections and approved artworks only.
- Keep private artwork originals and policy-protected image delivery. Never expose private storage paths.
- Inquiry data is private; do not log inquiry message bodies, emails, tokens or session identifiers.
- Price and availability are separate concepts. Distinguish null/undisclosed from numeric zero; confirm business semantics before coding.

### Frontend and design

- Keep React Router centralized and route URLs stable/shareable.
- Reuse semantic design tokens and existing Radix/shared components.
- Artwork is the focal point; avoid generic SaaS/dashboard decoration.
- Keep Persian RTL as default, Latin metadata LTR where needed, and use logical CSS properties.
- Include loading, empty, error, success, disabled and unauthorized states.
- Consider keyboard access, visible focus, semantic labels, contrast, reduced motion, responsive layouts and meaningful artwork alternatives.

### Security and privacy

- UI hiding is not authorization. Test Laravel policy/middleware behavior directly.
- Validate file content/type/size/dimensions server-side; never trust client MIME or filename.
- Escape user content and avoid unsafe HTML.
- Keep secrets in environment configuration; do not commit credentials, production data or private media.
- Do not add analytics collection before the provider, legal basis, consent, retention and minimization gate is approved.

## Required verification

Run the relevant focused tests first. Run the configured repository gates when environment/dependencies permit:

```bash
composer test
composer lint
npm run lint
npm run build
```

Also run Playwright critical journeys where configured. For migrations, test fresh install and rollback where safe. For visual work, record actual browser/viewport evidence. For performance work, compare repeatable measurements on the same environment and build; do not infer performance from code or a production build.

Report:
- commit SHA and PR link;
- issue and milestone;
- changed files and behavior;
- tests/commands actually run and results;
- CI workflow links;
- manual/browser/device/host checks not run;
- known risks and follow-up issues.

## Milestone completion rules

A task issue is complete only when its acceptance checklist is met, tests and docs are updated, CI evidence is linked and independent review approves it.

A milestone issue is complete only when:
- all required child issues are closed;
- milestone exit criteria are met;
- evidence is attached to the milestone issue;
- `ROADMAP.md`, `README.md`, QA/release docs and tracker #30 are synchronized;
- all remaining risks/deferred items are explicit and accepted by the product owner.

Do not close #60–#65 based on agent output, generated code, a merged PR or CI alone. Keep unverified manual and production checks unchecked.

## Change-control policy

The six-phase roadmap and premium discovery positioning are approved. If implementation reveals a material change to product scope, data semantics, architecture, user privacy, cost, hosting requirements or milestone order, stop and request product-owner approval. Do not silently replace the plan.


## Messaging milestone addendum — M05

Messaging is now approved scope. Read milestone [#77](https://github.com/AminBrave/rad-art-marketplace/issues/77) and tasks [#78–#84](https://github.com/AminBrave/rad-art-marketplace/issues/78).

### Messaging specialist workstreams
- Domain/API and participant authorization: #78.
- Inbox/thread UI: #79.
- Replies, edits/deletes, reactions and states: #80.
- Real-time delivery, typing/presence and fallback: #81.
- Secure private attachments: #82.
- In-app and optional email notifications: #83.
- Reporting, blocking, anti-spam and moderation: #84.

### Mandatory messaging safeguards
- Do not build on the current inquiry read/archive endpoints as if they were a message API; define and review a versioned conversation/message contract.
- Agree on conversation identity, inquiry relationship, deletion/retention semantics and event payloads before parallel backend/frontend work.
- All conversation, message, attachment, notification and report operations are participant-scoped and server-authorized.
- Use database persistence as the source of truth. Realtime events must handle reconnect, duplicate events, retry and polling fallback.
- Typing/presence is ephemeral and must not reveal user activity by default without an approved privacy decision.
- Attachment delivery is private and authorization-checked; no public storage URLs.
- Email notifications are opt-in/configurable and remain disabled until production delivery and unsubscribe are verified.
- Do not claim end-to-end encryption, message delivery, online presence or malware scanning unless the implementation genuinely provides it.
- Test IDOR, blocked participants, rate limits, abuse/report workflows, notification leakage, attachment access and RTL/keyboard behavior.
