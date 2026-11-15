"""Shared configuration for the temporary local Playwright test workflow."""
import os

BASE_URL = os.environ.get("RAD_ART_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
IGNORE_HTTPS_ERRORS = os.environ.get("RAD_ART_IGNORE_HTTPS_ERRORS", "false").lower() in {
    "1",
    "true",
    "yes",
    "on",
}
