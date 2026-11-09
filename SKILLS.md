# Engineering and Documentation Practices

This document defines how contributors should make changes in the Rad Art Marketplace. Repository-specific mandatory rules live in [AGENTS.md](AGENTS.md); the current product boundary and delivery sequence live in [README.md](README.md) and [ROADMAP.md](ROADMAP.md).

## Product and implementation approach

- Start from the user story and acceptance criteria in the relevant GitHub issue.
- Identify the actor and permissions involved: Guest, Buyer, Artist, or Admin.
- Inspect the current route, component, API controller, model/policy, migration, tests, and documentation before designing a change.
- Prefer a small vertical slice that uses the existing Laravel and React architecture.
- Reuse existing shared UI components and design tokens. Do not create a second design system.
- Avoid speculative abstractions, generic frameworks, premature service layers, and dependencies without a demonstrated need.
- Do not add APIs when existing endpoints and pagination metadata satisfy the real UI requirement.
- Keep Laravel authoritative for authorization, validation, ownership, and state transitions.

## AI-assisted implementation and multi-agent coordination

Use [`docs/ai-execution-playbook.md`](docs/ai-execution-playbook.md) as the operating procedure for AI coding agents. The approved roadmap and issue checklists are the scope contract.

### Required workflow

1. Read `AGENTS.md`, `README.md`, `ROADMAP.md`, the milestone issue and the exact task issue.
2. Inspect current code, API contract, policies, migrations, tests and relevant docs. Do not assume prior agent summaries are accurate.
3. Write a short implementation plan and list files/domains the agent will touch before editing.
4. Implement one issue as a small vertical slice. Keep schema, API, UI, tests and docs aligned.
5. Run focused tests first, then repository quality gates when feasible.
6. Review the diff for accidental scope, security/privacy regressions, accessibility, RTL and performance.
7. Open a PR with exact verification evidence; wait for independent review.
8. Update milestone and roadmap checklists only after acceptance criteria are verified.

### Agent role boundaries

- **Orchestrator / product architect:** owns scope, sequencing, dependencies, issue assignment and integration decisions; does not silently change approved roadmap.
- **Backend specialist:** Laravel models, migrations, controllers, requests, policies, resources, queries and backend tests.
- **Frontend specialist:** React routes, feature components, API integration, design-system reuse and frontend tests.
- **Design/UX reviewer:** editorial hierarchy, artwork prominence, responsive behavior, typography, RTL/LTR and interaction states.
- **QA/security reviewer:** independent test design, authorization/ownership, privacy, upload safety, regression and evidence review.
- **Code reviewer:** independently reviews changed lines, tests, maintainability, data integrity and scope. The implementation author cannot be the sole reviewer.

### Parallel execution rules

- Parallelize only tasks with non-overlapping files and no unresolved dependency.
- Use isolated branches/worktrees per task; do not share a dirty working tree.
- Shared API/schema contracts must be agreed before parallel frontend/backend implementation.
- Never run multiple agents' formatters or generators against the same files concurrently.
- Integrate in dependency order; rebase/merge from the latest approved base and rerun tests after conflict resolution.
- If an agent finds a scope change is necessary, stop and request product-owner approval before implementing it.

### Definition of done for AI-generated changes

- The linked issue's acceptance checklist is met.
- Tests cover success, validation/error, authorization/ownership and relevant edge cases.
- Migrations are safe and rollback/data-loss implications are documented.
- Public responses expose only approved/public fields; private inquiry/account data remains private.
- Loading, empty, error, success and permission states are considered.
- Persian RTL, mixed-direction text, keyboard/focus, contrast, reduced motion and responsive layouts are considered.
- Relevant docs and changelog are updated in the same PR.
- Exact test commands/results and unverified manual checks are recorded.
- Independent review has no unresolved blocker.

## Backend — Laravel

- Follow the existing Laravel 13 conventions and repository naming.
- Validate every write on the server; use Form Requests when they clarify substantial/reused validation.
- Enforce access through middleware and policies; never rely on client-side role checks.
- Use migrations for schema changes and seeders for reproducible reference data.
- Use transactions for multi-step writes that must succeed or fail together.
- Keep API payloads explicit and allow-listed. Never expose private account, inquiry, moderation, or storage data unintentionally.
- Preserve private artwork storage and policy-protected image delivery.
- Test happy paths, invalid input, role boundaries, ownership, and state transitions.

## Frontend — React, Router, and UI

- Keep the centralized React Router as the browser-navigation source of truth.
- Organize components by feature/domain; avoid oversized components and duplicated flows.
- Use the shared Axios conventions, shared UI components, Radix primitives, and semantic design tokens.
- Keep Persian copy and RTL behavior as defaults. Use logical CSS properties and isolate LTR values where needed.
- Implement loading, error, empty, permission, and success states where applicable.
- Use URL state for shareable discovery filters and pagination when appropriate.
- Treat client-side guards as navigation UX only; server authorization remains mandatory.

## Design and accessibility

- Follow the Contemporary Art Editorial direction: restrained, editorial, artwork-led, and not generic e-commerce/SaaS styling.
- Use the established palette, Vazirmatn for Persian, and Inter for Latin content.
- Preserve visible keyboard focus, semantic structure, labels, dialog behavior, contrast, reduced-motion preferences, and meaningful image alternatives.
- Consider narrow screens and touch targets in every UI change; record actual device/browser verification separately.

## Testing and review

Run the configured quality gates when dependencies and environment permit:

```bash
composer test
composer lint
npm run lint
npm run build
```

- Add/update focused tests for changed behavior and security boundaries.
- Review migration rollback/data-loss implications.
- Run only relevant manual smoke checks in a disposable environment.
- State exactly which checks ran and their results. Never infer success.

## Documentation is part of every feature

**A feature is not complete until its relevant documentation is updated in the same PR.** Do not postpone documentation updates to a later cleanup task.

Use this ownership map:

| Change | Update in the same PR |
|---|---|
| Product scope, delivery sequence, issue status | `README.md`, `ROADMAP.md` |
| User-visible behavior or meaningful implementation change | `CHANGELOG.md` |
| API endpoint, payload, validation, access, or status change | `docs/api-reference.md` |
| Data model, request flow, security boundary, dependency, or architectural decision | `docs/architecture.md` |
| Browser route, layout, guard, or navigation change | `docs/frontend-routing.md` |
| Tokens, typography, visual rules, or shared components | `docs/design-system.md` and/or `docs/ui-components.md` |
| Setup, environment, deployment, storage, backup, or recovery change | Relevant operational guide and `README.md` |
| Feature behavior or manual acceptance steps | `docs/manual-smoke-tests.md` |
| Release-wide verification or known limitation | `docs/qa-checklist.md` and/or `docs/release-checklist.md` |

### Documentation rules

1. Update the existing source-of-truth document; do not create a second document that repeats it.
2. Add a new document only when the subject has a distinct audience, procedure, or lifecycle and cannot fit clearly in an existing document.
3. Keep README concise and navigational. Detailed API contracts belong in the API reference; architecture decisions belong in architecture docs; execution steps belong in runbooks.
4. Keep changelog entries factual, dated, and in reverse chronological order. Do not use it as a roadmap or repeat whole documentation sections.
5. Keep roadmap status synchronized with the GitHub tracker. A route, placeholder, plan, passing build, or merged documentation PR is not proof that a feature is complete.
6. Remove or rewrite stale instructions when the implementation changes. Never leave old endpoint names, branches, status claims, or smoke-test steps behind.
7. Link every maintained document from the README or from a clearly relevant parent document; remove orphaned documents when they no longer have a unique purpose.
8. Before opening a PR, search the repository for stale references to changed routes, API fields, feature names, branches, and issue numbers.

## Definition of done

- Acceptance criteria are met without expanding the approved scope.
- Server-side authorization and validation remain intact.
- Relevant automated tests and quality gates pass, or blockers are explicitly recorded.
- UI states, RTL, keyboard, and responsive behavior are considered.
- Relevant docs and changelog are updated in the same PR.
- No redundant docs, dead links, secrets, generated dependencies, or build artifacts are introduced.
