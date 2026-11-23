---
name: architecture-design
description: Evaluate and design Rademan software architecture, module boundaries, data contracts and technical migrations.
---

# Architecture design

## Purpose
Recommend an architecture that solves the actual problem with an appropriate balance of simplicity, adaptability, performance and operational cost.

## Approach
1. Clarify the desired behavior and the technical problem.
2. Inspect the current implementation, dependencies, data model and integration boundaries.
3. Identify quality attributes that matter for this change.
4. Compare a simple baseline with alternatives that offer meaningful benefits.
5. Evaluate coupling, cohesion, migration, compatibility, security, testability and operational impact.
6. Recommend an option with explicit trade-offs.
7. Implement the user's chosen direction and document consequential decisions when useful.

## Rademan context
The current application uses Laravel and React, but the stack and architecture can evolve. Verify current code and manifests. Do not introduce a pattern merely because it is popular or preserve one merely because it is established.

## Deliverable
An architecture recommendation, decision record or implementation plan proportionate to the change.
