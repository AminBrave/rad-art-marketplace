"""Shared configuration for local Playwright browser tests.

The dev:local command starts Laravel, Vite (HTTPS mode), and Caddy. Caddy
exposes the complete app at https://rad.localhost and proxies requests to
Laravel/Vite. Override RAD_ART_BASE_URL when testing another local URL.
"""
import os

BASE_URL = os.environ.get("RAD_ART_BASE_URL", "https://rad.localhost").rstrip("/")
IGNORE_HTTPS_ERRORS = os.environ.get("RAD_ART_IGNORE_HTTPS_ERRORS", "true").lower() in {
    "1",
    "true",
    "yes",
    "on",
}
