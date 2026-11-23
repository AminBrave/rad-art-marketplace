---
name: code-review
description: Review a Rademan change for correctness, security, maintainability, performance and user-visible quality.
---

# Code review

## Purpose
Find material defects, regressions and risks in the requested change. Keep findings distinct from optional preferences.

## Approach
1. Understand the change, intended outcome and relevant surrounding implementation.
2. Inspect the diff and trace important callers, contracts and data paths.
3. Evaluate correctness, edge cases, authorization, privacy, data integrity and failure handling.
4. Consider accessibility, localization, performance and maintainability where affected.
5. Review whether tests cover important behavior and negative paths; run checks only when appropriate to the task and environment.
6. Prioritize findings by severity and explain their evidence and impact.
7. Identify uncertainties and scope limitations.

## Rademan context
For cross-layer changes, consider Laravel enforcement as well as frontend behavior. For UI changes, review responsive, RTL and accessible states where relevant.

## Deliverable
Prioritized findings with file/symbol references, impact and suggested fixes. If no material findings are found, state what was reviewed and what was not verified.
