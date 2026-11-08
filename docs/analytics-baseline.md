# Privacy-Conscious Analytics Baseline

## Status

This document is a proposed measurement plan only. The application does not currently enable an analytics provider, tracking script, or event-collection pipeline. Do not describe these metrics as being collected.

## Principles

Measure product health without building advertising profiles or collecting unnecessary personal data. Analytics must never include names, email addresses, account IDs, inquiry subjects/messages, private image paths or tokens, passwords, session identifiers, or precise location.

Do not record rejected form payloads or inquiry content. Avoid retaining raw IP addresses in analytics. Security logs may require short-lived IP data; keep those logs separate with restricted access and a documented retention period.

## Proposed event definitions

| Event | Proposed trigger | Allowed properties | Purpose |
|---|---|---|---|
| `catalogue_viewed` | Catalogue page loaded | Referrer category, device class | Discovery funnel |
| `catalogue_search_used` | Search submitted | Query-length bucket, result-count bucket | Search quality |
| `category_filter_used` | Category selected | Category slug | Category discovery |
| `artwork_viewed` | Approved artwork detail opened | Public artwork slug, category slug | Content engagement |
| `artist_profile_viewed` | Public profile opened | Public profile slug; coarse city only if justified | Artist discovery |
| `inquiry_submitted` | Inquiry accepted | Artwork-attached boolean | Contact conversion |
| `artwork_submitted` | Artist submission accepted | Category slug | Supply activity |
| `artwork_moderated` | Admin decision saved | Decision type, elapsed-time bucket | Moderation operations |

Treat public slugs as potentially linkable identifiers; aggregate or pseudonymize them if the analytics design does not require record-level content attribution.

## Proposed baseline metrics

- Weekly active visitors (aggregate, subject to consent/legal basis).
- Catalogue-to-artwork-detail view rate.
- Artwork-detail-to-artist-profile view rate.
- Artist-profile-to-inquiry submission rate.
- Search zero-result rate.
- Artwork approval/revision/rejection rates.
- Median time from submission to moderation.
- Error rate for critical API routes.

## Implementation gate

Do not add a third-party analytics script until the site owner:

1. Selects a provider and reviews its data-processing terms and international transfers.
2. Determines the applicable legal basis and consent requirements.
3. Updates the privacy notice and retention policy.
4. Configures data minimization, retention, access, and deletion controls.
5. Verifies that no private account or inquiry content enters event payloads.

Prefer first-party aggregate counters if a third-party provider is not justified. Analytics implementation and collection remain disabled until this gate is approved.
