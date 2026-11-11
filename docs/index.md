# Documentation Index

This is a linked knowledge system. Start with [AGENTS.md](../AGENTS.md), then follow only the path relevant to the task.

| Need | Read |
|---|---|
| Product | [Vision and scope](product/vision-and-scope.md), [domain workflows](product/domain-workflows.md) |
| Code | [System overview](architecture/system-overview.md), [feature registry](architecture/feature-registry.md), [data model](architecture/data-model.md), [frontend](architecture/frontend-and-ui.md), [API](architecture/api-contracts.md) |
| Design system | [shadcn/ui New York adoption](architecture/shadcn-new-york-design-system.md) |
| Feature delivery | [Feature lifecycle](delivery/feature-lifecycle.md), [agent operating model](engineering/agent-operating-model.md) |
| GitHub | [Git and GitHub](engineering/git-and-github.md) |
| Tests and gates | [Testing strategy](engineering/testing-strategy.md), [quality gates](engineering/quality-gates.md), [local verification script](../scripts/verify) |
| Planning | Use GitHub Issues, Milestones and Projects; see [Git and GitHub](engineering/git-and-github.md). |
| Security | [Security model](security/security-model.md) |
| Operations | [Developer workflow](operations/developer-workflow.md), [CI/CD and workflow cleanup](operations/ci-cd-and-release.md), [deployment/recovery](operations/deployment-and-recovery.md) |
| Decisions | [ADR index](decisions/index.md), [ADR template](decisions/adr-template.md) |

New agent: AGENTS → graph → relevant product/architecture nodes → agent model → Git/GitHub → relevant tests. Avoid reading every document for a small task.

**Execution policy:** feature-branch pushes are CI-silent; pull requests targeting `main` and pushes to `main` run the configured application CI. Markdown-only push events are ignored, but PR events still run CI. A separate hourly maintenance workflow deletes completed Actions runs older than 24 hours. The exact `#FORCE_MODE` suffix is documented in [AGENTS.md](../AGENTS.md) as a bounded override for explicitly authorized work; it does not waive security, truthfulness, or platform protections. See [testing strategy](engineering/testing-strategy.md) and [CI/CD](operations/ci-cd-and-release.md).

**Documentation is part of the change:** whenever a user-requested or user-approved code change affects documented behavior, contracts, architecture, tests, security, operations or workflows, update the related documents and graph links in the same change.

See [knowledge graph](knowledge-graph.md) for dependencies and update propagation.
