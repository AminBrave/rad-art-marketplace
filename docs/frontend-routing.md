# Frontend Routes and Access Model

The production application entry point is `resources/js/app.jsx`. Normal navigation mounts `AppRouter` from `resources/js/app/AppRouter.jsx`; React Router is the single source of truth for browser navigation. The legacy `resources/js/app/App.jsx` is retained only for the development-only `?design-system` specimen.

Laravel serves the React shell for application paths through the final web catch-all. JSON endpoints remain under `/api/v1`.

## Public routes

All public routes render inside `PublicLayout`, which provides the public navigation and footer.

| Route | Page |
|---|---|
| `/` | Editorial homepage |
| `/artworks` | Approved artwork catalogue, search, category filter, pagination |
| `/artworks/:slug` | Artwork detail and buyer inquiry entry point |
| `/artists` | Searchable, paginated public artist directory |
| `/artists/:slug` | Public artist profile and approved portfolio |
| `/about` | About Rad Art |
| `/help` | User help |
| `/contact` | Contact information/content |
| `/login` | Session login |
| `/register` | Buyer/Artist registration |
| `/unauthorized` | Authenticated user with an incompatible role |

## Protected workspaces

| Role | Base route | Child routes |
|---|---|---|
| Artist | `/dashboard/artist` | `profile`, `artworks`, `inquiries` |
| Buyer | `/dashboard/buyer` | `inquiries` |
| Admin | `/admin` | `users`, `artworks` |

`/dashboard` requires authentication and redirects to the user's role workspace: Admin to `/admin`, Buyer to `/dashboard/buyer`, and Artist to `/dashboard/artist`.

The artist workspace reuses `ArtistWorkspaceLayout` and the shared `WorkspaceLayout`. Its overview at `/dashboard/artist` derives profile visibility, artwork count/status, and inquiry count/recent items from the existing artist profile, artwork, and paginated inquiry endpoints. These are operational summaries, not analytics or fabricated performance metrics.

- `/dashboard/artist/profile` edits the current artist's profile.
- `/dashboard/artist/artworks` lists the current artist's unpaginated artwork collection and provides create/edit forms.
- `/dashboard/artist/inquiries` provides a paginated inbox, recipient-scoped detail, and supported read/archive status actions.

The artwork form uses `GET /api/v1/categories`, `GET /api/v1/artist/artworks`, `POST /api/v1/artist/artworks`, and method-spoofed `PATCH /api/v1/artist/artworks/{id}`. There is no artwork deletion endpoint. The inquiry inbox uses the artist list/detail/update endpoints and only exposes the API's `new`, `read`, and `archived` states. It does not provide replies, chat, or email delivery.

The artist, buyer, and admin route trees use their own role guards and workspace layouts. Nested and global not-found handling is provided for unknown workspace paths.

## Authentication and authorization

- `AuthProvider` in `resources/js/app/AuthContext.jsx` loads the current session from `GET /api/v1/auth/me`.
- `RequireAuth` sends guests to `/login` and preserves the requested location in router state.
- `RequireRole` sends authenticated users without the required role to `/unauthorized`.
- A 401 from a feature API clears stale client authentication state. A 403 remains an authorization denial and must be handled by the affected page.
- Successful login/registration and logout update the shared auth context.

Client-side guards are a navigation/UX boundary only. Laravel session middleware, role middleware, policies, validation, and ownership checks remain authoritative. Never remove server checks because a route or navigation item is hidden.

## Deep links and refresh

The final Laravel web catch-all serves the SPA entry view for application paths while excluding `/api`, `/storage`, and `/build`. Public and workspace routes should therefore load directly and survive browser refresh. The API and asset routes remain handled by Laravel.

## Development-only design specimen

Open `/?design-system` while running Vite in development to render the existing design/component specimen. `resources/js/app.jsx` selects the legacy specimen entry only for this development query parameter; normal application navigation always uses `AppRouter`. This specimen is not a production route or product page.

## Route acceptance matrix

| Session | Expected behavior |
|---|---|
| Guest opens an artist, buyer, or admin workspace | Redirect to login; preserve requested path for post-login navigation |
| Buyer opens an artist or admin workspace | Redirect to unauthorized |
| Artist opens a buyer or admin workspace | Redirect to unauthorized |
| Admin opens an artist or buyer workspace | Redirect to unauthorized |
| Session expires and a protected API returns 401 | Clear stale auth state and require login |
| API returns 403 | Keep the server denial authoritative and show a relevant access/error state |
| Unknown application path is opened/refreshed | Render the React not-found page |
| API path is requested | Laravel API route handles it; SPA fallback must not capture it |

Manual browser verification for all roles and representative viewport sizes remains part of the MVP 2 QA stage. See [manual smoke tests](manual-smoke-tests.md) and [QA checklist](qa-checklist.md).
