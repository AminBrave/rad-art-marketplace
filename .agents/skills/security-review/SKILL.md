---
name: security-review
description: Review application changes for authentication, authorization, privacy, data exposure, abuse and integration vulnerabilities. Use when assessing sensitive features, access control, uploads, messaging, APIs or security incidents.
---

# Security review

## Purpose

Identify trust-boundary failures and privacy risks, then recommend practical mitigations.

## Use when

Use when a change handles identity, permissions, private data, user-generated content, uploads, external input or privileged operations.

## Workflow

1. Identify assets, actors, trust boundaries, entry points and realistic abuse cases.
2. Trace authentication, authorization and resource ownership through server routes and data access.
3. Review validation, output encoding, query safety, uploads, storage, serialization and logging.
4. Assess CSRF, XSS, injection, IDOR, SSRF, replay, enumeration, race conditions and rate limits where relevant.
5. Review secrets, external integrations, webhook authenticity, error handling and retention.
6. Rank findings by severity and evidence; recommend mitigations and regression checks.
7. State review scope, untested paths and residual risk.

## Rademan context

Pay attention to role/resource ownership, buyer–artist conversations, attachments, unpublished artwork, user content and admin access. Verify controls. See [security guidance](../../../AI/SECURITY.md) and [architecture](../../../AI/ARCHITECTURE.md).

## Quality bar

Enforce security on the server, not only in UI. Avoid private-data leakage through logs, URLs, search or broad admin views. Static review is not penetration testing or certification.

## Deliverable

Prioritized findings with affected asset, evidence, impact, severity, remediation and suggested regression coverage.
