# Start here — Rademan AI development

This is a short pointer for human contributors. The complete practical tutorial, including copy-ready prompts for features, bugs, reviews, blockers and context-window recovery, lives in [`AI/README.md`](README.md).

## Every new chat

1. Give the AI the repository `AminBrave/rad-art-marketplace`.
2. Tell it to read `AGENTS.md` first and follow its context-routing instructions.
3. Describe the task in plain language and include the existing GitHub issue or PR link if one exists.
4. Ask for a factual summary and plan before implementation when the scope is not already approved.

You do not need to memorize or list internal project documents and skills. The AI must select only the context relevant to the task.

## Local optional context command

From a local checkout, this read-only helper can print a compact context packet:

```bash
npm run ai:context -- --task "Describe the task in one sentence"
```

Add `--chatgpt` only when ChatGPT-specific access notes are useful. Browser-only chats should read the selected files through authorized repository access or ask the user to provide them; they must not claim to have run the command.

## Human tutorial

Read [`AI/README.md`](README.md) for:
- The standard issue → plan → implementation → review → delivery loop.
- Ready-to-copy prompts for feature development, debugging and investigation.
- What to do when evidence is missing, access fails or requirements conflict.
- How to handle failed checks, scope changes, blockers and review feedback.
- How to hand off and resume work when a context window is full.
- How the M0–M4 roadmap and GitHub issues/PRs track progress.
