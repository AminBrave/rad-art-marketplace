# End-to-End Feature Lifecycle

Copy this checklist into the issue/PR and tick each stage only with evidence.

## S0 Discover
- [ ] Identify user, role, problem and outcome.
- [ ] Read graph nodes and inspect code/tests.
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
- [ ] Branch from current main.
- [ ] Deliver one vertical slice at a time.
- [ ] Add backend/frontend tests alongside behavior.
- [ ] Keep commits atomic and update graph.

## S4 Verify
- [ ] Backend tests and Pint.
- [ ] JS tests, ESLint and Vite build.
- [ ] Relevant Playwright including unmocked full-stack path.
- [ ] Auth/privacy/validation/race/idempotency/failure checks.
- [ ] Query count, payload size, RTL/mobile accessibility review.

## S5 Review
- [ ] Inspect full diff and changed-file list.
- [ ] Rebase/update base and resolve conflicts intentionally.
- [ ] PR links issue and includes test evidence/rollout.
- [ ] Review requested; blocking threads resolved.

## S6 Release
- [ ] Merge after required checks/review.
- [ ] Deploy via approved environment and migration order.
- [ ] Run smoke tests and observe logs/metrics.
- [ ] Roll back or forward-fix if health fails.

## S7 Close
- [ ] Update issue, milestone and project status.
- [ ] Update docs, graph, ADR and release notes.
- [ ] Record residual risks and follow-up issues.
