# Rademan Documentation Knowledge Graph

This graph maps documentation dependencies and change propagation. It is a human-maintained map of documentation, not a graph of runtime code relationships.

~~~mermaid
flowchart TD
 A[AGENTS.md] --> K[Documentation graph]
 A --> AT[AI agent tooling]
 A --> CHAT[ChatGPT entry point]
 CHAT --> CPI[ChatGPT Project integration]
 CPI --> AT
 K --> P[Product vision]
 P --> D[Domain workflows]
 D --> S[System overview]
 S --> M[Data model]
 S --> F[Frontend]
 S --> API[API contracts]
 S --> FR[Feature registry]
 FR --> F
 FR --> API
 M --> SEC[Security]
 API --> SEC
 F --> T[Testing]
 API --> T
 SEC --> Q[Quality gates]
 T --> Q
 Q --> L[Feature lifecycle]
 L --> G[Git and GitHub]
 G --> C[CI/CD and release]
 C --> O[Operations]
 ADR[ADRs] -. constrains .-> S
 ADR -. constrains .-> API
 CM[Test coverage matrix] --> T
 RM[API route test map] --> T
 AT --> G
 AT --> T
~~~

## Nodes

- [AGENTS](../AGENTS.md): authoritative agent contract.
- [ChatGPT entry point](../../CHATGPT.md): ChatGPT-specific instructions for retrieving the actual relevant skill files when repository access is connected.
- [ChatGPT Project integration](engineering/chatgpt-project-integration.md): setup, skill routing and ChatGPT repository-access limitations.
- [AI agent tooling](engineering/ai-agent-tooling.md): selected frameworks, project skills and execution boundaries.
- [Vision](product/vision-and-scope.md): user value and boundaries.
- [Domain](product/domain-workflows.md): actor workflows and invariants.
- [System](architecture/system-overview.md): runtime and stack.
- [Feature registry](architecture/feature-registry.md): centralized feature switches and enforcement boundaries.
- [Data](architecture/data-model.md): entities and persistence invariants.
- [Frontend](architecture/frontend-and-ui.md): routes, state and UI rules.
- [API](architecture/api-contracts.md): endpoint groups and contracts.
- [Security](security/security-model.md): trust boundaries and threats.
- [Testing](engineering/testing-strategy.md): test layers and opt-in local commands.
- [Coverage matrix](engineering/test-coverage-matrix.md): route/domain/scenario evidence and gaps.
- [API route map](engineering/api-route-test-map.md): endpoint access, existing test evidence and remaining checks.
- [Quality](engineering/quality-gates.md): implementation/review checklist and risk tiers.
- [Lifecycle](delivery/feature-lifecycle.md): stages from issue to release.
- [GitHub](engineering/git-and-github.md): branching, commits, collaboration.
- [CI/CD](operations/ci-cd-and-release.md): maintenance automation policy and release.
- [Operations](operations/developer-workflow.md): installation, local development, database, tests and builds.
- [Deployment](operations/deployment-and-recovery.md): production hosting, deployment, backup and recovery.
- [ADRs](decisions/index.md): durable decisions; use [ADR template](decisions/adr-template.md).
- [Project task runner](../scripts/project.mjs): cross-platform setup, dev, database, test, build and production tasks.
- [Local verification](../scripts/verify): backward-compatible Bash/Git Bash wrapper; see [testing strategy](engineering/testing-strategy.md).
- [Coverage summarizer](../scripts/summarize-coverage.py): combines per-suite Clover reports into an overall line-coverage baseline and low-coverage priority list.

## Change propagation

Schema/domain → data, domain, API, tests, security. API → API docs, backend tests, frontend consumers, optional browser E2E. Feature availability → feature registry, backend route tests, frontend route/navigation tests and system/API/frontend docs. UI/navigation → frontend docs and browser tests. Auth/moderation/messaging/uploads/privacy → threat review. Workflow/release → CI/CD and GitHub docs. Test architecture or coverage changes → testing strategy, coverage matrix, route test map, tests README, PHPUnit configuration and quality gates. ChatGPT skill routing or setup changes → CHATGPT.md, ChatGPT Project integration, AI agent tooling and this graph. Do not add CI workflow references as application verification gates; no application CI workflow exists.
