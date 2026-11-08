# Engineering Skills and Working Agreements

This document defines the practical workflow and quality expectations for the Rad Art Marketplace MVP.

## Product discovery
- Translate requests into user stories and acceptance criteria.
- Identify the role affected: Guest, Artist, or Admin.
- Check every proposed feature against the MVP scope in `README.md`.
- Separate launch-critical requirements from later enhancements.

## Backend (Laravel)
- Use conventional Laravel structure, Form Requests for validation, Policies/Gates for authorization, and service classes only where they clarify domain logic.
- Use migrations for schema changes and seeders for repeatable demo/reference data.
- Use database transactions for multi-step state changes.
- Paginate catalogue and admin lists.
- Return consistent validation and error responses.
- Test role permissions, ownership boundaries, moderation transitions, and upload constraints.

## Frontend (React + Vite)
- Organize UI by feature/domain rather than creating oversized components.
- Use Axios through a small shared API layer with consistent error handling.
- Use Radix UI primitives with Tailwind styling and accessible interaction patterns.
- Keep RTL direction and Persian typography intentional at the application shell and component level.
- Include loading, error, empty, and success states.
- Avoid duplicating server-side business rules in the client.

## UX and accessibility
- Design mobile-first and verify common tablet and desktop breakpoints.
- Ensure focus visibility, keyboard access, semantic headings, labels, and sufficient contrast.
- Make artwork imagery and metadata easy to scan.
- Ensure forms explain validation errors in Persian-friendly language.

## Security and operations
- Apply server-side validation and authorization to every mutation.
- Treat uploads and contact forms as untrusted inputs.
- Add rate limiting and safe logging.
- Document cPanel deployment, environment setup, storage permissions, migrations, backups, and rollback.
- Do not require long-running daemons or privileged server access.

## Testing and review
- Write focused unit/feature tests for domain behavior.
- Test API validation and authorization, not only happy paths.
- Run formatter, test suite, lint, and production build where configured.
- Review migrations for reversibility and data-loss risk.
- State clearly when checks could not be run.

## Definition of done
A task is complete when acceptance criteria are met, server-side security boundaries are enforced, relevant tests are added and pass (or limitations are documented), UX states are handled, and docs/changelog are updated when needed.
