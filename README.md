# Rademan

Rademan is an art discovery and artist–audience platform built with Laravel and React. This repository contains the application, frontend, supporting scripts, tests and project guidance.

## Start here

- **AI contributors:** read [AGENTS.md](AGENTS.md), then open only the relevant references.
- **Development approach:** [AI/DEVELOPMENT-GUIDE.md](AI/DEVELOPMENT-GUIDE.md)
- **Product context:** [AI/PROJECT.md](AI/PROJECT.md)
- **Technical architecture:** [AI/ARCHITECTURE.md](AI/ARCHITECTURE.md)
- **Design guidance:** [AI/DESIGN-SYSTEM.md](AI/DESIGN-SYSTEM.md)
- **Security:** [AI/SECURITY.md](AI/SECURITY.md)
- **Development workflow:** [AI/DEVELOPMENT-WORKFLOW.md](AI/DEVELOPMENT-WORKFLOW.md)

## Technology

The manifests currently declare PHP 8.3+, Laravel 13, React 18, React Router 7, TanStack Query 5, Vite 8 and Node 20.19+. Verify the current manifests and lockfiles before relying on exact versions.

## Local development

1. Install the PHP and Node versions required by the current manifests.
2. Install PHP dependencies with Composer and JavaScript dependencies with npm.
3. Configure the local environment using the project's Laravel environment template and a development database.
4. Inspect the setup script and its side effects before running it: `npm run setup`.
5. Start the local development workflow with `npm run dev` after prerequisites and environment configuration are ready.

Available project commands are declared in package.json and composer.json. The scripts in scripts/project.mjs implement several project workflows; inspect a command before using it when its side effects are unclear.

## Project structure

- `app/`, `routes/`, `database/`: Laravel application, HTTP routes and persistence.
- `resources/js/`: React application and frontend components.
- `resources/css/`: application styling and design tokens.
- `tests/`: backend and frontend tests.
- `scripts/`: project setup, development, packaging and test orchestration.
- `AI/`: product, architecture, development and security guidance.
- `.agents/skills/`: optional focused guidance for AI-assisted work.

## Contribution principles

Understand the current behavior, clarify the intended outcome, choose a proportionate solution, protect user data, and verify the changed boundaries. Existing conventions are useful starting points, not immutable rules. The user's current explicit direction takes precedence over historical project assumptions.

See [AI/DEVELOPMENT-GUIDE.md](AI/DEVELOPMENT-GUIDE.md) for the complete development approach.
