---
name: feature-planning
description: Define Rademan feature scope, actors, acceptance criteria, cross-layer impact, risks and implementation sequence before coding.
---

# Feature Planning

## Workflow
1. Describe the user problem, desired outcome and primary actor(s).
2. Inspect the existing feature behavior and relevant source before proposing new abstractions.
3. If the work derives from a product decision, retrieve only its canonical record from #150 and confirm explicit owner authorization. Define scope, explicit non-goals, assumptions, dependencies and unresolved decisions.
4. Write observable acceptance criteria for success, empty, loading, validation, permission-denied, failure and edge states as applicable.
5. Trace impact across Laravel routes, middleware, controllers, policies, models, migrations, resources, queues and storage; React routes, components, API clients and query state; plus tests and operations.
6. Identify API compatibility, data migration, privacy, security, accessibility, performance and rollback risks.
7. Define a task-specific MVP: the smallest coherent, useful and testable slice. If the decision is too large for one reviewable issue, use a parent epic and linked child tasks. Sequence only evidenced dependencies; do not infer order from decision numbering.
8. Specify test cases and verification commands without executing them unless authorized.
9. State decisions that require user approval; otherwise proceed with clearly stated conservative assumptions.

## Rademan constraints
- Rademan is a Persian-first artist discovery and artist-contact marketplace. Do not assume checkout, orders, shipping, payouts or subscriptions exist without source evidence.
- Preserve established /api/v1 contracts unless a deliberate contract change is part of the approved scope.
- Laravel authorization is authoritative; frontend guards are UX only.
- Preserve RTL, responsive behavior, accessible interactions and the shared RAD design system.
- Do not add dependencies, architecture layers or abstractions without a demonstrated requirement.

## Decision and issue discipline
- A product decision is intent, not permission, priority, architecture or a task by itself.
- Each authorized delivery issue links to its canonical decision record, records authorization, defines its MVP and lists exclusions.
- Do not read unrelated decisions or create issues for all vision items automatically.
- Follow AI/TASK-MANAGEMENT.md; Rademan uses one decision-driven Kanban board, not a product roadmap or phase milestones.
