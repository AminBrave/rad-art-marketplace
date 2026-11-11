# End-to-End Feature Lifecycle

Use this checklist proportionately. Tick only stages that apply and only with evidence.

## S0 Discover
- [ ] Identify user, role, problem and outcome.
- [ ] Inspect relevant source/docs; use Graphify only when cross-file structure warrants it.
- [ ] Search existing issues/PRs/implementation.
- [ ] Identify dependencies and owners.

## S1 Specify
- [ ] Given/When/Then acceptance criteria.
- [ ] Negative paths, edge cases, empty/error/loading states and non-goals.
- [ ] Data classification, authorization/privacy and abuse risks.
- [ ] API/UI/analytics and compatibility expectations.
- [ ] Success metric/guardrail where relevant.

## S2 Design
- [ ] Map models, migrations, routes, policies, controllers and React consumers.
- [ ] Compare alternatives; choose simplest safe design.
- [ ] Record ADR for consequential decisions.
- [ ] Plan migration, deployment order and rollback/forward-fix.

## S3 Implement
- [ ] Branch from current main when working locally with Git.
- [ ] Deliver one vertical slice at a time.
- [ ] Add/update relevant regression tests when behavior changes and a useful test is warranted.
- [ ] Keep commits atomic and update directly affected docs.

## S4 Review and optional verification
- [ ] Inspect focused diff and changed-file list.
- [ ] Review auth/privacy/validation/race/idempotency/failure paths.
- [ ] Review query count, payload size, RTL/mobile/accessibility where relevant.
- [ ] Run backend tests/Pint only when the user explicitly requests verification.
- [ ] Run JS tests, ESLint or Vite build only when explicitly requested.
- [ ] Optional Playwright E2E only when explicitly requested; never part of the default workflow.
- [ ] If checks were not requested, report verification as not run; do not imply that review is equivalent to execution.

## S5 Delivery
- [ ] Rebase/update base and resolve conflicts intentionally when applicable.
- [ ] PR links issue and includes risk, migration, verification status and rollout notes.
- [ ] Human review requested; blocking threads resolved.
- [ ] Merge only under repository policy; no application CI status checks are expected.

## S6 Release (only when requested)
- [ ] Deploy via approved environment and migration order.
- [ ] Run release smoke/health checks only within explicitly authorized release activity.
- [ ] Roll back or forward-fix if health fails.

## S7 Close
- [ ] Update issue, milestone and project status when used.
- [ ] Update docs, documentation graph, ADR and release notes when affected.
- [ ] Record residual risks and follow-up issues.
