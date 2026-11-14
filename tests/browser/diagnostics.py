"""Capture actionable Playwright diagnostics for a failing browser journey.

Artifacts are written only beneath RAD_ART_TEST_REPORT_DIR/browser-artifacts.
No credentials, cookies, request bodies, or response bodies are recorded.
"""
from __future__ import annotations

import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path


def start_page_diagnostics(context, page, test_id: str) -> dict:
    events = []
    started = time.perf_counter()

    def record(kind: str, **details) -> None:
        events.append({
            "at_seconds": round(time.perf_counter() - started, 4),
            "kind": kind,
            **details,
        })

    page.on("console", lambda message: record(
        "console", level=message.type, text=message.text[:4000]
    ))
    page.on("pageerror", lambda error: record("pageerror", message=str(error)[:4000]))
    page.on("request", lambda request: record(
        "request", method=request.method, url=request.url, resource_type=request.resource_type
    ) if "/api/" in request.url else None)
    page.on("requestfailed", lambda request: record(
        "requestfailed", method=request.method, url=request.url,
        failure=request.failure or "unknown",
    ))
    page.on("response", lambda response: record(
        "response", method=response.request.method, url=response.url, status=response.status
    ) if "/api/" in response.url or response.status >= 400 else None)

    context.tracing.start(screenshots=True, snapshots=True, sources=True)
    return {
        "test_id": test_id,
        "events": events,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "saved": False,
    }


def _artifact_directory(test_id: str) -> Path:
    report_root = Path(os.environ.get("RAD_ART_TEST_REPORT_DIR", "build/test-reports"))
    safe_name = re.sub(r"[^A-Za-z0-9_.-]+", "_", test_id).strip("._") or "browser-test"
    destination = report_root / "browser-artifacts" / safe_name
    destination.mkdir(parents=True, exist_ok=True)
    return destination


def save_failure_diagnostics(context, page, diagnostics: dict, error: BaseException) -> Path:
    destination = _artifact_directory(diagnostics["test_id"])
    diagnostics["finished_at"] = datetime.now(timezone.utc).isoformat()
    diagnostics["failure"] = {
        "type": type(error).__name__,
        "message": str(error)[:8000],
    }

    try:
        page.screenshot(path=str(destination / "failure.png"), full_page=True)
    except Exception as screenshot_error:  # Preserve the original test failure.
        diagnostics["screenshot_error"] = str(screenshot_error)

    try:
        context.tracing.stop(path=str(destination / "trace.zip"))
        diagnostics["trace"] = "trace.zip"
    except Exception as trace_error:  # Preserve the original test failure.
        diagnostics["trace_error"] = str(trace_error)

    (destination / "debug.json").write_text(
        json.dumps(diagnostics, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    diagnostics["saved"] = True
    return destination


def stop_page_diagnostics(context, diagnostics: dict) -> None:
    if diagnostics.get("saved"):
        return
    try:
        context.tracing.stop()
    except Exception:
        pass
