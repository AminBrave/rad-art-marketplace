"""Shared configuration for Playwright against the current local development app."""
import os

BASE_URL = os.environ.get("RAD_ART_BASE_URL", "https://rad.localhost").rstrip("/")
IGNORE_HTTPS_ERRORS = os.environ.get("RAD_ART_IGNORE_HTTPS_ERRORS", "false").lower() in {
    "1",
    "true",
    "yes",
    "on",
}
