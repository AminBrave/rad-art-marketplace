# Multi-theme runtime shell

This document describes only the runtime theme preference mechanism. It is not the component-system specification. The full product-wide adoption contract is [shadcn/ui New York Design System](shadcn-new-york-design-system.md).

## Decisions

- shadcn/ui New York is the default and primary design language.
- Editorial remains an optional compatibility theme while legacy screens are migrated.
- The New York adoption is not complete until the component inventory and page-level migration in the primary specification are implemented and verified.
- Theme configuration is centralized in `config/design-system.php` and exposed to the browser as `window.__RAD_THEME_CONFIG__`.
- React Context owns runtime selection; the active theme is reflected as `data-theme` on the document element.
- Browser preference is stored under the configured localStorage key. It is a per-browser preference, not a global setting or account preference.

## Runtime behavior

The Blade shell applies a validated saved preference before loading the Vite stylesheet to avoid a saved-theme flash. `ThemeProvider` validates the preference, owns runtime state, updates the root attribute and persists subsequent selections. Invalid or disabled preferences fall back to the configured New York default.

## Styling contract

Use semantic shadcn tokens for new UI. Existing Rad Art tokens may remain as temporary compatibility aliases during migration, but new components and migrated pages must not depend on them. Classic New York uses the current Radix-based component architecture and requires manual RTL review; see the primary design-system specification.

## Verification

Run the tests described in [Testing Strategy](../engineering/testing-strategy.md). Do not claim complete shadcn adoption based on theme-switching tests alone.
