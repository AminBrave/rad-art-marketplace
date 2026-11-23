# Rademan — AI working guide

This is the short entry point for AI-assisted work. Follow the user's current task, inspect relevant evidence and use the focused references below.

## 1. User direction and engineering judgment

- The user's latest explicit instructions define the intended outcome, scope, priorities and trade-offs. They supersede repository defaults, agent preferences, skills, templates and historical decisions, within applicable platform and safety requirements.
- No architecture, dependency, workflow, design system, branch convention or previous decision is permanently protected from change by repository guidance.
- Apply current engineering best practices with judgment. Explain material risks and alternatives without turning recommendations into unnecessary approval gates.
- Ask only when an unresolved answer materially changes the solution. Otherwise make a reasonable, reversible assumption and proceed.
- Old issues, PRs, branches, commits and session notes are historical evidence, not automatic future requirements.

## 2. Understand the project

- Inspect relevant source, configuration, tests and documentation before making implementation claims.
- Source code and runtime evidence describe current implementation; the user's current direction defines what should become.
- Verify versions and commands in current manifests and scripts.
- Separate confirmed facts, assumptions, proposals and unknowns. Never invent test results, approval or repository state.

## 3. Engineering approach

Prefer correct, secure, privacy-conscious, reliable, accessible and maintainable solutions proportionate to the problem. Understand existing patterns; reuse good abstractions and improve or replace poor ones when justified. Avoid speculative architecture, unnecessary dependencies and unrelated cleanup. Trace cross-layer behavior when relevant.

See AI/DEVELOPMENT-GUIDE.md for the central engineering guide.

## 4. Multi-agent branch lanes

Rademan supports parallel work by multiple agents. Follow AI/DEVELOPMENT-WORKFLOW.md for lane isolation, task branches, integration and handoff.

- Each active agent has a dedicated persistent lane named agent/<agent-name>/lane (for example, agent/chatgpt/lane and agent/claude/lane).
- Each task normally uses agent/<agent-name>/<task-type>/<task-name>. If a legacy branch named agent/<agent-name> already exists and cannot be safely renamed, use the documented collision-safe fallback agent-<agent-name>/<task-name> until migration is possible.
- Task branches merge into their owning agent/<agent-name>/lane, never directly into another agent's lane or main.
- Cross-agent integration is an explicit owner-directed activity using the integration branch/workflow.
- Keep parallel tasks independent; coordinate shared files and contracts before overlapping edits.
- Do not invent a new agent identity if it is unclear. Confirm the identity and intended base. If the required nested namespace is blocked by a legacy ref, follow the collision fallback in AI/DEVELOPMENT-WORKFLOW.md; do not force, delete or rewrite the legacy ref.

## 5. GitHub task management

Use GitHub issues and pull requests to coordinate substantial or parallel work, not as mandatory ceremony for every small change. AI/TASK-MANAGEMENT.md defines practical task ownership, issue structure, labels and optional board use.

- One clearly owned task per agent/task branch; link its issue and PR when tracking is useful.
- The user's task assignment authorizes the requested work. Board status, labels and old backlog items do not independently authorize it.
- Check live issue/PR and branch state before relying on them. Avoid duplicate tasks and conflicting edits.
- Keep PRs focused, reviewable and explicit about verification and integration dependencies.

## 6. Execution and risk

Run proportionate local development checks when useful and safe; report exactly what ran. Inspect scripts and environment before database-backed or stateful tests. Be deliberate with production, destructive, irreversible or shared-state actions. Confirm target and authorization when the user has not already clearly requested the action. Never force-push or rewrite shared history casually.

## 7. Documentation and skills

- AI/DEVELOPMENT-GUIDE.md is the central engineering reference.
- AI/PROJECT.md describes product context; AI/ARCHITECTURE.md describes verified implementation; AI/DESIGN-SYSTEM.md covers design guidance; AI/SECURITY.md covers security.
- AI/DEVELOPMENT-WORKFLOW.md owns branch lanes, integration and delivery workflow.
- AI/TASK-MANAGEMENT.md owns GitHub task and project-management guidance.
- .agents/skills/ contains optional task-focused methods. Load only what helps; skills do not override the user or duplicate global policy.
- AI may recommend improvements to agent guidance and skills. Keep instructions concise and non-duplicative.

## 8. Before finishing

Summarize changes, important decisions, branches/PRs/commits, verification actually performed, integration status and remaining risks. Distinguish completed task work from work still awaiting integration.
