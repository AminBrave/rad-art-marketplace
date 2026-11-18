# AI handoff — current project state

> Durable handoff between chats, not a transcript or model memory. Keep concise and update only when project-wide state changes.

## Current objective
Maintain a safe, evidence-driven AI development workflow for Rademan. Work is organized as explicitly authorized GitHub delivery issues on one decision-driven Kanban board. There is no product-phase roadmap. The product interface direction is a coherent, app-like responsive web experience; authenticated users retain role-aware primary navigation across authenticated routes, a compact dashboard header with primary and secondary navigation grouped in the hamburger drawer, and a primary-only mobile/tablet bottom bar, with existing header/account controls retained. See `AI/DESIGN-SYSTEM.md`.

## Project starting point
- Product: Persian-first artist discovery and artist-contact marketplace. See `AI/PROJECT.md`.
- Default integration branch: `main`.
- Single AI entry point: `AGENTS.md`.
- Human tutorial: `AI/README.md`.
- Task and Kanban rules: `AI/TASK-MANAGEMENT.md`.
- Canonical product intent: #150, with 41 standalone decision comments.
- Canonical skills: `.agents/skills/`; there is no maintained `.claude/skills/` mirror.
- Optional context helper: `npm run ai:context -- --task "..."`.

## Confirmed workflow constraints
- Product decisions in #150 are brainstorming/future direction unless separately authorized for implementation.
- When a decision is named, retrieve only its canonical comment; do not read unrelated decisions by default.
- Every authorized task has a bounded MVP, explicit exclusions, acceptance criteria and evidence-based dependencies.
- GitHub issue numbers identify tasks; D01–D41 identify product decisions. They are different namespaces.
- The Rademan Workboard is the only intended execution board. No product milestones or phase roadmap are used.
- No tests, lint, builds, migrations, seeders, scanners or CI without explicit permission for the specific execution.
- No deployment, merge, force-push, shared-history rewrite or repository-setting change without explicit permission.
- Preserve Laravel/API, React, RAD design system, accessibility, Persian and RTL conventions.
- RAD app-shell direction is defined in `AI/DESIGN-SYSTEM.md`; implementation uses shared role route definitions and a primary and secondary navigation inside the dashboard hamburger drawer plus a primary-only authenticated mobile/tablet bottom bar.
- Current source and live GitHub state outrank chat history and AI-generated summaries.

## Batch delivery preference
- The product owner has explicitly requested batching small, related implementation tasks to avoid per-slice approval overhead.
- For a bounded active workstream, state the batch scope and stop conditions once, then implement all safe, low-risk in-scope slices without asking for approval after each one.
- Keep issues and PRs independently reviewable; use draft PRs while the maintainer's combined local verification is pending.
- Provide one consolidated set of exact backend/frontend/Playwright commands at the end. The maintainer tests the batch and gives one batch-level approval for the review/merge step.
- Batch authorization does not authorize assistant-run tests, lint, builds, browser automation, CI, migrations, destructive operations, deployment or release. Stop for unresolved product, architecture, API/schema, security/privacy or material-risk decisions.
- See the authoritative batch rules in AGENTS.md and AI/DEVELOPMENT-WORKFLOW.md.

## Current delivery work
- #152 — configure the Rademan Workboard Kanban and repository labels (open; verify live state before resuming).
- #185 — architecture and unified development workflow epic (active).
- #186 — modular-monolith baseline and ADR (completed).
- #187 — agent/documentation reconciliation (completed; PR #200 merged).
- #188 — incremental backend modularity (open; PRs #193, #202, #206 and #208 merged; PR #207 remains draft pending batch review; higher-risk lifecycle/payload/authorization candidates are deferred).
- #189 — incremental React feature boundaries (completed; PRs #194–#199 merged).
- #190 — engineering review, verification and delivery workflow (completed; PR #201 merged).
- #209 — batch implementation and end-of-batch approval workflow (PR #210 draft pending maintainer verification/review).
- #153 — completed historical work replacing the old M0–M4 roadmap model with decision-driven task management.
- #150 remains the canonical product-intent register; brainstorming closed at Decision 41.
- #148 and #149 are completed historical AI-workflow records. Their old M0 wording is historical only.
- Historical branches are not integration sources; new work must branch from the current `main`.

## Resume protocol
Read `AGENTS.md` first. Inspect the live issue/PR, current branch/commit and relevant source. For a named decision, retrieve only its canonical comment. Record confirmed facts, assumptions, unknowns, authorized scope, MVP, exclusions, verification status and next actions on the relevant issue. Update this handoff only when project-wide state changes.
