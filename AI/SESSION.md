# AI handoff — current project state

> Durable handoff between chats, not a transcript or model memory. Keep under 100 lines.

## Current objective
Make Rademan straightforward and safe to develop with ChatGPT Free and Claude Free chat interfaces: one repository entry point, evidence-driven task routing, durable issue/PR tracking and reliable cross-chat recovery. No paid agent, Codex or autonomous IDE agent is required.

## Project starting point
- Product intent: Persian-first artist discovery and artist-contact marketplace. See `AI/PROJECT.md`.
- Main branch: `main`.
- Baseline before this work: `797e15b3bdaeb2e7925bf935bc686bf4a7227112` — script cleanup and skill navigation.
- Single AI entry point: `AGENTS.md`; optional human operating manual: `AI/README.md`.
- Canonical skills: `.agents/skills/`; Claude mirror: `.claude/skills/`.
- Context helper: `npm run ai:context -- --task "..."`; optional, not required in browser chats.

## Confirmed constraints
- No tests, lint, builds, migrations, seeders, scanners or CI without explicit permission for the specific execution.
- No dependency installation, deployment, merge, force-push or shared-history rewrite without explicit permission.
- Preserve Laravel/API, React, design-system, accessibility, Persian and RTL conventions.
- No paid coding-agent features assumed.
- AI must distinguish evidence, hypotheses, assumptions, unknowns and proposals; never invent inaccessible source, logs, product requirements or verification results.

## Current workstream
AI-friendly repository workflow and roadmap bootstrap.
- Epic: #148 — https://github.com/AminBrave/rad-art-marketplace/issues/148
- Implementation task: #149 — https://github.com/AminBrave/rad-art-marketplace/issues/149
- Product baseline audit: #150 — https://github.com/AminBrave/rad-art-marketplace/issues/150
- Draft PR: #151 — https://github.com/AminBrave/rad-art-marketplace/pull/151
- Working branch: `docs/ai-ready-free-tier-workflow`, originally based on `main` at `797e15b3bdaeb2e7925bf935bc686bf4a7227112`.
- GitHub labels, milestone objects/associations and branch protection are not yet configured; follow `AI/GITHUB-SETUP.md`.

## Decisions
- `AGENTS.md` is the only user-facing AI entry point; it routes to relevant docs and skills.
- `AI/README.md` is the human tutorial and prompt library; users do not need to mention its internal file paths in every prompt.
- Load only task-relevant skills and product context; do not load every skill by default.
- GitHub issues/PRs hold task-specific evidence and decisions. `AI/SESSION.md` holds only project-wide state.
- Current source and live GitHub state outrank chat history and AI-generated summaries.
- GitHub assigns issue numbers; never invent or reserve numbers.

## Open product questions
- Which artist and visitor segments are in the first launch?
- What are the primary discovery dimensions and ranking rules?
- Which contact methods are allowed, and what privacy/consent controls apply?
- What is the initial launch scope and success metric?
- What moderation, reporting and artist-verification rules are required?

## Suggested next tasks (AI-generated; validate against source and issues)
1. Complete the M1 product baseline audit in #150 with source evidence.
2. Convert confirmed product gaps into small issues with acceptance criteria and dependencies.
3. Reconfirm M2–M4 scope only after product-owner decisions and the baseline audit.
4. Review security/privacy, Persian/RTL, accessibility and performance on the highest-value confirmed flows.

## Resume protocol
Read `AGENTS.md` first, then select the minimum relevant context and skills. Inspect live issues/PRs and current source. Do not trust an old chat summary over repository state. Before ending substantial work, update the relevant issue/PR and this file only if project-wide objective, decisions, blockers or next actions changed.
