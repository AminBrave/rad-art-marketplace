# Rademan Art Marketplace

Persian-first art discovery and artist-contact marketplace. Artists publish profiles and submit artworks for review; buyers discover work and contact artists. This is not currently a checkout/order-processing platform.

## Start here

1. [Agent contract](AGENTS.md)
2. [AI agent tooling](docs/engineering/ai-agent-tooling.md)
3. [Knowledge graph](docs/knowledge-graph.md)
4. [Documentation index](docs/index.md)
5. [Product scope](docs/product/vision-and-scope.md)
6. [System overview](docs/architecture/system-overview.md)
7. [Feature lifecycle](docs/delivery/feature-lifecycle.md)
8. [Roadmap](docs/delivery/roadmap.md)

## Stack

PHP 8.3+, Laravel 13, React 18 (JavaScript), React Router 7, Axios, TanStack Query 5, Vite 6, Tailwind CSS 3.4, Radix UI with shadcn-compatible configuration, Lucide React, Eloquent, PHPUnit 11, Node test runner and Python Playwright. GitHub Actions is retained only for separately scoped maintenance automation; it does not run application verification.

## Developer setup and commands

Use PHP 8.3+, Composer 2 and Node.js 20+. From a fresh clone, run npm run setup, configure .env and your local database, then run npm run db:migrate and npm run db:seed:demo. Start the full HTTP development stack with npm run dev (Laravel + Vite), or optional local HTTPS with npm run dev:https (requires Caddy).

Testing is manual and opt-in: AI agents must not run tests, lint, builds or E2E checks unless you explicitly ask. Run relevant npm/Composer commands locally when you choose to verify; Playwright E2E is optional and separate. GitHub Actions does not run application verification. The complete Windows/macOS/Linux setup, database, testing, build and release guide is [Developer Workflow](docs/operations/developer-workflow.md). Test-layer details are in [Testing Strategy](docs/engineering/testing-strategy.md).

## AI agent tooling

Project-scoped skills, Graphify setup, optional ECC usage and safe integration rules are documented in [AI Agent Tooling](docs/engineering/ai-agent-tooling.md). The curated skills live under .agents/skills/. No agent framework or graph package is a Laravel runtime dependency.

## Scope boundary

Implemented capabilities include public artist/artwork discovery, moderation, canonical direct conversations, messaging/safety, in-app notifications and editorial collections/featured artists. The Inquiry implementation and existing records are retained but the feature is disabled by default. See the [Feature Registry](docs/architecture/feature-registry.md) for reactivation. Payment capture, orders, shipping, refunds and payouts are not evidenced as implemented. Do not describe them as existing.

All feature work follows [feature lifecycle](docs/delivery/feature-lifecycle.md), [Git/GitHub workflow](docs/engineering/git-and-github.md) and [quality gates](docs/engineering/quality-gates.md).
