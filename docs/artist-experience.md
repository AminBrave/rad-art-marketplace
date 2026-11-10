# Artist experience

## Onboarding and profile completeness

The artist workspace start checklist uses five named profile fields:
1. Display name
2. Artist biography
3. City
4. At least one website or Instagram handle
5. Public visibility enabled

The UI reports the number of these explicit items completed. This is a transparent checklist, not a quality score, ranking, prediction, or engagement metric. The first-artwork step is based on the actual total returned by the artist artwork API.

## Profile preview and privacy

An artist may open their own profile route as a preview even while the profile is private. The API continues to authorize the owner/Admin and returns 404 to guests and unrelated users for a private profile. Previewing does not modify visibility. Public directory and catalogue queries remain restricted to public profiles and approved artworks.

## Artwork submission

Accepted image formats are JPG/JPEG, PNG, and WebP. Files must be at most 5 MB and no more than 6000 × 6000 pixels. The browser checks MIME type, byte size, image decoding, and natural dimensions before upload to provide quick recoverable feedback. Laravel repeats authoritative image validation on the server; client checks are not a security boundary.

The artist workspace explains these moderation states:
- **Pending review:** submitted and waiting for an administrator; not publicly listed.
- **Approved:** approved for public display when the artist profile is public.
- **Rejected:** administrator declined the submission; the actual review note is shown.
- **Changes requested:** artist should review the administrator's note, edit the work, and submit it again.

Editing a work returns it to pending review. Laravel remains authoritative for ownership, validation, status, review metadata, and private image storage.

## Inquiry lifecycle

- **New:** no read state has been recorded.
- **Read:** the artist marked the request as reviewed.
- **Archived:** the artist moved the request out of the active inbox.

These are internal tracking states only. They do not send a response, email, or notification. Buyer identity fields remain limited to the API's allow-listed display name; private email addresses are not exposed.

## Verification

Automated coverage lives in:
- `tests/Feature/ArtistProfileTest.php`
- `tests/Feature/ArtworkTest.php`
- `tests/Feature/ArtworkModerationTest.php`
- `tests/Feature/ArtistInquiryTest.php`
- `tests/js/artistExperience.test.js`
- `tests/browser/test_m04_artist_experience.py`

Manual checks are listed in `docs/manual-smoke-tests.md` under **M04 artist experience**.
