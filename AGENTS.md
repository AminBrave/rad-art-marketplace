# Rademan — contributor entry point

Follow the user's latest explicit direction for the requested outcome, scope and trade-offs. Repository guidance and AI recommendations support the work; they do not override the user.

## Before changing code
- Inspect the current implementation, callers, configuration and relevant documentation. Treat source and runtime evidence as the authority for what exists.
- Read only the references relevant to the task; do not load the whole documentation set by default.
- Verify commands and dependency versions in the current manifests and scripts.
- Separate confirmed facts, assumptions, proposals and unknowns. Do not claim checks, approvals or repository actions that were not observed.

## Engineering
Prefer secure, accessible, reliable, maintainable solutions proportionate to the task. Understand existing patterns, preserve valuable behavior and contracts, and improve weak abstractions when the task justifies it. Avoid speculative layers, unnecessary dependencies and unrelated cleanup.

## Documentation map
- `AI/README.md` — documentation index and reading map.
- `AI/PROJECT.md` — current product context.
- `AI/ARCHITECTURE.md` — source-backed implementation map and ownership.
- `AI/DEVELOPMENT.md` — engineering approach, task routing, Git and delivery.
- `AI/DESIGN-SYSTEM.md` — current visual system, tokens and shared UI.
- `AI/LOCALIZATION.md` — Persian/English and RTL/LTR implementation.
- `AI/SECURITY.md` — security and privacy guidance.

Use the owning document as the canonical reference. Keep documentation aligned with current code; remove stale instructions instead of preserving parallel histories.

## Delivery
Use a task branch and focused PR for substantial changes. Keep related implementation, verification and documentation together. Merge, deploy, release, force-push or perform destructive/shared-state actions only when clearly authorized for the target. Report exact checks run, results, unrun checks and remaining risks.
