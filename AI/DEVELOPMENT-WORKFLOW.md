# Rademan issue-to-release workflow

This document describes the practical delivery sequence and review evidence for Rademan. `AGENTS.md` remains authoritative for permissions, safety and implementation rules. This guide does not grant implementation, verification, merge, deployment or CI permission.

## 1. Shape and authorize the work

Every delivery issue should identify:

- The user or maintenance outcome, affected actor and journey.
- Current implementation baseline, with source evidence or an explicit unknown.
- A bounded MVP, explicit non-goals and observable acceptance criteria.
- UX/design impact, architecture/API/data impact and relevant security/privacy, accessibility, RTL, responsive and performance risks.
- Evidence-based dependencies, rollback considerations and a proportionate verification plan.
- The source product decision and its canonical record when the work implements product intent. Standalone maintenance, bug, documentation and QA tasks do not need a product-decision ID.

A product decision, planning issue, priority label or board status is not implementation authorization. Resolve product, UX, data/API compatibility and architecture decisions before changing behavior. For larger work, use an epic with independently reviewable child issues.

## 2. Project-wide batch delivery

The default remains one bounded outcome per issue/PR. When the user explicitly authorizes a batch, apply this workflow to any engineering task category—not only feature implementation—including bugs, security, maintenance, documentation, design/RTL, quality, tooling and operations.

### 2.1 Authorization and batch boundary

A batch is a finite set of related tasks under one named workstream/parent issue, or a finite cross-project list the user explicitly identifies. It is not blanket permission to work through every open issue or every product decision.

- Examples of clear authorization: “Batch issues #240, #241 and #242”; “Do the next Ready documentation tasks”; “Batch the next three low-risk tasks in the frontend workstream and bring me one combined handoff.”
- If the user asks the agent to select tasks, select only from the explicitly named area/workstream and only tasks whose authorization, scope and acceptance criteria are already clear. Prefer Ready items when the live Workboard is accessible; otherwise use live GitHub issues and explain the source. Do not claim the Workboard is configured or accessible unless verified.
- A Ready status, priority, label, roadmap entry or product decision is not by itself permission to implement. The user's batch instruction authorizes only the clearly bounded tasks it names or asks the agent to select.
- If “next tasks” has no clear area, count or parent workstream, ask one concise clarification rather than silently treating the whole backlog as in scope.
- Do not invent a fixed task count. Honor a user-specified count/list; otherwise choose a small, coherent set that can be reviewed together without making a large mixed-scope PR.

### 2.2 Select and sequence

1. Re-check the live parent issue/epic, candidate issues, open PRs, current target branch, relevant source and task-specific skills.
2. Prefer explicitly named tasks, then eligible child issues under the named parent, then the next eligible Ready tasks in the named area. Do not infer dependencies from issue numbers, labels or topic similarity.
3. Confirm each task has clear authorization, a bounded outcome, acceptance criteria and no unresolved stop-condition decision. Product-decision work must still pass the #150 authorization gate.
4. Sequence only evidenced dependencies. Work on independent safe tasks while a blocked slice is parked.
5. At batch start, publish one concise plan: included tasks, exclusions, dependencies/order, intended branch/PR grouping and stop conditions. Do not ask for per-task confirmation after that.

### 2.3 Execute and deliver

1. Re-check live source and GitHub state before each independent slice; branch from the current agreed base.
2. Keep changes small, focused and independently reviewable. Prefer one PR per independently reviewable outcome; combine tasks only when they are tightly coupled and should be reviewed/reverted together.
3. Do not create duplicate issues. Create/link child issues only for distinct deliverables that need durable tracking and are within the authorized batch.
4. Record progress and evidence on the relevant issue/PR. Each PR states its own outcome, scope, exclusions, risks, linked issue and honest verification status.
5. Keep PRs draft while the maintainer's consolidated verification is pending. Review the full diff and relevant callers after each slice.
6. Do not add dependencies, speculative abstractions, unrelated cleanup or new product behavior to make batching convenient.

### 2.4 Stop conditions and permission boundaries

Park the affected slice and explain the smallest decision/evidence needed if it requires a new product choice, architecture change, API/schema/data-contract change, authorization/privacy/security semantic change, destructive or irreversible operation, new dependency, material cost/operational risk, or resolution of conflicting evidence. Continue independent safe tasks where possible.

Batch authorization does **not** authorize the assistant to run tests, lint, formatting, builds, type checks, browser automation, migrations, seeders, scanners or CI. It does not authorize deployment, release, force-push, history rewriting, repository-setting changes or merge. Those remain separate explicit gates. The maintainer may run one combined verification pass at the end. One explicit end-of-batch approval can authorize the specifically named review/ready/merge actions for all listed PRs; do not require approval separately for each small PR.

### 2.5 One consolidated end-of-batch handoff

Provide one final report containing:
- Every included, completed, blocked and deferred issue, with links and reasons.
- Every PR, branch, commit and changed file; identify coupled PRs and dependencies.
- Acceptance criteria met, unmet or deferred, plus material risks and assumptions.
- Exact combined local commands grouped by backend, frontend, accessibility and Playwright only where relevant; do not prescribe irrelevant suites.
- Whether Playwright is required; if so, state that it attaches to the already-running app, uses the configured MySQL/MariaDB database and may leave persistent records.
- Checks not run by the assistant and any automatically started CI status actually observed. Never initiate CI to complete the handoff.
- One batch-level next action: report the combined verification result and approve the listed review/merge actions, or request fixes.

Keep each PR independently revertible where practical. A batch may span multiple PRs, but must not collapse unrelated changes into one broad PR merely to reduce approval count.
## 3. Review checklist

Use the parts that apply to the change; do not require every item mechanically.

- [ ] Linked issue and approved product/architecture decisions, where applicable.
- [ ] User/maintenance outcome, MVP scope, non-goals and acceptance criteria are satisfied.
- [ ] Changed files and important behavior/state ownership are explained.
- [ ] API, response, pagination, schema and migration compatibility are stated.
- [ ] Authentication, authorization, ownership, privacy, uploads, storage and abuse boundaries are reviewed.
- [ ] Error, empty, loading, retry, duplicate-submission, idempotency and rollback paths are covered where relevant.
- [ ] Performance implications and evidence are stated when material.
- [ ] Accessibility, semantic names, keyboard/focus, RTL, responsive layout and visual impact are reviewed where relevant.
- [ ] User journey, content hierarchy, interaction states and RAD component/token reuse are reviewed for interface changes.
- [ ] Runtime configuration, privacy-conscious observability, recovery and rollback are considered for operationally significant changes.
- [ ] Relevant tests and checks are listed with exact scope and actual results; unrun checks are explicitly marked.
- [ ] `tests/QUALITY-MATRIX.md` and operator/contributor docs are updated if supported journeys, known gaps or commands change.
- [ ] Human review is complete. Merge and deployment remain separate explicit approvals.

## 4. Change-type verification matrix

Choose checks based on the changed boundary and risk. A passing lower-level test does not replace a necessary browser or manual review, and no suite is required merely for line coverage.

| Change type | Focused automated evidence | Additional review |
|---|---|---|
| Documentation only | Usually no application suite; verify links and consistency with source/scripts | Ownership, precedence, factual accuracy and no unsupported automation claims |
| Pure PHP/domain logic | PHPUnit Unit | Invariants, boundaries and failure behavior |
| Laravel HTTP/controller/auth/validation | PHPUnit Feature | Route/middleware/policy ownership, response/status/pagination compatibility and actor isolation |
| Database, transaction, storage, queue or external boundary | PHPUnit Integration plus relevant Feature coverage | Rollback, concurrency/idempotency, private-file access and retry/failure cleanup |
| React component/hook/query/cache | Node frontend tests | State ownership, cache invalidation, loading/error/empty states, keyboard and RTL behavior |
| Navigation or cross-role user journey | Focused Playwright journey plus relevant lower-layer tests | URL/deep links, focus/keyboard, responsive/RTL and recovery behavior |
| Visual/design-system/token change | Relevant frontend/color tests; compiled CSS audit when output is affected | Visual comparison, keyboard/focus and manual contrast/assistive-technology review as relevant |
| Security/privacy/upload/access boundary | Relevant Feature and Integration tests | Threat/ownership review, private storage and response leakage; scanners are supplemental |
| Performance-sensitive change | Focused tests and reproducible measurements only where a baseline/target exists | Fixed target, data, viewport/device/network and repeatable method |

## 5. Existing commands and side effects

Public commands are declared in `package.json`; orchestration is in `scripts/project.mjs`. Check those files before relying on this list if the scripts change.

| Command | Purpose | Important side effects / limits |
|---|---|---|
| `npm run test:unit` | PHPUnit Unit suite | Uses the test bootstrap and in-memory SQLite; refreshes its JUnit report |
| `npm run test:feature` | PHPUnit Feature suite | Uses the test bootstrap and in-memory SQLite; refreshes its JUnit report |
| `npm run test:integration` | PHPUnit Integration suite | Uses the test bootstrap and in-memory SQLite; refreshes its JUnit report |
| `npm run test:backend` | Full PHPUnit suite | Uses the test bootstrap and in-memory SQLite; refreshes its JUnit report |
| `npm run test:frontend` | Node frontend tests | Refreshes the frontend JUnit report |
| `npm run test:reporting` | Python tests for report tooling | Runs the Python reporting/discovery unit tests |
| `npm run test:report` | Summarize existing test reports | Reads existing reports and Git metadata; it does not run suites. Missing/stale reports are not passes |
| `npm run test:browser` | Playwright journeys against the running local app | Stateful: uses the app's configured MySQL/MariaDB database and may leave test records. It is not an isolated SQLite run |
| `npm run lint` | ESLint over `resources/js` | Static check; does not execute tests |
| `npm run a11y:colors` | Focused design-token color tests | Automated token checks do not prove full WCAG conformance |
| `npm run a11y:build` | Build and audit compiled CSS in `build/a11y-css` | Creates/overwrites that audit output directory; does not replace visual/manual review |
| `npm run production` | Production Vite build | Writes production assets under `public/build`; ensure the dev hot file is absent |
| `npm run build:cpanel` | cPanel production packaging/build | Writes build artifacts; review the target/output before running |

### Browser-test safety

`npm run test:browser` attaches Playwright to the already-running development application. The runner requires a local/development app environment and a MySQL connection from the configured `.env`; it does not create a separate test database, reset the database, start services, run migrations/seeders or isolate application storage/cache/session state. Browser journeys may create or mutate persistent records.

Before running it, inspect the effective `.env` and confirm the database is dedicated to disposable development or safely backed up. Never use production, staging or important user data. A localhost tunnel does not prove the database is safe. Start the normal app through the documented `npm run dev` workflow. There are no `browser:prepare` or `dev:browser` scripts in the current package manifest.

Database commands such as `npm run db:migrate`, `npm run db:seed`, `npm run db:seed:demo` and especially `npm run db:fresh` are data operations, not verification substitutes. `db:fresh` is destructive.

## 6. CI, merge and release are separate gates

- Inspect workflow YAML and live repository settings before describing automation. A workflow file does not prove that it runs on pull requests, is required, or is enforced by branch protection.
- Never dispatch, rerun or approve a workflow without explicit permission for that specific run.
- Record automatically started workflow evidence only when it is actually visible; do not trigger a second run for convenience.
- Mark a PR ready only after the draft is reviewable. Merge only after human review and explicit owner approval.
- Deployment, release tagging, production migrations and post-release smoke checks each require separate explicit authorization.
- Record the merged/deployed commit and environment when those actions occur. A merge is not a deployment.

## 7. Documentation and instruction ownership

Keep one authoritative home for each kind of guidance. Other files should link to it rather than copy its full rules.

| Location | Responsibility |
|---|---|
| AGENTS.md | Repository entry point, global permissions, evidence/authority model, engineering invariants and routing |
| AI/PROJECT.md and canonical #150 records | Product intent, confirmed baseline and product decisions |
| AI/TASK-MANAGEMENT.md | Issue structure, decision-to-task authorization, MVP and Workboard rules |
| AI/DEVELOPMENT-WORKFLOW.md | Delivery lifecycle, project-wide batch procedure, review checklist and verification selection |
| AI/ENGINEERING-PLAYBOOK.md | Cross-cutting engineering principles and curated external references |
| AI/SESSION.md | Short-lived cross-chat handoff; remove stale status and never duplicate task records |
| .agents/skills/*/SKILL.md | Triggered task-specific methods, checklists and expected outputs; defer global policy to AGENTS.md and delivery lifecycle to this document |
| Source, tests, manifests, scripts and runtime | Actual implementation, supported commands and observed behavior |
| GitHub issues/PRs and live Workboard (when configured) | Authorization, task scope, review and delivery status |

The authority model is not a simple document ranking: user authorization sets the task boundary; AGENTS.md sets non-negotiable operating constraints; source/runtime is evidence of implementation; canonical decision records establish product intent; live GitHub records establish task status. A skill, handoff or playbook must not override those sources.

When a skill needs GitHub mechanics, it should describe branch/commit/PR execution and link here for batch lifecycle. When it needs product or engineering context, it should point to the owning AI/ document rather than copying it.
