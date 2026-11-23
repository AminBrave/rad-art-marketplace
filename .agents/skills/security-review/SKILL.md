---
name: security-review
description: Assess Rademan features and changes for authentication, authorization, privacy, data exposure, abuse and integration risks.
---

# Security review

## Purpose
Identify material security and privacy risks and recommend practical mitigations.

## Approach
1. Identify sensitive assets, actors, trust boundaries and relevant threats.
2. Trace authentication and authorization through the server and data access paths.
3. Review validation, uploads, serialization, storage, logging and external integrations.
4. Consider abuse cases, rate limits, enumeration, replay, race conditions and failure behavior where relevant.
5. Rank findings by impact, likelihood and exposure.
6. Recommend mitigations that preserve the intended user experience.
7. State review scope and limitations; distinguish static observations from tested findings.

## Rademan context
Pay particular attention to role and resource ownership, buyer–artist conversations, attachments, unpublished artwork, user-generated content and administrative access. Verify actual implementation rather than relying on this list.

## Deliverable
Prioritized findings with evidence, impact, practical remediation and suggested regression coverage. A static review is not a penetration test or a certification.
