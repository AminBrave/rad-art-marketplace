# Localization and bilingual content contract

Rad Art is Persian-first with an in-place English locale. The language switch does not change the URL; `LanguageProvider` persists the selected locale and updates the document root `lang` and `dir`.

## UI translations

- Add every user-facing Persian UI string to the English dictionary in `resources/js/app/LanguageContext.jsx`.
- Use `t()` for labels, helper text, status labels, empty states, errors, and server messages.
- Keep user-authored content as content; do not translate arbitrary user text.
- Shared loading, error, success, upload, and image feedback components localize their fallback text.
- The frontend translation coverage test checks literal `t()` keys and duplicate dictionary keys.

## Localized content fields

The English fields are optional. Use `localizedValue(record, field, locale)` for display; it selects the English field when the locale is English and a non-empty translation exists, otherwise it falls back to the Persian field.

| Content | Persian field | English field |
| --- | --- | --- |
| Artist name | `artist_profiles.display_name` | `display_name_en` |
| Artist biography | `artist_profiles.bio` | `bio_en` |
| Artist city | `artist_profiles.city` | `city_en` |
| Artwork title | `artworks.title` | `title_en` |
| Artwork description | `artworks.description` | `description_en` |
| Artwork city | `artworks.city` | `city_en` |
| Category name | `categories.name` | `name_en` |
| Collection title | `curated_collections.title` | `title_en` |
| Collection introduction | `curated_collections.intro` | `intro_en` |
| Featured artist introduction | `featured_artist_selections.editorial_intro` | `editorial_intro_en` |

English artist fields are edited in artist profile settings. English artwork fields and artwork city are edited in the artist artwork studio. Editorial administrators can enter English collection titles/intros and featured artist introductions.

## Prices and search

- Use `formatArtworkPrice(price, locale)` for all artwork price display. It formats locale-specific digits and uses `ریال` / `IRR`.
- Category APIs return `name_en`; known existing category slugs are backfilled during migration and demo categories are seeded with English names.
- Public artwork search includes English title, description, artist name, and artwork city. Artist directory search includes English artist name and city.
- Featured artwork, collection, artist, portfolio, moderation, and related-artwork views should use the localized fields with Persian fallback.

## API errors

When showing a server-provided message or validation error in the UI, pass it through `t()`. Add new custom Persian API messages to the English dictionary at the same time they are introduced.
