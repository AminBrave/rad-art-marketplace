# AI handoff — current project state

> Durable handoff between chats, not a transcript or model memory. Keep concise and update only when project-wide state changes.

## Current objective
Maintain a safe, evidence-driven AI development workflow for Rademan. Work is organized as explicitly authorized GitHub delivery issues on one decision-driven Kanban board. There is no product-phase roadmap.

## Project starting point
- Product: Persian-first artist discovery and artist-contact marketplace. See AI/PROJECT.md.
- Default integration branch: main.
- Single AI entry point: AGENTS.md.
- Human tutorial: AI/README.md.
- Task and Kanban rules: AI/TASK-MANAGEMENT.md.
- Canonical product intent: #150, with 41 standalone decision comments.
- Canonical skills: .agents/skills/; Claude mirror: .claude/skills/.
- Optional context helper: npm run ai:context -- --task "...".

## Confirmed workflow constraints
- Product decisions in #150 are brainstorming/future direction unless separately authorized for implementation.
- When a decision is named, retrieve only its canonical comment; do not read unrelated decisions by default.
- Every authorized task has a bounded MVP, explicit exclusions, acceptance criteria and evidence-based dependencies.
- GitHub issue numbers identify tasks; D01–D41 identify product decisions. They are different namespaces.
- The Rademan Workboard is the only intended execution board. No product milestones or phase roadmap are used.
- No tests, lint, builds, migrations, seeders, scanners or CI without explicit permission for the specific execution.
- No deployment, merge, force-push, shared-history rewrite or repository-setting change without explicit permission.
- Preserve Laravel/API, React, RAD design system, accessibility, Persian and RTL conventions.
- Current source and live GitHub state outrank chat history and AI-generated summaries.

## Current documentation work
- #152 — configure the Rademan Workboard Kanban and repository labels.
- #153 — replace the old M0–M4 roadmap model with decision-driven task management.
- #150 remains the canonical product-intent register; brainstorming closed at Decision 41.
- #148 and #149 are completed historical AI-workflow records. Their old M0 wording is historical only.
- The former docs/ai-ready-free-tier-workflow branch is divergent from main; do not merge it wholesale. New work must branch from the current main.

## Resume protocol
Read AGENTS.md first. Inspect the live issue/PR, current branch/commit and relevant source. For a named decision, retrieve only its canonical comment. Record confirmed facts, assumptions, unknowns, authorized scope, MVP, exclusions, verification status and next actions on the relevant issue. Update this handoff only when project-wide state changes.