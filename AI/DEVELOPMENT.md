# Rademan — engineering and delivery guide

Use this as the single reference for task approach, engineering practices, verification and Git delivery. Scale the process to the actual risk; do not turn guidance into unnecessary ceremony.

## Working principles

- The user's latest explicit direction defines the requested outcome, scope and trade-offs.
- Inspect current source, callers, configuration and relevant tests before making implementation claims. Source establishes what exists; the user establishes what should change.
- Separate confirmed facts, assumptions, proposals and unknowns.
- Prefer the smallest coherent solution that meets the goal without avoidable coupling, security risk or migration cost.
- Preserve routes, API/data contracts, authorization, persisted data and user-visible behavior unless the task explicitly changes them.
- Do not introduce architecture layers, global state, dependencies or abstractions without a demonstrated need.
- Consider security, privacy, accessibility, RTL/LTR, responsive behavior, performance and recovery where relevant.
- Update the owning documentation in the same change when implementation facts or operating guidance change. Remove obsolete text instead of maintaining parallel histories.

## Task approach

1. Clarify the outcome, affected users, scope and meaningful exclusions.
2. Inspect the relevant route, component, data flow, API, authorization and callers.
3. Identify constraints, unknowns and failure states.
4. Choose the simplest sound implementation; compare alternatives when the decision is consequential.
5. Implement the behavior and appropriate regression coverage.
6. Review the diff for unintended scope, contract changes, secrets and stale documentation.
7. Run proportionate checks and report exactly what ran and what did not.

Use an issue or written plan when work spans sessions, has dependencies, is cross-layer/high-risk or benefits from durable acceptance criteria. Small, reversible tasks do not require project-management ceremony.

## Implementation practices

### Backend and data
- Validate untrusted input at server boundaries and enforce authentication, ownership and authorization on the server.
- Use database constraints and transactions for persisted invariants.
- Consider migration compatibility, data volume, rollback and recovery.
- Avoid mass-assignment vulnerabilities, N+1 queries, unbounded reads and accidental private-data exposure.
- Treat external APIs and webhooks as unreliable; authenticate, validate, make handlers idempotent and handle retries safely.

### Frontend
- Follow the current ownership map in [ARCHITECTURE.md](ARCHITECTURE.md).
- Keep remote state in TanStack Query, transient interaction state in component state/hooks, shareable state in the URL and genuinely global concerns in app providers.
- Use shared UI and semantic design tokens when they fit; improve or replace them when they prevent a better solution.
- Model loading, empty, no-results, validation, error, permission, disabled, busy and recovery states as relevant.
- Use semantic HTML, visible focus, keyboard operation and accessible labels.
- Preserve route-level lazy loading where it improves loading behavior.

### Tests and quality
- Tests should describe supported behavior and observable outcomes, not freeze implementation details.
- Add or update focused coverage for changed behavior, contracts, authorization and important failure cases.
- Never delete, skip or weaken a failing test merely to make a check pass.
- Choose the relevant test layer: unit, feature/API, integration, frontend interaction or browser journey.
- Report exact commands and observed results. Do not imply unrun checks passed.
- A static check or successful build is not proof of runtime behavior, visual quality or accessibility conformance.

## Task routing

| Task | Read first | Inspect |
|---|---|---|
| Product or feature | [PROJECT.md](PROJECT.md) | Current routes, screens, APIs and user journey |
| Architecture or refactor | [ARCHITECTURE.md](ARCHITECTURE.md) | Callers, public exports, dependency direction and contracts |
| Frontend/UI | [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) | Actual route, shared components, tokens, responsive and RTL states |
| Localization | [LOCALIZATION.md](LOCALIZATION.md) | Shared dictionaries/provider, localized fields and document direction |
| Security/auth | [SECURITY.md](SECURITY.md) | Server policies, middleware, ownership, validation and trust boundaries |
| Git/PR/CI | This document | Live branches, PR targets, workflow files and current scripts |

Read only what is relevant. Re-route if investigation reveals another affected domain.

## Git and delivery

Default workflow for a single task:
1. Start from the current `main`.
2. Create a short-lived branch such as `fix/<issue>-<slug>`, `feat/<issue>-<slug>`, `refactor/<issue>-<slug>` or `docs/<issue>-<slug>`.
3. Keep one coherent outcome per branch/PR; group related files in commits by task, not one commit per file.
4. Open a focused PR to `main` with scope, implementation notes, risks and actual verification.
5. Merge only when authorized and the required review/checks are satisfied.

Persistent agent lanes are optional for genuinely parallel work. Do not create them for ordinary tasks. Inspect remote refs before creating nested branch names; never delete or rewrite a legacy ref merely to satisfy a naming convention.

Use GitHub issues when ownership, dependencies, acceptance criteria or cross-session tracking materially help. Avoid duplicate issues and stale backlog work. A merged PR proves integration into its target branch, not deployment or release.

Do not force-push, rewrite shared history, change protections, deploy, release or perform destructive/shared-state operations without clear authorization for the action and target.

## Verification and handoff

For frontend changes, the current focused commands are:

```sh
npm run architecture:frontend
npm run lint
npm run production
npm run quality:frontend
```

Inspect current scripts before using any command, especially commands that touch databases, external services or shared state. Manual browser, RTL/LTR, theme, responsive, keyboard and assistive-technology checks must be reported separately from automated checks.

Finish with a concise summary of changes, branch/PR/commit, verification actually performed, integration state and remaining risks.
