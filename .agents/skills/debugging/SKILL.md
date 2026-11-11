---
name: debugging
description: Use when investigating a defect, unexpected behavior, exception, broken UI flow, API failure or regression in Rademan.
---

# Systematic Debugging

Adapted from the Debugging Wizard skill in Jeffallan/claude-skills (MIT).

## Workflow

1. Capture the exact symptom, expected behavior, observed behavior and reproduction details supplied by the user.
2. Inspect relevant source, logs or stack trace. Do not scan the whole repository without a reason.
3. Trace the smallest plausible execution path from UI/API entrypoint to state, persistence or external dependency.
4. Form falsifiable hypotheses and rank them by evidence and likelihood.
5. Distinguish confirmed facts, inferred causes and missing evidence.
6. Make the smallest targeted fix; avoid changing several unrelated layers at once.
7. Review adjacent failure paths and add a regression test when appropriate.
8. Explain root cause, changed behavior, residual uncertainty and how the user can reproduce/verify locally.

## Execution boundary

Do not start servers, mutate databases, clear caches, install packages, run commands, tests, lint, builds, browser automation or verification unless the user explicitly asks. If reproduction requires execution, request permission and name the exact command and side effects first.

Never invent logs, claim a bug is reproduced without evidence, or say a fix is verified when it was not executed.
