---
name: react-frontend
description: Use for React 18 JavaScript UI, React Router 7, TanStack Query 5, state, forms, accessibility, responsive layout and Persian RTL changes in Rademan.
---

# Rademan React Frontend

Adapted from the React Expert skill in Jeffallan/claude-skills (MIT). This project uses React 18 and JavaScript; do not assume React 19 or TypeScript.

## Workflow

1. Inspect the relevant route, page, component, hooks, query keys, API client and shared UI primitives.
2. Follow existing React Router 7 navigation and TanStack Query 5 data-fetching patterns.
3. Keep server state in the existing query/cache approach; do not add a second state library without a demonstrated need.
4. Model loading, success, empty, error, validation and submitting states.
5. Keep components composable and avoid premature abstractions, excessive prop drilling and unnecessary effects.
6. Preserve keyboard behavior, semantic HTML, accessible names, focus handling and reduced-motion preferences.
7. Validate Persian copy, RTL direction, responsive behavior and long-content overflow.
8. Treat frontend authorization as presentation only; server authorization remains authoritative.
9. Update frontend/API documentation when routes, navigation, state or contracts change.

## Constraints

- Use repository JavaScript conventions and existing build tooling; do not convert files to TypeScript as part of an unrelated task.
- Use installed React 18 APIs. Do not copy React 19-only examples blindly.
- Prefer existing Radix/shadcn-compatible primitives and design tokens.
- Do not add dependencies without a compatibility and bundle-cost reason.
- Tests may be written or updated when appropriate. Do not run tests, lint, type checks, builds or browser automation unless the user explicitly asks.
