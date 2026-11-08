# Frontend routing and access model

The React application uses React Router as the single source of truth for browser navigation. Laravel serves the React entry document for application paths; JSON APIs remain under `/api/v1`.

## Public routes

| Route | Purpose |
|---|---|
| `/` | Existing homepage and MVP 1 account entry |
| `/artworks` | Public approved-artwork catalogue |
| `/artworks/:slug` | Public artwork detail |
| `/artists` | Artist directory route placeholder; directory API is a separate follow-up |
| `/artists/:slug` | Public artist profile and buyer inquiry entry |
| `/about`, `/contact`, `/help` | Public content route placeholders |
| `/login`, `/register` | Session login and buyer/artist registration |
| `/unauthorized` | Role mismatch page |

## Protected workspaces

- Artist: `/dashboard/artist`, `/dashboard/artist/profile`, `/dashboard/artist/artworks`, `/dashboard/artist/inquiries`
- Buyer: `/dashboard/buyer`, `/dashboard/buyer/inquiries`
- Admin: `/admin`, `/admin/users`, `/admin/artworks`
- `/dashboard` redirects to the current role's workspace.

Role layouts render only the navigation appropriate to the authenticated role. The route guard waits for the session check, sends guests to `/login`, and sends authenticated users with the wrong role to `/unauthorized`. The not-found route is rendered by React Router for unknown application paths, including unknown nested paths inside each role workspace.

## Authentication and security

`resources/js/app.jsx` mounts the router for normal application requests. It reserves the development-only `?design-system` preview entry for the existing App component so the independent design-foundations PR can add its specimen without colliding with the route tree.

`AuthProvider` reads the current session from `GET /api/v1/auth/me`. A 401 from an API request clears stale client authentication state; a 403 remains an authorization failure and is shown by the affected screen. The browser guard is a navigation/UX aid only.

Laravel session middleware, role middleware, policies, validation, and ownership checks remain authoritative. Do not remove or weaken server-side checks because a route is hidden in React.

## Deep links and legacy compatibility

Laravel's final web catch-all serves the React entry view for application paths while explicitly excluding `/api`, `/storage`, and `/build`. Existing public paths `/`, `/artists/{slug}`, and `/artworks/{slug}` remain valid. This enables direct entry and refresh on nested workspace paths.

The artist directory and static information pages are route placeholders only; no artist-directory API or full static content was added in this routing issue. Their content remains in the corresponding public marketplace/content backlog work.

## Manual route acceptance matrix

| Session | Expected behavior |
|---|---|
| Guest opens an artist, buyer, or admin workspace URL | Redirect to `/login`; after successful login, return to the requested path if the role is allowed |
| Buyer opens an artist or admin workspace | Redirect to `/unauthorized` |
| Artist opens a buyer or admin workspace | Redirect to `/unauthorized` |
| Admin opens an artist or buyer workspace | Redirect to `/unauthorized` |
| Session expires and an API request returns 401 | Clear stale client session state; protected route returns to login |
| An API request returns 403 | Keep server denial authoritative and show the relevant feature's access/error state |
| Unknown browser path is opened or refreshed | Laravel serves the SPA shell; React Router renders the 404 page |
| API path is requested | Laravel API routing remains in control; SPA fallback does not capture it |

Run the PHPUnit frontend route test plus the repository's frontend lint and production build. Manual browser verification with guest, buyer, artist, and admin sessions remains part of release QA.
