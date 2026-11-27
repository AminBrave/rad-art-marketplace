---
name: quality-engineering
description: Plan and perform proportionate software verification, testing, accessibility, performance and regression checks. Use when changing behavior, reviewing test coverage, diagnosing CI failures or preparing a release.
---

# Quality engineering

## Purpose

Build confidence in observable behavior and reduce regression risk without unnecessary ceremony.

## Use when

Use when a code/configuration change needs verification, test coverage, CI diagnosis or release confidence.

## Workflow

1. Identify changed behavior, affected users, contracts and consequences of failure.
2. Choose suitable layers: unit, feature/API, integration, frontend interaction, browser journey or manual review.
3. Cover representative success, boundary, failure, permission and recovery paths.
4. Prefer observable outcomes and stable contracts over implementation-detail assertions.
5. Inspect relevant coverage and preserve security, privacy and data-integrity checks.
6. Run focused checks first, then broaden based on risk and environment.
7. Report exact commands, environment, results, skipped checks and residual risk.

## Rademan context

Inspect package.json and composer.json scripts before running them. Follow [engineering practices](../../../AI/DEVELOPMENT.md), [security guidance](../../../AI/SECURITY.md) and [design guidance](../../../AI/DESIGN-SYSTEM.md). Respect scope exclusions, including instructions not to inspect tests.

## Quality bar

Keep tests deterministic and isolated; do not weaken meaningful tests to pass CI. Distinguish tests, lint, builds, scans and manual accessibility/browser checks. Never claim unrun checks passed.

## Deliverable

A proportionate verification plan/report with coverage, commands, results, limitations, failures and remaining risk.
