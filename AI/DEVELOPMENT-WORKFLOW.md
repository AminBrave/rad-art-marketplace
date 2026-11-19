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

## 2. Implement an authorized batch of reviewable slices

The default remains one bounded outcome per issue/PR. When the product owner explicitly requests batch delivery, do not pause for approval after every small task.

1. Re-check the live parent issue/epic, child issues, open PRs, current main, relevant source and task-specific skills.
2. At batch start, publish a concise batch plan: candidate tasks, boundaries, dependencies, intended issue/PR grouping, and explicit stop conditions.
3. Implement every safe, in-scope, low-risk task in the batch. Use short-lived branches from current main; keep each independently reviewable outcome in its own PR unless two changes are tightly coupled.
4. Do not create duplicate issues. Add child issues only for genuinely distinct deliverables that need durable tracking; link them to the parent.
5. Update focused tests and documentation as each slice requires. Review callers and the full diff after each slice; record evidence and progress on the relevant issue/PR.
6. Do not request per-slice approval when the batch authorization clearly covers the work. Stop only for unresolved product/architecture decisions, scope expansion, API/schema/data-contract changes not already authorized, security/privacy/authorization semantics, destructive or irreversible operations, new dependencies, material operational risk, conflicting evidence, or a task that cannot be safely bounded.
7. Open PRs for the batch and keep them draft while maintainer verification is pending. Each PR must state its own behavior, risk, issue link and verification scope. The batch report should group the PRs and provide one consolidated test handoff.
8. The maintainer runs the combined local verification once at the end and gives one batch-level result/approval. After a passing report and explicit batch approval, the assistant may perform the specifically approved PR review/ready/merge actions for the batch; do not ask for a separate approval per small PR.
9. Batch authorization does not authorize the assistant to run tests, lint, builds, Playwright, migrations, seeders, scanners or CI. It also does not authorize deployment or release. Those remain separate explicit gates unless the user names the exact action.
10. If one item is blocked, park it with evidence and continue independent safe items. Report the blocked item and the smallest decision/evidence needed.

Do not add dependencies, generic service/repository layers, new product behavior or unrelated cleanup without evidence and the required approval.

## 2A. Batch boundaries and final handoff

A batch is a bounded set of related tasks under one explicitly named workstream/parent issue, not blanket permission to work across the product. At the start, define the batch in terms of outcomes, not a predetermined number of files or PRs.

At the end, provide one consolidated handoff containing:
- All included and deferred issues, with links and reasons.
- All PRs, branches, changed files and commit references.
- The exact combined local commands, grouped by backend, frontend and Playwright only where relevant. Do not ask the maintainer to run irrelevant suites.
- Whether Playwright is required; if required, state that it uses the already-running app and configured MySQL/MariaDB database and may leave records.
- Tests/checks not run by the assistant and any automatic CI status actually observed.
- Acceptance criteria, risks and any remaining stop-condition decisions.
- One batch-level next action: report test results and explicitly approve the batch review/merge, or request fixes.

Keep each PR independently revertible where practical. A batch may contain multiple PRs; it must not collapse unrelated changes into one broad PR merely to reduce approval count.


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

## 7. Documentation ownership

- `AI/ENGINEERING-PLAYBOOK.md`: curated engineering principles, lifecycle map and external reference index; it does not override project-specific contracts.
- `.agents/skills/product-discovery/SKILL.md`, `ui-ux-design/SKILL.md` and `operations-reliability/SKILL.md`: focused procedures for those disciplines.

- `AGENTS.md`: authoritative permissions, evidence, implementation and delivery contract.
- `.agents/skills/*/SKILL.md`: task-specific procedures; must not contradict `AGENTS.md` or executable scripts.
- `AI/PROJECT.md` and canonical comments on #150: product intent and decisions.
- `AI/TASK-MANAGEMENT.md`: decision-to-task, MVP and Workboard rules.
- `AI/DEVELOPMENT-WORKFLOW.md`: issue-to-release sequence, review checklist and verification selection.
- `tests/QUALITY-MATRIX.md`: supported journeys, actor boundaries and known coverage gaps.
- `tests/README.md`: test layers, setup, commands and side effects.
- `scripts/README.md`, `package.json` and `scripts/project.mjs`: public commands and executable orchestration.
- `.github/workflows/*.yml` and live GitHub settings: actual automation configuration; never infer enforcement from documentation.
- `AI/SESSION.md`: concise cross-issue objective and next actions, not a task transcript.
- GitHub issues/PRs: task scope, approval, review and delivery evidence.
