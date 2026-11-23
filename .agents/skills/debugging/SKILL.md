---
name: debugging
description: Diagnose and resolve Rademan defects, regressions, exceptions and inconsistent behavior using evidence.
---

# Debugging

## Purpose
Find the cause of a problem, verify the explanation and implement a proportionate repair when requested.

## Approach
1. Capture the observed behavior, expected behavior, environment and reproduction details.
2. Inspect relevant source, logs, configuration, recent changes and tests.
3. Trace the narrowest likely execution path, expanding when evidence points elsewhere.
4. Separate confirmed facts from hypotheses and unknowns.
5. Reproduce with a safe method when possible; do not invent reproduction results.
6. Identify the root cause rather than masking symptoms.
7. Fix the cause and add focused regression coverage where valuable.
8. Verify the repair and check for nearby regressions.

## Rademan context
For cross-layer defects, trace React state and requests through Laravel routes, middleware, controllers, policies, models and persistence as relevant. Check role boundaries, private data, RTL and messaging behavior when affected.

## Deliverable
A concise diagnosis, evidence, root cause, fix, regression coverage and verification status. If the cause is not confirmed, state what evidence is still needed.
