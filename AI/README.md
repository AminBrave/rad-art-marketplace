# Rademan documentation

This folder contains the current product context and engineering guidance. It is intentionally not a project history, roadmap archive or collection of old AI prompts.

## Start here

1. Read the repository-root [AGENTS.md](../AGENTS.md) for contributor expectations.
2. Read [PROJECT.md](PROJECT.md) for product context.
3. Read [ARCHITECTURE.md](ARCHITECTURE.md) to locate the current implementation.
4. Read [DEVELOPMENT.md](DEVELOPMENT.md) for the engineering and delivery approach.
5. Open a focused topic only when relevant.

## Current references

- [Project](PROJECT.md) — product purpose and current experience areas.
- [Architecture](ARCHITECTURE.md) — verified source map, module ownership, routes and quality commands.
- [Development](DEVELOPMENT.md) — task approach, code quality, verification, Git and PR workflow.
- [Design system](DESIGN-SYSTEM.md) — visual principles, tokens and shared UI ownership.
- [Localization](LOCALIZATION.md) — locale state, translations, localized content and directionality.
- [Security](SECURITY.md) — security and privacy considerations.
- [Agent skills](../.agents/skills/README.md) — task workflows and their authoring/validation standard.

## Maintenance rules

- Current source code, manifests and runtime behavior define implementation facts.
- Keep one canonical document per subject; link instead of duplicating.
- Update the owning document in the same change when code alters architecture, commands, contracts or user-visible behavior.
- Remove obsolete plans, snapshots, completed task logs and superseded instructions. Do not keep an archive in this folder.
- Do not document a proposal as implemented or a static check as proof of runtime/accessibility behavior.
- Keep descriptions concise and specific to the current codebase. Re-check paths before documenting them.
