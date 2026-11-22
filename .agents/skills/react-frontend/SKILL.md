---
name: react-frontend
description: Implement or review Rademan React 18 JavaScript UI, routing, TanStack Query state, forms, accessibility, responsive layouts and Persian RTL behavior.
---

# React Frontend Engineering

## First inspect
- Confirm installed versions in package.json and lockfile; this project uses React 18 and JavaScript.
- Trace route -> page -> component -> hook/query -> API client -> backend contract.
- Inspect current shared tokens, primitives and nearby components, but do not treat the legacy RAD design system as a constraint. The product refactor retains only the five Rademan brand color anchors and rebuilds the rest.
- Reuse existing React Router 7 and TanStack Query 5 patterns.

## Engineering rules
1. Keep server state in the established TanStack Query approach; do not add another state library without a demonstrated need.
2. Keep API calls in established client/service modules. Handle cancellation, stale data, retries and invalidation deliberately.
3. Model loading, empty, success, error, validation, disabled and submitting states. Avoid blank or ambiguous transitions.
4. Keep components cohesive and composable. Avoid premature abstractions, excessive prop drilling, redundant state and effects that can be derived.
5. Use semantic HTML, accessible names, correct roles, keyboard interaction, visible focus and logical focus management.
6. Build mobile-first across Discover, Buyer Studio, Artist Studio and Admin Console. Preserve Persian-first copy, RTL direction, mixed Persian/Latin text, numerals, long labels, responsive behavior and overflow handling.
7. Use the new semantic design tokens and shared primitives established by the refactor. Retain only the brand color anchors Ivory #F7F5F0, Charcoal #242320, Terracotta #A64F31, Sand #D8C9B7 and Olive #536052; do not preserve legacy RAD tokens by default.
8. Respect reduced-motion preferences and do not communicate status through color alone.
9. Treat frontend route guards as presentation only. Backend authorization must protect the data and action.
10. Keep rendering and bundle costs proportionate; avoid unnecessary dependencies and expensive rerenders.

## Test contract for frontend refactors
- Whenever a React component, page, shell, route, navigation model, design token, theme, responsive layout, interaction or accessibility behavior changes, update its component/integration/browser tests in the same change.
- Assert user-visible behavior, accessible names/roles, state transitions, keyboard/focus behavior, responsive journey outcomes and theme semantics. Avoid coupling tests to incidental class strings, fixed CSS dimensions or retired component-library conventions.
- During redesign, replace obsolete assertions about old RAD tokens, old navigation hierarchies or retired visual primitives with assertions for the approved semantic token system and current Discover / Buyer Studio / Artist Studio / Admin Console journeys.
- Preserve meaningful loading, empty, error, permission, RTL, dark/light, keyboard and messaging regression coverage. If an old assertion no longer applies, document why and add equivalent/stronger coverage for the current contract.
- If a test fails, determine whether the code regressed or the test describes superseded behavior before changing either. Do not alter new production code solely to appease stale assertions; ask when the intended behavior is unclear.

## Verification
- Add or update focused component, integration or browser coverage when useful.
- Do not run tests, lint, type checks, builds, browser automation, Lighthouse or accessibility tools unless explicitly authorized.
- Do not convert JavaScript to TypeScript or adopt React 19 APIs as incidental cleanup.
