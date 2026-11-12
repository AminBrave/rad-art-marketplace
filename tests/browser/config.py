"""Shared configuration for local Playwright browser tests.

Prepare the disposable browser database with npm run browser:prepare, then
start the isolated Laravel/Vite/Caddy stack with npm run dev:browser. The app
is exposed at https://rad.localhost. Override RAD_ART_BASE_URL only for another
local URL backed by the same isolated browser-test environment.
"""
import os

BASE_URL = os.environ.get("RAD_ART_BASE_URL", "https://rad.localhost").rstrip("/")
IGNORE_HTTPS_ERRORS = os.environ.get("RAD_ART_IGNORE_HTTPS_ERRORS", "true").lower() in {
    "1",
    "true",
    "yes",
    "on",
}
