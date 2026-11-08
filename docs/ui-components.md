# Shared UI components

The shared component layer lives in `resources/js/components/ui` and follows the Contemporary Art Editorial tokens from `resources/css/app.css` and `tailwind.config.js`.

Import from the barrel:

```jsx
import { Button, Badge, FormField, TextInput } from '../components/ui';
```

## Controls

### Button

Variants: `primary` (default), `secondary`, `outline`, `ghost`, `danger`.

Sizes: `sm`, `md` (default), `lg`.

Supports native button props, `disabled`, and `loading`. Loading disables interaction, exposes `aria-busy`, and renders a decorative progress indicator. Use `type="submit"` only for form submission; the default is `button`.

### IconButton

A compact square button. Supply a visible icon as children and a meaningful `label` prop; the label is exposed as both `aria-label` and `title`. Native disabled behavior is preserved.

### FormField, TextInput, TextareaField, SelectField

`FormField` provides a connected label, required marker, hint, and validation error. It assigns a stable ID to its child control and connects helper/error text through `aria-describedby`; invalid fields receive `aria-invalid`.

```jsx
<FormField label="عنوان اثر" hint="حداکثر ۱۶۰ نویسه" error={errors.title?.[0]} required>
  <TextInput value={title} onChange={handleTitleChange} />
</FormField>
```

All controls accept native input props, including `name`, `value`, `onChange`, `disabled`, `required`, and `dir`.

### SearchField

A labeled search form with a controlled `value`, `onChange`, and `onSearch(value)` callback. Each instance receives a unique input ID. The search button submits the form, so Enter works as expected.

### Badge

Variants: `neutral`, `success`, `warning`, `danger`, `info`, `accent`.

## Navigation and overlays

- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`: Radix Tabs with roving keyboard focus and arrow-key navigation.
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`: Radix Dropdown Menu with managed focus, keyboard navigation, Escape dismissal, and RTL direction.
- `Dialog`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogTitle`, `DialogDescription`: Radix Dialog with focus trapping/restoration, Escape dismissal, and an accessible title/description.
- `Breadcrumbs`: semantic navigation list; the final item is marked as the current page.
- `Pagination`: previous/next controls and a compact numeric page window. Supply `currentPage`, `lastPage`, and `onPageChange(page)`.

Radix controls should be composed using `asChild` when a shared `Button` is used as their trigger.

## Cards

- `ArtworkCard` accepts an artwork object with `slug`, `title`, `image_url`, optional `category.name`, optional `artist.display_name`, and optional `price`. Artwork imagery uses `object-contain` to avoid cropping the source.
- `ArtistCard` accepts a public artist object with `slug`, `display_name`, optional `city`, and optional `bio`. It does not assume avatar data exists.

## Feedback and loading

- `Skeleton` and `SkeletonLines`: non-interactive loading placeholders.
- `EmptyState`: title, optional description, and optional action.
- `ErrorState`: alert semantics and optional retry callback.
- `SuccessState`: polite status feedback.
- `PermissionState`: non-destructive permission-denied state.
- `UploadFeedback`: idle/uploading/success/error status with an accessible progress bar when uploading.
- `Toast`: dismissible status/alert presentation. The caller owns visibility and dismissal state; this primitive does not start timers or hide messages unexpectedly.

## Direction, responsiveness, and accessibility

- Components use semantic design tokens rather than page-specific hex values.
- Layouts are fluid and wrap at narrow widths; controls retain usable touch targets.
- Global `:focus-visible` styling remains active. Disabled controls use native disabled semantics.
- Radix handles focus management and keyboard behavior for tabs, menus, and dialogs.
- Text and controls inherit document RTL direction; LTR values can set `dir="ltr"` on the field.
- Keep form labels visible. Do not rely on placeholders as labels.
- Keep server-side authorization authoritative; component visibility is not a security boundary.

## Preview

Run the app in development and open `/?design-system`. The design specimen now includes an interactive shared-component section for variants, form feedback, tabs, dropdowns, dialogs, cards, pagination, upload progress, and toasts.
