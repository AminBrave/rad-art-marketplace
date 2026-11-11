---
name: security-review
description: Use for authentication, authorization, roles, private data, uploads, messaging, moderation, validation, rate limits or security-sensitive code review in Rademan.
---

# Rademan Security Review

Adapted from Secure Code Guardian in Jeffallan/claude-skills (MIT).

## Threat-focused workflow

1. Identify assets, actors, trust boundaries, entrypoints and sensitive data.
2. Trace authentication and server-side authorization. Check guest, wrong role, wrong owner, non-participant and cross-user access.
3. Validate input and file metadata/content on the server. Consider injection, XSS, CSRF, path traversal, unsafe deserialization and mass assignment.
4. Check rate limits, abuse controls, idempotency, replay, race conditions and transaction boundaries.
5. Review privacy in API resources, logs, notifications, messages, uploads, storage URLs and error responses.
6. Review secrets, environment handling, CORS/CSRF/session settings and dependency changes when relevant.
7. Report findings by severity with file/line evidence, exploit preconditions, impact and a minimal remediation.
8. Recommend negative regression tests for important controls.

## Rademan invariants

- Laravel policies/middleware and server-side checks are the security boundary; React guards never replace them.
- Private messages, attachments, unpublished artwork and account data must not leak to unauthorized users.
- Never weaken authorization or privacy to make a flow easier.
- Never inspect production personal data or expose credentials.
- Security review is not a penetration test or proof of absence of vulnerabilities.

## Execution boundary

Do not run scanners, exploit scripts, tests, curl requests, builds or other verification commands unless the user explicitly authorizes them. Static review can proceed without executing code; clearly label its limitations.
