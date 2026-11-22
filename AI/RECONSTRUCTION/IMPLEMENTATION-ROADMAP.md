# Rademan reconstruction — implementation roadmap

This sequence is a dependency plan, not permission to change every area at once. Re-check the latest main branch and linked issue before each implementation slice.

## Workstream 0 — Complete the baseline audit
- Finish route/API/data/permission mapping and verify related tests.
- Audit existing documentation and repository skills against the approved product direction.
- Record all findings and uncertainties on #265 and related child issues.
- No runtime verification is implied by source inspection.

## First implementation PR candidate (after audit closure)
- New semantic design-token architecture using only the five brand anchors.
- Shared responsive shell and role-aware navigation for Discover, Buyer Studio, Artist Studio and Admin Console.
- No API/schema/permission changes and no messaging behavior changes in this first slice.
- Confirm exact component and route scope against issues #265–#268 before implementation; do not run verification without explicit permission.

## Workstream 1 — Product foundations
- Define new semantic design tokens from the five retained brand anchors.
- Define typography, spacing, grids, component primitives, responsive breakpoints and RTL/LTR rules.
- Specify complete light/dark/system theme behavior.
- Establish shared public/authenticated shells and role-aware navigation.
- Preserve current route and API contracts by default.

## Workstream 2 — Discover
- Reconstruct home, artwork catalogue/detail, artist directory/profile and editorial collection presentation.
- Preserve existing data sources, filtering/pagination and inquiry context.
- Keep guest browsing accessible.

## Workstream 3 — Messaging / Inquiries
- Preserve the existing messaging subsystem and integrate the canonical Inquiries destination in Buyer and Artist Studio.
- Improve mobile list/detail navigation and desktop two-pane efficiency without changing backend behavior.
- Keep context, permissions, attachments and safety behavior intact.

## Workstream 4 — Buyer and Artist Studio
- Buyer: overview and Inquiries; do not invent buyer activity or saved features.
- Artist: overview, one Content Library, public profile and Inquiries.
- Avoid duplicate content managers and duplicate inbox surfaces.

## Workstream 5 — Admin Console
- Reorganize overview, content review, editorial curation, reports/trust and users/roles.
- Preserve moderation policy, role behavior and server-side access controls.

## Workstream 6 — PWA and quality
- Add manifest, icons and service-worker lifecycle with safe cache boundaries.
- Do not cache private workspaces/chat; define honest degraded-network behavior.
- Validate mobile installability, desktop support, light/dark themes, Persian RTL, accessibility and responsive layouts.

## Delivery discipline
- Use small, reviewable, issue-linked pull requests.
- Preserve contracts unless separately approved.
- Never run tests, lint, builds, browser automation, migrations, scanners or CI without explicit permission for the specific execution.
- No merge, deployment or release without separate approval.
