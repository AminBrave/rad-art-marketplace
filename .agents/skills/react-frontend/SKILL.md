---
name: react-frontend
description: Implement or review Rademan React 18 JavaScript UI, routing, TanStack Query state, forms, accessibility, responsive layouts and Persian RTL behavior.
---

# React Frontend Engineering

## First inspect
- Confirm installed versions in package.json and lockfile; this project uses React 18 and JavaScript.
- Trace route -> page -> component -> hook/query -> API client -> backend contract.
- Inspect shared RAD tokens, primitives, layout conventions and nearby components before creating new UI.
- Reuse existing React Router 7 and TanStack Query 5 patterns.

## Engineering rules
1. Keep server state in the established TanStack Query approach; do not add another state library without a demonstrated need.
2. Keep API calls in established client/service modules. Handle cancellation, stale data, retries and invalidation deliberately.
3. Model loading, empty, success, error, validation, disabled and submitting states. Avoid blank or ambiguous transitions.
4. Keep components cohesive and composable. Avoid premature abstractions, excessive prop drilling, redundant state and effects that can be derived.
5. Use semantic HTML, accessible names, correct roles, keyboard interaction, visible focus and logical focus management.
6. Preserve Persian-first copy, RTL direction, mixed Persian/Latin text, numerals, long labels, responsive breakpoints and overflow behavior.
7. Use shared design tokens and primitives. Avoid one-off colors, spacing, typography, radii, shadows or interaction patterns.
8. Respect reduced-motion preferences and do not communicate status through color alone.
9. Treat frontend route guards as presentation only. Backend authorization must protect the data and action.
10. Keep rendering and bundle costs proportionate; avoid unnecessary dependencies and expensive rerenders.

## Verification
- Add or update focused component, integration or browser coverage when useful.
- Do not run tests, lint, type checks, builds, browser automation, Lighthouse or accessibility tools unless explicitly authorized.
- Do not convert JavaScript to TypeScript or adopt React 19 APIs as incidental cleanup.
