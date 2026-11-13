# Rademan development guide — ChatGPT Free and Claude Free

This is the human operating manual for developing Rademan with ordinary chat-based AI. It is designed to work without Codex, paid agents, autonomous IDE agents or hidden model memory.

**The simple rule:** In a new chat, point the AI to `AGENTS.md` and describe the task. The AI—not you—must select the relevant project documents, GitHub records and skills. You should not need to remember internal file paths.

> AI can still make mistakes. This workflow reduces hallucination and context loss by requiring evidence, explicit uncertainty, durable records and human approval at decision boundaries. It cannot guarantee a model will never be wrong.

## 1. The operating model

| Layer | Purpose | Where truth lives |
|---|---|---|
| Rules | Permissions, safety, coding and collaboration rules | `AGENTS.md` |
| Product | Product intent, principles and unresolved product questions | `AI/PROJECT.md` |
| Task management | Authorized tasks, per-task MVP scope, priority and Kanban workflow | `AI/TASK-MANAGEMENT.md` |
| Project handoff | Current project objective, cross-project decisions, blockers and next actions | `AI/SESSION.md` |
| Task history | Requirements, bug evidence, decisions, progress and review discussion | GitHub issue or PR |
| Implementation | What the application actually does | Source code, migrations, tests, configuration and observed runtime behavior |
| Procedures | Focused instructions for feature, backend, frontend, debugging, security, review, quality and Git work | Relevant skill selected by `AGENTS.md` |

**Authority order:** explicit user decisions → `AGENTS.md` → approved issue/PR requirements and recorded decisions → current source and runtime evidence for implementation facts → product brief and canonical decision records for intent → AI suggestions. An AI suggestion is never an approved requirement.

The AI must not claim that a feature exists, is missing, works, is secure or is tested without suitable evidence. Documentation describes intent; source and runtime evidence establish implementation. Product decisions in #150 are not implementation permission. A named decision is retrieved independently; only explicitly authorized scope becomes a delivery issue.

## 2. One-time setup

1. Make sure your ChatGPT or Claude session can actually read the repository. A URL alone does not grant access to a private repository.
2. Connect an authorized GitHub integration if available, or provide the relevant files and issue/PR content yourself.
3. Open a new chat and use the single starter prompt below.
4. Keep this guide bookmarked for the human workflow. You do not need to ask the AI to read this whole guide for every task.

### Universal starter prompt

Copy this into a new chat and replace the task description:

> We are working on Rademan in `AminBrave/rad-art-marketplace`.
> First read `AGENTS.md`. Follow it to choose the minimum relevant project context, current GitHub issue/PR and task-specific skills. Do not ask me to name internal files.
>
> **My task:** [describe the outcome in plain language]
> **Issue/PR:** [number and link, or “find the existing one”]
>
> Before editing, inspect the live repository and GitHub state. Summarize confirmed facts, assumptions, unknowns, acceptance criteria and the smallest safe next step. If you cannot access something, say exactly what you could not read and ask for the minimum missing evidence. Never fill gaps by guessing. Do not modify files until I approve the plan.

For an already approved task where you want the AI to proceed, add: “The scope and plan are approved. Implement only the agreed work, following `AGENTS.md`.”

## 3. The stable development loop

Use the same loop for every substantial feature, bug, maintenance task or review.

1. **Frame the outcome.** State who is affected, what problem they have and what success means.
2. **Find the task record.** Search open issues and PRs. Continue the existing issue when one exists; do not create duplicates.
3. **Establish the baseline.** Read the live issue and comments, related PR, current branch/commit and relevant source. Summarize current behavior before proposing a change.
4. **Separate certainty levels.** List confirmed facts, hypotheses, unknowns and decisions requiring your approval.
5. **Agree on acceptance criteria.** Include success, failure, permission-denied, empty/loading states and compatibility constraints as relevant.
6. **Plan the smallest coherent change.** Identify affected backend/frontend/data/API/security/RTL/accessibility areas. Avoid unrelated refactors.
7. **Implement on a task branch.** Keep changes focused on one issue and preserve established contracts.
8. **Review the diff.** Check callers, error paths, authorization, privacy, data integrity, performance and accessibility.
9. **Verify only with permission.** A request to implement does not authorize tests, builds, lint, migrations or CI. Record exactly what was and was not run.
10. **Update GitHub.** Keep durable findings and progress on the issue; put code review discussion on the PR. Link PR to issue.
11. **Close the loop.** Record outcome, remaining work and next actions. Update the project handoff only for project-wide changes.

For a large authorized decision, create a parent epic and split its task-specific MVP into independently reviewable child issues. Do not create product-phase milestones or infer a delivery sequence from the decision register.

## 4. Practical prompts for real development situations

You do not need to use every prompt. Describe the situation naturally and use the matching example when you need stronger guardrails.

### A. Starting a new feature

Create or find a feature issue first. Ask the AI to investigate and plan, not immediately code.

> Work on the feature described in [issue link]. Read `AGENTS.md` and follow its routing rules. Inspect the current implementation and relevant user flow before proposing a solution.
>
> First report: (1) current behavior with source evidence, (2) user problem and target actor, (3) confirmed requirements versus assumptions, (4) explicit non-goals, (5) acceptance criteria including failure and permission cases, (6) affected files/API/database/security/RTL/accessibility areas, and (7) a small implementation sequence.
>
> Do not invent product requirements or assume proposed functionality is already implemented. Flag decisions that need my approval. Do not edit yet.

### B. Implementing an approved feature

> The plan and acceptance criteria on [issue link] are approved. Re-check the live issue and current branch before editing. Implement only the agreed scope, using existing project patterns. Trace the full affected flow rather than changing a component in isolation. Preserve API contracts, server-side authorization, privacy, Persian/RTL and accessibility behavior.
>
> If the source contradicts the plan, an important requirement is missing, or the change needs broader scope, stop and explain the evidence and options before proceeding. Do not silently redesign the feature. Do not run verification or CI without my explicit permission.

### C. Reporting a bug

> Help me document this bug in Rademan. First search for an existing issue so we do not duplicate it.
>
> **Expected:** [what should happen]
> **Actual:** [what happens]
> **Steps:** [reproduction steps]
> **Environment/commit:** [if known]
> **Evidence:** [sanitized error, screenshot or log]
>
> Help classify impact and create a concise reproducible report. Mark missing details as unknown; do not invent reproduction steps, affected users or root cause. Do not include secrets or unnecessary personal data.

### D. Investigating a bug without guessing

> Investigate [bug issue link] using the debugging procedure selected by `AGENTS.md`. Do not assume the reported cause is correct.
>
> Trace the narrowest relevant path and report:
> - Confirmed facts with file paths, symbols, line references or actual log evidence.
> - Hypotheses ranked by evidence, and what observation would falsify each.
> - What has actually been reproduced or executed versus only inspected.
> - The smallest next investigation step.
>
> Do not call a hypothesis the root cause. Do not change code until the root cause is supported and I approve the fix. Do not run commands or tests without permission.

### E. When a bug cannot be reproduced

> The bug in [issue link] is not currently reproducible. Do not invent a reproduction or claim it is fixed.
>
> Compare the report with the current source and environment evidence. List the missing conditions, possible explanations and the safest way to gather discriminating evidence. Suggest the smallest next step. Keep the issue open and record the status as “not reproduced” unless evidence supports another conclusion.

### F. When logs or evidence are incomplete

> The available evidence is incomplete. Tell me exactly which missing detail blocks diagnosis and why. Ask only for the smallest useful additional evidence. Do not infer unseen log entries, environment settings, database contents, user actions or network responses. If you can still make progress through read-only source inspection, do that and label its limits.

### G. When repository or GitHub access fails

> You do not appear to have access to [file/issue/PR/repository]. Do not pretend to have read it and do not infer its contents from the URL or an old chat summary.
>
> Identify the exact missing source and ask me for the minimum necessary file, diff, issue text or sanitized log. Continue only with facts you can verify.

### H. When source code contradicts the issue or documentation

> The current source appears to conflict with [issue/brief/document]. Stop before making changes. Show the exact conflicting evidence, explain which statements are confirmed and which are stale or ambiguous, and propose the smallest clarification needed. Do not choose a product behavior on my behalf.

### I. When the task grows beyond its original scope

> This work appears to require changes outside the approved scope of [issue link]. Do not expand scope silently. Separate the original acceptance criteria from the newly discovered work. Explain whether the new work is a blocker, dependency or independent follow-up, and propose issue/PR boundaries. Wait for my decision before broadening implementation.

### J. When a product or architecture decision is needed

> This task requires a decision that is not established in the product brief or source. Do not present your preferred option as an existing requirement. Give me the viable options, trade-offs, user impact, security/privacy implications and recommendation. Mark the recommendation as a proposal until I approve it, then record the approved decision in the correct durable project or issue record.

### K. When a test, build, lint or CI check fails

> The check [exact command/workflow and result] failed. Do not hide, delete, skip or weaken the failing test just to get a green result.
>
> First determine whether the failure is relevant to this change, pre-existing, environmental or caused by the change. Cite the exact output and source evidence. Propose the smallest corrective action and any regression coverage. Do not run additional commands or rerun CI until I authorize the exact checks.

### L. Before opening or updating a PR

> Review the changes for [issue link] as if you were an independent reviewer. Inspect the full diff and relevant callers. Look for correctness, regressions, authorization, privacy, data integrity, API compatibility, performance, Persian/RTL, responsive behavior and accessibility.
>
> Report findings first, ordered by severity, with exact file/line evidence, impact and a suggested fix. Separate confirmed defects from questions and style preferences. State what you could not verify. Do not approve or merge the PR.

### M. When review feedback arrives

> Review the comments on [PR link] and group them into: confirmed defects, valid improvements, questions, and suggestions that conflict with project rules or approved scope. Check each comment against current source; do not accept or reject feedback blindly.
>
> Recommend a response and minimal change for each item. Do not resolve or dismiss review threads, push changes or change scope without my approval.

### N. When requirements change mid-task

> My requirement has changed: [describe change]. Compare it with the approved issue and current implementation. Explain which acceptance criteria change, what work becomes obsolete, what new risks/dependencies appear and whether the issue should be updated or split. Do not continue using outdated assumptions. Wait for confirmation if the change affects product behavior or data/API contracts.

### O. When work is blocked

> We are blocked on [issue link]. Summarize what is complete, the exact blocker, evidence that demonstrates it, what has already been tried and what is still unknown. Give me the smallest set of options to unblock it, including trade-offs. Do not claim progress on steps that were not completed.

### P. When the AI proposes a dependency or major refactor

> Before adding a package, service, abstraction, framework or broad refactor, show the concrete requirement that existing project patterns cannot satisfy. Compare the smallest existing-pattern solution with the proposed addition, including maintenance, security, compatibility and operational cost. Do not install or introduce it until I approve.

### Q. Before any executable verification

> I authorize only this verification: [exact command or named workflow], in [local/staging/CI environment]. Do not run any other checks, install packages, mutate data or start additional CI. Explain side effects first if any are possible, then report the exact command, environment and output. If the command cannot be run, say so.

### R. Preparing a context-window handoff

> We are nearing the context limit. Stop new work and prepare a factual handoff for [issue/PR link].
>
> Record: goal and acceptance criteria; confirmed findings; unresolved hypotheses and unknowns; decisions I approved; files changed; branch and commit/PR; commands actually run and exact results; checks not run; blockers; and the next 1–3 actions. Update the GitHub issue or PR if access permits; otherwise give me a ready-to-paste comment. Update `AI/SESSION.md` only if project-wide objective, decisions, blockers or priorities changed. Do not claim unfinished work is complete.

### S. Resuming in a new chat after context is full

> Continue [issue/PR link] in `AminBrave/rad-art-marketplace`. Read `AGENTS.md` first and follow its instructions to select the relevant context and skills. Inspect the live issue/PR, latest comments, current branch/commit and current source. Treat these as authoritative over the previous chat.
>
> Before doing anything, summarize completed work, confirmed facts, approved decisions, unresolved hypotheses, current verification status, blockers and next 1–3 actions. Identify any mismatch between the handoff and live repository state. Do not repeat completed work, create a duplicate issue or assume a previous chat's claims are true. Ask me only for evidence you cannot access.

### T. When a task is complete

> Prepare the completion report for [issue/PR link]. State the delivered behavior, files changed, acceptance criteria satisfied or not satisfied, remaining risks, follow-up issues, and exact verification status. Distinguish static inspection, locally executed checks and CI evidence. Update the issue/PR and project handoff where appropriate. Do not mark the issue complete if acceptance criteria remain unmet.

## 5. Decision-driven task management

Rademan does not use a product roadmap or M0–M4 product milestones. Product intent is recorded separately from approved delivery work.

### The model

Product decision → authorized delivery issue → task-specific MVP → implementation PR

- **Product decision:** one of the 41 standalone intent records linked from #150. A decision may describe future direction and is not automatically a task.
- **Delivery issue:** a bounded piece of work explicitly authorized by the product owner. It links to the one relevant decision (or records “Standalone task”).
- **MVP:** the smallest useful, testable scope for that specific decision/task. It is written inside the issue, not treated as a platform-wide MVP roadmap.
- **Child tasks:** if a decision is too large for one reviewable change, use a parent epic and split the MVP into linked, independently reviewable child issues.

A decision can remain only a vision record. Never create an issue for every decision automatically. When the user names a decision, retrieve only its canonical comment; do not reread unrelated decisions by default. Decision IDs (D01–D41) are not GitHub issue numbers.

### One Kanban board

Use one GitHub Project named **Rademan Workboard**:

Backlog → Ready → In progress → In review → Done

Use **Blocked** when a documented dependency prevents progress. The board also has Priority (P0–P3), Type, Area and Decision ID fields. Issues remain the source of truth; the board shows their current execution state.

- **Backlog:** captured, not yet ready/authorized.
- **Ready:** authorization, MVP boundary, acceptance criteria, dependencies and owner are clear.
- **In progress:** work has actually started.
- **In review:** a linked PR or investigation output is under review.
- **Blocked:** blocker and next action are written on the issue.
- **Done:** acceptance criteria and required verification are complete, and implementation PR is merged.

### Required issue content

Every authorized task records its source decision and direct link (or “Standalone task”), authorization, current source-backed baseline, MVP scope, exclusions, observable acceptance criteria, risks/dependencies and verification plan. A verification plan does not authorize execution. Use the issue templates and AI/TASK-MANAGEMENT.md.

### Naming

Use a type prefix and include the decision ID when applicable:
- [FEAT] D02 — Improve buyer discovery entry point
- [EPIC] D06 — Deliver buyer personalization MVP
- [BUG] Fix artwork visibility regression
- [CHORE] Simplify AI context bootstrap

Do not put M0–M4 or product-phase labels in new tasks. Do not renumber existing GitHub issues or rewrite historical records.

### Priority and completion

P0 is urgent/critical, P1 high impact, P2 normal planned work, P3 low priority. Priority is not a product sequence. Move a task to Done only when its acceptance criteria are met, verification is accurately recorded and its PR is merged. Follow AI/TASK-MANAGEMENT.md for the full operating contract.

## 6. GitHub, branches and pull requests

For each substantial task:

1. Search for an existing issue before creating one.
2. Keep one bounded outcome per issue.
3. Create a task branch from the agreed base branch.
4. Keep commits focused and descriptive.
5. Open a PR linked to the issue; include behavior, risks and verification evidence.
6. Review feedback and record decisions on the PR.
7. Merge only after the required human approval and repository rules are satisfied.
8. Update the issue and Kanban Status from the actual result.

Do not assume labels, Project fields, branch protection or security settings are configured because documentation recommends them. Check the live GitHub settings. Follow `.agents/skills/git-github/SKILL.md` for Git and GitHub procedures. Use `AI/GITHUB-SETUP.md` only when configuring repository settings; you do not need to mention either file in prompts.

## 7. Anti-hallucination rules to expect from the AI

A reliable assistant should consistently do the following:

- **Cite evidence:** use repository paths, symbols, line references, issue comments, commit SHAs or actual command output.
- **Admit access limits:** say “I could not access this file/issue/log,” not “it probably says…”.
- **Label uncertainty:** distinguish facts, hypotheses, assumptions, unknowns and proposals.
- **Avoid false completion:** do not claim implemented, reproduced, tested, reviewed, merged or deployed without direct evidence.
- **Check current state:** inspect live source and GitHub before continuing old work.
- **Prefer the smallest change:** do not invent abstractions, features or dependencies to fill gaps.
- **Protect the product:** preserve existing API contracts, authorization, privacy, data integrity, Persian/RTL, responsive and accessibility requirements.
- **Stop at decision boundaries:** ask before making unapproved product, data model, API or scope decisions.
- **Preserve failures:** never hide failing checks or weaken tests just to get a green result.
- **Keep history durable:** put task-specific evidence and decisions on the issue/PR, not only in chat.

If the AI violates these rules, stop the task. Ask it to identify unsupported claims, correct the record and continue only from verifiable evidence.

## 8. Permission and safety boundaries

Unless you explicitly authorize the exact action, the AI must not run tests, lint, formatting, builds, type checks, browser automation, migrations, seeders, database changes, security scanners or CI. A request to implement or debug is not permission to run them.

Likewise, do not assume permission to install packages, start/stop services, deploy, release, merge, force-push, rewrite history, delete branches, close issues or change repository settings.

Examples of narrow authorization:

> I authorize running `npm run lint` locally in this checkout only. Do not run other commands or CI.

> I authorize starting the named CI workflow for PR #123 once. Do not rerun it.

Never put passwords, API keys, tokens, cookies, private keys, production credentials or unnecessary personal data into AI chats, issues or PRs. Sanitize logs and screenshots.

## 9. What a good final report looks like

For substantial work, expect a concise report with:

- Issue and PR links; branch and commit when available.
- What changed and observable behavior.
- Acceptance criteria met, unmet or deferred.
- Confirmed facts, remaining assumptions and risks.
- Verification: **not run**, **static inspection only**, **locally run** (exact commands/results), or **CI-confirmed** (workflow link/status).
- Blockers and next 1–3 actions.

A useful final report is factual—not a victory statement. “Implemented; tests not run because permission was not granted” is better than an unsupported “Everything works.”

---

**The rule to remember:** Tell AI the task and point it to `AGENTS.md`. Make it prove what it knows, record what it learns, ask before consequential decisions, and resume every task from GitHub—not from memory.
