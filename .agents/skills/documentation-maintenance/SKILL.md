---
name: documentation-maintenance
description: Create, audit, simplify and validate repository documentation, AGENTS instructions and Agent Skills. Use when docs are stale or duplicated, codebase guidance changes, or a skill needs authoring, review or standards compliance.
---

# Documentation and skill maintenance

## Purpose

Keep instructions accurate, concise, discoverable and aligned with the current codebase and user direction.

## Use when

Use when code changes affect documented behavior or ownership, guidance conflicts, or a skill needs creation, improvement or validation.

## Workflow

1. Inventory relevant documents and skill resources; identify audience, trigger and canonical owner.
2. Verify implementation claims against source, manifests, workflows and runtime evidence.
3. Use portable Agent Skills frontmatter and make each skill one coherent job with an actionable description.
4. Keep SKILL.md concise; add references, scripts or assets only when they provide real on-demand or deterministic value.
5. Use one structure, direct links and canonical project references; remove stale duplicates rather than archiving by default.
6. Validate metadata, names, structure, length, links and index coverage; evaluate triggers with representative prompts and near-misses.

## Rademan context

Follow [the documentation map](../../../AI/README.md), [architecture](../../../AI/ARCHITECTURE.md) and [engineering guide](../../../AI/DEVELOPMENT.md). Use the [Agent Skills specification](https://agentskills.io/specification) and [OpenAI skill-creator](https://github.com/openai/skills/tree/main/skills/.system/skill-creator) as references.

## Quality bar

Treat descriptions as routing metadata. Use progressive disclosure, avoid duplicated facts and client-specific frontmatter in portable skills, and never present proposals as implemented. Test skills against real prompts when feasible.

## Deliverable

A small, coherent documentation change with clear ownership, validated links/metadata and an honest report of evidence and gaps.
