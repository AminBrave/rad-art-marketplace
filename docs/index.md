# Documentation Index

Start with [AGENTS.md](../AGENTS.md), then follow only the path relevant to the task. Do not read every document at startup.

| Need | Read |
|---|---|
| AI agent setup and specialist skills | [AI Agent Tooling](engineering/ai-agent-tooling.md) |
| ChatGPT Project connection and skill retrieval | [ChatGPT Project Integration](engineering/chatgpt-project-integration.md), [root ChatGPT entry point](../CHATGPT.md) |
| Product | [Vision and scope](product/vision-and-scope.md), [domain workflows](product/domain-workflows.md) |
| Code | [System overview](architecture/system-overview.md), [feature registry](architecture/feature-registry.md), [data model](architecture/data-model.md), [frontend](architecture/frontend-and-ui.md), [API](architecture/api-contracts.md) |
| Feature delivery | [Feature lifecycle](delivery/feature-lifecycle.md), [agent operating model](engineering/agent-operating-model.md) |
| GitHub | [Git and GitHub](engineering/git-and-github.md) |
| Tests and gates | [Testing strategy](engineering/testing-strategy.md), [quality gates](engineering/quality-gates.md), [local verification script](../scripts/verify) |
| Planning | GitHub Issues, Milestones and Projects; see [Git and GitHub](engineering/git-and-github.md) |
| Security | [Security model](security/security-model.md) |
| Operations | [Developer workflow](operations/developer-workflow.md), [CI/CD and workflow cleanup](operations/ci-cd-and-release.md), [deployment/recovery](operations/deployment-and-recovery.md) |
| Decisions | [ADR index](decisions/index.md), [ADR template](decisions/adr-template.md) |

## New-agent path

AGENTS.md → identify task domain → read only relevant docs/source → select one primary skill if useful → implement → inspect focused diff.

Use the documentation knowledge graph for document dependencies and change propagation. Do not generate or maintain a separate code graph.

## Execution policy

No GitHub Actions workflow runs application tests, lint, builds or E2E. AI agents must not run local verification unless the user explicitly asks. Development is localhost-first; Playwright E2E is optional and user-triggered. See [testing strategy](engineering/testing-strategy.md), [Git/GitHub](engineering/git-and-github.md), [CI/CD](operations/ci-cd-and-release.md) and [AI Agent Tooling](engineering/ai-agent-tooling.md).

## Documentation maintenance

When a change affects documented behavior, contracts, architecture, tests, security, operations or workflows, update only the directly affected documents and knowledge-graph/index links in the same change. Avoid duplicating policy text across documents; link to the authoritative page instead.

See [knowledge graph](knowledge-graph.md) for documentation dependencies and update propagation.
