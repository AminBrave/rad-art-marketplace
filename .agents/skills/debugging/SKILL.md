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

## Test failure classification after refactors

When a test fails after a redesign, architecture change or product refactor, do not immediately change production code to satisfy it. Compare the assertion with the approved current product contract and classify the failure:
- **Regression:** implementation violates a still-valid invariant; fix code and keep/strengthen regression coverage.
- **Stale expectation:** test describes retired behavior or architecture; update it to assert the new approved behavior while preserving meaningful coverage.
- **Decision gap:** current product intent does not resolve the expected behavior; pause and ask the owner.
- **Environment/flakiness/tooling:** isolate the failure and report evidence without disguising it as a product defect.

Never skip, delete, quarantine or weaken tests just to get a green suite. If an assertion is retired, record why and what current invariant replaces it.

## Durable bug-issue record

Keep the GitHub issue—not the chat—as the canonical investigation record. Update it after each meaningful session:

- **Triage:** status, severity/priority, affected flow, first observed date, version/commit and environment.
- **Confirmed behavior:** expected vs actual, reproduction rate, minimal steps and user impact. Mark missing details unknown.
- **Sanitized evidence:** exact errors/log excerpts, screenshots, request/response or relevant record identifiers. Remove credentials, tokens, cookies, private keys and unnecessary personal data.
- **Dated investigation entries:** inspected files/symbols/logs; confirmed findings; unconfirmed hypotheses; experiments and exact results; changes/commit/PR; verification status; remaining questions and next 1–3 steps.
- **Diagnosis:** root cause remains unknown until evidence supports it; state confidence and contradictory evidence.
- **Fix acceptance:** cause addressed, regression coverage considered, failure/permission cases reviewed, verification recorded honestly, related PR linked.

For a new chat, read the live issue and latest investigation entries before continuing. Do not repeat recorded experiments or treat an old chat summary as evidence.

## Environment discipline
- Do not run commands, tests, servers, browser automation, migrations, seeders, cache clearing or database mutations unless explicitly authorized.
- If reproduction requires execution, explain the exact command, target environment and side effects, then request permission.
- Do not assume local, staging and production configuration are equivalent.
- Never invent logs, reproduce claims or verification results.
