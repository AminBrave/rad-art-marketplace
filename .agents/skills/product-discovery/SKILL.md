---
name: product-discovery
description: Research and frame Rademan user problems, opportunities, product hypotheses, validation experiments and outcome measures before delivery scope is authorized.
---

# Product Discovery

## Purpose and boundaries

Use this skill when the task is to understand what should be built, whether an opportunity is worth pursuing, or how to validate a product hypothesis. It is not an implementation authorization. Current product intent and authorization remain governed by `AI/PROJECT.md`, live owner-approved issues, `AI/TASK-MANAGEMENT.md` and `AGENTS.md`. #150 is a historical vision register; consult a specific record only when the owner explicitly selects it.

## Discovery workflow

1. **Frame the problem.** Identify the actor, context, task, pain point, current workaround and desired outcome. Avoid solution-first statements.
2. **Establish evidence.** Inspect only available, relevant sources: approved product decisions, support/feedback records, analytics, interviews, usability findings and current product behavior. State when evidence is unavailable.
3. **Separate certainty.** Label facts, direct observations, interpretations, assumptions and open questions. Do not invent customer quotes, usage metrics, market size or research findings.
4. **Map the journey.** Describe the current actor journey, friction points, trust concerns, accessibility needs and cross-role effects. Include Persian-first/RTL and mobile behavior where relevant.
5. **Frame the opportunity.** State who is affected, why it matters, frequency/severity if evidenced, and what outcome would improve. Consider non-software and workflow alternatives.
6. **Generate options.** Compare a small number of meaningfully different solutions, including doing nothing or improving the current flow. Explain user value, feasibility, risk, support/operational cost and dependencies.
7. **Test the riskiest assumption.** Propose the smallest ethical experiment or prototype that can distinguish options. Define the audience, method, success/guardrail signals, duration/sample rationale and decision rule only when evidence supports them. Do not fabricate numeric thresholds.
8. **Recommend a decision.** Give a clear proceed / test / revise / stop recommendation, confidence, evidence gaps and what would change the recommendation.
9. **Hand off to delivery.** Only after explicit product-owner authorization, create or update a bounded issue with MVP, exclusions, observable acceptance criteria, dependencies and verification plan. Link the current owner authorization and product direction; include a historical #150 record only when explicitly selected.

## Rademan-specific constraints

- Rademan is a mobile-first visual-content platform connecting artists and buyers through artwork discovery and direct messaging. Target experiences are Discover, Buyer Studio, Artist Studio and Admin Console. Do not infer checkout, payment, booking, shipping, payouts or other commerce capabilities.
- The 41 records in #150 are historical product intent, not the current product source of truth or delivery backlog. Retrieve a record only when the owner explicitly names it.
- A discovery recommendation, prototype, priority or board status does not authorize implementation.
- Preserve artist identity, artwork-led discovery, trust, privacy, inclusive content and clear contact expectations.
- Do not propose collecting sensitive personal data or tracking users without a clear, approved purpose and privacy review.

## Deliverable template

- **Problem / actor**
- **Evidence observed**
- **Assumptions and unknowns**
- **Current journey and friction**
- **Opportunity and desired outcome**
- **Options and trade-offs**
- **Smallest useful validation**
- **Success and guardrail signals**
- **Recommendation and confidence**
- **Decision / authorization needed**
- **If approved: delivery issue, MVP and acceptance criteria**

Keep discovery proportionate. Do not require interviews, analytics or experiments when the task is a small maintenance issue or the user already supplied a sufficiently clear, authorized requirement.
