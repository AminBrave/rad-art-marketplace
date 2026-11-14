"""Run Playwright unittest cases and emit a JUnit XML report using stdlib only."""

from __future__ import annotations

import argparse
import contextlib
import json
import os
import platform
import ssl
import sys
import time
import unittest
from datetime import datetime, timezone
from importlib.metadata import PackageNotFoundError, version
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import HTTPRedirectHandler, HTTPSHandler, ProxyHandler, Request, build_opener


class RejectRedirects(HTTPRedirectHandler):
    def redirect_request(self, request, file_pointer, code, message, headers, new_url):
        return None


def validate_local_target() -> None:
    if os.environ.get("RAD_ART_TEST_MODE") != "1":
        raise RuntimeError(
            "Browser tests must be started through the guarded project runner "
            "(npm run test:browser or npm run verify:all)."
        )

    raw_url = os.environ.get("RAD_ART_BASE_URL", "https://rad.localhost").rstrip("/")
    parsed = urlparse(raw_url)
    hostname = (parsed.hostname or "").lower()
    is_loopback_name = (
        hostname == "localhost"
        or hostname.endswith(".localhost")
        or hostname in {"127.0.0.1", "::1"}
    )

    if (
        parsed.scheme not in {"http", "https"}
        or not is_loopback_name
        or parsed.username is not None
        or parsed.password is not None
        or parsed.query
        or parsed.fragment
        or parsed.path not in {"", "/"}
    ):
        raise RuntimeError(
            "Browser tests are restricted to a root localhost/loopback URL without credentials, "
            "query strings or fragments. Production and remote hosts are refused."
        )

    health_url = f"{raw_url}/api/v1/health"
    ssl_context = (
        ssl._create_unverified_context()
        if parsed.scheme == "https"
        and os.environ.get("RAD_ART_IGNORE_HTTPS_ERRORS", "true").lower() in {"1", "true", "yes", "on"}
        else ssl.create_default_context()
    )
    opener = build_opener(ProxyHandler({}), RejectRedirects(), HTTPSHandler(context=ssl_context))
    request = Request(health_url, headers={"Accept": "application/json"})
    try:
        with opener.open(request, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
            if response.status != 200 or payload.get("status") != "ok":
                raise RuntimeError(f"Local app health check returned an unexpected response: {health_url}")
            if payload.get("browser_test_ready") is not True:
                raise RuntimeError(
                    "The local app is not using the isolated browser-test environment. "
                    "Run npm run browser:prepare, then npm run dev:browser."
                )
    except (URLError, HTTPError, TimeoutError, json.JSONDecodeError) as error:
        raise RuntimeError(
            f"Local RAD app is not ready at {health_url}. Run npm run browser:prepare, then npm run dev:browser. "
            f"Underlying error: {error}"
        ) from error


class TimedTextTestResult(unittest.TextTestResult):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.executed = []
        self.started_at = {}
        self.duration_by_id = {}
        self.failure_artifacts = {}

    def startTest(self, test):
        self.executed.append(test)
        self.started_at[test.id()] = time.perf_counter()
        try:
            from diagnostics import set_active_test
            set_active_test(test.id())
        except ImportError:
            pass
        super().startTest(test)

    def addSuccess(self, test):
        super().addSuccess(test)
        try:
            from diagnostics import finish_test_success
            finish_test_success(test.id())
        except ImportError:
            pass

    def addFailure(self, test, err):
        super().addFailure(test, err)
        try:
            from diagnostics import finish_test_failure
            self.failure_artifacts[test.id()] = finish_test_failure(test.id())
        except ImportError:
            pass

    def addError(self, test, err):
        super().addError(test, err)
        try:
            from diagnostics import finish_test_failure
            self.failure_artifacts[test.id()] = finish_test_failure(test.id())
        except ImportError:
            pass

    def stopTest(self, test):
        started = self.started_at.pop(test.id(), None)
        self.duration_by_id[test.id()] = time.perf_counter() - started if started is not None else 0.0
        try:
            from diagnostics import set_active_test
            set_active_test(None)
        except ImportError:
            pass
        super().stopTest(test)


def write_junit_report(result: TimedTextTestResult, destination: Path) -> None:
    failures = {test.id(): detail for test, detail in result.failures}
    errors = {test.id(): detail for test, detail in result.errors}
    skipped = {test.id(): reason for test, reason in result.skipped}
    total_time = sum(result.duration_by_id.values())

    suite = ET.Element(
        "testsuite",
        {
            "name": "Rademan Playwright Browser Suite",
            "tests": str(result.testsRun),
            "failures": str(len(failures)),
            "errors": str(len(errors)),
            "skipped": str(len(skipped)),
            "time": f"{total_time:.3f}",
        },
    )

    for test in result.executed:
        test_id = test.id()
        case = ET.SubElement(
            suite,
            "testcase",
            {
                "classname": test.__class__.__module__ + "." + test.__class__.__name__,
                "name": getattr(test, "_testMethodName", test_id),
                "time": f"{result.duration_by_id.get(test_id, 0.0):.3f}",
            },
        )
        if test_id in failures:
            ET.SubElement(case, "failure", {"message": "Assertion failure"}).text = failures[test_id]
        elif test_id in errors:
            ET.SubElement(case, "error", {"message": "Test error"}).text = errors[test_id]
        elif test_id in skipped:
            ET.SubElement(case, "skipped", {"message": skipped[test_id]})

    destination.parent.mkdir(parents=True, exist_ok=True)
    ET.indent(suite, space="  ")
    ET.ElementTree(suite).write(destination, encoding="utf-8", xml_declaration=True)


class Tee:
    """Write test output to both the terminal and a durable UTF-8 log."""

    def __init__(self, *streams):
        self.streams = streams

    def write(self, value):
        for stream in self.streams:
            try:
                stream.write(value)
            except UnicodeEncodeError:
                encoding = getattr(stream, "encoding", None) or "utf-8"
                stream.write(value.encode(encoding, errors="backslashreplace").decode(encoding))
            stream.flush()
        return len(value)

    def flush(self):
        for stream in self.streams:
            stream.flush()

    def isatty(self):
        return any(getattr(stream, "isatty", lambda: False)() for stream in self.streams)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run guarded Rademan Playwright tests and write JUnit + diagnostic reports."
    )
    parser.add_argument(
        "tests",
        nargs="*",
        help="Optional unittest names, e.g. test_notifications_and_preferences.MessageNotificationBrowserTests.test_buyer_can_disable_in_app_message_notifications",
    )
    args = parser.parse_args()

    report_dir = Path(os.environ.get("RAD_ART_TEST_REPORT_DIR", "build/test-reports"))
    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / "browser-junit.xml"
    log_path = report_dir / "browser-run.log"
    summary_path = report_dir / "browser-debug.json"
    for destination in (report_path, log_path, summary_path):
        destination.unlink(missing_ok=True)

    try:
        validate_local_target()
    except RuntimeError as error:
        print(f"Browser test preflight failed: {error}", file=sys.stderr)
        return 2

    try:
        import playwright.sync_api
    except ImportError:
        print(
            "Playwright is required for local browser tests. Install the project's test requirements "
            "and run 'python -m playwright install chromium'.",
            file=sys.stderr,
        )
        return 2

    browser_dir = Path(__file__).resolve().parent
    sys.path.insert(0, str(browser_dir))
    from diagnostics import install_automatic_diagnostics
    install_automatic_diagnostics()
    loader = unittest.defaultTestLoader
    if args.tests:
        suite = unittest.TestSuite(loader.loadTestsFromName(name) for name in args.tests)
    else:
        suite = loader.discover(
            start_dir=str(browser_dir),
            pattern="test_*.py",
            top_level_dir=str(browser_dir),
        )

    with log_path.open("w", encoding="utf-8") as log_file:
        output = Tee(sys.__stdout__, log_file)
        runner = unittest.TextTestRunner(
            stream=output,
            verbosity=2,
            resultclass=TimedTextTestResult,
        )
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            result = runner.run(suite)

    write_junit_report(result, report_path)
    try:
        playwright_version = version("playwright")
    except PackageNotFoundError:
        playwright_version = "unknown"

    failures = [
        {"test": test.id(), "traceback": detail}
        for test, detail in result.failures
    ]
    errors = [
        {"test": test.id(), "traceback": detail}
        for test, detail in result.errors
    ]
    summary = {
        "completed_at_utc": datetime.now(timezone.utc).isoformat(),
        "python": sys.version,
        "platform": platform.platform(),
        "playwright": playwright_version,
        "base_url": os.environ.get("RAD_ART_BASE_URL", "https://rad.localhost"),
        "selected_tests": args.tests,
        "tests_run": result.testsRun,
        "failures": failures,
        "errors": errors,
        "skipped": [
            {"test": test.id(), "reason": reason}
            for test, reason in result.skipped
        ],
        "durations_seconds": result.duration_by_id,
        "failure_artifacts_by_test": result.failure_artifacts,
        "exit_code": 0 if result.wasSuccessful() else 1,
        "artifacts": {
            "junit": str(report_path),
            "log": str(log_path),
            "failure_artifacts": str(report_dir / "browser-artifacts"),
        },
    }
    summary_path.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"JUnit browser report: {report_path}")
    print(f"Browser execution log: {log_path}")
    print(f"Browser debug summary: {summary_path}")
    print(f"Failure screenshots/traces: {report_dir / 'browser-artifacts'}")

    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    raise SystemExit(main())
