# Rademan development with ChatGPT Free or Claude Free

A practical guide for planning, implementing, debugging and maintaining Rademan with ordinary chat-based AI. It does not require Codex, a paid agent, an autonomous coding tool or a local IDE agent.

**Core principle:** GitHub is the source of truth. Chats are focused workspaces. The repository instructions define how AI work must be done.

## 1. Understand the system

Rademan uses four layers of project memory and task tracking:

| Layer | What belongs there | Source of truth |
|---|---|---|
| Project rules | Safety, permissions, coding conventions and workflow rules | `AGENTS.md` |
| Product context | What Rademan is, product goals, constraints and unresolved decisions | `AI/PROJECT.md` |
| Project-wide handoff | Current objective, cross-project decisions, blockers and next steps | `AI/SESSION.md` |
| Task state | Bug reports, feature requirements, investigation logs, review feedback and delivery status | GitHub issues and pull requests |

Skills add task-specific procedures. They are not a replacement for the global rules. Read only the skills relevant to the current task.

**Do not use chat history as the only record of important work.** A new conversation should be able to continue from the repository and the linked GitHub issue/PR.

## 2. One-time setup

### 2.1 Get repository access

Choose the workflow that matches your tools:

- **Browser-only ChatGPT or Claude:** provide the repository and issue/PR links. The assistant must have an authorized GitHub connection or you must provide the relevant file contents. A URL alone does not grant private-repository access.
- **Local repository workflow:** clone the repository and open its folder in your terminal/editor. The AI chat may still be browser-based; you can provide the generated context packet and relevant diffs/files.
- **Connected GitHub integration:** ask the assistant to read the exact repository files and live issue/PR. It should tell you when it cannot access something.

Never ask an assistant to pretend it read a file, issue, log or PR it could not access.

### 2.2 Read the starting documents

Start with:

1. `AGENTS.md` — mandatory operating rules and permissions.
2. `AI/PROJECT.md` — product brief and known unknowns.
3. `AI/SESSION.md` — current project-wide handoff.
4. `.agents/skills/README.md` — skill index and routing.
5. `AI/GIT-WORKFLOW.md` — branch, commit and PR process.
6. `AI/GITHUB-SETUP.md` — GitHub settings and labels checklist.

For task-specific chat prompts, see `AI/CHAT-WORKFLOWS.md`. For bug investigation records, see `AI/BUG-HANDOFF.md`.

### 2.3 Optional local context command

From the repository root, run:

```bash
npm run ai:context -- --task "Describe the task in one sentence"
```

For ChatGPT-specific guidance:

```bash
npm run ai:context -- --task "Describe the task" --chatgpt
```

This command is designed to print the global contract, product brief, project handoff, skill index and only the task-matched skills. It is read-only. It does not inspect GitHub, run tests or change files.

If you are using a browser chat without terminal access, do not ask it to run this command. Ask it to read the same documents through an available repository connection, or provide their contents.

## 3. The standard workflow for every task

Use this sequence for bugs, features, maintenance and reviews.

### Step 1 — Identify the outcome

Describe the user or engineering problem, not just the proposed code change.

Good: "An artist can save a profile with an invalid public contact URL. Validate the URL and show a useful error."

Less useful: "Change the profile form."

Define what success looks like and what must not change.

### Step 2 — Find or create the GitHub issue

Search open issues and PRs before creating a duplicate.

Use the repository issue templates:

- Bug: `.github/ISSUE_TEMPLATE/bug.md`
- Feature: `.github/ISSUE_TEMPLATE/feature.md`
- Chore: `.github/ISSUE_TEMPLATE/chore.md`
- Epic: `.github/ISSUE_TEMPLATE/epic.md`
- Security: `.github/ISSUE_TEMPLATE/security.md`
- Investigation/spike: `.github/ISSUE_TEMPLATE/spike.md`

Use one issue for one bounded outcome. Use an epic to group a larger initiative into smaller issues. Link related issues rather than copying the same history into several places.

### Step 3 — Start the right chat

Prefer one chat per substantial issue or PR:

| Work | Chat arrangement | Canonical GitHub record |
|---|---|---|
| One bug | One bug-focused chat; new chats can resume the same issue | Bug issue |
| One feature | One feature-focused chat | Feature issue |
| Larger initiative | Planning chat for the epic, then focused chats for child issues | Epic and child issues |
| Product direction | One ongoing planning chat when useful | Product brief and decision issues |
| Code review | One chat per PR | Pull request |
| Security review | One chat per surface or finding set | Security issue(s) and remediation PR(s) |
| Small question | Use an existing relevant chat; no issue needed unless work results | Issue only if a durable action is required |

Do not create a new chat for every tiny follow-up. Continue in the same chat while it remains focused and context is healthy. Start a fresh one when the context gets long, stale or confused.

### Step 4 — Give the assistant a precise task pointer

Use the new-chat prompt in section 4. Include:

- Repository name.
- GitHub issue or PR number and link.
- Expected outcome.
- Current branch/PR if one exists.
- Important constraints or new evidence.

Ask it to summarize the current state before editing. This catches stale assumptions and duplicate work.

### Step 5 — Plan before implementation

For meaningful changes, ask for:

- Relevant files and call paths to inspect.
- Confirmed facts versus assumptions.
- Acceptance criteria and failure cases.
- API/database/security/privacy/RTL/accessibility risks.
- A small implementation plan.
- Any product decision that requires your approval.

Do not let an AI-generated suggestion silently become an approved product requirement. You own product decisions.

### Step 6 — Implement on a task branch

Follow `AI/GIT-WORKFLOW.md` and `.agents/skills/git-github/SKILL.md`.

- Use a branch linked to the task, not direct commits to `main`.
- Keep the change focused on the issue.
- Avoid unrelated refactors.
- Preserve existing architecture and contracts unless the issue explicitly changes them.
- Keep secrets and private data out of commits, issue comments and chat messages.
- Do not merge or deploy unless you explicitly authorize it.

### Step 7 — Review the diff and record verification

Ask for a focused review of changed files and their callers. Require the assistant to distinguish:

- Implemented changes.
- Static inspection only.
- Commands actually run and their exact outcomes.
- CI results with links, if any.
- Checks not run.

A proposed command is not a test result. A PR existing is not proof that CI passed.

### Step 8 — Open/update the PR and link the issue

Use the repository PR template. Include:

- The problem and intended outcome.
- The issue link (use GitHub's closing keyword such as `Closes #123` when appropriate).
- A concise change summary.
- Risks and compatibility notes.
- Verification status and evidence.
- Screenshots for meaningful UI changes when useful.

Keep discussion about code changes on the PR. Keep bug reproduction and investigation history on the issue.

### Step 9 — Close the loop

After review and merge, make sure the issue reflects the actual outcome. Update `AI/SESSION.md` only if project-wide goals, decisions, blockers or priorities changed. Do not put every bug detail into the global session file.

## 4. Copy-and-use chat prompts

The complete prompt library is in `AI/CHAT-WORKFLOWS.md`. These are compact examples.

### 4.1 New chat — general task

Replace the placeholders:

> You are helping with the GitHub repository `AminBrave/rad-art-marketplace`.
> Read `AGENTS.md`, `AI/PROJECT.md`, `AI/SESSION.md` and `.agents/skills/README.md`. Read only the skill files relevant to this task. Read the live GitHub issue below, including its latest comments, and inspect related open issues/PRs. Treat current repository files and GitHub state as authoritative, not another chat's memory.
> Follow `AI/GIT-WORKFLOW.md`. Work only on this issue unless I expand scope. Separate confirmed facts from assumptions. Do not run tests, lint, builds, migrations, scanners or CI unless I explicitly authorize the exact execution. Do not merge, deploy, force-push or change repository settings without permission.
>
> **Task:** [one-sentence outcome]
> **Issue/PR:** [#number and URL]
> **Branch:** [branch name or none]
>
> First summarize current state, acceptance criteria, confirmed facts, unknowns and the next smallest safe step. Do not edit until the task is clear.

### 4.2 Continue an existing task in a new chat

> Continue Rademan issue #[NUMBER] ([URL]). Read the current repository instructions and the live issue and comments. Read the linked PR if one exists. Summarize what is confirmed, what changed, what remains, the current verification status and the next 1–3 actions. Do not repeat completed investigation. Do not rely on the previous chat transcript. Ask for missing evidence instead of guessing.

### 4.3 Ask for a plan only

> Do not edit files yet. Inspect the relevant source and propose a minimal plan for issue #[NUMBER]. Include affected files, acceptance criteria, risks, unknowns and how the result should be verified. Identify decisions that require my approval.

### 4.4 Ask for a handoff

> Prepare a concise handoff for issue #[NUMBER]. Record confirmed findings, unresolved hypotheses, files changed, branch/commit/PR links, exact verification status and next 1–3 actions in the GitHub issue or PR. If you cannot write to GitHub, give me a ready-to-paste comment. Update `AI/SESSION.md` only if project-wide state changed.

## 5. Bug reporting and long-term bug maintenance

A bug is not just an error message. Capture enough evidence that a different chat or developer can reproduce and continue it.

### 5.1 Report the bug

Include:

- What happened and what should have happened.
- Exact reproduction steps and reproduction frequency.
- Affected page/flow, environment, version or commit.
- User impact and severity.
- Relevant sanitized logs, screenshots or request/response details.
- What changed recently, if known.

Use the bug issue template and `AI/BUG-HANDOFF.md`.

### 5.2 Investigate in sessions

For each meaningful investigation session, record a dated issue comment with:

- Files, routes, logs and code paths inspected.
- Confirmed findings.
- Hypotheses that are not yet proven.
- Experiments actually performed and outcomes.
- Current diagnosis and confidence.
- Next useful investigation step.

Do not label a guess as a root cause. Prefer a small experiment that distinguishes competing hypotheses.

### 5.3 Continue across different chats

When the chat becomes long:

1. Ask for an issue handoff.
2. Ensure the latest findings are recorded on the GitHub issue.
3. Open a new chat with the bug-resume prompt.
4. Point it to the same issue and ask it to read all recent investigation entries.
5. Confirm the summary before continuing.

You do not need to create a new issue just because you created a new chat.

### 5.4 Fix and close

Link the fix PR to the bug issue. Record regression coverage and the verification result. Close only when the agreed acceptance criteria are met and the fix status is clear.

### 5.5 Protect sensitive data

Never paste passwords, API keys, access tokens, session cookies, private keys, production credentials or unnecessary personal data into AI chats or GitHub. Sanitize logs and screenshots. Share the smallest relevant excerpt rather than repeatedly pasting huge logs.

## 6. Feature development and product decisions

### 6.1 Separate product discovery from implementation

For a feature, first answer:

- Who has the problem?
- What are they trying to achieve?
- What is the current pain?
- What is in scope and explicitly out of scope?
- What is the expected user-visible behavior?
- What are the acceptance criteria?
- What privacy, moderation, authorization, accessibility and RTL requirements apply?

Do not assume a feature exists just because it appears in a proposal or AI response. Verify the current codebase.

### 6.2 Use epics for larger work

Create an epic for a multi-stage feature. Break it into small issues that can each be implemented and reviewed independently. Record dependencies and the intended order.

### 6.3 Keep decisions durable

When you approve a product or architecture decision, record it in the appropriate place:

- Product-wide intent or scope: `AI/PROJECT.md`.
- Project-wide current objective or blocker: `AI/SESSION.md`.
- Feature-specific requirements and decisions: feature issue.
- Technical decision with long-term architectural impact: a dedicated decision record or linked issue, following repository conventions.

Keep proposed ideas clearly marked as proposals until approved.

## 7. Code review, security and quality

For each PR, ask for a review that checks:

- Correctness and edge cases.
- Authorization and server-side validation.
- Privacy and accidental data exposure.
- Database integrity, concurrency and idempotency.
- API compatibility and error handling.
- Performance and query behavior.
- Persian language, RTL, responsive behavior and accessibility.
- Loading, empty, error, success and disabled UI states.
- Tests and regression coverage, where appropriate.

Ask for actionable findings with severity, file/line references, impact and a concrete fix. Distinguish confirmed defects from questions. Do not ask an assistant to approve or merge its own work.

## 8. GitHub working agreements

Follow `AI/GIT-WORKFLOW.md` for exact conventions. The intended loop is:

1. Issue describes the outcome and acceptance criteria.
2. A task branch contains only that work.
3. Commits are small and descriptive.
4. PR links the issue and explains the change.
5. Review feedback is resolved or explicitly discussed.
6. Verification status is evidence-based.
7. Merge follows the repository's agreed review and protection rules.
8. The issue and project handoff are updated.

Do not assume labels, milestones, branch protection or security settings are configured merely because a checklist exists. Check the live repository settings and complete `AI/GITHUB-SETUP.md` manually where required.

## 9. Permissions and verification safety

The repository's `AGENTS.md` is strict: **implementation requests do not automatically authorize executable verification or CI.**

Unless you explicitly authorize the specific action, the assistant must not run:

- Tests, lint, formatters, builds, type checks or browser automation.
- Migrations, seeders or database-mutating commands.
- Security scanners or other executable verification.
- GitHub Actions workflows or workflow reruns.

Likewise, do not assume permission to install packages, deploy, release, merge, force-push, rewrite history or change repository settings.

When you want a check performed, authorize it specifically, for example:

> I authorize running `npm run lint` locally in this checkout. Do not run other commands or CI.

For CI:

> I authorize starting the named [workflow] for this PR once. Do not rerun it.

The assistant must report exactly what was run and what the result proves. If nothing was run, the correct status is **Not run (permission not granted)**.

## 10. Keeping token use low

- One chat should have one main issue and one deliverable.
- Do not paste the whole repository or all skill files.
- Start with the mandatory context documents and only relevant skills.
- Ask for focused source inspection, not a full-repository dump.
- Share the issue/PR link and the latest relevant evidence.
- Summarize long logs into a short excerpt with timestamps and correlation IDs.
- Ask for concise plans and handoffs.
- Move durable findings to GitHub; do not repeatedly retell the entire history.
- Start a new chat when context is long, then resume from the issue/PR.

## 11. End-of-session checklist

Before you stop a substantial task, confirm:

- [ ] The issue or PR contains the latest durable status.
- [ ] Confirmed facts are separated from assumptions.
- [ ] Relevant changes, branch, commit and PR are linked.
- [ ] Verification is accurately marked as not run, locally run or CI-confirmed.
- [ ] No secrets or sensitive data were exposed.
- [ ] Blockers and next 1–3 actions are recorded.
- [ ] `AI/SESSION.md` is updated only if project-wide state changed.

## 12. Quick reference

| I want to… | Start here |
|---|---|
| Start any new task | `AGENTS.md`, then `AI/CHAT-WORKFLOWS.md` |
| Develop a feature | Feature issue + feature chat prompt |
| Report or continue a bug | Bug issue + `AI/BUG-HANDOFF.md` |
| Resume after context is full | Same issue/PR in a new chat |
| Plan a larger initiative | Epic + product planning chat |
| Review a PR | PR link + code-review chat prompt |
| Load compact local context | `npm run ai:context -- --task "…"` |
| Understand branch and PR rules | `AI/GIT-WORKFLOW.md` |
| Configure repository settings | `AI/GITHUB-SETUP.md` |
| Understand current project-wide work | `AI/SESSION.md` |

---

**The operating rule to remember:** Keep conversations focused, keep GitHub records complete, keep repository instructions authoritative, and require explicit permission for risky actions and verification.
