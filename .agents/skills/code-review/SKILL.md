---
name: code-review
description: Review code changes for correctness, regressions, security, performance, accessibility and maintainability. Use when asked to review a PR, inspect a diff, audit a change, find bugs or assess implementation quality.
---

# Code review

## Purpose

Find actionable defects and material risks in the requested change, not stylistic preferences.

## Use when

Use for pull requests, commits, patches and implementations needing independent scrutiny. Stay within the requested review scope.

## Workflow

1. Establish the intended outcome, review base/head and inspect the complete diff.
2. Read surrounding code and trace affected callers, contracts, data paths and failure handling.
3. Check correctness, edge cases, authorization, privacy and data integrity.
4. Assess performance, accessibility, localization and maintainability where affected.
5. Check regression coverage and run only checks permitted by the task and safe in the environment.
6. Prioritize findings by severity with exact file/line evidence and realistic impact.
7. Re-check fixes against the original failure mode and report uncertainty.

## Rademan context

For cross-layer changes, inspect Laravel enforcement and React behavior. Use [architecture](../../../AI/ARCHITECTURE.md), [security](../../../AI/SECURITY.md) and [design guidance](../../../AI/DESIGN-SYSTEM.md) where relevant.

## Quality bar

Lead with defects. Distinguish blockers from suggestions; avoid speculative findings and nitpicks. Never claim unrun tests, browser checks or security assessments.

## Deliverable

Prioritized findings with severity, file/line, evidence, impact and remediation. If no material issue is found, state scope and what was not verified.
