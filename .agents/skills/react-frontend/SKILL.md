---
name: react-frontend
description: Build, debug and optimize React interfaces, routing, state, forms and frontend integrations. Use when changing React components, hooks, TanStack Query flows, React Router routes, bundle performance or frontend behavior.
---

# React frontend engineering

## Purpose

Deliver clear, accessible and performant interfaces that follow current feature ownership and user needs.

## Use when

Use for browser UI, client state, navigation, forms, frontend data fetching or rendering performance.

## Workflow

1. Inspect manifests, routes, feature public exports, shared UI, hooks, styles and nearby behavior.
2. Trace server state, URL state, local interaction state and derived state; give each a clear owner.
3. Keep components focused and reuse shared abstractions only when they improve consistency.
4. Handle loading, empty, no-results, error, permission, disabled and recovery states.
5. Prevent avoidable request waterfalls and oversized bundles; lazy-load route/heavy code where appropriate.
6. Use stable list keys, derive render state directly and memoize only when cost is meaningful.
7. Verify keyboard access, responsive behavior, RTL/LTR, reduced motion and relevant browser journeys.

## Rademan context

Current manifests declare React 18, React Router 7, TanStack Query 5 and Vite 8; verify versions before using APIs. Follow [architecture](../../../AI/ARCHITECTURE.md), [design](../../../AI/DESIGN-SYSTEM.md) and [localization](../../../AI/LOCALIZATION.md).

## Quality bar

Frontend guards are not authorization. Avoid unnecessary global state, effects for derivable state, premature memoization and unmeasured optimization. Preserve route/API contracts and artwork media intent.

## Deliverable

Cohesive UI changes with explicit state behavior, accessible interactions, relevant regression coverage and exact verification.
