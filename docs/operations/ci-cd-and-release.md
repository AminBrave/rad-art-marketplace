# CI/CD and Release

## Application verification policy

There is no GitHub Actions application CI workflow. The former .github/workflows/ci.yml was removed. Do not recreate, dispatch or add scheduled workflows for application tests, lint, builds, browser checks or E2E.

Verification is local and opt-in:
- AI agents must not execute tests, lint, builds or other verification commands unless the user explicitly asks.
- The normal development loop is localhost-first and should not wait for a test pipeline.
- When asked to test, run only the requested/relevant checks locally and report exact commands and results.
- Playwright/browser E2E is optional, separate from the main workflow, and runs only on explicit request.
- A PR, merge, push to main or deployment does not itself authorize testing.

## Other GitHub Actions workflows

Any future non-test maintenance or deployment automation must have a separate explicit purpose, minimum permissions, reviewed action versions and clear ownership. It must not invoke application verification implicitly. Do not assume that a cleanup workflow exists or is required.

## Release

1. Complete implementation and human review.
2. Run local verification only if the user explicitly requests it.
3. Merge via repository policy.
4. Deploy through the approved environment/approval process.
5. Apply migrations in approved order; run health checks only as part of an explicitly approved release activity.
6. Monitor errors; record deployment ID, commit and rollback decision.

GitHub Actions is not an application quality gate. Local verification, human review and production deployment/health are distinct activities. Never describe unrun checks as passed.
