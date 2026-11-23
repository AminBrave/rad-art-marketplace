---
name: quality-engineering
description: Choose and improve tests, verification, accessibility and performance checks for Rademan changes.
---

# Quality engineering

## Purpose
Provide confidence in behavior and reduce regression risk without unnecessary test ceremony.

## Approach
1. Identify changed behavior, users, contracts and failure consequences.
2. Choose the test layers that protect those boundaries: unit, feature/API, integration, frontend or browser.
3. Prefer observable outcomes and stable contracts over incidental implementation details.
4. Cover relevant success, failure, boundary and unauthorized paths.
5. Review existing tests when product behavior or architecture changes; update tests that encode obsolete expectations while preserving meaningful security, privacy and data-integrity coverage.
6. Use lint, static analysis, builds, accessibility review, performance checks or security tooling when they add evidence.
7. Run focused checks first and broaden based on risk.
8. Report exact commands, environment and results. Distinguish tests from lint, builds, scans and manual review.

## Rademan context
Current scripts are declared in package.json and composer.json; scripts/project.mjs orchestrates several project commands. Inspect scripts and environment before running database-backed or browser checks. Browser journeys may use the configured application database, so confirm it is a safe development target.

## Deliverable
A proportionate verification plan or executed report, including coverage added, checks run, failures, limitations and residual risk. Do not claim that a check ran when it did not.
