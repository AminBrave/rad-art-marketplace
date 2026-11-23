# Rademan application route map

**Baseline:** product-owner-supplied `agent/chatgpt`. Frontend declarations are in `resources/js/app/AppRouter.jsx`; browser/API routes are in `routes/web.php`. The redesign preserves these route contracts.

| Route | Experience | Screen |
|---|---|---|
| `/` | Discover | Home / image-led discovery |
| `/artworks` | Discover | Artwork catalogue |
| `/artworks/:slug` | Discover | Artwork detail |
| `/artists` | Discover | Artist directory |
| `/artists/:slug` | Discover | Artist profile and portfolio |
| `/collections` | Discover | Editorial collections |
| `/collections/:slug` | Discover | Collection detail |
| `/about`, `/help`, `/contact` | Public support | Information pages |
| `/login`, `/register` | Authentication | Sign in / registration |
| `/dashboard` | Auth routing | Dashboard index |
| `/dashboard/artist` | Artist Studio | Overview |
| `/dashboard/artist/profile` | Artist Studio | Profile settings |
| `/dashboard/artist/artworks` | Artist Studio | Artwork/content studio |
| `/dashboard/artist/messages` | Artist Studio | Canonical conversation inbox |
| `/dashboard/buyer` | Buyer Studio | Overview |
| `/dashboard/buyer/messages` | Buyer Studio | Canonical conversation inbox |
| `/admin` | Admin Console | Overview |
| `/admin/users` | Admin Console | User and role governance |
| `/admin/artworks` | Admin Console | Artwork moderation |
| `/admin/message-reports` | Admin Console | Message reports |
| `/admin/artwork-comment-reports` | Admin Console | Artwork comment reports |
| `/admin/editorial` | Admin Console | Editorial curation |

## Navigation principles
- Discover retains all existing public destinations.
- Buyer and Artist Studios retain their canonical messages destinations; “Inquiries” may be used as a label without changing URLs.
- Artist artwork management may be labeled Content Library while preserving its route and behavior.
- Admin navigation may be grouped and reordered without changing route contracts.
- Mobile navigation must expose the most common role actions and keep messaging reachable.

## Backend and data boundaries
Public APIs include artwork, artist, category, filter, collection and featured-artist discovery. Authenticated conversation operations remain participant-authorized. Artist profile/artwork operations and admin moderation/editorial/user/report operations remain role-gated.

Do not rename URLs or weaken authorization to fit a visual navigation proposal. If route migration is later approved, preserve deep links and query/context continuity with explicit redirects and tests.
