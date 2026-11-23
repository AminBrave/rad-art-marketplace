# Rademan task management

Use task tracking when it improves coordination, continuity or review. It is optional overhead for work that can be completed directly in the current conversation or change.

## Principles

- The user's current request defines the task and its intended outcome.
- A GitHub issue or project board is a coordination aid, not permission to override the user or an independent product roadmap.
- Existing issues, PRs, milestones, labels and historical decisions do not create new requirements or priorities. Check their current state and relevance before relying on them.
- Do not revive, duplicate, expand or sequence historical work unless the user requests it or it is necessary to complete the current task.
- Use the smallest useful record. Do not require an issue for every small fix, documentation edit or exploratory question.

## When a task record helps

Create or update a task when the work is substantial, spans sessions, needs collaboration, has multiple deliverables, or benefits from review and status tracking.

A useful task description includes:
- User problem and intended outcome
- Scope and relevant context
- Observable acceptance criteria
- Important exclusions or assumptions, if any
- Dependencies and risks supported by evidence
- Verification approach appropriate to the change

Do not force product-decision IDs, fixed MVP labels, milestone taxonomies or mandatory board states into tasks unless the user or the active team process explicitly wants them.

## Issues and pull requests

- Search for a relevant current issue or PR before creating a duplicate when GitHub tracking is part of the task.
- Link related records when it helps explain the work; do not treat links as approval or product authority.
- Keep PR descriptions concise and factual: purpose, implementation, risk, migration notes and verification evidence.
- Use status fields and labels consistently with the repository's actual configuration. Do not invent board columns, fields or automation.
- A merged PR is evidence of code integration, not by itself proof that the broader user outcome is accepted.

## Historical records

Historical issues, PRs, branches, comments and decision documents are records of what happened at a particular time. They may explain current code or a past trade-off, but they are not a backlog, roadmap or binding design contract. Reassess their relevance against current user direction and implementation before using them.

## Completion

Close or mark work complete when the requested outcome and relevant acceptance criteria are satisfied and the verification status is honestly represented. Record remaining work separately rather than silently expanding the task.
