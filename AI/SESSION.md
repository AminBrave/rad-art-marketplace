# AI handoff — current project state

> Durable handoff between chats, not a transcript or model memory. Keep concise and update only when project-wide state changes.

## Current objective
Maintain a safe, evidence-driven development workflow for Rademan. Work is organized as explicitly authorized GitHub delivery issues on one decision-driven Kanban board. There is no product-phase roadmap. The product interface direction is a coherent, app-like responsive web experience; authenticated users retain role-aware primary navigation across authenticated routes, a compact dashboard header with primary and secondary navigation grouped in the hamburger drawer, and a primary-only mobile/tablet bottom bar. See `AI/DESIGN-SYSTEM.md`.

## Project starting point
- Product: Persian-first artist discovery and artist-contact marketplace. See `AI/PROJECT.md`.
- Default integration branch: `main`.
- Single AI entry point: `AGENTS.md`.
- Human operating guide: `AI/README.md`.
- Engineering practices and curated external references: `AI/ENGINEERING-PLAYBOOK.md`.
- Task and Kanban rules: `AI/TASK-MANAGEMENT.md`.
- Issue-to-release workflow and verification selection: `AI/DEVELOPMENT-WORKFLOW.md`.
- Canonical product intent: #150, with 41 standalone decision records.
- Canonical task skills: `.agents/skills/`; there is no maintained `.claude/skills/` mirror.
- Optional local context helper: `npm run ai:context -- --task "<one-sentence task>"`.

## Confirmed workflow constraints
- Product decisions in #150 are future product intent unless separately authorized for implementation.
- When a decision is named, retrieve only its canonical record; do not read unrelated decisions by default.
- Every authorized task has a bounded MVP, explicit exclusions, acceptance criteria and evidence-based dependencies.
- GitHub issue numbers identify tasks; D01–D41 identify product decisions. They are different namespaces.
- The Rademan Workboard is the intended single execution view; #152 remains open and its live configuration must be verified before claiming setup is complete.
- No tests, lint, builds, migrations, seeders, scanners or CI without explicit permission for the specific execution.
- No deployment, merge, force-push, shared-history rewrite or repository-setting change without explicit permission.
- Preserve Laravel/API, React, RAD design-system, accessibility, Persian and RTL conventions.
- Current source and live GitHub state outrank chat history and AI-generated summaries.

## Architecture workstream status
- Parent epic #185 — architecture and unified development workflow: **closed/completed on 2026-11-19**.
- Child workstreams #186–#190 are closed. Relevant implementation and documentation PRs are merged to `main`.
- #209 batch implementation and end-of-batch approval documentation is complete through merged PR #210.
- #217 SendMessage action extraction is complete through merged PR #218.
- Higher-risk backend lifecycle, payload-serialization and authorization-consolidation candidates were deliberately deferred; do not treat them as approved follow-up implementation.
- Historical issues and PRs remain authoritative records. Verify live GitHub state before resuming any historical task.

## Current documentation work
- #219 — refresh agent skills and engineering playbook. This is the active task for the current documentation update.
- #152 — Workboard configuration remains a separate open task, outside #185.

## Batch delivery preference
- For a bounded, explicitly authorized workstream, state the batch scope and stop conditions once, then implement all safe, low-risk in-scope slices without per-slice approval.
- Keep independently reviewable outcomes in separate PRs; use draft PRs while maintainer verification is pending.
- Provide one consolidated set of exact backend/frontend/Playwright commands at the end, only for affected boundaries.
- Batch authorization does not authorize assistant-run tests, lint, builds, browser automation, CI, migrations, destructive operations, deployment or release.
- Stop for unresolved product, architecture, API/schema, authorization/privacy/security or material-risk decisions.
- See the authoritative rules in `AGENTS.md` and `AI/DEVELOPMENT-WORKFLOW.md`.

## Resume protocol
Read `AGENTS.md` first. Inspect the live issue/PR, current branch/commit and relevant source. For a named product decision, retrieve only its canonical record. Record confirmed facts, assumptions, unknowns, authorized scope, MVP, exclusions, verification status and next actions on the relevant issue. Update this handoff only when project-wide state changes.
