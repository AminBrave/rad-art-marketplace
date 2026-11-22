---
name: code-review
description: Read-only review of a focused Rademan diff or implementation for correctness, security, data integrity, accessibility, performance and maintainability.
---

# Code Review

## Purpose
Find material defects and risks in the requested change. Review is read-only unless the user explicitly changes the task to implementation.

## Workflow
1. Read the task, acceptance criteria and applicable AGENTS.md constraints.
2. Identify the exact diff and inspect affected callers, contracts, tests and nearby established patterns.
3. Trace behavior across relevant layers rather than reviewing changed lines in isolation.
4. Evaluate:
   - correctness, edge cases and failure handling;
   - authentication, authorization, privacy and input/file handling;
   - schema integrity, migration safety, transactions and concurrency;
   - API compatibility and frontend/backend contract alignment;
   - accessibility, keyboard/focus behavior, RTL and responsive states;
   - query efficiency, rendering cost, caching and resource lifecycle;
   - maintainability, duplication and unnecessary complexity.
5. Check whether tests cover both expected behavior and important negative cases. Do not execute them without permission.
6. Report actionable findings first, ordered Critical / High / Medium / Low. Include file and line evidence, impact, realistic preconditions and a focused remediation.
7. Separate confirmed defects from uncertainty and optional suggestions. If no findings are identified, state scope and limitations; do not imply proof of correctness.

## Test-contract review
- Check that every changed production behavior, architecture boundary or UI/design contract has corresponding updated tests in the same change.
- Challenge assertions that preserve retired design systems, old navigation structures, obsolete labels or incidental CSS implementation details. Tests should express current approved behavior and durable invariants.
- Verify that removed or relaxed assertions are genuinely obsolete and replaced by equivalent/stronger coverage where the underlying risk remains. Pay special attention to authorization, privacy, accessibility, RTL, messaging and data integrity.
- Flag production changes made solely to satisfy stale tests, as well as test deletions or weakened assertions without a documented rationale.

## Review rules
- Do not edit files, silently fix findings or broaden scope.
- Do not report speculative style preferences as defects.
- Do not claim tests, scanners, builds or CI passed unless direct evidence exists and execution was authorized.
- Follow AGENTS.md for all execution and CI permissions.
