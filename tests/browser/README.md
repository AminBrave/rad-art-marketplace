# Browser Test Suite

The browser suite uses Python unittest and Playwright Chromium.

## Test categories
- Full-stack tests: unmocked journeys across the browser, React, Laravel session/API and isolated database. These must use disposable test data. Current seeded journeys cover buyer-to-artist messaging, buyer inquiries/privacy, artist artwork submission and admin moderation.
- Feature regressions: browser interactions with API routes intercepted by Playwright. Use these for deterministic UI states and hard-to-reproduce responses.
- Responsive tests: viewport/RTL and overflow regressions.
- Accessibility smoke tests: document direction, landmarks, labels and image alt attributes. These are heuristics, not a replacement for axe-core or manual keyboard/screen-reader review.

## Conventions
- File names use test_*.py and classes end in Tests. Nested discovery folders must include __init__.py so unittest discover recurses into them.
- Test names describe the actor, behavior and observable outcome.
- Use a new browser context per test and close it in finally.
- Avoid fixed sleeps; wait for a role, locator, URL or network response.
- Never target production or store real user data in test fixtures.
- Use unique account identifiers for tests that create users.
- Do not intercept API calls in tests labelled full-stack.
- Full-stack actor classes use reserved TEST-NET forwarded IPs to keep their request-throttle counters isolated while still exercising the real throttle middleware. The application trusts forwarded headers only from loopback proxies.

## Running
Start the full local stack with npm run dev:local, then run:

~~~bash
./scripts/verify browser
~~~

The default base URL is https://rad.localhost. Override it with RAD_ART_BASE_URL when needed.
