# Agent and Contributor Instructions

These instructions are mandatory for automated agents and human contributors.

## Start every task here

1. Read [README.md](README.md) for product scope, implemented capabilities, setup, and documentation map.
2. Read [ROADMAP.md](ROADMAP.md) and the relevant GitHub issue before selecting work.
3. Read [SKILLS.md](SKILLS.md) for engineering, review, and documentation standards.
4. Inspect the latest `main`, current implementation, tests, migrations, and relevant docs before editing.
5. Check open/recent PRs to avoid duplicating or reviving superseded work.
6. Create a focused branch from the latest `main`. Keep one cohesive stage or feature slice per PR.

## Branch, review, and integration workflow

- `main` is the only active integration branch. `cleaned-MVP-1` is historical baseline context only.
- Create new work branches from the latest `main`; target PRs at `main`.
- Do not build on old stacked feature branches or use historical PR branches as a baseline.
- Keep PRs scoped to the issue(s) they complete and state what is deliberately excluded.
- Run `composer test`, `composer lint`, `npm run lint`, and `npm run build` when available. Report exact results; do not infer success from a merge.
- Do not merge a PR unless the user explicitly authorizes merging or asks to finish/integrate the stage.
- Update the GitHub delivery tracker and `ROADMAP.md` when a stage changes status.

## Product direction and boundaries

Rad Art is a Persian-first, RTL-by-default art discovery and artist-contact marketplace. The approved MVP 2 visual direction is **Contemporary Art Editorial**: restrained, editorial, artwork-led, and distinct from generic e-commerce/SaaS templates.

MVP 2 includes the public marketplace, artist workspace, buyer workspace, admin workspace, shared design system, centralized routing, responsive behavior, localization, accessibility, performance, and release QA. Small Laravel/API changes are allowed only when an approved UI requirement cannot be met safely by the existing API.

Do not implement without an explicit scope revision:
- Payments, cart, checkout, orders, or shipping.
- Group chat, public social networking, native mobile apps, AI recommendations, subscriptions, or advertising.
- General-purpose admin reports/abuse queue, category management, or featured placements unless explicitly brought into scope.

M05 issue #77 explicitly approves private one-to-one conversations, replies, edits/deletes, reactions, private attachments, in-app notifications, message reporting/blocking, and a messaging moderation queue. Real-time transport and optional email remain conditional on verified target-host support, privacy controls, and operational configuration; do not add Redis, persistent workers, daemons, or external services without that verification.

Email verification and password-reset UX are not currently implemented. Do not promise or imply them.

## Architecture and technology

- Backend: Laravel 13 / PHP 8.3+.
- Frontend: React 18, Vite, React Router 6.
- UI: Tailwind CSS 3, Radix UI, shared components under `resources/js/components/ui`.
- Database: MySQL for deployment; in-memory SQLite for tests.
- HTTP: Axios and Laravel session authentication/CSRF.
- Hosting target: cPanel shared hosting; actual host compatibility is unverified.

Keep the Laravel monolith and centralized React Router. Do not introduce microservices, repositories/services for every model, global state frameworks, new runtime infrastructure, or dependencies without a concrete requirement and documented rationale. Do not assume Docker at runtime, Redis, persistent workers, queues, daemons, root access, or process managers.

## Security and domain requirements

- Server-side authentication, authorization, ownership, validation, and state transitions are mandatory. UI hiding is never a security control.
- Public artwork discovery/detail and public artist portfolios expose approved artwork only.
- Artist submissions and edits enter pending review; the client cannot set owner or moderation state.
- Only the owning Artist may edit their profile/artwork or manage inquiries addressed to that profile; Admin access follows policies.
- Buyer inquiries may target public artist profiles and optionally approved artwork owned by that artist.
- Inquiry and conversation payloads must not expose either party's email address. Conversation messages use the separate participant-scoped M05 APIs; do not claim email delivery or real-time transport until those services are configured and verified.
- Keep original artwork uploads private. Validate actual image type, dimensions, and size; use policy-protected image delivery.
- Keep secrets in environment configuration; never commit credentials or production data.
- Escape user-generated content and avoid unsafe HTML rendering.
- Preserve session/CSRF behavior. Review cookie, CORS, and middleware implications before changing auth architecture.

## Documentation is required in every feature PR

**Every feature change must update its relevant documentation in the same PR.** This is a release requirement, not optional cleanup.

- API changes → `docs/api-reference.md`.
- Route/layout/guard/navigation changes → `docs/frontend-routing.md`.
- Domain/data/security/architecture changes → `docs/architecture.md`.
- Design tokens/components → `docs/design-system.md` and/or `docs/ui-components.md`.
- User-visible behavior → `CHANGELOG.md`.
- Setup/operations changes → relevant runbook and `README.md`.
- Stage/scope/status changes → `ROADMAP.md`, `README.md`, and GitHub issue #30.
- Manual acceptance changes → `docs/manual-smoke-tests.md` and relevant QA checklist.

Update existing documents instead of creating duplicates. Remove stale statements, links, and steps when behavior changes. Do not create a new document unless it has a distinct, maintained purpose. Keep README as the concise entry point and the specialist document as the detailed source of truth.

## Quality gates and delivery

- Add/update automated tests for behavior, validation, role boundaries, ownership, and state transitions.
- Run `composer test`, `composer lint`, `npm run lint`, and `npm run build` when the environment supports them.
- Review migrations for reversibility and data-loss risk.
- Consider Persian/RTL, keyboard access, focus, semantic labels, responsive layouts, and reduced motion in UI work.
- Never claim manual/device/production checks unless they were actually performed.
- Summarize scope, implementation, docs updated, CI results, manual checks, known limitations, and follow-up work.
