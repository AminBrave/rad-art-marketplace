# Rademan — project brief

> Compact source of truth for AI coding chats. Update only when product intent or confirmed architecture changes.

## Product identity
- Product: Rademan (RAD), a Persian-first artist discovery and artist-contact marketplace.
- Core intent: help people discover artists and make appropriate contact through a coherent, trustworthy experience.
- Experience: image-led, editorial, marketplace-oriented, Persian-first, RTL-aware and responsive.
- Recorded stack: PHP 8.3+, Laravel 13, React 18, JavaScript, React Router 7, TanStack Query 5 and Vite. Verify installed versions in manifests before using version-specific APIs.

## Product intent and decision authority
The product owner's canonical product vision and future-direction decisions are recorded as 41 individually addressable decision comments in GitHub issue #150. That register is brainstorming/future vision, not an implementation backlog.

- Retrieve only the specific decision requested; do not read unrelated decisions by default.
- A decision does not automatically become an MVP, delivery task, architecture requirement or implementation authorization.
- The confirmed launch direction recorded in #150 is discovery and direct buyer–artist connection; do not infer checkout or platform payment gates.
- Any implementation requires separate, explicit product-owner authorization and a focused GitHub delivery issue.
- Each authorized issue defines its own smallest useful MVP, exclusions, acceptance criteria and dependencies.
- Current implementation must be established from source and runtime evidence, not from product-intent documents.

## Problem definition
The product is intended to address the gap between discovering artists and being able to contact them through a coherent, trustworthy experience. Product decisions and future possibilities are recorded in #150. Do not invent requirements or assume they are implemented.

## Principles
1. Persian-first content and correct RTL behavior are first-class.
2. Artwork and artist identity are central to the visual experience.
3. Trust, privacy and authorization are enforced server-side.
4. Prefer a simple, coherent vertical slice over speculative platform complexity.
5. Preserve the RAD design system, API contracts and established patterns.
6. Source, migrations, tests and runtime behavior are truth; docs guide intent, not proof of implementation.

## Explicit non-goals unless approved
Do not assume checkout, orders, shipping, payouts, subscriptions, commissions, booking, escrow or other commerce capabilities exist or belong in scope.

## Resolve unknowns
Inspect current implementation and product evidence first. Separate confirmed facts from assumptions. Ask one focused question only if a decision blocks safe implementation; otherwise state the smallest reversible assumption. Record approved durable decisions.

## Starting point
Read `AGENTS.md` first. It selects this brief, the current handoff and only task-relevant skills. Inspect source before implementation and check open issues before creating duplicate work.
