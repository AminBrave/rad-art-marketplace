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

## Local checks
`composer test`, `composer lint`, `npm run test:frontend`, `npm run lint`, `npm run build`. Browser suite: install Playwright + Chromium, start Laravel, then `python -m unittest discover -s tests/browser -p 'test_*.py' -v`. See [testing strategy](docs/engineering/testing-strategy.md).

## Scope boundary
Implemented capabilities include public artist/artwork discovery, moderation, inquiries, canonical direct conversations, messaging/safety, in-app notifications and editorial collections/featured artists. Payment capture, orders, shipping, refunds and payouts are not evidenced as implemented. Do not describe them as existing.

All feature work follows [feature lifecycle](docs/delivery/feature-lifecycle.md), [Git/GitHub workflow](docs/engineering/git-and-github.md) and [quality gates](docs/engineering/quality-gates.md).
