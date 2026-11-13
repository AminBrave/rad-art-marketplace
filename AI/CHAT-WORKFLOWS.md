# Chat workflows — separate chats, shared GitHub state

## Operating principle

Use chats as focused workspaces and GitHub as the durable source of truth.

- One chat per substantial issue or bounded deliverable is recommended.
- Keep one GitHub issue as the canonical record for one bug or feature. Related symptoms can share an issue only when they plausibly share one cause; otherwise link separate issues.
- A chat is not the issue tracker. Record confirmed findings, decisions, logs, implementation status and next steps in the issue or PR before ending a substantial session.
- A new chat must re-read current repository files and the live issue/PR. Never assume the previous chat's summary is current.
- Do not paste the whole repository or every skill into every chat. Load only global instructions, project brief, session handoff and relevant task skills.

## Recommended chat spaces

| Chat type | Scope | Durable record |
|---|---|---|
| Bug investigation | One bug issue, continuing across sessions | Bug issue comments and linked fix PR |
| Feature development | One feature issue; use an epic for multi-issue work | Feature issue, decision notes and PR |
| Product planning | Cross-feature scope, priorities and product decisions | Product brief, roadmap and planning issues |
| Code review | One PR at a time | PR review and inline comments |
| Security review | One defined surface or finding set | Security issue(s) and remediation PR(s) |
| General project | Questions crossing multiple areas without a dedicated issue | Create/link an issue if a durable decision or action results |

Avoid creating a separate chat for every tiny follow-up. Continue in the same chat while it remains focused and useful; start a fresh chat when the context is long, stale, or the task changes.

## New-chat startup prompt

Copy this into a new ChatGPT or Claude chat, then replace the task line:

> You are working on the GitHub repository `AminBrave/rad-art-marketplace`.
> Before proposing or changing code, read `AGENTS.md`, `AI/PROJECT.md`, `AI/SESSION.md`, and `.agents/skills/README.md`. Read only the skill files relevant to this task.
> Open and read the live GitHub issue/PR linked below, including its latest comments and current state. Check related open issues/PRs to avoid duplicate work. Treat repository files and GitHub state as the source of truth, not another chat's memory.
> Follow `AI/GIT-WORKFLOW.md`. Work only on the linked issue unless I explicitly expand scope. Separate confirmed facts from assumptions. Do not run tests, builds, lint, migrations, scanners or CI unless I explicitly authorize the exact execution. Do not merge, deploy, force-push or change repository settings without explicit permission.
>
> **Task:** [one-sentence outcome]
> **GitHub issue/PR:** [URL or #number]
> **Current branch/PR (if any):** [branch and URL, or none]
> First summarize the issue's current state, confirmed facts, open questions and next smallest safe step. Do not edit files until the task and acceptance criteria are clear.

If the chat cannot access GitHub or repository files, the assistant must say so and ask for the minimum missing content. Do not assume a link means it can read private repository content.

## Bug chat — continuing investigation

Use one chat per substantial bug, but keep the investigation in the GitHub issue so a different chat can continue it.

> Continue bug investigation for AminBrave/rad-art-marketplace issue #[NUMBER] ([ISSUE URL]). Read the repository instructions and the complete live issue, especially its latest investigation entries. Read `AI/BUG-HANDOFF.md` and the relevant debugging/backend/frontend skills. Summarize confirmed behavior, reproduction status, evidence, hypotheses, changes and verification so far. Then propose the next smallest discriminating investigation step. Do not repeat experiments already recorded. Do not edit code or run commands until I authorize the next step. After each meaningful session, prepare a concise dated investigation entry for the issue.

### What belongs in the bug issue

- Original report: observed vs expected behavior, steps, impact, environment and sanitized evidence.
- Every meaningful session: inspected sources, confirmed findings, unconfirmed hypotheses, experiments and outcomes.
- Fix tracking: changed files, commit/PR, regression coverage and verification status.
- Handoff: current diagnosis/confidence, blockers and next 1–3 steps.

Do not dump huge logs repeatedly. Attach or link the relevant sanitized excerpt and include timestamps, correlation/request IDs and the exact error context needed to locate the full log. Never include credentials, tokens, session cookies, private keys or unnecessary personal data.

## Feature chat — continuing implementation

> Continue feature work for AminBrave/rad-art-marketplace issue #[NUMBER] ([ISSUE URL]). Read the repository instructions, product brief, session handoff, relevant skill files and the live issue/linked PR. Summarize the user problem, agreed scope, acceptance criteria, decisions, implementation status, blockers and next 1–3 steps. Identify unresolved product decisions before coding. Work only within this issue's scope and record durable decisions and progress on GitHub.

## Product planning chat

> Help plan Rademan product direction. Read `AGENTS.md`, `AI/PROJECT.md`, `AI/ROADMAP.md` and `AI/SESSION.md`, then inspect relevant live GitHub issues/PRs. Separate implemented facts from assumptions and proposals. Do not silently turn an AI suggestion into an approved product decision. Present trade-offs and identify which decision needs owner confirmation. Record approved durable decisions in the product brief or a linked issue.

## Code review chat

> Review AminBrave/rad-art-marketplace PR #[NUMBER] ([PR URL]). Read the repository instructions and the relevant code-review/security/quality skills. Inspect the actual diff and surrounding code. Report only actionable findings, ordered by severity, with file/line references, impact and a concrete remediation. Distinguish confirmed defects from questions. Do not modify code, approve, request changes, merge or run checks unless explicitly asked.

## End-of-chat handoff

Before ending a substantial session, ask the assistant to:
1. Add a concise dated update to the relevant GitHub issue or PR (or give you a ready-to-paste comment if it cannot write).
2. State what changed and link the branch, commit and PR if they exist.
3. Record verification as **Not run**, **Locally run** (with exact command/result), or **CI confirmed** (with run link). Never imply verification happened when it did not.
4. List blockers and the next 1–3 concrete actions.
5. Update `AI/SESSION.md` only when project-wide objective, decisions, blockers or priorities changed—not for every issue-specific log entry.

## When to start a new chat

Start a fresh chat when the current context is long, the task changes, or the assistant starts losing earlier details. Resume using the issue/PR link and the prompts above. The GitHub issue/PR must contain enough information for a new chat to continue without needing the old transcript.
