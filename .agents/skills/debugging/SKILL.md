---
name: debugging
description: Investigate reproducible defects, exceptions, broken flows, API failures, regressions and inconsistent behavior in Rademan.
---

# Systematic Debugging

## Workflow
1. Capture expected behavior, actual behavior, exact error, reproduction steps, environment and the first known failing point.
2. Inspect the narrowest relevant source path, logs and configuration. Expand only when evidence points elsewhere.
3. Trace the full request/state lifecycle: entrypoint, middleware, authorization, validation, business logic, persistence, response, frontend state and side effects as applicable.
4. Form falsifiable hypotheses. Rank them by evidence; state what observation would confirm or reject each.
5. Distinguish facts, inferences and unknowns. Do not label a hypothesis as a root cause.
6. Prefer a minimal fix at the true fault boundary. Avoid masking symptoms, weakening security or changing unrelated behavior.
7. Add or update a regression test at the layer that best protects the behavior, including a negative case where relevant.
8. Review adjacent paths for regressions and explain cause, fix, residual risk and user-run verification steps.

## Environment discipline
- Do not run commands, tests, servers, browser automation, migrations, seeders, cache clearing or database mutations unless explicitly authorized.
- If reproduction requires execution, explain the exact command, target environment and side effects, then request permission.
- Do not assume local, staging and production configuration are equivalent.
- Never invent logs, reproduce claims or verification results.
