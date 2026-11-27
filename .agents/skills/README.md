# Rademan agent skills

Focused workflows for recurring product and engineering tasks. Read only the skill that matches the request; combine skills only when a task genuinely crosses domains.

## Skill index

| Skill | Use for |
|---|---|
| [Architecture design](./architecture-design/SKILL.md) | Analyze or improve system architecture, module boundaries, integrations, data contracts and technical migrations |
| [Code review](./code-review/SKILL.md) | Review code changes for correctness, regressions, security, performance, accessibility and maintainability |
| [Systematic debugging](./debugging/SKILL.md) | Diagnose and repair application bugs, exceptions, failed requests, regressions and inconsistent behavior using reproducible evidence |
| [Documentation and skill maintenance](./documentation-maintenance/SKILL.md) | Create, audit, simplify and validate repository documentation, AGENTS instructions and Agent Skills |
| [Feature planning](./feature-planning/SKILL.md) | Turn product requests and feature ideas into implementable outcomes, scope, acceptance criteria and delivery steps |
| [Git and GitHub delivery](./git-github/SKILL.md) | Manage Git workflows, branches, commits, pull requests, issues and GitHub Actions safely |
| [Laravel backend engineering](./laravel-backend/SKILL.md) | Implement, debug and review Laravel backend features, APIs, database changes, authorization and integrations |
| [Operations and reliability](./operations-reliability/SKILL.md) | Assess and improve runtime reliability, deployment safety, observability, backups, recovery and production operations |
| [Product discovery](./product-discovery/SKILL.md) | Explore user problems, product opportunities, customer journeys, hypotheses and validation approaches for Rademan |
| [Quality engineering](./quality-engineering/SKILL.md) | Plan and perform proportionate software verification, testing, accessibility, performance and regression checks |
| [React frontend engineering](./react-frontend/SKILL.md) | Build, debug and optimize React interfaces, routing, state, forms and frontend integrations |
| [Security review](./security-review/SKILL.md) | Review application changes for authentication, authorization, privacy, data exposure, abuse and integration vulnerabilities |
| [UI and UX design](./ui-ux-design/SKILL.md) | Design or improve product journeys, information architecture, visual direction, interaction patterns and responsive accessible interfaces |

## Shared authoring standard

Every skill uses the same six sections: **Purpose**, **Use when**, **Workflow**, **Rademan context**, **Quality bar** and **Deliverable**.

- Make each skill one coherent capability with an actionable trigger description.
- Keep instructions concise and specific to this repository; do not restate generic model knowledge.
- Use progressive disclosure only when a real reference, deterministic script or asset is needed.
- Link to canonical `AI/` guidance instead of copying project facts into every skill.
- Match instruction strictness to risk: flexible guidance for judgment, explicit steps for fragile operations.
- Validate metadata, structure, length, links and index coverage. Evaluate triggering with representative prompts and near-misses when possible.

## Standards and upstream practice

- [Agent Skills specification](https://agentskills.io/specification) — portable folder and frontmatter contract.
- [OpenAI skill-creator](https://github.com/openai/skills/tree/main/skills/.system/skill-creator) — concise authoring, progressive disclosure and validation.
- [Anthropic skills](https://github.com/anthropics/skills) — practical skill examples and resources.
- [Vercel agent-skills](https://github.com/vercel-labs/agent-skills) — React performance and interface review guidance.
- [Superpowers](https://github.com/obra/superpowers) — systematic debugging, verification, review and skill evaluation.

Upstream references are guidance, not a mandate to copy another project's stack or workflow. Re-check them when substantially changing skills and adapt only practices that fit Rademan's current code and user requirements.

## Validation

Run `npm run skills:check` after changing a skill or this index. The check validates frontmatter, names, structure, length, relative links and index coverage. It does not evaluate semantic quality or prove that a skill triggers correctly.
