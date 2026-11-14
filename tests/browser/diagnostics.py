"""Capture automatic Playwright diagnostics for every failed browser test.

Artifacts are written beneath RAD_ART_TEST_REPORT_DIR/browser-artifacts.
Only browser console/network metadata is recorded; request and response bodies,
cookies, storage state and authorization headers are never collected.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

_ACTIVE_TEST_ID: str | None = None
_PENDING: dict[str, list[Path]] = {}
_INSTALLED = False


def _report_root() -> Path:
    return Path(os.environ.get("RAD_ART_TEST_REPORT_DIR", "build/test-reports"))


def _safe_name(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value).strip("._") or "browser-test"


def _artifact_directory(test_id: str) -> Path:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S_%fZ")
    destination = _report_root() / "browser-artifacts" / _safe_name(test_id) / stamp
    destination.mkdir(parents=True, exist_ok=True)
    return destination


def set_active_test(test_id: str | None) -> None:
    global _ACTIVE_TEST_ID
    _ACTIVE_TEST_ID = test_id


def _record_page(page, events: list[dict], started: float) -> None:
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


def install_automatic_diagnostics() -> None:
    """Instrument contexts created during each unittest method without test edits."""
    global _INSTALLED
    if _INSTALLED:
        return

    from playwright.sync_api import Browser

    original_new_context = Browser.new_context

    def new_context_with_diagnostics(browser, *args, **kwargs):
        context = original_new_context(browser, *args, **kwargs)
        test_id = _ACTIVE_TEST_ID
        if not test_id:
            return context

        events: list[dict] = []
        started = time.perf_counter()
        started_at = datetime.now(timezone.utc).isoformat()
        pages = []
        pending = (
            _report_root() / "browser-artifacts" / ".pending"
            / _safe_name(test_id) / uuid.uuid4().hex
        )
        pending.mkdir(parents=True, exist_ok=True)

        def attach_page(page) -> None:
            if page in pages:
                return
            pages.append(page)
            _record_page(page, events, started)

        context.on("page", attach_page)
        for page in context.pages:
            attach_page(page)

        try:
            context.tracing.start(screenshots=True, snapshots=True, sources=True)
            context._rad_automatic_trace = True
        except Exception as error:
            events.append({"kind": "trace_start_error", "message": str(error)[:1000]})

        original_close = context.close

        def close_with_diagnostics(*close_args, **close_kwargs):
            if not getattr(context, "_rad_explicit_failure_saved", False):
                for index, page in enumerate(list(context.pages)):
                    try:
                        page.screenshot(
                            path=str(pending / f"failure-{index + 1}.png"),
                            full_page=True,
                        )
                    except Exception as error:
                        events.append({"kind": "screenshot_error", "message": str(error)[:1000]})
                try:
                    context.tracing.stop(path=str(pending / "trace.zip"))
                except Exception as error:
                    events.append({"kind": "trace_stop_error", "message": str(error)[:1000]})
                (pending / "debug.json").write_text(json.dumps({
                    "test_id": test_id,
                    "started_at": started_at,
                    "finished_at": datetime.now(timezone.utc).isoformat(),
                    "events": events,
                    "capture": "automatic",
                }, ensure_ascii=False, indent=2), encoding="utf-8")
                _PENDING.setdefault(test_id, []).append(pending)
            return original_close(*close_args, **close_kwargs)

        context.close = close_with_diagnostics
        return context

    Browser.new_context = new_context_with_diagnostics
    _INSTALLED = True


def _finish_test(test_id: str, failed: bool) -> list[str]:
    pending = _PENDING.pop(test_id, [])
    if not failed:
        for directory in pending:
            shutil.rmtree(directory, ignore_errors=True)
        return []

    saved = []
    for directory in pending:
        if not directory.exists():
            continue
        destination = _artifact_directory(test_id)
        for item in directory.iterdir():
            shutil.move(str(item), str(destination / item.name))
        shutil.rmtree(directory, ignore_errors=True)
        saved.append(str(destination))
    pending_root = _report_root() / "browser-artifacts" / ".pending"
    try:
        pending_root.rmdir()
    except OSError:
        pass
    return saved


def finish_test_success(test_id: str) -> None:
    _finish_test(test_id, failed=False)


def finish_test_failure(test_id: str) -> list[str]:
    return _finish_test(test_id, failed=True)


def start_page_diagnostics(context, page, test_id: str) -> dict:
    events = []
    started = time.perf_counter()
    _record_page(page, events, started)
    if not getattr(context, "_rad_automatic_trace", False):
        context.tracing.start(screenshots=True, snapshots=True, sources=True)
    return {
        "test_id": test_id,
        "events": events,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "saved": False,
    }


def save_failure_diagnostics(context, page, diagnostics: dict, error: BaseException) -> Path:
    destination = _artifact_directory(diagnostics["test_id"])
    diagnostics["finished_at"] = datetime.now(timezone.utc).isoformat()
    diagnostics["failure"] = {
        "type": type(error).__name__,
        "message": str(error)[:8000],
    }

    try:
        page.screenshot(path=str(destination / "failure.png"), full_page=True)
    except Exception as screenshot_error:
        diagnostics["screenshot_error"] = str(screenshot_error)

    try:
        context.tracing.stop(path=str(destination / "trace.zip"))
        diagnostics["trace"] = "trace.zip"
    except Exception as trace_error:
        diagnostics["trace_error"] = str(trace_error)

    diagnostics["saved"] = True
    context._rad_explicit_failure_saved = True
    (destination / "debug.json").write_text(
        json.dumps(diagnostics, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return destination


def stop_page_diagnostics(context, diagnostics: dict) -> None:
    if diagnostics.get("saved"):
        return
    try:
        context.tracing.stop()
    except Exception:
        pass
