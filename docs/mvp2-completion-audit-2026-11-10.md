# MVP 2 completion batch — evidence and remaining gates

**Audit date:** 2026-11-10  
**Main commit:** `b24e91dd44dcac8d5ef9b5f78140bf256dacd5ba`  
**Merged implementation:** [PR #114](https://github.com/AminBrave/rad-art-marketplace/pull/114)  
**Final PR CI:** [run #42845563969](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42845563969)  
**Post-merge main CI:** [run #42845923790](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42845923790)

## Verified automated evidence

PR #114 passed all three required GitHub Actions jobs on final head `db965b0dad2106314b8f105f46728cbe3db40f06`:

- Backend: **92 tests / 890 assertions**; PHP style job passed.
- Browser: **26 Chromium tests** passed against the Laravel-served application with deterministic API fixtures.
- Frontend: ESLint and Vite production build passed.

The post-merge workflow on `main` commit `b24e91dd44dcac8d5ef9b5f78140bf256dacd5ba` also passed all three jobs. See [run #42845923790](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42845923790).

Automated RTL/responsive smoke coverage includes public routes and Buyer, Artist and Admin workspace shells at 320, 375, 768, 1024 and 1440 CSS-pixel widths. These checks detect horizontal overflow and verify Persian document language/direction. They do not establish visual quality, keyboard accessibility, screen-reader behavior or physical-device compatibility.

## M05 implementation status

### Integrated in main

- Canonical buyer–artist conversations, participant-scoped APIs and direct-message entry points.
- Message replies, sender-only edit/delete, reactions and read state.
- In-app message notifications and notification preferences.
- Participant-scoped inbox search, unread/archived filtering, and independent per-participant archive/mute state. Muting suppresses only that participant's in-app message notifications for that conversation.
- Private message attachments: JPEG/PNG/WebP/PDF allowlist, 10 MB cap, image dimension checks, private local storage, participant-authorized downloads, safe metadata, and purge on message deletion/removal.
- Messaging safety: block/unblock, participant-scoped message/conversation reports, report rate limits, Admin report queue/actions, moderation audit records, and negative authorization tests.

### Still gated or incomplete

- **Real-time delivery, typing and presence (#81):** the UI currently uses five-second message polling. WebSocket/broadcasting and presence are not enabled because the actual target host's persistent process/broadcasting support has not been verified.
- **Email notifications (#83):** in-app notifications are integrated; email remains disabled until a persistent queue worker, mail transport/sender identity, retry/failure handling, preferences and unsubscribe behavior are verified on the target host.
- **Attachment malware scanning (#82):** no scanner is integrated. Before production uploads are enabled, select a compatible host-level scanning control or record explicit product-owner risk acceptance. Do not infer safety from MIME checks alone.
- **Retention policy (#84):** technical report/audit records exist, but a retention period, deletion schedule and accountable policy owner still require product/legal approval.
- **Independent security review:** not performed by a separate reviewer. Automated authorization tests are evidence, not a substitute for review.
- **Manual visual/accessibility checks:** human review, keyboard/focus, contrast, screen-reader and real-device checks remain outstanding.

## Remaining non-M05 roadmap gates

- **Localization/RTL (#26):** source and automated document-direction checks exist; full UI-copy, mixed-direction and human rendering review remains.
- **Responsive/accessibility (#27):** automated viewport overflow checks exist; keyboard, focus, contrast, screen-reader and physical-device evidence remains.
- **Image/performance (#28, #48):** loading and code-splitting improvements are integrated; repeatable Lighthouse/Core Web Vitals, CLS, network waterfall and production-like database/query measurements remain.
- **Release verification (#29, #60):** CI is green; production-host configuration, deployment smoke tests, backup/restore drill and cross-browser/manual sign-off remain.
- **SEO (#74):** implementation is merged; actual production-origin canonical URLs and external social crawler rendering still require deployed-host verification.
- **Design system and discovery visual acceptance (#61, #62, #69, #70, #71):** implementation is integrated; human design review across mobile/tablet/desktop and explicit deferred-feature decisions remain.
- **Observability and launch readiness (#65, #75):** production monitoring, privacy/legal review, backup/restore, operational ownership and product-owner launch approval remain.

## Decision

The implementation batch is integrated and the automated CI baseline is green. This is **not** a production launch sign-off. Keep the affected issues open until their specific remaining acceptance evidence is recorded or the product owner explicitly accepts a documented deferral. Do not enable email, WebSocket transport or production attachment uploads without the corresponding host/security decisions.


**Follow-up CI verification (2026-11-10):** PR #118 corrected the Playwright notification-to-conversation fixture boundaries and added an explicit nested-route regression. Latest post-merge `main` [CI run #42852936094](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42852936094) passed all three jobs: 92 backend tests / 890 assertions, PHP style, frontend lint/build, and 27 Chromium browser tests. Main commit: `d7c056645addf33d872bec4868995e0e9bfda89f`. This supersedes the intermediate documentation-sync run that exposed the fixture failure; no application feature regression was found.

The final browser fixture correction is test-only; no application feature behavior was changed by PR #118.
