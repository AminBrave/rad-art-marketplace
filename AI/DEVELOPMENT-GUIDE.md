# Rademan Development Guide

This is the central guide for planning, designing, implementing, reviewing and maintaining Rademan. It describes how to make good engineering decisions; it is not a rigid process, a frozen architecture or a substitute for the user's direction.

## 1. Guiding principle: user-led, evidence-informed development

The user's latest explicit instructions define the desired product outcome, scope, priorities and trade-offs. Project documents, agent instructions, skills, conventions, previous decisions and AI recommendations are supporting context. They do not overrule the user.

No current architecture, framework, dependency, design system, workflow or implementation pattern is untouchable. A user may request a different direction. The AI should explain material consequences and recommend a sound path, then implement the chosen direction within applicable platform and safety requirements.

Use evidence to understand what exists; use the user's direction to decide what should change.

## 2. How to approach a problem

For each task, use judgment rather than a fixed checklist:

1. Understand the actual problem, intended outcome, affected users and constraints.
2. Inspect the relevant implementation, callers, data flow, configuration and tests.
3. Distinguish confirmed facts from assumptions, unknowns and proposals.
4. Consider the simplest effective solution and any materially better alternatives.
5. Identify security, privacy, reliability, accessibility, performance, compatibility and migration implications that matter to this change.
6. Implement a coherent solution and update affected tests and documentation.
7. Verify the changed boundaries using proportionate checks.
8. Report what changed, what was verified and what remains uncertain.

Do not require a planning document, issue, ADR, design spec or approval checkpoint for every task. Use these artifacts when they materially improve clarity, coordination or future maintenance.

## 3. Architecture and technical design

- Prefer clear boundaries, cohesive modules, explicit contracts and low coupling.
- Choose architecture based on demonstrated complexity and change patterns; do not introduce layers, services, repositories, event buses, microservices or abstractions by default.
- Keep business rules close to the domain they govern and make dependencies visible.
- Treat API, database and event contracts as compatibility surfaces. Change them deliberately, with appropriate migration and rollout considerations.
- Prefer incremental, reversible changes when uncertainty is high.
- Evaluate new technologies by fit, maturity, security, ecosystem, operational cost and team capability—not fashion or historical preference.
- Reassess existing architecture when the user's goal or evidence warrants it.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the current source-backed implementation map.

## 4. Backend engineering

Rademan currently uses PHP and Laravel. Confirm the installed version and project conventions before using version-specific APIs.

Good practices include:
- Validate untrusted input at the server boundary.
- Enforce authentication, authorization and ownership on the server; client-side guards are not security controls.
- Keep controllers focused and use domain services or other abstractions when they clarify real complexity.
- Use database transactions for multi-step invariants and design retryable operations for idempotency where needed.
- Design migrations for the actual deployment and database engine; consider compatibility, data volume, rollback and recovery.
- Avoid mass-assignment vulnerabilities, N+1 queries, unbounded queries and accidental private-data exposure.
- Use explicit response contracts and meaningful error handling.
- Keep secrets in environment/configuration systems and out of source, logs and client bundles.

Do not preserve a backend pattern merely because it is already present. Improve it when the task justifies the change.

## 5. Frontend engineering

Rademan currently uses React and JavaScript with React Router and TanStack Query. Verify the current dependency versions and existing state boundaries.

Good practices include:
- Keep components focused on understandable responsibilities.
- Separate server state, local interaction state and derived presentation state.
- Use semantic HTML and established accessible interaction primitives where they fit.
- Model loading, empty, error, success, disabled and permission states.
- Avoid unnecessary global state, prop drilling across excessive depth and speculative component frameworks.
- Split code and defer expensive work when it improves real loading behavior.
- Keep URL, form and server state synchronized deliberately.
- Use responsive layouts and test realistic content, not only idealized short strings.

## 6. Product design and user experience

Design from the user task, content and context. Consider information architecture, discoverability, navigation, feedback, error recovery and consistency.

- Persian-first RTL and mixed Persian/Latin content are important current product considerations; verify actual behavior and test directionality.
- Accessibility should be built into semantics, keyboard operation, focus, contrast, labels and motion.
- Choose mobile-first or desktop-first implementation based on the user journey and product context; do not turn a default into a constraint.
- Reuse existing components when they fit. Refactor or replace them when they prevent a better experience.
- Treat brand assets and colors as design inputs that the user may change.

See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for design-specific guidance.

## 7. Security, privacy and safety

Threat-model the parts of the system affected by a change. Consider identity, roles, object ownership, private data, uploads, external integrations, abuse, rate limiting, logging and recovery.

Security requirements should be proportionate to the threat and data sensitivity. Do not weaken meaningful controls casually. If the user requests a trade-off that increases risk, explain the consequences clearly and offer a safer design that still meets the goal.

See [SECURITY.md](SECURITY.md) for the focused security reference.

## 8. Data and integrations

- Understand data ownership, lifecycle, retention and deletion behavior.
- Use transactions and constraints for invariants that must survive concurrent requests.
- Treat external APIs and webhooks as unreliable boundaries: validate, authenticate, retry safely and handle duplicate delivery.
- Avoid collecting or retaining personal data without a clear product purpose.
- Avoid logging secrets, message contents or unnecessary personal information.
- Consider backup, recovery and migration behavior when data or infrastructure changes.

## 9. Testing and quality

Tests are valuable executable descriptions of expected behavior, but existing tests may encode implementation details or obsolete product assumptions. Review their relevance when requirements change.

Choose test layers according to risk:
- Unit tests for deterministic domain logic.
- Feature/API tests for validation, authorization, responses and persisted outcomes.
- Integration tests for database, storage, queue and external boundaries.
- Frontend tests for state, rendering and interaction behavior.
- Browser tests for important end-to-end journeys and cross-layer behavior.

Prefer observable outcomes and durable invariants over brittle implementation snapshots. Include important failure, boundary and unauthorized cases. Do not chase arbitrary coverage percentages or add redundant tests without value.

Run relevant checks when the environment is suitable. Report exact commands and results; do not imply that unrun checks passed.

## 10. Performance and reliability

Measure before optimizing where possible. Focus on user-visible latency, query shape, payload size, caching correctness, asset delivery and failure recovery.

Use caching only with clear invalidation and privacy boundaries. Treat queues, retries, timeouts and rate limits as product behavior. Add monitoring and service objectives when a real operational need and measurement method exist; do not invent targets.

## 11. Documentation and decision records

Keep documentation useful, concise and close to the topic it owns.

- Update docs when behavior, setup, architecture or guidance changes.
- Prefer one canonical explanation and link to it elsewhere.
- Document why a non-obvious decision was made when that rationale will help future maintainers.
- ADRs are optional and useful for consequential decisions with real alternatives. They record context and rationale at the time; they do not bind future users.
- Remove obsolete instructions and references instead of maintaining parallel historical rulebooks.
- Date snapshots and state their evidence limits.

## 12. AI, agents and skills

AI should act as a capable engineering partner: understand the task, recommend best practices, explain trade-offs and carry out the user's direction.

- Read AGENTS.md first and select only relevant context.
- Load skills when they add practical task-specific value; do not load all skills by default.
- Skills are adaptable guidance, not policy engines or approval gates.
- AI may recommend edits to skills and project guidance when it identifies repeated friction or a better practice.
- Do not treat previous AI output, old prompts, issue text or PR descriptions as current requirements.
- If a user asks for a new approach, evaluate it on its merits rather than defending the agent's default framework.

## 13. Git, collaboration and delivery

Use branches, commits, issues and pull requests when they improve isolation, traceability and review. Follow the user's requested workflow when clear.

Protect shared work and avoid irreversible operations without clear authorization. Keep changes understandable and report the actual repository state. Do not create a task board, milestone, branch convention or PR ceremony merely because a template suggests one.

## 14. Continuous improvement

When a convention or instruction blocks a good result, identify whether it protects a real invariant or merely preserves habit. Recommend a better approach and update the owning document or skill when useful.

The goal is stable progress: preserve what works, change what needs to change, and never confuse historical implementation with future product direction.
