# Rademan — security and privacy

Apply security controls according to the data, feature and threat model. This guide is practical engineering guidance, not a claim that the application has undergone a security audit.

## Trust boundaries

Treat browser input, uploaded files, user-generated content, external API responses and inbound webhooks as untrusted. Validate and normalize data at server boundaries. Escape output for its rendering context.

## Authentication and authorization

- Enforce access on the server for every sensitive operation.
- Check role, ownership, participant relationship and resource-level permissions where applicable.
- Scope resource lookups to the authorized actor to prevent insecure direct object references.
- Do not rely on hidden UI, client-side route guards or client-supplied role claims as security controls.
- Preserve denied-access behavior as well as successful flows.

## Data protection

- Collect and retain only data needed for a clear product purpose.
- Limit access to personal and private data.
- Keep secrets in environment/configuration systems; never commit them or expose them in client bundles.
- Avoid sensitive content in logs, analytics, URLs and exception messages.
- Use framework protections and parameterized queries; avoid unsafe dynamic SQL and mass assignment.
- Define appropriate retention and deletion behavior for personal data and uploaded content.

## Uploads and messaging

For uploads, validate size, content and allowed formats on the server; do not trust filename extensions or browser MIME declarations alone. Consider storage privacy, download authorization, metadata exposure and safe processing.

For private conversations and attachments, verify participant access on every read and write path. Consider blocking/reporting, abuse throttling, notification leakage and moderation access. Do not expose message bodies in logs or broad administrative views without a clear purpose and authorization model.

## External services

Authenticate inbound events and verify signatures where supported. Make handlers idempotent, validate external responses, retry safely and handle provider outages. Validate outbound destinations to reduce SSRF and credential leakage risks.

## Security review

For a security-sensitive change, identify assets, actors, trust boundaries and abuse cases; trace server and client paths; inspect authorization, validation, storage, logging and failure handling; then state findings, mitigations and unassessed areas clearly.

A code review or static scan is not a penetration test or security certification. Describe the actual scope of any assessment and report residual risk honestly.
