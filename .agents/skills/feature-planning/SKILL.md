---
name: feature-planning
description: Define Rademan feature scope, actors, acceptance criteria, cross-layer impact, risks and implementation sequence before coding.
---

# Feature Planning

## Workflow
1. Describe the user problem, desired outcome and primary actor(s).
2. Inspect the existing feature behavior and relevant source before proposing new abstractions.
3. Define scope, explicit non-goals, assumptions, dependencies and unresolved decisions.
4. Write observable acceptance criteria for success, empty, loading, validation, permission-denied, failure and edge states as applicable.
5. Trace impact across Laravel routes, middleware, controllers, policies, models, migrations, resources, queues and storage; React routes, components, API clients and query state; plus tests and operations.
6. Identify API compatibility, data migration, privacy, security, accessibility, performance and rollback risks.
7. Prefer the smallest end-to-end vertical slice. Sequence work by dependencies and keep unrelated improvements separate.
8. Specify test cases and verification commands without executing them unless authorized.
9. State decisions that require user approval; otherwise proceed with clearly stated conservative assumptions.

## Rademan constraints
- Rademan is a Persian-first artist discovery and artist-contact marketplace. Do not assume checkout, orders, shipping, payouts or subscriptions exist without source evidence.
- Preserve established /api/v1 contracts unless a deliberate contract change is part of the approved scope.
- Laravel authorization is authoritative; frontend guards are UX only.
- Preserve RTL, responsive behavior, accessible interactions and the shared RAD design system.
- Do not add dependencies, architecture layers or abstractions without a demonstrated requirement.
