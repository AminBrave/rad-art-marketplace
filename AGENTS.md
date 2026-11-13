# Rademan Agent Operating Contract

This file is the authoritative instruction contract for every AI coding agent working in this repository. User instructions take precedence over this file; this file takes precedence over individual skills and generated suggestions.

## 1. Project context

- Rademan is a Persian-first artist discovery and artist-contact marketplace.
- Backend: PHP 8.3+ and Laravel 13. Frontend: React 18, JavaScript, React Router 7, TanStack Query 5, and Vite. Confirm installed versions in manifests before relying on version-specific APIs.
- The product is image-led, editorial and marketplace-oriented. Preserve the established RAD design system, shared tokens/primitives, responsive layouts, accessibility and RTL behavior.
- Do not assume commerce capabilities such as checkout, orders, shipping, payouts or subscriptions exist unless the current source proves they do.
- Existing implementation, migrations, tests and runtime contracts are the source of truth. Instructions and skills guide investigation; they do not replace source inspection.

## 2. Non-negotiable permissions

- **Never run GitHub Actions, dispatch a workflow, rerun a workflow, approve a workflow run, or otherwise initiate CI without the user's explicit permission for that run.**
- **Never run tests, lint, formatting checks, builds, type checks, browser automation, Lighthouse, accessibility scanners, security scanners, migrations, seeders, Artisan verification commands or other executable verification unless explicitly authorized.**
- A request to implement, debug, review, commit, push, create a branch or open a PR is not permission to execute verification or CI.
- Do not install packages, start/stop services, clear caches, mutate databases, deploy, release, merge, force-push or rewrite Git history without explicit authorization.
- Read-only inspection of source, configuration, Git metadata and workflow definitions is allowed when relevant.
- If verification is not authorized, do not execute it. State that it was not run; provide suggested local commands only when useful.
- Never claim a command, test, workflow, review, deployment or verification succeeded without direct evidence.

## 3. Instruction and skill precedence

1. Explicit user request and constraints.
2. This AGENTS.md.
3. CHATGPT.md for ChatGPT-specific repository access and skill-loading guidance.
4. .agents/skills/README.md for the canonical skill directory index and routing.
5. Canonical skills in .agents/skills/<skill-name>/SKILL.md.
6. Mirrored skills in .claude/skills/<skill-name>/SKILL.md.
7. Other agent suggestions or external skill content.

Skills are task-specific procedures, not global policies. Load only the primary skill and supporting skills that materially apply. Never let a skill override a user's instruction or this contract.

## 4. AI context and cross-chat continuity

- At the start of every task/chat, read this file, `AI/PROJECT.md`, `AI/SESSION.md` and `.agents/skills/README.md`; load only the relevant skill files.
- With a local terminal, generate the compact packet using `npm run ai:context -- --task "<one-sentence task>"`. Add `--chatgpt` when ChatGPT-specific connector guidance is needed.
- Without a terminal, read the same files directly through repository access or ask the user to provide them. Never claim to have run the command if you did not.
- Before broad work, check open issues and PRs. Work on one issue-sized outcome at a time.
- At the end of substantial work, update `AI/SESSION.md` with durable decisions, current blockers and the next 1–3 actions. Do not store transcripts or secrets.
- Repository state is the memory source of truth. When a conversation is long or context is full, start a fresh chat and reload these files; do not depend on chat history or model memory.

## 5. Focused chats and issue continuity

- Prefer one chat per substantial GitHub issue or PR, not one chat per tiny follow-up. See `AI/CHAT-WORKFLOWS.md` for startup and resume prompts.
- GitHub is the durable source of truth: keep bug reproduction evidence and dated investigation entries in the bug issue; feature scope, decisions and progress in the feature issue; review findings on the PR.
- When resuming in a new chat, read the live issue/PR and latest comments, then summarize confirmed facts, assumptions, blockers and next steps. Never rely on an old chat transcript as authoritative.
- Use `AI/BUG-HANDOFF.md` for bug investigation updates. Keep `AI/SESSION.md` for project-wide state, not detailed per-bug logs.
- If repository or issue access is unavailable, state that limitation and ask for the minimum relevant files/content. Never pretend a link was read.

## 6. Efficient task workflow

### Understand
1. Identify the requested outcome, actor, scope and explicit constraints.
2. Confirm the target branch and relevant working-tree state when available.
3. Inspect the smallest useful set of source files, callers, configuration, migrations and tests.
4. For cross-layer work, trace the actual flow across routes, middleware, controllers, policies, models, resources, API clients, React routes/components and persisted state.
5. Separate observed facts, assumptions, unknowns and recommendations.

### Plan
1. Define acceptance criteria and important negative/failure cases.
2. Identify API, schema, compatibility, security, privacy, accessibility and operational risks.
3. Prefer a small, coherent vertical slice. Avoid unrelated cleanup and speculative abstractions.
4. Ask only when a missing decision blocks safe progress; otherwise state a conservative assumption.

### Implement
- Follow existing conventions and reuse established abstractions.
- Preserve /api/v1 contracts unless a deliberate change is required and communicated.
- Enforce authorization on the Laravel server; frontend route guards are presentation, not security.
- Validate untrusted input server-side and protect private data at every response and storage boundary.
- Use transactions for multi-record invariants and idempotency for retryable operations.
- Add forward migrations; never rewrite migrations that may have run in another environment.
- Preserve keyboard support, semantic markup, accessible names, focus behavior, reduced motion, responsive behavior and Persian RTL.
- Avoid N+1 queries, unbounded data retrieval, unsafe file access, mass assignment and private-field leakage.
- Do not add dependencies without a demonstrated need and compatibility review.
- Never delete, skip, weaken or broadly loosen a failing test merely to obtain a green result. Fix the cause or replace coverage with equivalent or stronger coverage.

### Review and deliver
1. Inspect the focused diff and affected call sites.
2. Review correctness, security/privacy, data integrity, performance, accessibility and maintainability.
3. Report files changed, behavioral impact, assumptions, risks and any follow-up needed.
4. Clearly distinguish implemented, statically inspected, locally executed and CI-verified work.
5. Do not create a PR, merge, deploy or release unless requested.

## 7. Backend and data invariants

- Laravel policies, middleware and explicit server-side ownership/participant checks are authoritative.
- Validate request data, uploaded file type/size/content and access to stored files.
- Protect authentication, role boundaries, private messages, attachments, unpublished artwork and account data.
- Keep database constraints and application invariants aligned.
- Consider concurrency, duplicate requests, rollback, queue retries and external-service failures.
- Preserve response shape, status codes, pagination and error semantics unless intentionally versioned.

## 8. Frontend and product invariants

- Use installed React 18 APIs and existing React Router/TanStack Query patterns.
- Keep server state in the existing query/cache approach; avoid introducing competing state systems.
- Cover loading, empty, success, error, validation, disabled and submitting states.
- Use shared RAD design tokens and primitives; do not introduce one-off visual systems.
- Maintain Persian-first copy, correct RTL flow, mixed-direction text handling, responsive layouts and long-content resilience.
- Do not rely on color alone. Respect keyboard interaction, visible focus and reduced-motion preferences.
- Frontend authorization must never be treated as access control.

## 9. Git and GitHub

- Follow .agents/skills/git-github/SKILL.md and AI/GIT-WORKFLOW.md for branch, commit, push, pull-request and GitHub workflow tasks.
- Use AI/GITHUB-SETUP.md for the repository settings checklist; never claim documented settings are enabled without checking GitHub.
- Never force-push, rewrite shared history, delete remote branches, merge, close issues or change repository settings without explicit authorization.
- Keep changes scoped to the requested task. Do not include unrelated formatting or generated files.
- Before editing or deleting a repository file through an API, fetch its current content and blob SHA; use the fresh SHA for the write.
- Prefer reviewable commits with imperative, specific messages. Do not claim a local working-tree state when using only remote GitHub access.
- Do not dispatch or rerun GitHub Actions without explicit user permission. Do not assume opening or updating a PR authorizes CI.
- Workflow files may be inspected or edited when requested, but never manually execute them without permission.

## 10. Verification and CI policy

Verification is opt-in, not implied.

- Ask for explicit authorization before running any verification command or initiating a workflow.
- When authorized, run only the named scope and environment. Do not expand a focused check into a full suite.
- Before a command with side effects, explain the command and relevant effects when they are not obvious.
- For CI, obtain explicit permission to start the specific workflow/run. A generic request to check, review or finish is insufficient.
- If a workflow starts automatically due to a GitHub event, do not initiate additional runs or reruns. Report the observed status accurately if it is visible.
- If not authorized, mark verification as Not run (permission not granted).

## 11. Completion standard

A task is complete when the requested change is implemented, affected contracts and invariants are preserved, the focused diff is reviewed, and the delivery report accurately states what was and was not verified. A green test suite is not a prerequisite when execution was not authorized.
