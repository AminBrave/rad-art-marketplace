# Phase 4 — Buyer-to-artist inquiry smoke test

Run this checklist after pulling the Phase 4 branch and applying migrations.

## Setup

\`\`\`powershell
git fetch origin
git switch -c feature/phase-4-buyer-artist-contact --track origin/feature/phase-4-buyer-artist-contact
php artisan migrate
npm run dev
\`\`\`

In a second terminal run \`php artisan serve\`, then open the local Laravel URL.

## Account roles

1. Register one account as **Buyer** and another as **Artist**.
2. Confirm the buyer sees the buyer inquiry panel and does not see artist profile or artwork-management forms.
3. Confirm the artist can create/edit an artist profile and sees the artist inquiry inbox.
4. Attempt public registration with \`role=admin\` through the API; expect HTTP 422.
5. Confirm a guest can browse public profiles and approved artworks but cannot send an inquiry.

## Buyer contact flow

1. Sign in as the buyer.
2. Open a public artist profile and send an inquiry with a subject and a message of at least 20 characters.
3. Open an approved artwork by that artist and send an artwork-specific inquiry.
4. Confirm both submissions appear in the buyer's sent-inquiry list.
5. Confirm the buyer cannot open another buyer's inquiry by changing the inquiry ID in the API request.
6. Try an inquiry against a private artist profile; expect HTTP 404.
7. Try to associate an artwork from another artist or a pending artwork; expect HTTP 404.
8. Submit a message shorter than 20 characters or a subject shorter than 4; expect HTTP 422.
9. Fill the hidden honeypot field in a direct API request; expect HTTP 422.
10. Send more than five contact requests within one minute from the same client; subsequent requests should be rate-limited with HTTP 429.

## Artist inbox

1. Sign in as the artist who received the inquiry.
2. Confirm the inbox shows subject, message, buyer display name, and optional artwork title.
3. Confirm the buyer's email address is not present in the API response or interface.
4. Mark a new inquiry as read; confirm its status and read timestamp update.
5. Archive the inquiry.
6. Try to read or update an inquiry addressed to another artist; expect HTTP 404.
7. Confirm the artist cannot access buyer sent-inquiry endpoints.

## Privacy and regression checks

- Inquiry API payloads do not include buyer or artist email addresses.
- Only the authenticated buyer can create and list their own inquiries.
- Only the owning artist can view or update received inquiries.
- Existing public catalogue and artwork moderation behavior still works.
- No email delivery, real-time chat, payment, or order workflow is introduced in this milestone.
