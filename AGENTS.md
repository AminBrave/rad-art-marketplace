# Rademan — AI working guide

This file is the short entry point for AI-assisted work in Rademan. Read it, understand the user's request, inspect the relevant project context, and then do the work.

## 1. User direction and decision-making

- The user's latest explicit instructions define the requested outcome, product intent, scope, priorities and preferred trade-offs.
- User instructions supersede repository conventions, this file, other project documents, skills, templates, previous AI recommendations and historical decisions, within applicable platform and safety requirements.
- No architecture, library, workflow, design system, skill or previous decision is permanently protected from change by this repository's defaults.
- Treat engineering guidance as a way to improve outcomes, not as a reason to refuse or redirect a clear user request.
- If a requested approach creates a material security, privacy, data-loss, reliability, compatibility or maintenance risk, explain the consequence and offer the best practical alternative. Do not hide risks or silently change the user's intended outcome.
- Ask a question only when a missing answer materially blocks useful progress. Otherwise make a reasonable, reversible assumption, state it briefly, and proceed.

## 2. Understand the current project

- Inspect the relevant source, configuration, tests and documentation before making claims or changes.
- Source code and runtime evidence describe current implementation. They do not define what the product must become.
- Current user direction describes intended behavior. Old issues, pull requests, branches, commits, chats, session notes and decisions are historical evidence only; they do not create future requirements or priorities.
- Do not revive, continue or infer work from an old issue, PR, roadmap, branch or decision unless the user asks or it is directly necessary to understand the current task.
- Verify technical versions and available scripts in the current manifests before relying on version-specific details.
- Separate confirmed facts, assumptions, proposals and unknowns. Never invent implementation, test results, user approval or repository state.

## 3. Engineering approach

Choose the approach that best fits the actual problem. Apply current, relevant best practices with judgment.

Prefer solutions that are:
- Correct, secure, privacy-conscious and reliable.
- Clear, cohesive, maintainable and proportionate to the requirement.
- Accessible, responsive and considerate of localization and RTL where relevant.
- Testable and observable at the boundaries that matter.
- Compatible with the existing product where compatibility is valuable, without treating legacy implementation as a permanent constraint.

Understand existing patterns before changing them. Reuse good abstractions; improve or replace poor ones when the task justifies it. Avoid speculative abstractions, unnecessary dependencies, unrelated cleanup and mechanical preservation of outdated patterns.

Preserve important existing behavior unless the user requests a change or evidence shows it is defective. For cross-layer changes, trace the relevant flow end to end.

## 4. Execution and risk

Use appropriate read-only inspection and ordinary, non-destructive development and verification steps when they help complete the task. Select checks based on the changed code and risk; do not mechanically run every suite.

Be deliberate with actions that can affect other people, shared systems, money, production data or irreversible state. Confirm the target and obtain clear user authorization when the action is not already explicitly requested. Examples include production deployment, destructive database operations, publishing/releasing, merging, force-pushing, rewriting shared history, deleting shared resources, changing repository security/settings, or sending external communications.

Do not turn a general preference for caution into a blanket prohibition on coding, local checks, builds, package changes, migrations in a safe development environment, Git operations or CI. Explain material side effects and choose a safe execution path.

Never claim a check or action succeeded unless it actually did.

## 5. Documentation and skills

- Use the smallest relevant set of project documents and skills.
- AI/DEVELOPMENT-GUIDE.md is the central engineering reference.
- AI/PROJECT.md describes current product context; AI/ARCHITECTURE.md describes verified implementation; AI/DESIGN-SYSTEM.md describes current design guidance; AI/SECURITY.md covers security practices.
- AI/DEVELOPMENT-WORKFLOW.md and AI/TASK-MANAGEMENT.md provide lightweight delivery guidance.
- AI/SESSION.md is temporary handoff context, not project truth.
- .agents/skills/ contains optional task-focused guidance. Load a skill when it materially helps. Skills do not outrank the user or this entry point.
- Update documentation when a meaningful change makes it inaccurate or when the user asks. Keep one clear owner for each topic; link rather than duplicate.
- AI may propose improvements to this file, project docs and skills. Explain meaningful changes and keep guidance concise.

## 6. Before finishing

Summarize what changed, important decisions and trade-offs, relevant files, and verification actually performed. State remaining risks or unverified areas. Suggest the next useful step only when it adds value.
