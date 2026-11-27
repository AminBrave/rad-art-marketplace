# Rademan — localization and directionality

The frontend supports Persian and English through the shared localization module. Keep locale behavior centralized and verify the implementation before changing translation or direction handling.

## Ownership

- `resources/js/shared/i18n/` owns locale dictionaries, provider/hook and document language/direction synchronization.
- `resources/js/utils/` owns localized-content and artwork-price formatting helpers.
- The document root is the single owner of the active `lang` and `dir` attributes. Components should not independently set page direction.

## UI text

- Add user-facing UI text to the shared locale dictionaries in both Persian and English.
- Use the shared translation hook for labels, helper text, statuses, empty states, errors and feedback.
- Keep user-authored content in its source language unless the API provides a localized field.
- Do not translate arbitrary user content in the browser.
- Keep translation keys consistent and avoid duplicate dictionary entries.

## Localized content

Use the shared localized-content helper when a model provides language-specific fields. Verify the model/API response before assuming a field exists. Prefer the requested locale when its value is non-empty, then use the documented fallback.

Use the shared artwork-price formatter for displayed artwork prices so digits and currency labels remain locale-consistent. Do not introduce page-local price formatting.

## RTL, LTR and mixed-direction content

- Use logical properties (inline/block start/end) instead of hard-coded left/right layout rules.
- Keep text and layout direction aligned with the active document locale.
- Isolate technical identifiers, URLs, email addresses, phone numbers and other LTR fragments when needed.
- Use automatic direction for user-generated text whose direction is unknown.
- Mirror directional controls only where meaning requires it; do not mirror logos, artwork or neutral symbols.
- Avoid per-component RTL overrides when the document direction already provides the correct behavior.

## Verification

For affected surfaces, inspect both locales, mixed Persian/Latin strings, long text, dates/numbers/prices, forms, menus, dialogs, navigation, focus order and responsive behavior. A translation-key/static check does not prove the whole product is correctly localized.
