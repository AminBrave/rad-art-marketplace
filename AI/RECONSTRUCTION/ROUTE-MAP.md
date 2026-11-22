# Rademan reconstruction — route map

**Evidence baseline:** `main` at `4db615e7ff271446640dd79ad2aa1c24553f7966`. Frontend route declarations: `resources/js/app/AppRouter.jsx`. Backend browser/API declarations: `routes/web.php`.

## Current frontend routes

| Current route | Experience | Current screen |
|---|---|---|
| `/` | Discover | Home |
| `/artworks` | Discover | Artwork catalogue |
| `/artworks/:slug` | Discover | Artwork detail |
| `/artists` | Discover | Artist directory |
| `/artists/:slug` | Discover | Artist profile |
| `/collections` | Discover | Editorial collections |
| `/collections/:slug` | Discover | Collection detail |
| `/about`, `/help`, `/contact` | Public support | Information pages |
| `/login`, `/register` | Authentication | Auth |
| `/dashboard` | Auth routing | Dashboard index |
| `/dashboard/artist` | Artist Studio | Overview |
| `/dashboard/artist/profile` | Artist Studio | Profile settings |
| `/dashboard/artist/artworks` | Artist Studio | Artwork management |
| `/dashboard/artist/messages` | Artist Studio | Messaging center |
| `/dashboard/buyer` | Buyer Studio | Overview |
| `/dashboard/buyer/messages` | Buyer Studio | Messaging center |
| `/admin` | Admin Console | Overview |
| `/admin/users` | Admin Console | User management |
| `/admin/artworks` | Admin Console | Artwork moderation |
| `/admin/message-reports` | Admin Console | Message reports |
| `/admin/editorial` | Admin Console | Editorial management |

## Proposed navigation mapping
- Discover: retain the current public routes.
- Buyer: keep current overview and messages destinations; relabel messages as Inquiries in the UI while preserving the URL unless a separate route migration is approved.
- Artist: consolidate the artist artworks destination as Content Library; keep profile and messages behavior, with Inquiries as the product label.
- Admin: map existing routes to Overview, Content Review, Reports & Trust, Curation, and Users & Roles. Reorder navigation without changing route contracts by default.

## Backend route observations
- `routes/web.php` defines the API v1 groups as well as SPA/browser routes.
- Public APIs include artist profiles, artworks, categories, filters, collections and featured artists.
- Authenticated buyer and artist conversation index endpoints are role-scoped.
- Conversation detail/message operations are authenticated and participant-authorized.
- Artist profile/artwork operations and admin moderation/editorial/user/report operations are role-gated.

## Migration policy
Do not rename or remove URLs just to align labels. Prefer a navigation/label refactor first. If a route migration is later approved, preserve deep links with explicit redirects and test query-string/context continuity.
