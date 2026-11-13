# Rademan delivery roadmap

This roadmap separates planning milestones from claims about current implementation. Every milestone begins with evidence-based discovery.

## Milestones
| Milestone | Goal | Exit criteria |
|---|---|---|
| M0 — AI-ready foundation | Repeatable, low-token and resumable free-chat coding | Entry contract, context command, brief, handoff, issue/PR conventions |
| M1 — Product baseline | Establish what exists and what the first release must solve | Evidence-backed flow inventory, confirmed users, prioritized MVP scope, measurable outcomes |
| M2 — Discovery experience | Validate and improve artist discovery | Approved requirements, accessible responsive implementation, acceptance evidence |
| M3 — Artist identity and contact | Validate profile information and safe contact journeys | Approved profile/contact rules, server-side authorization/privacy, abuse and failure handling |
| M4 — Release readiness | Make the agreed MVP supportable and releasable | Security/privacy review, quality evidence, operational notes, release/rollback checklist |

M1–M4 are planning containers, not assertions that features are missing or must be built. Audit first and re-scope with the product owner.

## Issue types
Use GitHub's native issue numbers as permanent identifiers. Prefix titles:
- `[EPIC]` milestone-sized outcome linking child issues.
- `[FEAT]` user-visible capability.
- `[BUG]` reproducible defect/regression.
- `[CHORE]` maintenance/developer experience.
- `[SEC]` security, privacy or abuse-risk work.
- `[QA]` tests, accessibility, performance or verification.
- `[DOCS]` product, architecture or developer docs.
- `[SPIKE]` time-boxed investigation with a decision/output.

## Label taxonomy
Create/apply lowercase kebab-case labels:
- Type: `type:epic`, `type:feature`, `type:bug`, `type:chore`, `type:security`, `type:qa`, `type:docs`, `type:spike`.
- Priority: `priority:p0` urgent, `priority:p1` high, `priority:p2` normal, `priority:p3` low.
- Status: `status:ready`, `status:blocked`, `status:needs-decision`.
- Area: `area:backend`, `area:frontend`, `area:product`, `area:design-rtl`, `area:security`, `area:tooling`, `area:docs`, `area:quality`.

Normally use one type, one priority and one area; add status only when useful. Use GitHub Milestones for M0–M4. Do not create labels for individual tasks.

## Issue template contract
Every actionable issue states context/problem, outcome, scope/out-of-scope, observable acceptance criteria, risks/dependencies, focused verification plan, milestone, labels and related issue links. Search existing issues before creating duplicates. Verification plans do not authorize execution. Split work that cannot be reviewed independently.

## Initial work packages
- M0: AI context/bootstrap workflow.
- M1: evidence-based product and architecture baseline audit.
- M1: MVP decisions and measurable outcomes.
- M2–M3: only vertical slices confirmed by audit and product decisions.
- M4: release readiness and operational hardening.

Product owner approves detailed M1–M4 scope after the baseline audit.
