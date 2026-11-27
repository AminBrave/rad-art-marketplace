---
name: debugging
description: Diagnose and repair application bugs, exceptions, failed requests, regressions and inconsistent behavior using reproducible evidence. Use when the user reports an error, broken flow, unexpected output or an incident.
---

# Systematic debugging

## Purpose

Identify and verify the root cause before changing code.

## Use when

Use when observed behavior differs from expected behavior, an error is reported or a regression needs isolation. For incidents, prioritize containment and data safety.

## Workflow

1. Capture the symptom, expected result, environment, reproduction steps and recent changes.
2. Inspect the narrow execution path, configuration, logs and data; redact secrets and personal data.
3. Form explicit hypotheses and rank them by evidence and cost to falsify.
4. Reproduce safely, add targeted instrumentation if needed and change one variable at a time.
5. Trace UI, network, server, database and external services only as evidence requires.
6. Fix the cause, add regression coverage when in scope, then re-run reproduction and neighboring checks.
7. Remove temporary diagnostics and report what remains uncertain.

## Rademan context

For full-stack defects, trace React state and requests through Laravel routes, middleware, validation, policies, models and persistence. Consult [architecture](../../../AI/ARCHITECTURE.md) and [security](../../../AI/SECURITY.md).

## Quality bar

Separate observations, hypotheses and confirmed causes. Avoid random edits, broad rewrites, silent fallbacks and unredacted logs. Never run destructive data commands against an uncertain environment.

## Deliverable

A reproducible diagnosis, root-cause evidence, minimal repair, regression protection and exact verification status.
