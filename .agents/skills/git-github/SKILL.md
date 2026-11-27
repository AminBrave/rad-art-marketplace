---
name: git-github
description: Manage Git workflows, branches, commits, pull requests, issues and GitHub Actions safely. Use when changing repository state, coordinating PRs, resolving review feedback or investigating CI.
---

# Git and GitHub delivery

## Purpose

Deliver focused, traceable repository changes without losing work or taking unauthorized shared actions.

## Use when

Use when a task requires branching, committing, creating/updating a PR or issue, reviewing CI or coordinating repository work.

## Workflow

1. Confirm repository, target branch, authorized actions and current PR/issue state.
2. Inspect remote refs and the relevant diff; inspect local working-tree state separately when available.
3. Use a short-lived task branch from the current target and keep one coherent outcome per PR.
4. Coordinate shared files and contracts before parallel work; use lanes only when isolation materially helps.
5. Keep commits scoped by outcome and PR descriptions factual about scope, risk and checks.
6. Verify the exact PR head SHA before relying on CI; inspect review feedback.
7. Merge, release, deploy, force-push or delete shared refs only with explicit authorization for that target.

## Rademan context

Follow [repository guidance](../../../AGENTS.md) and [delivery practices](../../../AI/DEVELOPMENT.md). The normal integration target is `main`; verify live branch and PR metadata.

## Quality bar

Protect uncommitted work, avoid rewriting shared history, inspect scripts before stateful operations and never weaken checks to obtain green CI. A merged PR does not prove deployment.

## Deliverable

Branch, target, issue/PR links, changed scope, verification evidence, integration status and remaining risks.
