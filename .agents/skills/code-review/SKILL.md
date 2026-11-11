---
name: code-review
description: Use to review a focused diff or implementation for correctness, security, performance, maintainability and project consistency without modifying files.
---

# Rademan Code Review

Adapted from Code Reviewer in Jeffallan/claude-skills (MIT).

## Review process

1. Read the task and acceptance criteria; summarize the intended behavior.
2. Inspect the focused diff and directly affected call sites/contracts.
3. Look for correctness defects, authorization/privacy gaps, race conditions, unsafe migrations, N+1/unbounded queries, frontend state bugs, accessibility regressions and missing failure handling.
4. Check whether docs, tests, API/data maps and feature registry need updates.
5. Report only actionable findings, ordered by severity, with file/line evidence and concrete impact.
6. Separate confirmed defects from questions, assumptions and optional improvements.
7. If no findings are identified, say what was reviewed and state that review is not a guarantee of correctness.

## Review rules

- Read-only: do not edit files unless the user changes the task from review to implementation.
- Do not block on personal style preferences when they conflict with project conventions.
- Do not execute tests, lint, builds, browser checks or scanners unless explicitly authorized.
- Do not infer that CI passed; this repository has no application CI checks.
