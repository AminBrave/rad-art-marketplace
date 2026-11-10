# Roadmap and Milestones

Statuses distinguish existing source capabilities from future work. GitHub Milestones/Projects are authoritative once configured.

## M0 — Existing marketplace baseline
- [x] Artist/buyer roles and session authentication.
- [x] Public artist/profile and approved artwork discovery.
- [x] Artwork submission and admin moderation.
- [x] Buyer inquiries and canonical buyer/artist conversations.
- [x] Messaging, attachments, reactions, safety/reporting.
- [x] In-app notifications and editorial collections/featured artists.
- [ ] Re-run and record checks on this branch; source presence is not test evidence.

## M1 — Agent engineering foundation
- [ ] Adopt knowledge graph and agent contract.
- [ ] Confirm branch protection/rulesets and required checks.
- [ ] Establish issue labels, milestones and GitHub Project.
- [ ] CI green for backend, frontend, build and browser suites on every PR.
- [ ] Add known owners for security/migrations/workflows.

## M2 — Reliability and security
- [ ] Review email verification, password recovery and account lifecycle.
- [ ] Define rate limits, attachment constraints and abuse monitoring.
- [ ] Add query performance budgets and representative-data checks.
- [ ] Define structured logs, error tracking, uptime and deployment smoke tests.
- [ ] Verify backup restore in non-production.

## M3 — Discovery and measurement
- [ ] Define privacy-safe analytics taxonomy.
- [ ] Establish discovery-to-contact baseline.
- [ ] Measure moderation and report resolution.
- [ ] Validate search relevance with user research.
- [ ] Define performance/accessibility budgets.

## M4 — Future commerce discovery (not committed scope)
- [ ] Validate demand and operating model before cart/order/payment.
- [ ] Security/legal/architecture review for payment, refunds, tax, shipping and payouts.
- [ ] Create dedicated ADRs and milestones before implementation.

Close a milestone only when all scoped issues are closed, acceptance checks pass, release is verified where applicable and outcome is recorded.
