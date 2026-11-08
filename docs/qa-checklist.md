# Post-merge QA checklist

This checklist supplements automated CI. A successful lint/build/test run does not replace browser, accessibility, security, or real-device verification.

## Automated checks

Run from the repository root:

- [ ] `composer test`
- [ ] `composer lint`
- [ ] `npm run lint`
- [ ] `npm run build`

## Public routes and catalogue

- [ ] Open the homepage as a guest.
- [ ] Open `/artworks`, search, and filter by category.
- [ ] Open an artwork detail page directly and refresh it.
- [ ] Open a public artist profile directly and refresh it.
- [ ] Verify private artist profiles and unapproved artworks are not publicly exposed.
- [ ] Verify unknown public paths render the not-found page.

## Authentication and role boundaries

- [ ] Guest opening a protected artist, buyer, or admin route is sent to login.
- [ ] Successful login returns the user to the originally requested permitted route.
- [ ] Buyer can access only buyer workspace routes.
- [ ] Artist can access only artist workspace routes.
- [ ] Admin can access only admin workspace routes.
- [ ] Wrong-role access renders the unauthorized page.
- [ ] Logout clears the session and protected routes require login again.
- [ ] Expired sessions recover cleanly after an API 401; API 403 responses remain server-authoritative.

## Workspace behavior

- [ ] Artist can load and update their own profile.
- [ ] Artist can create/edit their own artwork and view their own inquiry inbox.
- [ ] Buyer can view their own sent inquiries.
- [ ] Admin can view user management and artwork moderation.
- [ ] Verify ownership and role restrictions against API responses, not only hidden UI controls.

## RTL, accessibility, and responsive behavior

- [ ] Verify Persian content, mixed Persian/Latin fields, and RTL navigation.
- [ ] Verify keyboard-only navigation and visible focus indicators.
- [ ] Verify labels, validation errors, loading, empty, and error states.
- [ ] Check mobile, tablet, and desktop widths for overflow and broken layouts.
- [ ] Check reduced-motion behavior and text contrast.
- [ ] Check image loading, aspect ratios, and layout stability.

## Release gates

- [ ] Confirm target PHP version and required extensions on the actual host.
- [ ] Verify environment configuration, mail settings, private storage permissions, and API routing.
- [ ] Perform a backup and a restore drill before production launch.
- [ ] Run production-like smoke tests after deployment.
