# Rademan reconstruction documents

This folder contains the source-backed baseline and target architecture for the current product refactor. These documents are derived from the latest `main` implementation and current product-owner direction; they are not competing implementation sources of truth.

## Baseline
- Inspected main commit: `4db615e7ff271446640dd79ad2aa1c24553f7966` (2026-11-21)
- Working branch: `refactor/rademan-product-foundation`
- Audit type: static source and repository inspection only; no runtime verification.

## Documents
- [Current state](CURRENT-STATE.md) — existing application structure and confirmed capabilities.
- [Target architecture](TARGET-ARCHITECTURE.md) — four product experiences and shared architecture.
- [Capability matrix](CAPABILITY-MATRIX.md) — preserve/refactor/replace/defer classification.
- [Route map](ROUTE-MAP.md) — current routes and proposed navigation.
- [Messaging preservation](MESSAGING-PRESERVATION.md) — constraints for the existing buyer–artist chat subsystem.
- [Implementation roadmap](IMPLEMENTATION-ROADMAP.md) — proposed sequencing and bounded work.

## Authority and maintenance
1. Before implementation, re-check latest `main`, record its SHA and inspect relevant source, migrations, configuration and tests.
2. If a finding in this folder conflicts with latest main, update this folder; do not change code to match a stale audit.
3. Product intent comes from `AI/PROJECT.md` and explicit owner-approved issues. Task authorization comes from the owner and live GitHub task scope.
4. Never infer or weaken actual authorization, privacy or safety controls from documentation.
5. Update this folder as architecture and implementation evolve. Mark unverified claims and unknowns explicitly.

## Audit limits
The baseline describes inspected source, not runtime behavior. No tests, builds, lint, browser automation, migrations, CI, security scans, accessibility scans or deployments were run as part of this audit.
