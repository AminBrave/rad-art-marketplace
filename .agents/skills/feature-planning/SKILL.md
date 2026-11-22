---
name: feature-planning
description: Define Rademan feature scope, actors, acceptance criteria, cross-layer impact, risks and implementation sequence before coding.
---

# Feature Planning

## Workflow
1. Describe the user problem, desired outcome and primary actor(s).
2. Inspect the existing feature behavior and relevant source before proposing new abstractions.
3. Use current owner-approved product direction in `AI/PROJECT.md` and the live delivery issue. Retrieve a historical #150 record only when the owner explicitly names it; confirm explicit authorization. Define scope, explicit non-goals, assumptions, dependencies and unresolved decisions.
4. Write observable acceptance criteria for success, empty, loading, validation, permission-denied, failure and edge states as applicable.
5. Trace impact across Laravel routes, middleware, controllers, policies, models, migrations, resources, queues and storage; React routes, components, API clients and query state; plus tests and operations.
6. Identify API compatibility, data migration, privacy, security, accessibility, performance and rollback risks.
7. Define a task-specific MVP: the smallest coherent, useful and testable slice. If the decision is too large for one reviewable issue, use a parent epic and linked child tasks. Sequence only evidenced dependencies; do not infer order from decision numbering.
8. Specify test cases and verification commands without executing them unless authorized.
9. State decisions that require user approval; otherwise proceed with clearly stated conservative assumptions.

## Rademan constraints
- Rademan is a mobile-first visual-content platform connecting artists and buyers through artwork discovery and direct messaging. Target experiences are Discover, Buyer Studio, Artist Studio and Admin Console. Do not assume checkout, orders, shipping, payouts or subscriptions exist without source evidence.
- Preserve established /api/v1 contracts unless a deliberate contract change is part of the approved scope.
- Laravel authorization is authoritative; frontend guards are UX only.
- Preserve RTL, responsive behavior and accessible interactions. Retain only the five brand color anchors and rebuild the design system; do not treat legacy RAD tokens/components as constraints.
- Do not add dependencies, architecture layers or abstractions without a demonstrated requirement.

## Decision and issue discipline
- A product decision is intent, not permission, priority, architecture or a task by itself.
- Each authorized delivery issue links to current owner direction, records authorization, defines its MVP and lists exclusions. Link historical #150 records only when explicitly selected.
- Do not read unrelated historical records or create issues for all vision items automatically.
- Follow AI/TASK-MANAGEMENT.md; Rademan uses one decision-driven Kanban board, not a product roadmap or phase milestones.
