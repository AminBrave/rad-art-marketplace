# Rademan task management

This document defines how approved work is captured and delivered. **It is not a product roadmap.** Rademan does not use product-phase milestones (M0, M1, M2, etc.) to sequence its product vision. The active planning view is one decision-driven GitHub Kanban board.

## 1. Source-of-truth model

| Record | Purpose | Canonical location |
|---|---|---|
| Product decision | Stable statement of product intent and rationale; may describe future direction | The standalone decision comment linked from #150 |
| Delivery issue | Authorized, bounded work to be done; linked to its source decision when applicable | GitHub issue |
| MVP scope | Smallest useful, testable first delivery for that decision/task | The delivery issue body |
| Implementation evidence | What changed and what was actually verified | PR, commits, tests/CI evidence and relevant source |
| Progress | Current execution state | The single Rademan Workboard Kanban Project |

GitHub issue numbers are permanent task identifiers. Decision IDs (D01–D41) are permanent product-intent identifiers. Never treat them as interchangeable.

## 2. Decision → task → MVP

A product decision is not automatically a task, backlog commitment, architecture specification or permission to implement.

When the product owner explicitly authorizes work based on a decision:

1. Retrieve only that decision's canonical comment from #150. Read another decision only when the selected record explicitly references it or a real technical dependency is evidenced.
2. Inspect the current repository and describe the existing behavior as implemented, partial, missing or unknown.
3. Create or update a focused GitHub issue and link the canonical decision comment.
4. Define the **MVP for this decision/task**: the smallest coherent, useful, testable slice that satisfies the authorized outcome.
5. State exclusions and later possibilities separately. They are not silently included in the MVP.
6. If the decision is small enough, one delivery issue can represent the whole task and contain its MVP scope.
7. If the decision is too large for one reviewable change, use a parent [EPIC] issue for the decision-level outcome and create child delivery issues for independently reviewable MVP slices. Link every child to the parent and source decision.
8. If an implementation requires more than one decision, record each relevant decision link and obtain explicit authorization for the combined scope. Do not infer dependencies from numbering or topic similarity.

A decision may remain in the vision register indefinitely without creating any task. The owner may also authorize a standalone bug, maintenance, quality or documentation task that has no product decision ID.

## 3. Delivery issue naming

Use a clear type prefix, include the decision ID when relevant, and let GitHub supply the unique issue number.

Examples:
- [FEAT] D02 — Improve buyer discovery entry point
- [EPIC] D06 — Deliver buyer personalization MVP
- [FEAT] D06 — Add explicit buyer preference controls
- [BUG] Fix artwork visibility regression
- [CHORE] Simplify AI context bootstrap
- [SPIKE] Investigate image moderation options

Supported prefixes:
- [DECISION] — a product decision record when a separate issue is genuinely needed; do not duplicate the canonical #150 record by default.
- [EPIC] — a decision-level outcome requiring multiple child issues.
- [FEAT] — a user-visible delivery slice.
- [BUG] — a reproducible defect or regression.
- [CHORE] — maintenance and developer experience.
- [SEC] — security, privacy, trust or abuse-risk work.
- [QA] — quality, test, accessibility or performance work.
- [DOCS] — documentation and workflow work.
- [SPIKE] — bounded investigation ending in evidence and a recommendation.

Do not put M0–M4 or other product-phase labels in new task titles. Do not create a second task-numbering scheme; use GitHub issue numbers.

## 4. Required delivery issue structure

Every authorized delivery issue should include:

- **Source decision(s):** stable decision ID(s) and direct canonical link(s), or “Standalone task”.
- **Authorization:** what the product owner explicitly approved and when; link to the authorization when available.
- **Problem and outcome:** who needs what and why.
- **Current baseline:** source-backed implemented / partial / missing / unknown status.
- **MVP scope:** the smallest deliverable included in this issue.
- **Acceptance criteria:** observable outcomes, including relevant negative, permission, empty, error and edge cases.
- **Out of scope:** explicit exclusions and later possibilities.
- **Dependencies and risks:** only evidenced or owner-confirmed dependencies.
- **Verification plan:** focused checks to run after separate permission is granted; a plan is not permission.
- **Related work:** parent/child issues, blockers and PRs.

For a parent epic, define the decision-level outcome and MVP boundary, then link its child issues. Child issues must each be independently understandable and reviewable.

## 5. Kanban board

Create one GitHub Project named **Rademan Workboard**. Issues and pull requests remain the source of truth; the board is a live execution view, not a copied backlog or product roadmap.

### Status options

Use one Status field with these options in this order:

1. Backlog
2. Ready
3. In progress
4. In review
5. Blocked
6. Done

### Additional fields

- **Priority:** P0, P1, P2, P3.
- **Type:** Epic, Feature, Bug, Chore, Security, QA, Docs, Spike.
- **Area:** Backend, Frontend, Product, Design/RTL, Security, Tooling, Docs, Quality.
- **Decision ID:** text field; use D01–D41 when applicable, otherwise leave blank.

Use GitHub's native Assignees for ownership, Labels for filtering, and linked issues/PRs for dependencies and delivery evidence. Do not add a Milestone field or create product-phase milestones.

### Movement rules

- New, untriaged issues enter **Backlog**.
- Move to **Ready** only when authorization is clear, the MVP boundary and acceptance criteria are explicit, dependencies are understood, and an owner is assigned.
- Move to **In progress** when implementation or investigation actually begins.
- Move to **In review** when a reviewable PR is open and linked, or when a defined investigation output is under review.
- Move to **Blocked** only with a written blocker, its owner (if known), and the next action.
- Move to **Done** only when acceptance criteria are met, required verification is honestly recorded, and any implementation PR is merged. An issue with unrun required verification is not Done.
- Do not use labels to maintain a second, conflicting status system. Prefer the Project Status field.
- A board column, label, priority or issue creation never grants implementation authorization.

## 6. Priority and labels

Priority is task urgency/value, not a roadmap phase:
- P0 — urgent incident, critical security or service-blocking work.
- P1 — high-impact, time-sensitive work.
- P2 — normal planned work.
- P3 — low-priority improvement or explicitly deferred work.

Use one primary type, one priority and one primary area label per issue. Suggested label taxonomy:
- Type: type:epic, type:feature, type:bug, type:chore, type:security, type:qa, type:docs, type:spike.
- Priority: priority:p0, priority:p1, priority:p2, priority:p3.
- Area: area:backend, area:frontend, area:product, area:design-rtl, area:security, area:tooling, area:docs, area:quality.
- Optional triage labels only when useful: status:needs-decision, status:blocked. Do not use them to contradict the board Status field.

## 7. Operating loop

1. Find the relevant decision or existing task; do not duplicate it.
2. Confirm explicit authorization before converting product intent into implementation.
3. Inspect current source and live GitHub state.
4. Define the issue's MVP, exclusions, acceptance criteria and dependencies.
5. Add the issue to Rademan Workboard and set Status, Priority, Type, Area and Decision ID.
6. Create a task branch from the current main; keep one bounded outcome per branch.
7. Open a PR linked to the issue; report actual verification and what was not run.
8. Merge only with explicit owner authorization and after the required review/check policy is satisfied.
9. Move the issue to Done only when its completion criteria are actually met.

## 8. Non-negotiable AI guardrails

- A decision ID is a pointer to one standalone intent record, not an instruction to read all decisions.
- Do not read unrelated decisions by default.
- A decision does not imply MVP priority, timing, implementation permission, architecture or dependencies.
- Do not create implementation issues from every vision decision automatically.
- Do not expand an authorized MVP with adjacent decisions or speculative platform features.
- If a task's scope changes materially, stop and ask for authorization or create a separately approved issue.
- Distinguish confirmed facts, hypotheses, assumptions, unknowns and proposals.
- Never claim tests, builds, lint, CI, security review or deployment passed without direct evidence.
- Never run verification or initiate CI without explicit permission for the specific execution.

## 9. Historical records

Historical issues, PRs, commits and former M0–M4 references remain valid historical records. Do not renumber GitHub issues, rewrite shared history, or rename old completed work merely to make history look current. New work follows this decision-driven task model.