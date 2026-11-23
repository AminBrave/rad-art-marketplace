# Rademan target application architecture

## Experience architecture
Rademan is a responsive social-first visual art application. The reference is Instagram's compact, image-led interaction rhythm; the system itself is owned by Rademan.

### Shared application frame
- Public Discover shell: app bar, desktop navigation rail, mobile bottom tabs and centered content.
- Authenticated shell: compact top bar, persistent role navigation on desktop, mobile bottom tabs and navigation drawer.
- Shared theme provider: system/light/dark.
- Shared primitives: buttons, icon buttons, badges, fields, tabs, menus, dialogs, cards, surfaces, metrics, feedback and skeletons.

### Route-level modules
- Discover: home, artworks, artwork detail, artists, artist profile, collections, public information, login/register.
- Buyer Studio: buyer dashboard and canonical messages.
- Artist Studio: overview, profile settings, artwork studio and canonical messages.
- Admin Console: dashboard, users, moderation, editorial, message reports and artwork-comment reports.
- Messaging: canonical conversation list and active thread with contextual artwork, attachment, reply, reaction and safety workflows.

## UI architecture
- `resources/css/app.css`: semantic token foundation and base reset.
- `resources/css/rademan.css`: app shell, page composition and shared presentation.
- `tailwind.config.js`: semantic utility aliases only.
- `resources/js/components/ui/`: behavior and accessibility primitives.
- `resources/js/app/Layouts.jsx`: navigation and application shell.
- `resources/js/app/ThemeContext.jsx`: theme preference and browser chrome.
- Feature pages compose primitives and own route-level data interactions.

## Responsive contract
- 320px minimum viewport.
- Phone: single-column discovery, safe-area-aware bottom navigation, keyboard-safe forms and inbox/thread navigation.
- Tablet: compact shell and adaptive grids.
- Desktop: persistent navigation, centered content and two-pane messaging.
- RTL first, explicit LTR islands for mixed-direction values.

## PWA and security
- Standalone Persian RTL manifest and install icon.
- Production-only worker registration.
- Offline cache contains no private responses. No API, auth, HTML navigation, admin, dashboard or conversation data is cached.
- Server-side authorization and feature API contracts remain unchanged.

## Quality gates
- Unit/component tests and production build.
- Full route smoke tests across guest, buyer, artist and admin.
- Responsive screenshots at phone/tablet/desktop.
- Light/dark contrast and RTL review.
- Messaging list/thread, composer, attachments and safety regression.
- Android, iOS and desktop install/offline validation.
