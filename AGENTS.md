# Rademan Agent Operating Contract

This is the single entry point and authoritative operating contract for AI work in this repository. The user should only need to point an AI to this file and describe the task. The AI is responsible for selecting the minimum relevant project context, GitHub records and task-specific skills.

Explicit user instructions take precedence over this file, except that the AI must still respect applicable safety and platform constraints. This file takes precedence over individual skills and generated suggestions.

## 1. Project identity and source of truth

- Rademan is a Persian-first artist discovery and artist-contact marketplace.
- Recorded stack: PHP 8.3+ and Laravel 13; React 18, JavaScript, React Router 7, TanStack Query 5 and Vite. Confirm installed versions in manifests before relying on version-specific APIs.
- Preserve the established RAD design system, shared tokens/primitives, responsive layouts, accessibility and RTL behavior.
- Do not assume checkout, orders, shipping, payouts, subscriptions, commissions, booking, escrow or other commerce capabilities exist unless current source and approved product decisions prove they do.
- Implementation facts come from current source, migrations, tests, configuration and observed runtime behavior. Product intent comes from the canonical decision records in #150 and `AI/PROJECT.md`. Task status comes from live GitHub issues/PRs and the Rademan Workboard Kanban Project. Chat history and model memory are not authoritative.

## 2. Non-negotiable permissions

- **Never run GitHub Actions, dispatch a workflow, rerun a workflow, approve a workflow run, or otherwise initiate CI without the user's explicit permission for that run.**
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
- Product behavior, scope or user journey: read `AI/PROJECT.md`; when a specific product decision is named, retrieve only its canonical record from #150; read `AI/TASK-MANAGEMENT.md` for issue/MVP/Kanban rules.
- Cross-chat continuation or project-wide planning: read `AI/SESSION.md` and the referenced live issue/PR.
- Feature planning or product discovery: load `.agents/skills/feature-planning/SKILL.md`.
- Laravel, API, database or backend work: load `.agents/skills/laravel-backend/SKILL.md`.
- React, routing, frontend or UI work: load `.agents/skills/react-frontend/SKILL.md`.
- Bug or regression: load `.agents/skills/debugging/SKILL.md`.
- Authentication, authorization, privacy, uploads or abuse: load `.agents/skills/security-review/SKILL.md`.
- PR or code review: load `.agents/skills/code-review/SKILL.md`.
- Tests, accessibility, performance or verification planning: load `.agents/skills/quality-engineering/SKILL.md`.
- Branches, commits, GitHub issues/PRs or repository workflow: load `.agents/skills/git-github/SKILL.md`.
- Repository setup or settings: consult `AI/GITHUB-SETUP.md`.
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

- The canonical product vision register is GitHub issue #150. Its numbered decision comments are standalone records; the index is only a lookup table.
- When the user names a decision, retrieve only that decision's canonical comment. Do not reread all 41 decisions unless explicitly asked or a real dependency is evidenced.
- A decision is product intent, not an implementation task, MVP commitment, architecture specification, priority or permission to build.
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
- Use shared RAD design tokens and primitives; do not introduce one-off visual systems.
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
- Do not dispatch or rerun GitHub Actions without explicit user permission. Do not assume opening or updating a PR authorizes CI.
- Workflow files may be inspected or edited when requested, but never manually execute them without permission.

## 9. Verification and CI policy

Verification is opt-in, not implied.

- Ask for explicit authorization before running any verification command or initiating a workflow.
- When authorized, run only the named scope and environment. Do not expand a focused check into a full suite.
- Before a command with side effects, explain the command and relevant effects when they are not obvious.
- For CI, obtain explicit permission to start the specific workflow/run. A generic request to check, review or finish is insufficient.
- If a workflow starts automatically due to a GitHub event, do not initiate additional runs or reruns. Report the observed status accurately if it is visible.
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
