# Multi-theme design system

## Decisions

- The existing Rad Art Editorial system remains the default theme.
- shadcn/ui New York is the second theme, using the Stone-neutral foundation and Rad Art's existing Persian-first typography and RTL requirements.
- Theme configuration is centralized in `config/design-system.php` and exposed to the browser as `window.__RAD_THEME_CONFIG__`.
- React Context owns runtime selection; the active theme is reflected as `data-theme` on the document element.
- Browser preference is stored under the configured localStorage key. It is a per-browser preference, not a global setting or account preference.
- Both themes share semantic CSS variables and the existing component API. Pages and domain logic must not branch on theme IDs.

## Runtime behavior

The Blade shell applies a validated saved preference before loading the Vite stylesheet to avoid a first-paint flash. `ThemeProvider` repeats validation, owns the React state, updates the root attribute and persists subsequent selections. Invalid or disabled preferences fall back to the configured default.

Use `useTheme()` only inside the provider. Components that need a theme selector should use `ThemeSwitcher`; application pages should continue importing shared components from `resources/js/components/ui`.

## Styling contract

Use shadcn semantic tokens (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--input`, `--ring`, and related foreground tokens) for new UI. Existing Rad Art `--color-*` variables remain compatibility aliases so the current pages do not need a mass rewrite.

Theme-specific values belong in `resources/css/app.css` under `:root` and `[data-theme="new-york"]`. Do not add theme-specific conditional classes to business pages. Keep Radix behavior, Lucide icons, the `cn()` utility, Persian font loading and RTL behavior.

## Adding components

Add generic primitives to `resources/js/components/ui`, preserving current prop contracts. Prefer semantic Tailwind utilities. Marketplace components such as `ArtworkCard` and `ArtistCard` retain their domain data contracts and consume the shared semantic token layer.

## Verification

Run `npm run lint`, `npm run test:frontend`, `npm run build`, and the repository CI workflow. Theme utility tests cover default selection, saved preferences, disabled themes, invalid IDs and storage failures. Browser-level checks should cover switching and persistence on public and workspace routes.
