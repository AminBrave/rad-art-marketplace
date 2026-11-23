# Rademan — product context

This document gives contributors and AI a concise starting point for understanding Rademan. It describes the current product context, not an immutable roadmap or a limit on what the owner may request.

## Product identity

Rademan is an art discovery and artist–audience platform. The current product brings together public artwork and artist discovery with authenticated experiences for buyers, artists and administrators.

The product direction can evolve. The user's latest explicit instructions and approved product decisions define what should be built. This document should be updated when that direction changes.

## Current experience model

The current information architecture is organized around these areas:

- **Discover:** public artwork, artist and editorial discovery.
- **Buyer experience:** buyer workspace and communication with artists.
- **Artist experience:** artist workspace, artwork management, profile and communication.
- **Administration:** user, artwork, editorial and safety/moderation operations.

These names describe the current conceptual model, not mandatory route names or a restriction on future roles, areas or navigation. Follow the user's requested product model when it changes.

## Messaging

The codebase contains a substantial buyer–artist messaging subsystem. Before changing it, inspect its current routes, data model, authorization, synchronization, attachments, safety behavior and UI. Preserve valuable behavior and data integrity where appropriate; redesign or replace parts when the user requests it and the migration is properly considered.

Do not infer that a feature exists from this brief alone. Verify current implementation.

## Experience principles

Use these as design prompts and engineering considerations, not rigid gates:

- Make core tasks understandable and efficient across phone, tablet and desktop.
- Support Persian-first content, RTL layouts and mixed Persian/Latin text where relevant.
- Treat accessibility, readable typography, clear feedback and keyboard operation as part of quality.
- Keep public content and private workspace data appropriately separated.
- Make product states, permissions and error recovery understandable.
- Choose visual and interaction patterns that fit the current user need rather than copying legacy UI by default.

## Brand context

The existing brand palette includes Ivory #F7F5F0, Charcoal #242320, Terracotta #A64F31, Sand #D8C9B7 and Olive #536052. These are useful identity references. The owner may change them; they do not constrain all future color, typography, component or layout decisions.

## Capabilities and product scope

Use the live application, tests and current user direction to establish what exists and what is wanted. Do not treat an old exclusion list, issue, PR, mockup or brainstorm as a permanent prohibition or commitment.

When discussing a capability, distinguish:
- Implemented and verified
- Present in code but not fully verified
- Planned or requested by the user
- Proposed by AI
- Unknown or not yet investigated

Do not present proposals as approved product direction.

## Source-of-truth guidance

- User's latest explicit direction: intended product outcome and current priorities.
- Current source, migrations, configuration and runtime: implementation facts.
- Tests: evidence of specified behavior and coverage, subject to review for relevance.
- Current task discussion or approved task record: scope and acceptance criteria.
- Older issues, PRs, decisions and session notes: historical context only unless the user explicitly reactivates them.

For technical architecture, see AI/ARCHITECTURE.md. For the development approach, see AI/DEVELOPMENT-GUIDE.md.
