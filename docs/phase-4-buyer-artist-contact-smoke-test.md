# Phase 4 — Buyer-to-Artist Inquiry Smoke Test

Run this checklist against the branch/release under test after installing dependencies and applying migrations.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# Configure a test database in .env
php artisan migrate
npm install
npm run dev
```

In a second terminal, run `php artisan serve`, then open the local Laravel URL.

## Account roles and access

1. Register one account as Buyer and another as Artist.
2. Confirm the Buyer sees the buyer inquiry panel and cannot access artist profile/artwork-management mutations.
3. Confirm the Artist can create/edit their own artist profile and sees the artist inquiry inbox.
4. Attempt public registration with `role=admin`; expect HTTP 422.
5. Confirm a Guest can browse public profiles and approved artwork but cannot send an inquiry.

## Buyer inquiry flow

1. Sign in as the Buyer.
2. Open a public artist profile and submit an inquiry with a subject (4–160 characters) and message (20–3000 characters).
3. Open an approved artwork by that artist and submit an artwork-specific inquiry.
4. Confirm both submissions appear in the buyer's sent-inquiry list.
5. Confirm the Buyer cannot open another buyer's inquiry by changing the inquiry ID in the API request.
6. Try an inquiry against a private artist profile; expect HTTP 404.
7. Try to associate an artwork from another artist or a non-approved artwork; expect HTTP 404.
8. Submit a subject or message below its minimum length; expect HTTP 422.
9. Fill the hidden honeypot field in a direct API request; expect HTTP 422.
10. Send more than five contact requests within one minute from the same client; subsequent requests should be rate-limited with HTTP 429.

## Artist inbox

1. Sign in as the Artist who received the inquiry.
2. Confirm the inbox shows subject, message, buyer display name, and optional artwork title.
3. Confirm the buyer's email address is not present in the API response or interface.
4. Mark a new inquiry as read; confirm status and read timestamp update.
5. Archive the inquiry.
6. Try to read or update an inquiry addressed to another artist; expect HTTP 404.
7. Confirm the Artist cannot access buyer sent-inquiry endpoints.

## Privacy and regression checks

- Inquiry API payloads omit buyer and artist email addresses.
- Only the authenticated Buyer can create and list their own inquiries.
- Only the owning Artist can view or update received inquiries.
- Existing public catalogue and artwork moderation behavior still works.
- No email delivery, real-time chat, payment, or order workflow is part of this milestone.
