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


def flatten_tests(suite):
    """Yield individual unittest cases from nested suites."""
    for item in suite:
        if isinstance(item, unittest.TestSuite):
            yield from flatten_tests(item)
        else:
            yield item


def is_manual_dev_safe(test) -> bool:
    method = getattr(test.__class__, getattr(test, "_testMethodName", ""), None)
    return bool(
        getattr(test.__class__, "manual_dev_safe", False)
        or getattr(method, "manual_dev_safe", False)
    )


def manual_selection_error(tests, allow_mutations: bool, run_all: bool = False) -> str | None:
    """Return a safety error when a manual selection is not explicitly safe."""
    if run_all and not allow_mutations:
        return "The complete browser suite may mutate development data. Add --allow-mutations only after reviewing that risk."
    if not allow_mutations:
        unsafe = [test.id() for test in tests if not is_manual_dev_safe(test)]
        if unsafe:
            return (
                "Refusing tests not marked manual_dev_safe. Review their data effects, "
                "then pass --allow-mutations explicitly:\n" + "\n".join(unsafe)
            )
    return None


class RejectRedirects(HTTPRedirectHandler):
    def redirect_request(self, request, file_pointer, code, message, headers, new_url):
        return None


def validate_local_target() -> None:
    if os.environ.get("RAD_ART_DEV_MODE") != "1":
        raise RuntimeError("Playwright must be launched by npm run test:browser against the current development app.")

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
    except (URLError, HTTPError, TimeoutError, json.JSONDecodeError) as error:
        raise RuntimeError(
            f"Current local RAD development app is not ready at {health_url}. Start it with npm run dev first. Underlying error: {error}"
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

    def addSubTest(self, test, subtest, err):
        super().addSubTest(test, subtest, err)
        if err is not None:
            try:
                from diagnostics import finish_test_failure
                self.failure_artifacts[test.id()] = finish_test_failure(test.id())
            except ImportError:
                pass

    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        try:
            from diagnostics import finish_test_success
            finish_test_success(test.id())
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
    parser.add_argument("--list", action="store_true", help="List discovered test IDs and whether they are read-only/manual-safe for the current development database.")
    parser.add_argument("--all", action="store_true", help="Explicitly select the complete discovered suite.")
    parser.add_argument("--allow-mutations", action="store_true", help="Allow selected tests not marked manual_dev_safe; they may change the current development database.")
    parser.add_argument(
        "tests",
        nargs="*",
        help="Optional unittest names, e.g. test_notifications_and_preferences.MessageNotificationBrowserTests.test_buyer_can_disable_in_app_message_notifications",
    )
    args = parser.parse_args()
    if args.all and args.tests:
        parser.error("--all cannot be combined with individual test IDs")
    browser_dir = Path(__file__).resolve().parent
    sys.path.insert(0, str(browser_dir))
    loader = unittest.defaultTestLoader
    discovered = loader.discover(
        start_dir=str(browser_dir), pattern="test_*.py", top_level_dir=str(browser_dir)
    )

    all_tests = list(flatten_tests(discovered))
    if args.list:
        for test in all_tests:
            safe = is_manual_dev_safe(test)
            print(f"{test.id()}  [{'manual-safe: API mocked/read-only' if safe else 'requires --allow-mutations'}]")
        return 0
    if not args.tests and not args.all:
        print("Select one or more test IDs, or pass --all explicitly. The current development app is never started or reset.", file=sys.stderr)
        return 2
    if args.tests:
        selected = []
        for name in args.tests:
            loaded = loader.loadTestsFromName(name, module=None)
            selected.extend(flatten_tests(loaded))
        suite = unittest.TestSuite(selected)
    elif args.all:
        suite = unittest.TestSuite(all_tests)

    safety_error = manual_selection_error(list(flatten_tests(suite)), args.allow_mutations, args.all)
    if safety_error:
        print(safety_error, file=sys.stderr)
        return 2

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

    report_dir = Path(os.environ.get("RAD_ART_TEST_REPORT_DIR", "build/test-reports/browser"))
    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / "browser-junit.xml"
    log_path = report_dir / "browser-run.log"
    summary_path = report_dir / "browser-debug.json"
    for destination in (report_path, log_path, summary_path):
        destination.unlink(missing_ok=True)

    from diagnostics import install_automatic_diagnostics
    install_automatic_diagnostics()
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
        "base_url": os.environ.get("RAD_ART_BASE_URL", "http://127.0.0.1:8000"),
        "selected_tests": [test.id() for test in flatten_tests(suite)],
        "target_environment": "current-local-development",
        "allow_mutations": args.allow_mutations,
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
