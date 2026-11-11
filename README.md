# Rademan Art Marketplace

Persian-first art discovery and artist-contact marketplace. Artists publish profiles and submit artworks for review; buyers discover work and contact artists. This is not currently a checkout/order-processing platform.

## Start here
1. [Agent contract](AGENTS.md)
2. [Knowledge graph](docs/knowledge-graph.md)
3. [Documentation index](docs/index.md)
4. [Product scope](docs/product/vision-and-scope.md)
5. [System overview](docs/architecture/system-overview.md)
6. [Feature lifecycle](docs/delivery/feature-lifecycle.md)
7. [Roadmap](docs/delivery/roadmap.md)

## Stack
PHP 8.3+, Laravel 13, React 18, React Router 7, Axios, TanStack Query 5, Vite 6, Tailwind CSS 3.4, Radix UI with shadcn-compatible configuration, Lucide React, Eloquent, PHPUnit 11, Node test runner, Python Playwright and GitHub Actions.

## Developer setup and commands
Use PHP 8.3+, Composer 2 and Node.js 20+. From a fresh clone, run `npm run setup`, configure `.env` and your local database, then run `npm run db:migrate` and `npm run db:seed:demo`. Start the full HTTP development stack with `npm run dev` (Laravel + Vite), or optional local HTTPS with `npm run dev:https` (requires Caddy). Run `npm test` for backend/frontend tests, `npm run verify` for tests + lint + production builds, and `npm run verify:all` for the full suite including Playwright (requires a running local app and Python dependencies). The complete Windows/macOS/Linux setup, database, testing, build and release guide is [Developer Workflow](docs/operations/developer-workflow.md). Test-layer details are in [Testing Strategy](docs/engineering/testing-strategy.md).

## Scope boundary
Implemented capabilities include public artist/artwork discovery, moderation, inquiries, canonical direct conversations, messaging/safety, in-app notifications and editorial collections/featured artists. Payment capture, orders, shipping, refunds and payouts are not evidenced as implemented. Do not describe them as existing.

All feature work follows [feature lifecycle](docs/delivery/feature-lifecycle.md), [Git/GitHub workflow](docs/engineering/git-and-github.md) and [quality gates](docs/engineering/quality-gates.md).
