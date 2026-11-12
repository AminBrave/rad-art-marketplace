---
name: security-review
description: Threat-model or review Rademan authentication, authorization, private data, messaging, uploads, roles, moderation, rate limits and sensitive integrations.
---

# Security Review

## Threat-focused workflow
1. Identify assets, actors, trust boundaries, entrypoints, sensitive data and security assumptions.
2. Trace authentication and server-side authorization for guest, wrong role, wrong owner, non-participant and cross-account cases.
3. Validate request data, file metadata and file content. Check injection, XSS, CSRF, path traversal, unsafe deserialization, mass assignment and unsafe redirects where relevant.
4. Examine rate limits, abuse controls, enumeration, idempotency, replay, race conditions, transaction boundaries and resource exhaustion.
5. Check privacy across API resources, logs, messages, notifications, attachments, storage URLs, exports and error responses.
6. Review session/cookie, CORS/CSRF, environment, secrets and dependency changes when relevant.
7. Consider queue workers, webhooks and external integrations as untrusted/retryable boundaries.
8. Report findings by severity with exact evidence, preconditions, impact and a minimal remediation.
9. Recommend negative regression cases for each important security boundary.

## Rademan invariants
- Laravel policies, middleware and server-side ownership/participant checks are the security boundary.
- React guards never replace backend authorization.
- Private messages, attachments, unpublished artwork and account data must not leak across users or roles.
- Never weaken authorization, validation, rate limits or privacy to make a test or user flow pass.
- Never inspect production personal data or expose credentials.
- A code review is not a penetration test or proof that the system is secure.

## Execution boundary
Do not run scanners, exploit scripts, requests, tests, builds or other verification without explicit authorization. Static findings must be labeled as static review.
