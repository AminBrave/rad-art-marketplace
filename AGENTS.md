# Agent and Contributor Instructions

These instructions apply to automated agents and human contributors working in this repository.

## Start here

1. Read `README.md` for product scope, current behavior, setup, and documentation links.
2. Read `ROADMAP.md` before selecting work; distinguish implemented items from open milestones.
3. Read `SKILLS.md` and the relevant architecture/API documentation before changing a feature.
4. Inspect the existing implementation, tests, migrations, and frontend flow before proposing structural changes.
5. Work on a dedicated feature branch. Keep changes focused and reviewable.



## Branch and integration workflow

- `main` is the active integration branch. The agreed MVP 1 snapshot `cleaned-MVP-1` (commit `bd4599401e84cacc06807dea0db878fc2a9bd22d`) is historical baseline context, not the current branch from which new work should be created.
- Create a dedicated, focused feature branch from the latest `main` for each issue or cohesive implementation slice.
- Open pull requests against `main`; keep them small, reviewable, and scoped to the relevant issue.
- Run the repository quality gates when dependencies/environment are available: `composer test`, `composer lint`, `npm run lint`, and `npm run build`. Report checks that could not be run; never infer success from a merge or from an empty status-check list.
- Keep the MVP 2 GitHub delivery tracker and `ROADMAP.md` aligned as scope or delivery status changes.
- Never mark roadmap items complete based only on documentation or a successful build; verify the behavior and relevant acceptance criteria.

## Product boundaries

Build a Persian-first, RTL-oriented art discovery and artist-contact marketplace.

Do not implement payments, cart/checkout, order management, shipping, in-app chat/replies, mobile apps, AI recommendations, social networking, subscriptions, or advertising unless the product scope is explicitly revised.

The inquiry feature is a private contact-intake and status-tracking workflow. It is not a messaging platform and does not deliver email.

## Architecture and stack

- Backend: Laravel 13 / PHP 8.3+.
- Frontend: React 18 + Vite.
- Styling/UI: Tailwind CSS and Radix UI.
- Database: MySQL for deployment; in-memory SQLite for tests.
- HTTP: Axios.
- Hosting target: cPanel shared hosting.
- Keep API contracts explicit and versioned under `/api/v1`.
- Do not assume root access, Docker at runtime, Redis, persistent workers, queue daemons, or process managers.
- Do not downgrade to an end-of-life framework or bypass Composer platform/security checks to accommodate an unverified host.

## Security requirements

- Enforce authentication, authorization, and ownership on the server; UI visibility is not a security control.
- Use Laravel validation and mass-assignment protection.
- Preserve CSRF protection for state-changing browser requests and configure CORS narrowly if cross-origin access is introduced.
- Apply rate limits to authentication, artwork mutations, inquiries, and other abuse-prone endpoints.
- Keep secrets in environment configuration; never commit real credentials.
- Validate uploaded images by actual content/type, dimensions, and size. Generate safe filenames and never trust client-supplied storage paths.
- Prevent executable uploads and path traversal. Keep original/private files outside public paths.
- Escape user-generated content and avoid unsafe HTML rendering.
- Do not expose private account data or inquiry email addresses in public/API payloads.
- Log security-relevant events without logging passwords, tokens, or private inquiry content.
- Use least-privilege database credentials and follow the backup/restore runbook.

## Domain and UX rules

- Public catalogue and artwork detail/image access must expose approved artwork only.
- New artwork submissions and artist edits enter pending review; clients must not choose moderation state or ownership.
- Only the owning artist may edit their profile, artwork, or received inquiries; admins may moderate across the platform.
- Buyer inquiries may target only public artist profiles and, when attached, an approved artwork owned by that artist.
- Keep inquiry responses free of buyer and artist email addresses.
- Support Persian text, RTL layout, keyboard navigation, and responsive layouts.
- Store timestamps consistently; localize display dates and use Jalali presentation where required.
- Provide accessible labels, validation feedback, and loading/error/empty/success states.

## Quality gates

- Add or update tests for behavior changes, especially authorization, ownership, validation, and moderation.
- Run `composer test`, `composer lint`, `npm run lint`, and `npm run build` when the relevant dependencies/environment are available.
- Do not claim a check passed unless it was actually run; report unavailable checks explicitly.
- Review migrations for reversibility and data-loss risk.
- Update documentation and `CHANGELOG.md` for meaningful behavior or workflow changes.
- Never commit generated secrets, dependency folders, build artifacts, or local environment files.

## Delivery

Summarize what changed, why, checks actually run, and known limitations. Keep TODOs actionable and tie them to roadmap milestones or issues. Do not describe planned functionality as implemented.
