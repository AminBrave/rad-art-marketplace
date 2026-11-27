---
name: architecture-design
description: Analyze or improve system architecture, module boundaries, integrations, data contracts and technical migrations. Use when a task involves architecture decisions, dependency direction, system decomposition or risky cross-cutting refactors.
---

# Architecture design

## Purpose

Choose a maintainable architecture that solves the real problem without unnecessary complexity.

## Use when

Use for cross-module or cross-layer changes, new integrations, contract changes and consequential technical decisions. Skip formal architecture work for small local changes.

## Workflow

1. Define required behavior, constraints and quality attributes before choosing a pattern.
2. Inspect source, callers, data flows, dependencies and existing boundaries.
3. Map the current state and identify the specific pressure the design must relieve.
4. Compare the simplest viable option with alternatives that offer measurable benefits.
5. Evaluate coupling, compatibility, security, operations, migration and rollback costs.
6. Recommend one option with trade-offs; record an ADR only for costly or hard-to-reverse decisions.
7. Implement incrementally and add boundary checks where they protect the decision.

## Rademan context

Use [the current architecture map](../../../AI/ARCHITECTURE.md) and [engineering guide](../../../AI/DEVELOPMENT.md). Verify manifests and implementation; versions and ownership change.

## Quality bar

Prefer evolutionary change, explicit contracts and clear ownership. Do not introduce layers, event buses or abstractions without demonstrated need. Preserve behavior unless the request changes it.

## Deliverable

A concise decision or implementation with context, options, rationale, consequences, migration steps and proportionate verification.
