# Privacy-Conscious Analytics Baseline

## Principles

The MVP should measure product health without building advertising profiles or collecting unnecessary personal data. Analytics must not include names, email addresses, account IDs, inquiry subjects/messages, artwork image URLs containing private tokens, passwords, session identifiers, or precise location.

## Event definitions

| Event | Trigger | Properties allowed | Purpose |
|---|---|---|---|
| `catalogue_viewed` | Catalogue page loaded | referrer category, device class | Discovery funnel |
| `catalogue_search_used` | Search submitted | query length bucket, result-count bucket | Search quality |
| `category_filter_used` | Category selected | category slug | Category discovery |
| `artwork_viewed` | Approved artwork detail opened | artwork public slug, category slug | Content engagement |
| `artist_profile_viewed` | Public profile opened | public profile slug, city only if coarse and approved | Artist discovery |
| `inquiry_submitted` | Inquiry accepted | artwork-attached boolean | Contact conversion |
| `artwork_submitted` | Artist submission accepted | category slug | Supply activity |
| `artwork_moderated` | Admin decision saved | decision type, elapsed-time bucket | Moderation operations |

Do not record rejected form payloads or inquiry content. Avoid retaining raw IP addresses in analytics. Security logs may require short-lived IP data; keep those logs separate with restricted access and a documented retention period.

## Baseline metrics

- Weekly active visitors (aggregate, consent/legal basis permitting)
- Catalogue-to-artwork-detail view rate
- Artwork-detail-to-artist-profile view rate
- Artist-profile-to-inquiry submission rate
- Search zero-result rate
- Artwork approval/revision/rejection rates
- Median time from submission to moderation
- Error rate for critical API routes

## Implementation gate

No third-party analytics script should be added until the site owner chooses a provider, reviews its data-processing terms and international transfers, configures consent where required, and updates the privacy notice. Prefer first-party, aggregate server-side counters if a provider is not selected. Analytics collection is not yet enabled by this document.
