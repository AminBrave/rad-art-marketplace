# Phase 3 — Admin artwork moderation smoke test

Run after pulling the moderation branch and applying migrations.

## Setup

\`\`\`powershell
git checkout feature/phase-3-artwork-moderation
git pull origin feature/phase-3-artwork-moderation
php artisan migrate
npm run dev
\`\`\`

In another terminal, run \`php artisan serve\` and open the local URL.

## Access control

1. Sign in as an administrator.
2. Confirm the administrator dashboard shows the artwork review panel.
3. Sign in as an artist and confirm the moderation panel is not rendered.
4. As a guest, request \`GET /api/v1/admin/artworks\`; expect HTTP 401.
5. As an artist, request the same endpoint; expect HTTP 403.

## Moderation workflow

1. Submit a new artwork as an artist. Confirm its status is **در انتظار بررسی**.
2. As an administrator, open the pending review tab and confirm the artwork and artist details appear.
3. Approve one artwork without a note. Confirm its status becomes **منتشرشده** and it appears in the public catalogue.
4. For another pending artwork, try rejecting without a note. The UI and API must require a note.
5. Reject it with a clear note. Confirm the status becomes **ردشده** and the note is visible in the artist studio.
6. For another pending artwork, request changes with a note. Confirm **نیازمند اصلاح** appears in the artist studio.
7. Edit and resubmit that artwork as its owner. Confirm it returns to **در انتظار بررسی** and the previous moderation note and review audit fields are cleared.
8. Try to moderate an already approved/rejected item again without artist resubmission. The API must return HTTP 422.
9. Confirm the administrator can filter the queue by pending, approved, rejected, and changes requested.

## Review audit

- After a moderation decision, \`reviewed_by\` must identify the administrator and \`reviewed_at\` must be populated.
- Deleting an administrator must not delete artworks; the nullable reviewer foreign key should become null.
- Public catalogue and detail endpoints must continue to expose approved artwork only.
