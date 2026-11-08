# Agent and Contributor Instructions

These instructions apply to all automated agents and contributors working in this repository.

## Before changing code
- Read README.md, ROADMAP.md, and the relevant sections of SKILLS.md.
- Inspect the existing implementation before proposing or making structural changes.
- Prefer small, reviewable changes that directly advance the MVP.
- If a requirement is ambiguous or conflicts with the current architecture, document the assumption rather than silently expanding scope.

## Product boundaries
- Build a Persian-first art discovery and artist-contact marketplace.
- Do not implement payments, cart/checkout, order management, shipping, in-app chat, mobile apps, AI recommendations, social networking, automated subscriptions, or advertising unless the product scope is explicitly revised.
- The MVP contact flow is a way for a visitor to reach an artist; it is not a messaging platform.

## Architecture and stack
- Backend: Laravel 13 by default (PHP 8.3+).
- Frontend: React + Vite.
- UI: Tailwind CSS and Radix UI.
- Database: MySQL.
- HTTP: Axios.
- Hosting: cPanel shared hosting. Avoid mandatory root access, persistent workers, Docker-at-runtime, Redis, or daemon processes.
- Keep backend API contracts explicit and versionable where practical.
- Do not downgrade to an end-of-life Laravel release or bypass Composer security advisories to accommodate an unverified host. Confirm host PHP support first.

## Security requirements
- Enforce authentication, authorization, and ownership checks on the server.
- Use Laravel validation and mass-assignment protection.
- Protect state-changing browser requests against CSRF where applicable; configure CORS narrowly.
- Apply rate limits to authentication, contact, and other abuse-prone endpoints.
- Store secrets only in environment variables; never commit real credentials.
- Validate uploaded images by allowed format, actual content, dimensions, and size. Generate safe filenames; do not trust user-supplied paths.
- Prevent executable uploads and path traversal. Keep originals/private files outside public paths when feasible.
- Escape user-generated content and avoid unsafe HTML rendering.
- Log security-relevant events without logging passwords, tokens, or sensitive message content.
- Use least-privilege database credentials and document backup/restore procedures.

## Data and UX
- Use clear status values for artwork moderation (for example: draft, pending, changes_requested, approved, rejected, archived).
- Artists may only modify their own records; admins may moderate across the platform.
- Public catalogue endpoints must expose approved/published artwork only.
- Support Persian text, RTL layout, keyboard navigation, and responsive mobile/tablet/desktop layouts.
- Store timestamps consistently; localize display dates and use Jalali presentation where required.
- Provide accessible labels, validation feedback, empty states, and loading/error states.

## Quality gates
- Add or update tests for behavior changes, especially permissions and moderation.
- Run relevant backend tests, frontend lint/type checks, and production builds when available.
- Do not claim a check passed unless it was actually run.
- Update documentation and CHANGELOG.md for meaningful changes.
- Never commit generated secrets, dependency folders, build artifacts, or local environment files.

## Delivery
- Summarize what changed, why, tests/checks run, and known limitations.
- Keep TODOs actionable and link them to roadmap milestones or issues.
