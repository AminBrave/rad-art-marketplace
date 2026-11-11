# Testing Strategy

## Where tests run
**Feature branches:** the user runs tests locally. GitHub Actions is deliberately not triggered by feature-branch pushes or pull requests. Agents should not consume runner resources by launching full suites for each incremental task; provide the relevant commands and wait for the user's results. Run a focused local diagnostic only when explicitly requested or essential to investigate a concrete failure.

**Main branch:** GitHub Actions runs automated test, lint and build suites on pushes to `main` (normally after merge). Docs-only pushes are ignored because they do not change executable behavior. A green run validates the merged main commit, not the earlier PR head.

## Local verification commands
The cross-platform task runner is exposed through npm scripts. It works in PowerShell, Git Bash, macOS and Linux:

```bash
npm test                    # backend + frontend tests
npm run verify:backend      # backend tests + PHP style
npm run verify:frontend     # frontend tests + lint + standard/cPanel builds
npm run verify              # all tests + lint + both production builds
npm run verify:all          # verify + Playwright browser suite
```

For compatibility, the Bash/Git Bash wrapper is also available:

```bash
./scripts/verify backend
./scripts/verify frontend
./scripts/verify browser
./scripts/verify all
```

The Node task runner is the source of truth; npm commands are preferred on Windows because they do not require Bash.

### Browser tests
Install the pinned browser dependency once with `python -m pip install -r requirements-dev.txt`, then install Chromium using `python -m playwright install chromium`.

Start the application in one terminal:
- `npm run dev` starts Laravel + Vite over HTTP at `http://127.0.0.1:8000`.
- `npm run dev:https` starts Laravel + Vite + Caddy at `https://rad.localhost` (Caddy and its trusted local certificate are required).

Run `npm run test:browser` in a second terminal. The default URL is `https://rad.localhost`; override it when using HTTP:

PowerShell:
```powershell
$env:RAD_ART_BASE_URL = "http://127.0.0.1:8000"
npm run test:browser
```

Git Bash/macOS/Linux:
```bash
RAD_ART_BASE_URL=http://127.0.0.1:8000 npm run test:browser
```

Browser tests require a disposable local/test database and seeded actors where the scenario needs them. Never target production. The browser suite includes both API-mocked UI regressions and unmocked full-stack journeys. It does not replace backend authorization or persistence tests.

## Test pyramid
1. **PHPUnit Unit** (`tests/Unit`): isolated PHP rules and transformations; no HTTP/database boot where avoidable.
2. **PHPUnit Feature** (`tests/Feature`): Laravel HTTP/API contracts, middleware, validation, policies and persistence using the test database.
3. **PHPUnit Integration** (`tests/Integration`): real database, filesystem, queue and notification boundaries.
4. **Frontend tests** (`tests/js/*.test.js`): Node's built-in test runner for deterministic frontend logic and Vite SSR component rendering. SSR checks validate markup/semantics; they do not simulate browser events.
5. **Playwright** (`tests/browser`): route behavior, RTL, accessibility smoke checks, user interactions and full-stack journeys.
6. **Quality/build checks:** Pint, ESLint, standard Vite build and cPanel-specific Vite build.

Do not mock the boundary a test intends to verify. Unit tests should not boot Laravel or use a database. Feature tests should use the real Laravel container, middleware and test database. Integration tests exercise the actual adapter. Critical browser journeys remain unmocked.

## Risk-based test selection
- **Low — docs, copy, non-functional styling:** inspect rendered result/diff; no full suite. Docs-only main pushes skip CI.
- **Medium — isolated UI or API behavior:** run the affected frontend or backend layer; add a regression test for changed behavior.
- **High — authentication, roles, messaging, uploads, moderation, privacy or migrations:** run backend + affected frontend/browser journeys; cover negative authorization, validation, concurrency/transactions, privacy and failure paths.
- **Critical — irreversible/high-volume data changes or security boundary redesign:** require staged migration/rollout plan, backup and reconciliation, explicit architecture/security review, and full relevant test suite before merge.

## Coverage expectations
For APIs test success, validation, guest, wrong role/owner/participant, private records, throttling and idempotency. For transitions test allowed/forbidden states and persisted metadata. For public queries test pagination/filtering and absence of private fields.

For browser flows test entry, success, validation/error, refresh/deep link, role boundary, keyboard and mobile. Maintain both isolated UI tests and unmocked full-stack paths for critical journeys.

Use RefreshDatabase in backend tests. Browser tests use unique accounts and isolated DB. Never target production or rely on test order. Do not claim local checks passed unless the user reports results or the agent actually ran the requested focused check. Main-branch CI is authoritative automated evidence after merge.
