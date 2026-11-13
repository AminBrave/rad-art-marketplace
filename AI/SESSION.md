# AI handoff — current project state

> Durable handoff between chats, not a transcript or model memory. Keep under 100 lines.

## Current objective
Make Rademan straightforward and safe to develop with ChatGPT Free and Claude Free chat interfaces: low-token context loading, predictable task handoffs, small reviewable changes and disciplined GitHub collaboration. No paid agent, Codex, MCP server or local IDE agent is required.

## Project starting point
- Product intent: Persian-first artist discovery and artist-contact marketplace. See `AI/PROJECT.md`.
- Main branch: `main`.
- Baseline before this work: `797e15b3bdaeb2e7925bf935bc686bf4a7227112` — script cleanup and skill navigation.
- Global rules: `AGENTS.md`; ChatGPT guidance: `CHATGPT.md`.
- Canonical skills: `.agents/skills/`; Claude mirror: `.claude/skills/`.
- Public commands: `package.json`; dispatcher: `scripts/project.mjs`.

## Confirmed constraints
- No tests, lint, builds, migrations, seeders, scanners or CI without explicit permission for the specific execution.
- No dependency installation, deployment, merge, force-push or shared-history rewrite without explicit permission.
- Preserve Laravel/API, React, design-system, accessibility, Persian and RTL conventions.
- No paid coding-agent features assumed.

## Current workstream
AI-friendly repository workflow and roadmap bootstrap. Update this section after the PR merges.

## Decisions
- One canonical global policy: `AGENTS.md`; platform-specific access guidance: `CHATGPT.md`.
- Load task skills on demand, never all skills by default.
- Committed project brief and session checkpoint are cross-chat continuity; do not rely on hidden model memory.
- Context command: `npm run ai:context -- --task "..." `; add `--chatgpt` when needed.
- GitHub assigns issue numbers; never invent or reserve numbers.

## Open product questions
- Which artist and visitor segments are in the first launch?
- What are the primary discovery dimensions and ranking rules?
- Which contact methods are allowed, and what privacy/consent controls apply?
- What is the initial launch scope and success metric?
- What moderation, reporting and artist-verification rules are required?

## Suggested next tasks (AI-generated; validate against source and issues)
1. Audit current product flows against the brief; report implemented, partial, missing and unclear behavior with source evidence.
2. Convert confirmed product gaps into small issues with acceptance criteria and dependencies.
3. Review security/privacy for artist contact, profile visibility, uploads and unpublished content.
4. Review Persian/RTL, accessibility, responsive and performance behavior on high-value flows.
5. Establish minimal useful CI checks only after the owner approves workflow execution and policy.

## Resume protocol
Read `AGENTS.md`, `AI/PROJECT.md`, this file, then the skill index and relevant skill files. Check live issues and PRs. Do not trust an old chat summary over repository state. Before ending substantial work, update objective, decisions, blockers and next 1–3 actions.
