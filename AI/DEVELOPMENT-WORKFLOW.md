# Rademan development workflow

Use this as a practical workflow, not a mandatory ceremony. Scale the process to the size, risk and ambiguity of the task. The user's explicit request determines the intended outcome and may simplify or change any default described here.

## 1. Understand the request

- Identify the outcome, affected users, scope and constraints.
- Read relevant source and project guidance; inspect callers and data flow when needed.
- Distinguish current implementation from intended product behavior.
- Identify important unknowns, dependencies and risks.
- If the request is clear, proceed. Ask only when an unresolved decision would materially change the solution.

## 2. Choose an approach

- Consider the simplest viable approach and relevant alternatives.
- Apply current best practices appropriate to the actual stack and problem.
- Prefer coherent changes that are easy to understand, test and evolve.
- Preserve existing contracts and behavior when they matter; change them deliberately when the request requires it.
- Avoid speculative architecture, unrelated refactoring and dependencies without a concrete benefit.
- State assumptions and meaningful trade-offs without turning recommendations into approval gates.

## 3. Implement

- Work in the branch and scope appropriate to the user's request.
- Follow existing patterns where they are sound; improve patterns where the task justifies it.
- Trace cross-layer behavior through UI, routes, middleware, controllers, policies, models, persistence and integrations as relevant.
- Consider validation, authorization, privacy, accessibility, localization, error handling and failure recovery at the boundaries affected.
- Update tests and documentation that no longer describe the intended behavior.
- Keep changes reviewable, but do not split tightly related work merely to satisfy a fixed process.

## 4. Verify proportionately

Choose checks based on what changed and the consequences of failure. Possible checks include focused tests, broader suites, lint, static analysis, builds, browser journeys, accessibility review, security analysis and manual inspection.

- Prefer focused checks first, then broaden when risk warrants it.
- Inspect available scripts and the actual environment before running commands.
- Use safe development data and avoid unintended external side effects.
- Report exactly what ran, what passed or failed, and what remains unverified.
- If execution is unavailable or inappropriate, provide the most useful alternative evidence and say what was not checked.

## 5. Deliver

Summarize:
- User-visible and technical changes.
- Important decisions and trade-offs.
- Files or systems affected.
- Verification performed and its result.
- Known limitations, migration considerations or remaining risks.

Use a branch, commit, issue or pull request when it helps collaboration or the user requests it. Do not create process artifacts just to satisfy a template.

## 6. GitHub and external operations

GitHub issues and pull requests can help coordinate work, but they are not a source of future product direction by themselves. Review their current status when relevant; do not automatically revive old tasks.

Before actions that affect shared or external state, confirm the intended target and scope. This includes production deployment, release, merge, force push, shared-history rewrite, destructive data operations and repository permission/settings changes. An explicit user request can authorize the relevant action. Do not assume authorization for unrelated side effects.

## 7. Improve the workflow

When a workflow step creates friction without improving quality, suggest a simpler alternative. Update this document when a durable improvement is adopted. Keep task-specific procedures in the relevant skill rather than copying them here.
