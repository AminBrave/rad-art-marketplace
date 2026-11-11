---
name: feature-planning
description: Use when defining a new Rademan feature, clarifying scope, writing acceptance criteria, or planning a cross-layer change.
---

# Rademan Feature Planning

Inspired by the Feature Forge skill in Jeffallan/claude-skills (MIT).

## Workflow

1. State the user outcome and the actor who needs it.
2. Inspect the existing feature registry, domain workflow and relevant source before proposing a new abstraction.
3. Record current behavior using source evidence; label assumptions and unknowns.
4. Define scope, explicit non-goals, acceptance criteria and important failure/permission cases.
5. Trace likely impact across Laravel routes/controllers/policies/models/migrations, API contracts, React routes/components/query state and operational behavior.
6. Prefer one small vertical slice. Split independent work only when interfaces and file ownership are clear.
7. Identify documentation and ADR updates required by the change.

## Rademan constraints

- Rademan is a Persian-first artist discovery and artist-contact marketplace; do not assume checkout, orders, shipping or payouts exist.
- Preserve established /api/v1 contracts unless a deliberate contract change is approved.
- Laravel authorization is the security boundary; frontend guards are UX only.
- Keep UI Persian-first, RTL, responsive and accessible.
- Do not add a dependency or architecture layer without a concrete need.
- Tests may be designed and updated, but do not execute tests, lint, builds, browser checks or verification commands unless the user explicitly asks.
- Ask a question only when a missing decision blocks a safe implementation; otherwise state a conservative assumption and proceed.
