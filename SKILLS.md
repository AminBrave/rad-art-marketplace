# Engineering Skills and Working Agreements

This document describes the preferred implementation workflow and quality expectations for the Rad Art Marketplace MVP.

## Product discovery

- Translate requests into user stories and observable acceptance criteria.
- Identify the affected actor: Guest, Buyer, Artist, or Admin.
- Check proposed work against the scope and deferred features in `README.md`.
- Separate implemented behavior, planned work, and launch-critical verification.
- Prefer the smallest change that solves the user problem without widening the product scope.

## Backend — Laravel

- Follow conventional Laravel structure and naming.
- Use Form Requests when validation is shared or substantial; use Policies/Gates for authorization.
- Introduce service classes when they clarify domain workflows, not as a layer for every controller action.
- Use migrations for schema changes and seeders for repeatable reference/demo data.
- Use database transactions for multi-step writes that must succeed or fail together.
- Paginate public catalogue and administrative lists.
- Keep API responses predictable and avoid leaking internal or private model fields.
- Test role boundaries, ownership, moderation transitions, and upload constraints.

## Frontend — React and Vite

- Organize UI by feature/domain; avoid oversized components and duplicated flows.
- Route API requests through a small shared Axios layer with consistent error handling.
- Use Radix UI primitives with Tailwind styling and accessible interaction patterns.
- Establish RTL direction and Persian typography intentionally at application-shell and component levels.
- Represent loading, error, empty, and success states.
- Treat the server as the source of truth for authorization, validation, and business rules.

## UX and accessibility

- Design mobile-first and verify tablet and desktop breakpoints.
- Ensure visible focus, keyboard operation, semantic headings, accessible labels, and sufficient contrast.
- Make artwork imagery and metadata easy to scan.
- Provide understandable validation feedback for Persian-language forms.
- Verify right-to-left reading order, mixed Persian/Latin content, and form alignment.

## Security and operations

- Validate and authorize every mutation server-side.
- Treat uploads and inquiry forms as untrusted input.
- Use rate limiting and safe logging.
- Keep secrets out of source control.
- Keep private artwork originals outside public paths and use controlled image delivery.
- Document cPanel deployment, environment setup, storage permissions, migrations, backups, restore, and rollback.
- Do not introduce runtime dependencies on long-running daemons or privileged server access without an approved architecture change.

## Testing and review

- Write focused unit/feature tests for domain behavior and negative authorization paths.
- Test API validation and access control, not only happy paths.
- Run backend tests, PHP formatting checks, frontend lint, and production build when configured.
- Review migrations for rollback safety and possible data loss.
- Perform manual browser smoke tests for workflows that automated tests cannot fully cover.
- State clearly when checks could not be run.

## Definition of done

A change is complete when:

1. Acceptance criteria are met and the implementation matches the documented product boundary.
2. Server-side authorization and validation are in place.
3. Relevant automated tests pass, or any blocked/unavailable checks are explicitly recorded.
4. User-facing loading, error, empty, and success states are handled where applicable.
5. RTL, keyboard, and responsive behavior are considered for UI changes.
6. Documentation and changelog are updated when behavior, setup, or operations change.
7. No secrets, local environment files, generated dependencies, or build artifacts are introduced.
