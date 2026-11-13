# Bug investigation handoff

Use this format in the **GitHub issue**, not only in a chat. The issue is the durable record; separate chats may investigate the same issue over time.

## Triage
- **Status:** Reported / Reproducing / Investigating / Fix in progress / Ready for verification / Verified / Closed
- **Severity / priority:**
- **Affected area / flow:**
- **First observed:**
- **Affected version / commit / environment:**

## Confirmed behavior
- **Observed:**
- **Expected:**
- **Reproduction rate:** Always / Intermittent / Once / Unknown
- **Minimal reproduction steps:**
  1.
- **User impact:**

## Evidence
- **Logs / error messages:**
- **Screenshots / recordings:**
- **Relevant request, response, route, job or database record:**
- **Sanitization check:** Secrets, tokens, credentials, personal data and private user content removed.

## Investigation log
Add a dated entry for each meaningful investigation session. Keep entries factual and concise.

### YYYY-MM-DD — Chat/session label
- **Inspected:** files, endpoints, logs, commits or environment
- **Findings (confirmed):**
- **Hypotheses (unconfirmed):**
- **Experiments / actions:** include exact commands only if actually run
- **Outcome:** reproduced / not reproduced / narrowed down / inconclusive
- **Changes:** files and commit/PR links, or none
- **Verification:** not run / locally verified (state how) / CI verified (link evidence)
- **Remaining questions / next steps:**

## Current diagnosis
- **Root cause:** Unknown until supported by evidence.
- **Confidence:** Low / Medium / High
- **Evidence supporting diagnosis:**
- **Evidence that contradicts it:**

## Fix and acceptance
- [ ] Root cause is supported by evidence, or remaining uncertainty is documented.
- [ ] Fix addresses the cause without weakening unrelated behavior or tests.
- [ ] Regression coverage is added or a reason is documented.
- [ ] Relevant failure, edge and permission cases are considered.
- [ ] Verification result is recorded accurately.
- [ ] Related PR is linked and issue closure is tied to verified acceptance.

## Resume this bug in a new chat
Paste the short prompt from `AI/CHAT-WORKFLOWS.md`, replacing the issue number. Ask the assistant to read the live issue and repository instructions first. Do not rely on an old chat transcript as the source of truth.
