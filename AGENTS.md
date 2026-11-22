# Rademan Agent Operating Contract

This is the single entry point and authoritative operating contract for AI work in this repository. The user should only need to point an AI to this file and describe the task. The AI is responsible for selecting the minimum relevant project context, GitHub records and task-specific skills.

Explicit user instructions take precedence over this file, except that the AI must still respect applicable safety and platform constraints. This file takes precedence over individual skills and generated suggestions.

## 1. Project identity and source of truth

## Instruction and evidence map

Keep each layer focused; do not copy whole policies between files.

| Layer | Owns | Does not own |
|---|---|---|
| AGENTS.md | Entry point, authority/permission rules, evidence standards, global engineering invariants and task routing | Long task-specific procedures or duplicated project reference material |
| AI/ | Durable Rademan context, product/architecture decisions, governance, delivery workflow and human-facing documentation | Proof of implementation or a second copy of skill procedures |
| .agents/skills/ | Reusable, task-specific procedures, checklists and outputs | Overrides to this contract, global permissions or a competing delivery lifecycle |
| Source, tests, configuration and runtime | Evidence of actual implementation and behavior | Product intent or authorization |
| GitHub issues, PRs and Workboard (when configured) | Authorization records, task scope, review evidence and live progress | A substitute for source inspection or permission |

Authority is purpose-specific: current explicit owner direction defines product intent and authorized task scope; this contract defines default safety boundaries and explicit permission gates; latest main source/runtime establishes implementation facts; live GitHub records establish task/review status. Historical vision records are consulted only when the owner explicitly selects them. AI/SESSION.md is only a concise handoff and never outranks those sources. Skills and playbook guidance must defer to their owning project documents.

- Rademan's current product direction is a mobile-first, installable visual-content platform connecting artists and buyers through artwork discovery and direct messaging. See `AI/PROJECT.md`.
- Recorded stack: PHP 8.3+ and Laravel 13; React 18, JavaScript, React Router 7, TanStack Query 5 and Vite. Confirm installed versions in manifests before relying on version-specific APIs.
- Rebuild the design system from first principles; retain only the five brand color anchors documented in `AI/PROJECT.md`. Do not treat the legacy RAD design system or component catalogue as a constraint.
- Do not assume checkout, orders, shipping, payouts, subscriptions, commissions, booking, escrow or other commerce capabilities exist unless current source and approved product decisions prove they do.
- Implementation facts come from the latest main source, migrations, tests, configuration and observed runtime behavior. Product intent comes from current owner direction and `AI/PROJECT.md`. Task status comes from live GitHub issues/PRs and the Rademan Workboard Kanban Project. Chat history and model memory are not authoritative.

## 1A. Rademan product refactor authority

- The current owner-approved product direction is recorded in `AI/PROJECT.md`; the target experience direction is in `AI/DESIGN-SYSTEM.md`; the source-backed reconstruction baseline is in `AI/RECONSTRUCTION/`.
- For implementation facts, inspect the latest `main` branch and relevant current source, migrations, configuration and tests. Record the inspected main SHA. Do not use stale documentation, old skills, historical issue text or old permission statements as implementation authority when they conflict with latest main or current owner direction.
- Update repository documentation and agent skills as derived guidance whenever they conflict with the refactor. Retire or clearly label legacy catalogues and playbooks rather than silently treating them as design constraints.
- Product direction does not authorize weakening backend authorization, privacy controls, safety controls or platform constraints. Inspect actual server-side enforcement; never bypass it because a document is stale.
- “Inquiries” is the existing buyer–artist messaging subsystem. Preserve its identity, state, context, data contracts and access boundaries; do not replace it with a contact form or a new inbox.
- Target experiences: public Discover, Buyer Studio, Artist Studio and Admin Console. Mobile-first installable PWA is the target; do not claim PWA/offline capabilities without source and runtime evidence.
- Retain only the brand color anchors Ivory #F7F5F0, Charcoal #242320, Terracotta #A64F31, Sand #D8C9B7 and Olive #536052. Redesign all other visual-system foundations.

## 2. Non-negotiable permissions

- **GitHub Actions are manual-only across this repository. Every workflow must use `workflow_dispatch` as its only trigger; do not add `push`, `pull_request`, `schedule`, `release`, `workflow_run`, or any other automatic trigger.**
- **Never dispatch a workflow, rerun a workflow, approve a workflow run, or otherwise initiate CI unless the user explicitly authorizes that specific run.**
- **Never run tests, lint, formatting checks, builds, type checks, browser automation, Lighthouse, accessibility scanners, security scanners, migrations, seeders, Artisan verification commands or other executable verification unless explicitly authorized.**
- A request to implement, debug, review, commit, push, create a branch or open a PR is not permission to execute verification or CI.
- Do not install packages, start/stop services, clear caches, mutate databases, deploy, release, merge, force-push, rewrite Git history, delete branches or change repository settings without explicit authorization.
- Read-only inspection of source, configuration, Git metadata, issues, PRs and workflow definitions is allowed when relevant.
- If verification is not authorized, do not execute it. State that it was not run; provide suggested local commands only when useful.
- Never claim a command, test, workflow, reproduction, review, deployment or verification succeeded without direct evidence.

## 3. Startup: choose context automatically

At the start of a task, read this file first. Then classify the task and select only the context that materially helps. The user should not need to know or name these paths.

### Context routing

- Any task: inspect the live GitHub issue/PR if supplied; check for related open work before creating duplicates.
- Product behavior, scope or user journey: read `AI/PROJECT.md`; read `AI/TASK-MANAGEMENT.md` for issue/MVP/Kanban rules; retrieve a historical #150 record only when the owner explicitly names it.
- Cross-chat continuation or project-wide planning: read `AI/SESSION.md` and the referenced live issue/PR.
- Product discovery, opportunity assessment, customer research or experiment design: load `.agents/skills/product-discovery/SKILL.md`; read `AI/PROJECT.md`; retrieve a historical #150 record only when explicitly selected by the owner.
- Feature planning, requirements, acceptance criteria or delivery slicing: load `.agents/skills/feature-planning/SKILL.md` and follow `AI/TASK-MANAGEMENT.md`.
- UI/UX, user journeys, information architecture, interaction design, visual design or design-system changes: load `.agents/skills/ui-ux-design/SKILL.md` and `AI/DESIGN-SYSTEM.md`; treat `AI/RAD-COMPONENT-CATALOGUE.md` as legacy reference only; inspect current shared UI source and follow the new design direction.
- Laravel, API, database or backend work: load `.agents/skills/laravel-backend/SKILL.md`.
- React, routing, frontend or UI implementation: load `.agents/skills/react-frontend/SKILL.md`.
- Bug or regression: load `.agents/skills/debugging/SKILL.md`.
- Authentication, authorization, privacy, uploads or abuse: load `.agents/skills/security-review/SKILL.md`.
- PR or code review: load `.agents/skills/code-review/SKILL.md`.
- Tests, accessibility, performance or verification planning: load `.agents/skills/quality-engineering/SKILL.md`.
- Branches, commits, GitHub issues/PRs or repository workflow: load `.agents/skills/git-github/SKILL.md`.
- Deployment planning, runtime configuration, observability, backups, incident response, reliability or operational readiness: load `.agents/skills/operations-reliability/SKILL.md` and inspect the actual deployment/runtime configuration before making claims.
- Repository setup or settings: consult `AI/GITHUB-SETUP.md`.
- For cross-cutting engineering principles and curated external references, consult `AI/ENGINEERING-PLAYBOOK.md`. It is an index and guidance layer, not a source of project-specific facts or permission.
- Project delivery and board management remain governed by `AI/TASK-MANAGEMENT.md` and `AI/DEVELOPMENT-WORKFLOW.md`; do not create a duplicate project-management skill.
- A cross-layer task may require multiple skills. Load only those needed; do not load every skill by default.
- If unsure which skill applies, inspect the `name` and `description` in the frontmatter of available `.agents/skills/*/SKILL.md` files, then load the closest relevant skill.

For local terminal use, `npm run ai:context -- --task "<one-sentence task>"` can print a compact context packet. This is optional. Do not claim to have run it unless it was actually run. In browser-only chats, read the selected files through authorized repository access or ask the user to provide them.

If a file, issue, PR, log or source is inaccessible, state exactly what is missing and ask for the minimum necessary content. A URL alone does not grant access to a private repository. Never pretend to have read inaccessible material.

## 4. Evidence and anti-hallucination protocol

Before making a material claim or change:

1. Identify the evidence source: current file and symbol, migration/schema, test, configuration, live issue/PR comment, commit or actual command output.
2. Separate **confirmed facts**, **hypotheses**, **assumptions**, **unknowns** and **proposals**.
3. Cite concrete repository paths and symbols; include line references or commit/issue links when available.
4. Verify relevant callers and the full request/state path instead of inferring behavior from a filename or component name.
5. Treat documentation as intent or guidance, not proof that implementation exists.
6. Treat old chat summaries and AI-generated handoffs as leads to verify, never as authoritative facts.
7. Never invent APIs, database columns, routes, tests, logs, command results, product requirements, GitHub state or user approval.
8. If evidence conflicts, stop and explain the contradiction before changing behavior.
9. If a hypothesis is unproven, label it and identify the observation or experiment that would confirm or reject it.
10. If access or evidence is insufficient, say so and ask for the smallest missing evidence rather than guessing.

Do not state that a feature is missing until the relevant routes, screens, data model and adjacent implementation have been checked. Do not state that a bug is fixed merely because code was changed.

## 5. Task continuity and durable records

- Prefer one chat per substantial GitHub issue or PR, not one chat per tiny follow-up.
- GitHub is the durable task record: keep bug reproduction evidence and dated investigation findings on the bug issue; feature scope, approved decisions and progress on the feature issue; code review findings and resolutions on the PR.
- Before creating an issue, search for an existing issue/PR. A new chat does not mean a new issue.
- When resuming, inspect the live issue/PR and latest comments, current branch/commit and current source. Summarize completed work, confirmed facts, approved decisions, unresolved hypotheses, verification status, blockers and next 1–3 actions.
- Do not repeat completed work or trust a previous chat's claim without checking the current repository state.
- Use `AI/SESSION.md` only for project-wide objective, cross-project decisions, blockers and next 1–3 actions. Do not turn it into a task transcript or duplicate issue tracker.
- Before context is exhausted, prepare a factual handoff and update the relevant issue/PR. Update `AI/SESSION.md` only if project-wide state changed.
- If repository or GitHub access is unavailable, state the limitation and ask for the minimum relevant files/content.


## 5A. Decision-to-task authorization gate

- Issue #150 is a historical vision register. Its numbered decision comments are historical intent records, not current implementation authority or automatic authorization.
- When the user explicitly names a historical #150 decision, retrieve only that record. Do not read unrelated historical decisions.
- A historical vision decision is context, not an implementation task, MVP commitment, architecture specification, priority or permission to build.
- Convert a decision into a delivery issue only after explicit product-owner authorization. Link the issue to the selected decision comment and record the authorization.
- Define an MVP boundary inside each authorized delivery issue. A small decision may be one issue; a large decision may use a parent epic and independently reviewable child issues. Keep later scope separate.
- Standalone bugs, maintenance, QA and documentation tasks do not need a product decision ID.
- Follow `AI/TASK-MANAGEMENT.md` for naming, issue structure, priority, Kanban status and completion rules. There is no active product-phase roadmap or M0–M4 milestone sequence.
- Never infer task dependencies or implementation order from decision numbering or subject similarity.

## 6. Understand and plan before implementation

### Understand

1. Identify the requested outcome, user/actor, scope and explicit constraints.
2. Inspect the smallest useful set of source files, callers, configuration, migrations and tests.
3. Confirm the target branch, current commit and existing PR/issue when available.
4. For cross-layer work, trace the actual flow across routes, middleware, controllers, policies, models, resources, persistence, API clients, React routes/components and state.
5. Compare current behavior with the approved issue and product decisions.
6. Separate observed facts from assumptions, unknowns and recommendations.

### Plan

1. Define observable acceptance criteria and important negative/failure cases.
2. Identify API, schema, compatibility, security, privacy, accessibility, performance and operational risks.
3. Prefer a small, coherent vertical slice. Avoid unrelated cleanup and speculative abstractions.
4. Identify product or architecture decisions requiring approval.
5. Ask only when a missing decision blocks safe progress; otherwise state a conservative, reversible assumption and label it.
6. If scope expands, stop and propose a new or linked issue rather than silently broadening the task.

### Implement

- Wait for approval when the user asked for a plan first or a product/architecture decision is unresolved.
- Follow existing conventions and reuse established abstractions.
- Preserve `/api/v1` contracts unless a deliberate change is required and communicated.
- Enforce authorization on the Laravel server; frontend route guards are presentation, not security.
- Validate untrusted input server-side and protect private data at every response and storage boundary.
- Use transactions for multi-record invariants and idempotency for retryable operations.
- Add forward migrations; never rewrite migrations that may have run in another environment.
- Preserve keyboard support, semantic markup, accessible names, focus behavior, reduced motion, responsive behavior and Persian RTL.
- Avoid N+1 queries, unbounded data retrieval, unsafe file access, mass assignment and private-field leakage.
- Do not add dependencies without a demonstrated need and compatibility review.
- Never delete, skip, weaken or broadly loosen a failing test merely to obtain a green result. Fix the cause or replace coverage with equivalent or stronger coverage.

## 6A. Project-wide batch mode

A user may explicitly authorize a bounded batch for any engineering work type: feature, bug, security, maintenance, documentation, design/RTL, quality, tooling or operations. A batch may cross disciplines when its tasks belong to one named workstream or the user explicitly names a finite cross-project task list; it is never blanket permission to clear the backlog.

- A clear instruction such as “batch the next Ready tasks in [area/workstream] and bring me one combined verification handoff” authorizes the bounded batch. A board status alone does not authorize work. If the workstream or selection boundary is unclear, ask one focused question.
- Do not ask for approval after every in-scope slice. State the batch plan once, then complete all safe, authorized tasks; follow AI/DEVELOPMENT-WORKFLOW.md §2 for selection, sequencing, PR grouping and the final handoff.
- Keep each independently reviewable outcome separate. Re-check live source and GitHub state between slices; avoid duplicate or already-completed work.
- Park a slice when it reaches a product, architecture, API/schema/data-contract, authorization/privacy/security, destructive-operation, dependency or material operational-risk decision boundary. Continue other independent safe slices.
- Batch authorization never authorizes tests, lint, formatting, builds, type checks, browser automation, migrations, seeders, scanners or CI. It never authorizes deployment, release, force-push, history rewriting, repository-setting changes or merge.
- At batch end, provide one consolidated report and one decision point. A single explicit end-of-batch approval may cover the listed review/merge actions; do not ask for separate approval per PR. All other permission gates remain unchanged.

## 6B. Change-driven test maintenance (mandatory)

Tests are executable specifications of the **current approved product behavior and architecture**, not preservation contracts for retired implementation choices. When production code, user-visible behavior, product architecture, information architecture, navigation, design tokens, shared components, API/data contracts, permissions or runtime configuration changes, update the relevant tests in the same change.

Before implementation:
1. Inspect the tests that currently cover the affected behavior and identify which assertions express durable user/business/security invariants versus incidental implementation details.
2. Compare those assertions with the latest owner-approved product direction, task acceptance criteria and current source of truth (latest main for implementation facts; the task branch/diff for the proposed new behavior).
3. Record which tests remain valid, which need revision, which new risks need coverage and which old expectations are explicitly retired. Do not assume an existing assertion is correct merely because it is green.

During implementation:
- Update or replace stale tests alongside the production change. Do not leave knowingly obsolete tests for a later cleanup task.
- Prefer tests of observable behavior, user journeys, accessibility semantics, API contracts, authorization boundaries, data invariants and failure recovery. Avoid brittle snapshots or assertions coupled to class names, CSS values, component internals or exact implementation structure unless that detail is itself an explicit contract.
- For redesign/refactor work, rewrite design-system and navigation tests to assert the new approved semantic tokens, themes, responsive behavior, roles and journeys. Remove assertions that encode retired design systems, component libraries, layout dimensions or navigation patterns.
- Preserve coverage strength when replacing a test: map each removed assertion to a current invariant or explain why it no longer applies. Do not delete meaningful security, privacy, accessibility, compatibility or regression coverage just because implementation changed.
- Add regression tests for newly introduced behavior and relevant negative/failure cases. Update fixtures, mocks, test helpers, accessibility expectations and test documentation when their contracts change.
- Keep production code changes driven by product requirements and runtime correctness—not by pressure to satisfy stale tests. **Never modify new/refactored production code solely to make an obsolete test pass.**

When a test fails after a product or architecture change, classify it before editing either side:
1. **Real regression:** the new code violates an approved invariant; fix production code and retain/strengthen the test.
2. **Stale test contract:** the assertion encodes superseded behavior; update the test to the approved current behavior while preserving equivalent or stronger coverage.
3. **Unclear product decision:** stop and ask; do not guess whether code or test should change.
4. **Environment/flaky/tooling failure:** isolate and report it; do not disguise it as a product fix or weaken the assertion.

Review every test deletion or relaxation explicitly. A test may be removed only when its behavior is genuinely retired or its coverage is replaced by equivalent/stronger current-contract coverage; record the rationale in the PR. Never skip, quarantine, loosen or rewrite a test merely to obtain a green run.

Before handoff, include a test-impact summary: changed production surfaces, tests added/updated/retired, invariant coverage preserved, commands actually run by an authorized person, exact result, and checks not run. A code change is not verified merely because tests were edited. Follow the repository's explicit verification permission gate; editing tests does not authorize executing them.

## 7. Backend, data and frontend invariants

- Laravel policies, middleware and explicit server-side ownership/participant checks are authoritative.
- Validate request data, uploaded file type/size/content and access to stored files.
- Protect authentication, role boundaries, private messages, attachments, unpublished artwork and account data.
- Keep database constraints and application invariants aligned.
- Consider concurrency, duplicate requests, rollback, queue retries and external-service failures.
- Preserve response shape, status codes, pagination and error semantics unless intentionally versioned.
- Use installed React APIs and existing React Router/TanStack Query patterns.
- Keep server state in the existing query/cache approach; avoid introducing competing state systems.
- Cover loading, empty, success, error, validation, disabled and submitting states.
- Use the new semantic design tokens and shared primitives established by the product refactor; do not assume legacy RAD tokens/components are constraints or introduce unrelated one-off systems.
- Maintain Persian-first copy, correct RTL flow, mixed-direction text handling, responsive layouts and long-content resilience.
- Do not rely on color alone. Respect keyboard interaction, visible focus and reduced-motion preferences.
- Frontend authorization must never be treated as access control.

## 8. Git and GitHub

- Follow `.agents/skills/git-github/SKILL.md` for branch, commit, push, pull-request and release conventions.
- Use `AI/GITHUB-SETUP.md` for the repository settings checklist; never claim documented settings are enabled without checking GitHub.
- Never force-push, rewrite shared history, delete remote branches, merge, close issues or change repository settings without explicit authorization.
- Keep changes scoped to the requested task. Do not include unrelated formatting or generated files.
- Before editing or deleting a repository file through an API, fetch its current content and blob SHA; use the fresh SHA for the write.
- Prefer reviewable commits with imperative, specific messages. Do not claim a local working-tree state when using only remote GitHub access.
- All repository GitHub Actions workflows must remain manual-dispatch-only (`workflow_dispatch`); automatic event and scheduled triggers are prohibited.
- Do not dispatch or rerun GitHub Actions without explicit user permission for that specific run. Requests to implement, review, commit, push, create a branch, open/update a PR, or finish a task do not authorize a workflow run.
- Workflow files may be inspected or edited when requested, but never manually execute them without permission.

## 9. Verification and CI policy

Verification is opt-in, not implied.

- Ask for explicit authorization before running any verification command or initiating a workflow.
- When authorized, run only the named scope and environment. Do not expand a focused check into a full suite.
- Before a command with side effects, explain the command and relevant effects when they are not obvious.
- For CI, obtain explicit permission to start the specific workflow/run. A generic request to check, review or finish is insufficient.
- Repository workflows must not start automatically: keep only `workflow_dispatch` triggers. If an unexpected run appears, do not initiate additional runs or reruns; report the observed status accurately and flag the unexpected trigger for correction.
- If not authorized, mark verification as **Not run (permission not granted)**.
- Distinguish static inspection, locally executed checks and CI-confirmed results. A suggested command is not evidence that it ran.

## 10. Completion standard

A task is complete when the requested change is implemented, acceptance criteria are met or explicitly deferred, affected contracts and invariants are preserved, the focused diff is reviewed, durable task records are updated, and the delivery report accurately states what was and was not verified.

For substantial work, report:
- Issue/PR, branch and commit when available.
- Files changed and observable behavior.
- Acceptance criteria met, unmet or deferred.
- Confirmed facts, remaining assumptions and risks.
- Verification status with exact commands/results or links; otherwise state not run.
- Blockers and next 1–3 actions.

Do not create a PR, merge, deploy or release unless requested. Do not claim completion while acceptance criteria remain unmet.


## 8A. Parallel AI development branches (mandatory)

Rademan uses two long-lived development integration branches:
- `develop/chatgpt` is the integration target for work authored through ChatGPT.
- `develop/claude` is the integration target for work authored through Claude.

Branch and PR rules:
1. **Never target `main` with ordinary feature, refactor, maintenance, documentation or agent-authored PRs.** Those PRs target the matching AI development branch.
2. ChatGPT work starts from `develop/chatgpt`; Claude work starts from `develop/claude`. Create short-lived task branches from the matching development branch, using the issue number and task slug where practical.
3. Open PRs from task branches into the matching development branch only. Do not open cross-track PRs or merge one AI track into the other unless the product owner explicitly requests it.
4. The product owner may explicitly authorize a shared task or cross-track integration. Record the chosen integration branch in the issue/PR before proceeding.
5. Keep the two tracks isolated. Do not assume commits on one branch exist on the other. Re-check the selected branch's current head and source before each task.
6. `main` is the release/stable integration branch. Promotion from either development branch to `main` is a separate release decision and requires explicit product-owner approval, review and the applicable verification gates.
7. Do not change the repository default branch, branch protections, merge settings or delete branches as part of this workflow unless separately authorized.
8. Existing PRs must be retargeted to the appropriate development branch before merge. Never merge an ordinary development PR directly into `main`.
9. GitHub issues are not mergeable. Keep issues open as the source of scope/status; link them to the matching development branch and PR. Close an issue only when its acceptance criteria are complete and the owner-approved workflow permits closure.
10. If the authoring track is unclear, ask which development branch to use rather than guessing.

The current branch mapping is also documented in `.agents/skills/git-github/SKILL.md`. This policy does not relax security, review, verification, CI, merge or release approval requirements.
